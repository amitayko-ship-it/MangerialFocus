import { Express, Request, Response } from 'express';
import { pool } from './db.js';
import { sendReminderEmail } from './email.js';
import { questionForWeek, videoForWeek } from './reminderContent.js';

const TIME_WINDOWS = ['morning', 'afternoon', 'evening'] as const;
type TimeWindow = (typeof TIME_WINDOWS)[number];

const timeWindowStartHour: Record<TimeWindow, number> = {
  morning: 8,
  afternoon: 13,
  evening: 18,
};

const TIMEZONE = 'Asia/Jerusalem';

// Returns { weekday: 0-6 (Sun-Sat), hour: 0-23 } in Israel time.
function israelNowParts(now = new Date()): { weekday: number; hour: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'short',
    hour: 'numeric',
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekdayStr = parts.find((p) => p.type === 'weekday')?.value || 'Sun';
  const hourStr = parts.find((p) => p.type === 'hour')?.value || '0';
  const weekdayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  let hour = parseInt(hourStr, 10);
  if (hour === 24) hour = 0;
  return { weekday: weekdayMap[weekdayStr] ?? 0, hour };
}

// ISO-week string like "2026-W24", computed in Israel time.
function israelIsoWeek(now = new Date()): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(now);
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  const date = new Date(Date.UTC(y, m - 1, d));
  const dayNum = (date.getUTCDay() + 6) % 7; // Mon=0..Sun=6
  date.setUTCDate(date.getUTCDate() - dayNum + 3); // nearest Thursday
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000));
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

// UTC-midnight timestamp of the Israel-local calendar date for `now`.
function israelMidnightUTC(now = new Date()): number {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = fmt.formatToParts(now);
  const y = Number(parts.find((p) => p.type === 'year')?.value);
  const m = Number(parts.find((p) => p.type === 'month')?.value);
  const d = Number(parts.find((p) => p.type === 'day')?.value);
  return Date.UTC(y, m - 1, d);
}

function weekIndexSince(startDate: Date | string | null, now = new Date()): number {
  if (!startDate) return 0;
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return 0;
  // Normalize both ends to Israel-local calendar dates so day boundaries are consistent.
  const startMidnight = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const diffDays = Math.floor((israelMidnightUTC(now) - startMidnight) / (24 * 3600 * 1000));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7);
}

// Core: find users due now and send their weekly reminder. Idempotent per ISO week.
export async function sendDueReminders(now = new Date()): Promise<{ sent: number; skipped: number; failed: number }> {
  const { weekday, hour } = israelNowParts(now);
  const currentWeek = israelIsoWeek(now);

  const result = await pool.query(
    `SELECT r.user_id, r.reminder_time_window, r.keystone_trigger, r.keystone_action,
            r.start_date, r.last_sent_week, u.email, u.full_name
       FROM email_reminders r
       JOIN users u ON u.id = r.user_id
      WHERE r.reminder_weekday = $1
        AND (r.last_sent_week IS DISTINCT FROM $2)`,
    [weekday, currentWeek]
  );

  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const row of result.rows) {
    const tw = (TIME_WINDOWS.includes(row.reminder_time_window) ? row.reminder_time_window : 'morning') as TimeWindow;
    if (hour < timeWindowStartHour[tw]) {
      skipped++;
      continue;
    }
    if (!row.email) {
      skipped++;
      continue;
    }

    // Atomically claim this week before sending so overlapping/retried runs can't
    // double-send. Only one runner wins the conditional UPDATE; others get rowCount 0.
    const claim = await pool.query(
      `UPDATE email_reminders SET last_sent_week = $1, updated_at = NOW()
        WHERE user_id = $2 AND last_sent_week IS DISTINCT FROM $1`,
      [currentWeek, row.user_id]
    );
    if (claim.rowCount === 0) {
      skipped++;
      continue;
    }

    const idx = weekIndexSince(row.start_date, now);
    const question = questionForWeek(idx);
    const video = videoForWeek(idx);

    let ok = false;
    try {
      ok = await sendReminderEmail({
        toEmail: row.email,
        userName: row.full_name,
        question,
        keystoneTrigger: row.keystone_trigger,
        keystoneAction: row.keystone_action,
        video,
      });
    } catch (err) {
      console.error('sendReminderEmail threw:', err);
      ok = false;
    }

    if (ok) {
      sent++;
    } else {
      // Release the claim so a later run this week can retry, but only if we still hold it.
      await pool.query(
        `UPDATE email_reminders SET last_sent_week = $1, updated_at = NOW()
          WHERE user_id = $2 AND last_sent_week = $3`,
        [row.last_sent_week, row.user_id, currentWeek]
      );
      failed++;
    }
  }

  return { sent, skipped, failed };
}

export function setupReminders(app: Express) {
  // Load the current user's reminder settings.
  app.get('/api/reminders', async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'לא מחובר' });
    }
    try {
      const r = await pool.query(
        `SELECT reminder_weekday, reminder_time_window, keystone_trigger, keystone_action
           FROM email_reminders WHERE user_id = $1`,
        [req.session.userId]
      );
      if (r.rows.length === 0) {
        return res.json(null);
      }
      const row = r.rows[0];
      res.json({
        weekday: row.reminder_weekday,
        timeWindow: row.reminder_time_window,
        keystoneTrigger: row.keystone_trigger,
        keystoneAction: row.keystone_action,
      });
    } catch (err) {
      console.error('Get reminders error:', err);
      res.status(500).json({ error: 'שגיאה בטעינת הגדרות התזכורת' });
    }
  });

  // Save / update the current user's reminder settings.
  app.post('/api/reminders', async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'לא מחובר' });
    }
    const { weekday, timeWindow, keystoneTrigger, keystoneAction } = req.body || {};
    const wd = Number(weekday);
    if (!Number.isInteger(wd) || wd < 0 || wd > 6) {
      return res.status(400).json({ error: 'יום לא תקין' });
    }
    const tw = TIME_WINDOWS.includes(timeWindow) ? timeWindow : 'morning';
    try {
      await pool.query(
        `INSERT INTO email_reminders (user_id, reminder_weekday, reminder_time_window, keystone_trigger, keystone_action, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW())
         ON CONFLICT (user_id) DO UPDATE
           SET reminder_weekday = EXCLUDED.reminder_weekday,
               reminder_time_window = EXCLUDED.reminder_time_window,
               keystone_trigger = COALESCE(EXCLUDED.keystone_trigger, email_reminders.keystone_trigger),
               keystone_action = COALESCE(EXCLUDED.keystone_action, email_reminders.keystone_action),
               updated_at = NOW()`,
        [req.session.userId, wd, tw, keystoneTrigger || null, keystoneAction || null]
      );
      res.json({ ok: true });
    } catch (err) {
      console.error('Save reminders error:', err);
      res.status(500).json({ error: 'שגיאה בשמירת הגדרות התזכורת' });
    }
  });

  // Delete the current user's reminder settings (stop receiving).
  app.delete('/api/reminders', async (req: Request, res: Response) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: 'לא מחובר' });
    }
    try {
      await pool.query(`DELETE FROM email_reminders WHERE user_id = $1`, [req.session.userId]);
      res.json({ ok: true });
    } catch (err) {
      console.error('Delete reminders error:', err);
      res.status(500).json({ error: 'שגיאה במחיקת הגדרות התזכורת' });
    }
  });

  // Admin-triggered manual run (useful for testing). Protected by ADMIN_PASSWORD.
  app.post('/api/admin/send-reminders', async (req: Request, res: Response) => {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword || req.headers['x-admin-password'] !== adminPassword) {
      return res.status(403).json({ error: 'גישה נדחתה' });
    }
    try {
      const summary = await sendDueReminders();
      res.json({ ok: true, ...summary });
    } catch (err) {
      console.error('Manual send reminders error:', err);
      res.status(500).json({ error: 'שגיאה בשליחת תזכורות' });
    }
  });
}
