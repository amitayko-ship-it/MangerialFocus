import { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { pool } from './db.js';

const PgSession = connectPgSimple(session);

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  gender: string | null;
}

export function setupAuth(app: Express) {
  app.use(
    session({
      store: new PgSession({
        pool: pool as any,
        tableName: 'user_sessions',
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || 'focus-tracker-secret-key-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
      },
    })
  );

  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { email, password, fullName, gender } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'נדרש מייל וסיסמא' });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'הסיסמא חייבת להיות לפחות 6 תווים' });
      }

      const existingUser = await pool.query(
        'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'המייל הזה כבר רשום במערכת' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await pool.query(
        'INSERT INTO users (email, password, full_name, gender) VALUES (LOWER($1), $2, $3, $4) RETURNING id, email, full_name, gender',
        [email, hashedPassword, fullName || null, gender || null]
      );

      const user = result.rows[0];
      req.session.userId = user.id;

      res.status(201).json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        gender: user.gender,
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'שגיאה בהרשמה' });
    }
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'נדרש מייל וסיסמא' });
      }

      const result = await pool.query(
        'SELECT id, email, password, full_name, gender FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'מייל או סיסמא שגויים' });
      }

      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'מייל או סיסמא שגויים' });
      }

      req.session.userId = user.id;

      res.json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        gender: user.gender,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'שגיאה בהתחברות' });
    }
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'שגיאה בהתנתקות' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'התנתקת בהצלחה' });
    });
  });

  app.get('/api/auth/user', async (req: Request, res: Response) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'לא מחובר' });
      }

      const result = await pool.query(
        'SELECT id, email, full_name, gender FROM users WHERE id = $1',
        [req.session.userId]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'משתמש לא נמצא' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'שגיאה בקבלת נתוני משתמש' });
    }
  });

  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'נדרש מייל' });
      }

      const result = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
      );

      if (result.rows.length === 0) {
        return res.json({ message: 'אם המייל קיים במערכת, תקבל הוראות לאיפוס סיסמא' });
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await pool.query(
        'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
        [resetToken, expires, email.toLowerCase()]
      );

      res.json({ 
        message: 'קוד איפוס נוצר',
        resetToken: resetToken
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'שגיאה באיפוס סיסמא' });
    }
  });

  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({ error: 'נדרש קוד איפוס וסיסמא חדשה' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'הסיסמא חייבת להיות לפחות 6 תווים' });
      }

      const result = await pool.query(
        'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({ error: 'קוד איפוס לא תקין או פג תוקף' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await pool.query(
        'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
        [hashedPassword, result.rows[0].id]
      );

      res.json({ message: 'הסיסמא אופסה בהצלחה' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ error: 'שגיאה באיפוס סיסמא' });
    }
  });
}
