import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'he' | 'en';

const translations = {
  he: {
    common: { continue: 'המשך', back: 'חזור', skip: 'דלג', save: 'שמור', cancel: 'ביטול', loading: 'טוען...' },
    auth: { login: 'התחברות', signup: 'הרשמה', email: 'אימייל', password: 'סיסמה', loginSuccess: 'התחברת בהצלחה', invalidCredentials: 'פרטים שגויים' },
    vision: {
      title: 'תמונת העתיד שלך',
      subtitle: 'בוא נבנה Vision Board ל-2030',
      alreadyHaveVision: 'כבר הגדרת תמונת הצלחה',
      editOrContinue: 'רוצה לערוך את מה שכתבת או להמשיך לשלב הבא?',
      edit: 'עריכה',
      continueNext: 'המשך לשלב הבא',
      showSummary: 'סיימתי - תראה לי את הסיכום',
      skipForNow: 'דלג בינתיים',
      editAnswers: 'ערוך תשובות',
      looksGood: 'נראה מצוין, בוא נמשיך',
      placeholder: 'כתוב את התשובה שלך...',
      thinking: 'חושב...',
      step: 'שלב',
      of: 'מתוך',
      completed: 'השיחה הושלמה',
    },
  },
  en: {
    common: { continue: 'Continue', back: 'Back', skip: 'Skip', save: 'Save', cancel: 'Cancel', loading: 'Loading...' },
    auth: { login: 'Log In', signup: 'Sign Up', email: 'Email', password: 'Password', loginSuccess: 'Logged in successfully', invalidCredentials: 'Invalid credentials' },
    vision: {
      title: 'Your Future Vision',
      subtitle: "Let's build your 2030 Vision Board",
      alreadyHaveVision: 'You already have a success vision',
      editOrContinue: 'Would you like to edit or continue?',
      edit: 'Edit',
      continueNext: 'Continue',
      showSummary: 'Done - Show me the summary',
      skipForNow: 'Skip for now',
      editAnswers: 'Edit answers',
      looksGood: 'Looks great, continue',
      placeholder: 'Write your answer...',
      thinking: 'Thinking...',
      step: 'Step',
      of: 'of',
      completed: 'Interview completed',
    },
  },
} as const;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)['he'];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

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
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      t: translations[language],
      isRTL: language === 'he',
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
