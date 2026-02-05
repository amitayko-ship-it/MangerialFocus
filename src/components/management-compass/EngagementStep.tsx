import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface EngagementStepProps {
  energyLevel: number;
  meaningScore: number;
  pressurePattern: string;
  onEnergyLevelChange: (score: number) => void;
  onMeaningScoreChange: (score: number) => void;
  onPressurePatternChange: (value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const pressureOptions = [
  { id: 'lower_standards', label: 'מוריד סטנדרטים', icon: '📉' },
  { id: 'more_hours', label: 'עובד יותר שעות', icon: '⏰' },
  { id: 'defer_development', label: 'דוחה פיתוח וחשיבה', icon: '🚫' },
  { id: 'delegate', label: 'מעביר אחריות', icon: '➡️' },
  { id: 'reprioritize', label: 'עוצר ומתעדף מחדש', icon: '🎯' },
];

const EngagementStep: React.FC<EngagementStepProps> = ({
  energyLevel,
  meaningScore,
  pressurePattern,
  onEnergyLevelChange,
  onMeaningScoreChange,
  onPressurePatternChange,
  onNext,
  onBack,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-slide-up">
        <ProgressBar currentStep={7} totalSteps={8} />

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border">
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            מעורבות ואנרגיה
          </h2>
          <p className="text-muted-foreground mb-6">
            Engagement & Energy
          </p>

          {/* Q13 - Energy Level */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              כשאתה פותח את יום העבודה – רמת האנרגיה שלך:
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => onEnergyLevelChange(score)}
                  className={`
                    w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                    ${energyLevel === score
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
              <span>נמוכה מאוד</span>
              <span>גבוהה מאוד</span>
            </div>
          </div>

          {/* Q14 - Meaning */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              באיזו מידה אתה מרגיש שהעבודה שלך מייצרת אימפקט אמיתי?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => onMeaningScoreChange(score)}
                  className={`
                    w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                    ${meaningScore === score
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

          {/* Q15 - Pressure Pattern */}
          <div className="mb-8">
            <label className="block text-foreground font-medium mb-4">
              כשיש עומס, מה קורה?
            </label>
            <div className="grid gap-3">
              {pressureOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onPressurePatternChange(option.id)}
                  className={`
                    w-full p-4 rounded-xl text-right transition-all duration-200
                    flex items-center gap-3 border-2
                    ${pressurePattern === option.id
                      ? 'border-primary bg-accent shadow-soft'
                      : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                    }
                  `}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="flex-1 font-medium text-foreground">{option.label}</span>
                  {pressurePattern === option.id && (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              חזרה
            </Button>
            <Button 
              variant="hero" 
              onClick={onNext} 
              className="flex-1"
              disabled={!pressurePattern}
            >
              המשך
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EngagementStep;
