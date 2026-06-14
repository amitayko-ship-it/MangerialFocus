import pg from 'pg';

const { Pool } = pg;

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  export { pool };

  export async function initDatabase() {
    try {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(255),
            gender VARCHAR(10),
            reset_token VARCHAR(255),
            reset_token_expires TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        await client.query(`
          CREATE TABLE IF NOT EXISTS user_sessions (
            sid VARCHAR NOT NULL PRIMARY KEY,
            sess JSON NOT NULL,
            expire TIMESTAMP(6) NOT NULL
          )
        `);
        
        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_session_expire ON user_sessions(expire)
        `);

        await client.query(`
          ALTER TABLE users
          ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS user_progress (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            current_step VARCHAR(50) DEFAULT 'not_started',
            axes_completed BOOLEAN DEFAULT FALSE,
            personal_development_completed BOOLEAN DEFAULT FALSE,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          ALTER TABLE user_progress
          ADD COLUMN IF NOT EXISTS current_step VARCHAR(50) DEFAULT 'not_started',
          ADD COLUMN IF NOT EXISTS axes_completed BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS personal_development_completed BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ADD COLUMN IF NOT EXISTS questionnaire_data JSONB
        `);

        await client.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id)
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS email_reminders (
            user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            reminder_weekday INTEGER NOT NULL,
            reminder_time_window VARCHAR(20) NOT NULL DEFAULT 'morning',
            keystone_trigger TEXT,
            keystone_action TEXT,
            start_date DATE DEFAULT CURRENT_DATE,
            last_sent_week VARCHAR(10),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);

        console.log('Database tables verified/created');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
