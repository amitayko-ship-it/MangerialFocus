import React from 'react';
import { Button } from '@/components/ui/button';
import { Compass, Clock } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-fade-in">
        {/* Hero Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-2xl gradient-hero flex items-center justify-center shadow-glow animate-pulse-soft">
            <Compass className="w-12 h-12 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-foreground">
          מצפן הניהול
        </h1>
        
        <p className="text-lg text-muted-foreground text-center mb-8">
          אבחון ממוקד למנהלים
        </p>

        {/* Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-medium mb-8 border border-border">
          <p className="text-foreground leading-relaxed text-center text-lg">
            זהו כלי אבחוני לצמיחה, לא להערכה.
          </p>
          <p className="text-muted-foreground leading-relaxed text-center mt-4">
            המטרה: לזהות איפה נתקע האימפקט הניהולי ואיפה מהלך ממוקד יכול לעשות קפיצה אמיתית.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>10-12 דקות</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button 
            variant="hero" 
            size="xl" 
            onClick={onStart}
            className="min-w-[200px]"
          >
            התחלה
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
