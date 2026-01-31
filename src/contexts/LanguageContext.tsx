import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'he' | 'en';

const translations = {
  he: {
    common: { continue: 'המשך', back: 'חזור', skip: 'דלג', save: 'שמור', cancel: 'ביטול', loading: 'טוען...', error: 'שגיאה', success: 'הצלחה', delete: 'מחק', add: 'הוסף', edit: 'ערוך', close: 'סגור' },
    auth: {
      login: 'התחברות', signup: 'הרשמה', logout: 'התנתקות', email: 'אימייל', password: 'סיסמה', fullName: 'שם מלא',
      loginSuccess: 'התחברת בהצלחה', invalidCredentials: 'אימייל או סיסמה שגויים',
      noAccount: 'אין לך חשבון?', hasAccount: 'יש לך חשבון?', signupSuccess: 'נרשמת בהצלחה! בדוק את האימייל',
    },
    vision: {
      title: 'תמונת העתיד שלך', subtitle: 'בוא נבנה Vision Board ל-2030',
      alreadyHaveVision: 'כבר הגדרת תמונת הצלחה',
      editOrContinue: 'רוצה לערוך את מה שכתבת או להמשיך לשלב הבא?',
      edit: 'עריכה', continueNext: 'המשך לשלב הבא',
      showSummary: 'סיימתי - תראה לי את הסיכום', skipForNow: 'דלג בינתיים',
      editAnswers: 'ערוך תשובות', looksGood: 'נראה מצוין, בוא נמשיך',
      placeholder: 'כתוב את התשובה שלך...', thinking: 'חושב...',
      step: 'שלב', of: 'מתוך', completed: 'השיחה הושלמה',
    },
    questionnaire: {
      title: 'בוא נתחיל', subtitle: 'כמה שאלות קצרות כדי להכיר אותך',
      q1: 'מה התפקיד שלך?', q2: 'כמה אנשים מדווחים לך?', q3: 'מה האתגר הכי גדול שלך עכשיו?',
      q4: 'מה תרצה לשפר ב-12 השבועות הקרובים?',
      placeholder: 'הקלד את תשובתך...',
    },
    focusAreas: { big_rocks: 'אבנים גדולות', interfaces: 'ממשקים', upward: 'ניהול למעלה', strategy: 'אסטרטגיה' },
    rocks: {
      title: 'הגדרת המיקוד שלך', subtitle: 'אימפקט לא מגיע מעוד עשייה, אלא מבחירה מדויקת',
      bigRocksTitle: 'האבנים הגדולות', bigRocksSubtitle: 'מה הדברים הכי חשובים שאתה צריך לקדם?',
      addRock: 'הוסף אבן גדולה', rockPlaceholder: 'שם האבן הגדולה (לדוגמה: חיזוק הנהלה, ייצוב צוות, פרויקט X)',
      practiceHint: 'פרקטיקה = פעולה שחוזרת על עצמה. אם תיישם אותה בעקביות – האבן תתקדם.',
      practice: 'פרקטיקה',
    },
    tasks: {
      title: 'משימות ואנרגיה', subtitle: 'הגדר משימות שבועיות ומה נותן לך אנרגיה',
      weeklyTasks: 'משימות שבועיות', addTask: 'הוסף משימה', taskPlaceholder: 'תאר את המשימה...',
      energyBoosters: 'מה נותן לך אנרגיה?', addBooster: 'הוסף', boosterPlaceholder: 'פעילות שנותנת לך אנרגיה...',
      weeklyHours: 'כמה שעות בשבוע אתה עובד?',
    },
    stakeholders: {
      title: 'בעלי עניין מרכזיים', subtitle: 'מי האנשים שאתה צריך לעבוד איתם כדי להצליח?',
      dependencyLabel: 'עד כמה אתה תלוי באחרים כדי להצליח?',
      independent: 'עצמאי לחלוטין', dependent: 'תלוי לחלוטין',
      list: 'רשימת בעלי עניין', addStakeholder: 'הוסף בעל עניין',
      name: 'שם', role: 'תפקיד',
    },
    summary: {
      title: 'סיכום התוכנית שלך', subtitle: 'בדוק שהכל נכון לפני שמתחילים',
      focusArea: 'תחום מיקוד', goal: 'יעד ל-12 שבועות', weeklyTarget: 'יעד שבועי',
      tasks: 'משימות', stakeholders: 'בעלי עניין', startPlan: 'בוא נתחיל!', editPlan: 'ערוך תוכנית',
    },
    dashboard: {
      title: 'דשבורד', weeklyProgress: 'התקדמות שבועית', tasks: 'משימות',
      focusScore: 'ציון מיקוד', executionReadiness: 'מוכנות לביצוע',
      myWeek: 'השבוע שלי', journey: 'המסע שלי', insights: 'תובנות',
      weeklyCheckin: 'צ\'ק-אין שבועי', requestFeedback: 'בקש פידבק',
      noActivePlan: 'אין תוכנית פעילה', createPlan: 'צור תוכנית חדשה',
      week: 'שבוע', hours: 'שעות', ofWeek: 'מהשבוע', minutes: 'דק׳',
    },
    checkin: {
      title: 'צ\'ק-אין שבועי', focusTime: 'זמן פוקוס השבוע',
      outOfWeek: 'מתוך שבוע עבודה של {hours} שעות',
      howManyHours: 'כמה שעות פוקוס היו לך השבוע?',
      weeklyTasks: 'משימות השבוע', energyLevel: 'רמת אנרגיה', energyHow: 'איך הרגשת השבוע?',
      motivationLevel: 'רמת מוטיבציה', motivationHow: 'כמה התלהבת מהעבודה?',
      saved: 'הצ\'ק-אין השבועי נשמר', saveFailed: 'לא הצלחנו לשמור',
    },
    feedback: {
      requestTitle: 'בקש פידבק 360°', requestSubtitle: 'שלח קישור לבעלי עניין שלך לקבלת משוב',
      generateLink: 'צור קישור', copyLink: 'העתק קישור', linkCopied: 'הקישור הועתק!',
      formTitle: 'משוב על', anonymous: 'המשוב אנונימי ומאובטח',
      submit: 'שלח משוב', thankYou: 'תודה על המשוב!',
      expired: 'הקישור פג תוקף', invalid: 'קישור לא תקין',
    },
    calendar: {
      title: 'חבר את היומן שלך',
      subtitle: 'נסנכרן את הפגישות שלך כדי לעקוב אחרי הזמן שאתה משקיע במיקוד',
      outlookCalendar: 'Outlook Calendar', googleCalendar: 'Google Calendar',
      connected: 'מחובר', connect: 'חבר', skipForNow: 'דלג בינתיים',
    },
  },
  en: {
    common: { continue: 'Continue', back: 'Back', skip: 'Skip', save: 'Save', cancel: 'Cancel', loading: 'Loading...', error: 'Error', success: 'Success', delete: 'Delete', add: 'Add', edit: 'Edit', close: 'Close' },
    auth: {
      login: 'Log In', signup: 'Sign Up', logout: 'Log Out', email: 'Email', password: 'Password', fullName: 'Full Name',
      loginSuccess: 'Logged in successfully', invalidCredentials: 'Invalid email or password',
      noAccount: "Don't have an account?", hasAccount: 'Already have an account?', signupSuccess: 'Signed up! Check your email',
    },
    vision: {
      title: 'Your Future Vision', subtitle: "Let's build your 2030 Vision Board",
      alreadyHaveVision: 'You already have a success vision',
      editOrContinue: 'Would you like to edit or continue?',
      edit: 'Edit', continueNext: 'Continue',
      showSummary: 'Done - Show me the summary', skipForNow: 'Skip for now',
      editAnswers: 'Edit answers', looksGood: 'Looks great, continue',
      placeholder: 'Write your answer...', thinking: 'Thinking...',
      step: 'Step', of: 'of', completed: 'Interview completed',
    },
    questionnaire: {
      title: "Let's get started", subtitle: 'A few quick questions to know you better',
      q1: 'What is your role?', q2: 'How many direct reports do you have?', q3: 'What is your biggest challenge right now?',
      q4: 'What would you like to improve in the next 12 weeks?',
      placeholder: 'Type your answer...',
    },
    focusAreas: { big_rocks: 'Big Rocks', interfaces: 'Interfaces', upward: 'Managing Up', strategy: 'Strategy' },
    rocks: {
      title: 'Define Your Focus', subtitle: "Impact doesn't come from doing more, but from making precise choices",
      bigRocksTitle: 'The Big Rocks', bigRocksSubtitle: 'What are the most important things you need to advance?',
      addRock: 'Add big rock', rockPlaceholder: 'Name of the big rock (e.g., Strengthen leadership, Stabilize team, Project X)',
      practiceHint: 'Practice = a recurring action. Implement it consistently and the rock will advance.',
      practice: 'Practice',
    },
    tasks: {
      title: 'Tasks & Energy', subtitle: 'Define weekly tasks and what gives you energy',
      weeklyTasks: 'Weekly Tasks', addTask: 'Add task', taskPlaceholder: 'Describe the task...',
      energyBoosters: 'What gives you energy?', addBooster: 'Add', boosterPlaceholder: 'An activity that gives you energy...',
      weeklyHours: 'How many hours a week do you work?',
    },
    stakeholders: {
      title: 'Key Stakeholders', subtitle: 'Who are the people you need to work with to succeed?',
      dependencyLabel: 'How dependent are you on others to succeed?',
      independent: 'Fully independent', dependent: 'Fully dependent',
      list: 'Stakeholder List', addStakeholder: 'Add Stakeholder',
      name: 'Name', role: 'Role',
    },
    summary: {
      title: 'Your Plan Summary', subtitle: 'Review everything before we start',
      focusArea: 'Focus Area', goal: '12-Week Goal', weeklyTarget: 'Weekly Target',
      tasks: 'Tasks', stakeholders: 'Stakeholders', startPlan: "Let's go!", editPlan: 'Edit Plan',
    },
    dashboard: {
      title: 'Dashboard', weeklyProgress: 'Weekly Progress', tasks: 'Tasks',
      focusScore: 'Focus Score', executionReadiness: 'Execution Readiness',
      myWeek: 'My Week', journey: 'My Journey', insights: 'Insights',
      weeklyCheckin: 'Weekly Check-in', requestFeedback: 'Request Feedback',
      noActivePlan: 'No active plan', createPlan: 'Create new plan',
      week: 'Week', hours: 'hours', ofWeek: 'of week', minutes: 'min',
    },
    checkin: {
      title: 'Weekly Check-in', focusTime: 'Focus Time This Week',
      outOfWeek: 'Out of a {hours}-hour work week',
      howManyHours: 'How many focus hours did you have this week?',
      weeklyTasks: 'Weekly Tasks', energyLevel: 'Energy Level', energyHow: 'How did you feel this week?',
      motivationLevel: 'Motivation Level', motivationHow: 'How excited were you about the work?',
      saved: 'Weekly check-in saved', saveFailed: 'Failed to save',
    },
    feedback: {
      requestTitle: 'Request 360° Feedback', requestSubtitle: 'Send a link to your stakeholders for feedback',
      generateLink: 'Generate Link', copyLink: 'Copy Link', linkCopied: 'Link copied!',
      formTitle: 'Feedback for', anonymous: 'Feedback is anonymous and secure',
      submit: 'Submit Feedback', thankYou: 'Thank you for your feedback!',
      expired: 'This link has expired', invalid: 'Invalid link',
    },
    calendar: {
      title: 'Connect Your Calendar',
      subtitle: "We'll sync your meetings to track the time you invest in your focus",
      outlookCalendar: 'Outlook Calendar', googleCalendar: 'Google Calendar',
      connected: 'Connected', connect: 'Connect', skipForNow: 'Skip for now',
    },
  },
} as const;

export type Translations = (typeof translations)[Language];

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)[Language];
  isRTL: boolean;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('preferred-language');
    return (saved === 'en' || saved === 'he') ? saved : 'he';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language], isRTL: language === 'he' }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
