import express, { Router } from 'express';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const setupMotivation = (app: express.Express) => {
  const router = Router();

  // Get user progress
  router.get('/progress', async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const result = await pool.query(
        'SELECT * FROM user_progress WHERE user_id = $1',
        [userId]
      );
      if (result.rows.length === 0) {
        const insert = await pool.query(
          'INSERT INTO user_progress (user_id) VALUES ($1) RETURNING *',
          [userId]
        );
        return res.json(insert.rows[0]);
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Log activity and update streak
  router.post('/activity', async (req, res) => {
    const userId = (req as any).session?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const progressResult = await pool.query(
        'SELECT * FROM user_progress WHERE user_id = $1',
        [userId]
      );
      const progress = progressResult.rows[0];
      const now = new Date();
      const lastActivity = progress.last_activity_date ? new Date(progress.last_activity_date) : null;

      let newStreak = progress.current_streak;
      const isToday = lastActivity && lastActivity.toDateString() === now.toDateString();
      const isYesterday = lastActivity && new Date(now.getTime() - 86400000).toDateString() === lastActivity.toDateString();

      if (!isToday) {
        if (isYesterday || !lastActivity) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      const update = await pool.query(
        `UPDATE user_progress 
         SET current_streak = $1, 
             longest_streak = GREATEST(longest_streak, $1),
             last_activity_date = $2,
             updated_at = $2
         WHERE user_id = $3 RETURNING *`,
        [newStreak, now, userId]
      );

      res.json(update.rows[0]);
    } catch (error) {
      console.error('Error updating activity:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.use('/api/motivation', router);
};
