// Standalone one-shot reminder sender.
// Run on a recurring schedule (e.g. hourly) via a Replit Scheduled Deployment:
//   npx tsx server/sendReminders.ts
// It finds users due this week at their chosen weekday/time window, sends the
// weekly email via Resend, records the send, and exits.
import { sendDueReminders } from './reminders.js';
import { pool } from './db.js';

async function main() {
  const summary = await sendDueReminders();
  console.log(`Reminder run complete: sent=${summary.sent}, skipped=${summary.skipped}, failed=${summary.failed}`);
  await pool.end();
  process.exit(0);
}

main().catch(async (err) => {
  console.error('Reminder run failed:', err);
  try {
    await pool.end();
  } catch {}
  process.exit(1);
});
