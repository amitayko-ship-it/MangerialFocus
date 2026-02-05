import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, AlertTriangle } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface DecisionsPriceStepProps {
  immediatePrice: string;
  longTermPrice: string;
  retrospective: string;
  onImmediatePriceChange: (value: string) => void;
  onLongTermPriceChange: (value: string) => void;
  onRetrospectiveChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const immediatePriceOptions = [
  { id: 'me', label: 'אני', icon: '👤' },
  { id: 'team', label: 'הצוות', icon: '👥' },
  { id: 'interface', label: 'ממשק', icon: '🔗' },
  { id: 'customer', label: 'הלקוח', icon: '🎯' },
  { id: 'organization', label: 'הארגון', icon: '🏢' },
];

const longTermPriceOptions = [
  { id: 'burnout', label: 'שחיקה', icon: '🔥' },
  { id: 'trust', label: 'פגיעה באמון', icon: '💔' },
  { id: 'quality', label: 'פגיעה באיכות / מקצועיות', icon: '📉' },
  { id: 'delay', label: 'עיכוב תהליכים', icon: '⏳' },
  { id: 'none', label: 'לא נוצר מחיר משמעותי', icon: '✅' },
];

const DecisionsPriceStep: React.FC<DecisionsPriceStepProps> = ({
  immediatePrice,
  longTermPrice,
  retrospective,
  onImmediatePriceChange,
  onLongTermPriceChange,
  onRetrospectiveChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-slide-up">
        <ProgressBar currentStep={3} totalSteps={8} />

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border">
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            החלטות ומחיר
          </h2>
          <p className="text-muted-foreground mb-6">
            אחריותיות (Accountability)
          </p>

          {/* Q5 - Scenario Instruction */}
          <div className="mb-6 p-4 bg-accent/50 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-primary mt-0.5" />
            <p className="text-foreground">
              חשוב על החלטה ניהולית מורכבת מהחודש האחרון.
            </p>
          </div>

          {/* Q6 - Immediate Price */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              מי שילם את המחיר המיידי?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {immediatePriceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onImmediatePriceChange(option.id)}
                  className={`
                    p-4 rounded-xl text-center transition-all duration-200
                    flex flex-col items-center gap-2 border-2
                    ${immediatePrice === option.id
                      ? 'border-primary bg-accent shadow-soft'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-foreground text-sm">{option.label}</span>
                  {immediatePrice === option.id && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Q7 - Long-term Price */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              מה היה המחיר לטווח ארוך?
            </label>
            <div className="grid gap-3">
              {longTermPriceOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onLongTermPriceChange(option.id)}
                  className={`
                    w-full p-4 rounded-xl text-right transition-all duration-200
                    flex items-center gap-3 border-2
                    ${longTermPrice === option.id
                      ? 'border-primary bg-accent shadow-soft'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="flex-1 font-medium text-foreground">{option.label}</span>
                  {longTermPrice === option.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Q8 - Retrospective */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              אם היית מקבל את ההחלטה שוב – מה דבר אחד שהיית עושה אחרת?
            </label>
            <Textarea
              value={retrospective}
              onChange={(e) => onRetrospectiveChange(e.target.value)}
              placeholder="כתוב כאן..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              חזרה
            </Button>
            <Button 
              variant="hero" 
              onClick={onNext} 
              className="flex-1"
              disabled={!immediatePrice || !longTermPrice}
            >
              המשך
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionsPriceStep;
