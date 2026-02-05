import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ClipboardList, Clock, Brain } from 'lucide-react';

interface QuestionnaireIntroStepProps {
  userName: string;
  onNext: () => void;
}

const QuestionnaireIntroStep: React.FC<QuestionnaireIntroStepProps> = ({
  userName,
  onNext
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-lg w-full animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center shadow-glow">
            <ClipboardList className="w-10 h-10 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground text-center">
          {userName ? `${userName}, ` : ''}עכשיו נתחיל בשאלון
        </h1>
        <p className="text-muted-foreground text-center mb-8">
          השאלון יעזור לנו להבין את סגנון הניהול שלך
        </p>

        <div className="bg-card rounded-2xl p-6 shadow-soft border border-border space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 text-primary" />
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-foreground mb-1">משחק קלפים</h3>
              <p className="text-sm text-muted-foreground">
                תתבקש למיין קלפים לפי מה שמתאר אותך ומה שלא
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-foreground mb-1">שאלות אבחון</h3>
              <p className="text-sm text-muted-foreground">
                שאלות על זמן, אנרגיה, קבלת החלטות ועוד
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div className="text-right">
              <h3 className="font-semibold text-foreground mb-1">10-12 דקות</h3>
              <p className="text-sm text-muted-foreground">
                קח את הזמן, אין תשובות נכונות או לא נכונות
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground text-center mt-6">
          התשובות שלך יעזרו לנו להתאים את התוכנית עבורך
        </p>

        <div className="flex justify-center mt-8">
          <Button
            onClick={onNext}
            size="lg"
            className="gap-2"
          >
            בואו נתחיל
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireIntroStep;
