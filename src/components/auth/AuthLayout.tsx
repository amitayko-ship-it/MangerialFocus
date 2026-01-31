import React, { ReactNode } from 'react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Target } from 'lucide-react';

export const AuthLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Focus Tracker</span>
        </div>
        <LanguageSwitcher />
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; 2026 Focus Tracker
      </footer>
    </div>
  );
};
