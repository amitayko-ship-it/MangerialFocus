import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full">
      <div className="py-4 px-6 bg-card border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <img 
            src="/milestone-logo.png" 
            alt="מיילסטון - מובילים מטבעם" 
            className="h-12 object-contain"
          />
          <span className="text-sm text-muted-foreground font-medium">מערכת ניהול סדנאות ולוגיסטיקה</span>
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-l from-brand-yellow via-brand-yellow/60 to-transparent" />
    </header>
  );
};

export default Header;
