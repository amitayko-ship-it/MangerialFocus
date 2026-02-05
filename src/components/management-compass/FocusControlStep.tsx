import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface FocusControlStepProps {
  anchorScore: number;
  timeDrain: string;
  timeDrainOther: string;
  onAnchorChange: (score: number) => void;
  onTimeDrainChange: (drain: string) => void;
  onTimeDrainOtherChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const timeDrainOptions = [
  { id: 'firefighting', label: 'כיבוי שריפות', icon: '🔥' },
  { id: 'details', label: 'טיפול בפרטים של אחרים', icon: '📋' },
  { id: 'coordination', label: 'תיאומים וממשקים', icon: '🔗' },
  { id: 'autonomy', label: 'חוסר עצמאות של הצוות', icon: '👥' },
  { id: 'meetings', label: 'עומס פגישות', icon: '📅' },
  { id: 'other', label: 'אחר', icon: '✏️' },
];

const FocusControlStep: React.FC<FocusControlStepProps> = ({
  anchorScore,
  timeDrain,
  timeDrainOther,
  onAnchorChange,
  onTimeDrainChange,
  onTimeDrainOtherChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-slide-up">
        <ProgressBar currentStep={1} totalSteps={8} />

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border">
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            מיקוד ושליטה
          </h2>
          <p className="text-muted-foreground mb-6">
            אבנים גדולות
          </p>

          {/* Q1 - Anchor Score */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              אם אסתכל על השבוע האחרון שלך – עד כמה הזמן שלך הושקע בדברים שרק אתה כמנהל באמת צריך לעשות?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => onAnchorChange(score)}
                  className={`
                    w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                    ${anchorScore === score
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                    }
                  `}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
              <span>כמעט ולא</span>
              <span>במידה רבה מאוד</span>
            </div>
          </div>

          {/* Q2 - Time Drain */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              מה גוזל ממך הכי הרבה זמן שלא אמור להיות אצלך?
            </label>
            <div className="grid gap-3">
              {timeDrainOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onTimeDrainChange(option.id)}
                  className={`
                    w-full p-4 rounded-xl text-right transition-all duration-200
                    flex items-center gap-3 border-2
                    ${timeDrain === option.id
                      ? 'border-primary bg-accent shadow-soft'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="flex-1 font-medium text-foreground">{option.label}</span>
                  {timeDrain === option.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            {timeDrain === 'other' && (
              <Textarea
                value={timeDrainOther}
                onChange={(e) => onTimeDrainOtherChange(e.target.value)}
                placeholder="פרט/י..."
                className="mt-4"
                rows={2}
              />
            )}
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              חזרה
            </Button>
            <Button 
              variant="hero" 
              onClick={onNext} 
              className="flex-1"
              disabled={!timeDrain}
            >
              המשך
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusControlStep;
