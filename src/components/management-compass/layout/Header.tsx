import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 bg-card border-b border-border">
      <div className="max-w-4xl mx-auto flex justify-center">
        <img 
          src="/milestone-logo.png" 
          alt="Milestone - Lead By Nature" 
          className="h-12 object-contain"
        />
      </div>
    </header>
  );
};

export default Header;
