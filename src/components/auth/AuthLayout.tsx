import React, { ReactNode } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50/40 via-background to-green-50/20 flex flex-col">
      <header className="w-full">
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/milestone-logo.png" 
              alt="מיילסטון - מובילים מטבעם" 
              className="h-10 object-contain"
            />
            <span className="text-sm text-muted-foreground font-medium hidden sm:inline">מערכת ניהול סדנאות ולוגיסטיקה</span>
          </div>
          <LanguageSwitcher />
        </div>
        <div className="h-0.5 bg-gradient-to-l from-brand-yellow via-brand-yellow/60 to-transparent" />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="py-5 px-4">
        <div className="border-t border-border/60 pt-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70 tracking-wide">Milestone</span>
            <span className="text-xs text-muted-foreground/50 tracking-wider">Lead by nature</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
