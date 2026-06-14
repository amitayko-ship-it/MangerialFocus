import sgMail from '@sendgrid/mail';
import { Resend } from 'resend';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@focustracker.app';
// Resend requires a verified sending domain. Until one is configured, the only
// address that works out-of-the-box is Resend's shared onboarding sender.
const RESEND_SENDER_EMAIL = process.env.RESEND_SENDER_EMAIL || 'onboarding@resend.dev';
const APP_NAME = 'מצפן הניהול';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

interface ReminderEmailParams {
  toEmail: string;
  userName?: string | null;
  question: string;
  keystoneTrigger?: string | null;
  keystoneAction?: string | null;
  video?: { title: string; url: string } | null;
}

export async function sendReminderEmail(params: ReminderEmailParams): Promise<boolean> {
  if (!resend) {
    console.warn('Resend API key not configured - skipping reminder email');
    return false;
  }

  const { toEmail, userName, question, keystoneTrigger, keystoneAction, video } = params;
  const greeting = userName ? `שלום ${userName},` : 'שלום,';

  const habitLine = keystoneAction
    ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;margin:20px 0;">
         <p style="color:#92400e;font-size:14px;margin:0 0 4px;">הרגל המפתח שלך:</p>
         <p style="color:#1f2937;font-size:16px;font-weight:600;margin:0;">${keystoneTrigger ? `מיד אחרי ${keystoneTrigger}, ` : ''}${keystoneAction}</p>
       </div>`
    : '';

  const videoBlock = video
    ? `<div style="text-align:center;margin:28px 0;">
         <p style="color:#374151;font-size:15px;margin:0 0 10px;">תוכן להשראה השבוע:</p>
         <a href="${video.url}" style="display:inline-block;background:#eab308;color:#1f2937;text-decoration:none;font-weight:600;font-size:15px;padding:12px 24px;border-radius:9999px;">▶ ${video.title}</a>
       </div>`
    : '';

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 540px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 24px;">
      <h1 style="color: #1f2937; font-size: 22px; margin: 0;">${APP_NAME}</h1>
      <div style="height:3px;width:60px;background:#eab308;border-radius:9999px;margin:10px auto 0;"></div>
    </div>

    <p style="color: #374151; font-size: 16px; line-height: 1.6;">${greeting}</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">הנה התזכורת השבועית שלך. קח רגע לעצור ולחשוב:</p>

    <div style="background:#f9fafb;border-right:4px solid #eab308;border-radius:8px;padding:18px 20px;margin:20px 0;">
      <p style="color:#1f2937;font-size:18px;line-height:1.6;font-weight:600;margin:0;">${question}</p>
    </div>

    ${habitLine}
    ${videoBlock}

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">${APP_NAME} &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>`;

  const textParts = [
    greeting,
    '',
    'התזכורת השבועית שלך:',
    question,
  ];
  if (keystoneAction) {
    textParts.push('', `הרגל המפתח שלך: ${keystoneTrigger ? `מיד אחרי ${keystoneTrigger}, ` : ''}${keystoneAction}`);
  }
  if (video) {
    textParts.push('', `תוכן להשראה: ${video.title} - ${video.url}`);
  }
  textParts.push('', APP_NAME);

  try {
    const { error } = await resend.emails.send({
      from: `${APP_NAME} <${RESEND_SENDER_EMAIL}>`,
      to: toEmail,
      subject: `${APP_NAME} - התזכורת השבועית שלך`,
      html: htmlContent,
      text: textParts.join('\n'),
    });
    if (error) {
      console.error('Resend reminder email error:', error);
      return false;
    }
    console.log(`Reminder email sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error('Resend reminder email error:', error?.message || error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  resetToken: string,
  userName?: string
): Promise<boolean> {
  if (!SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured - skipping email send');
    return false;
  }

  const appUrl = process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}`
    : process.env.REPL_SLUG
    ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
    : 'http://localhost:5000';

  const greeting = userName ? `שלום ${userName},` : 'שלום,';

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; direction: rtl;">
  <div style="max-width: 500px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 2px 10px rgba(0,0,0,0.08);">
    <div style="text-align: center; margin-bottom: 30px;">
      <div style="width: 60px; height: 60px; background: #6366f1; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
        <span style="color: white; font-size: 28px;">🧭</span>
      </div>
      <h1 style="color: #1f2937; font-size: 22px; margin: 0;">${APP_NAME}</h1>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">${greeting}</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">קיבלנו בקשה לאיפוס הסיסמה שלך.</p>
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">הקוד לאיפוס הסיסמה שלך:</p>
    
    <div style="background: #f0f0ff; border: 2px solid #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
      <p style="color: #6366f1; font-size: 24px; font-weight: bold; margin: 0; letter-spacing: 2px; font-family: monospace; word-break: break-all;">${resetToken}</p>
    </div>
    
    <p style="color: #374151; font-size: 16px; line-height: 1.6;">העתק את הקוד הזה והכנס אותו בדף האיפוס באפליקציה.</p>
    
    <div style="background: #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 24px 0;">
      <p style="color: #92400e; font-size: 13px; margin: 0;">⚠️ קוד זה תקף לשעה אחת בלבד. אם לא ביקשת איפוס סיסמה, התעלם מהודעה זו.</p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">${APP_NAME} &copy; ${new Date().getFullYear()}</p>
  </div>
</body>
</html>
  `;

  const textContent = `${greeting}

קיבלנו בקשה לאיפוס הסיסמה שלך.

הקוד לאיפוס: ${resetToken}

העתק את הקוד הזה והכנס אותו בדף האיפוס באפליקציה.

הקוד תקף לשעה אחת בלבד.
אם לא ביקשת איפוס סיסמה, התעלם מהודעה זו.

${APP_NAME}`;

  try {
    await sgMail.send({
      to: toEmail,
      from: {
        email: SENDER_EMAIL,
        name: APP_NAME,
      },
      subject: `${APP_NAME} - איפוס סיסמה`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Password reset email sent to ${toEmail}`);
    return true;
  } catch (error: any) {
    console.error('SendGrid email error:', error?.response?.body || error);
    return false;
  }
}
