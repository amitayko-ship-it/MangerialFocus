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
        
        console.log('Database tables verified/created');
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }
