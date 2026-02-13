import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-5 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="border-t border-border/60 pt-4">
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-semibold text-muted-foreground/70 tracking-wide">Milestone</span>
            <span className="text-xs text-muted-foreground/50 tracking-wider">Lead by nature</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
