import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-6 bg-card border-t border-border">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
        <img 
          src="/milestone-logo.png" 
          alt="Milestone - Lead By Nature" 
          className="h-10 object-contain"
        />
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Milestone. כל הזכויות שמורות.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
