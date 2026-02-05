import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { CoachingData, getCoachingInsight, initialCoachingData } from '@/types/managementCompass';

interface CoachingStepProps {
  coaching?: CoachingData;
  onCoachingChange: (coaching: CoachingData) => void;
  onNext: () => void;
  onBack: () => void;
}

const timeOptions = [
  { id: 'less30', label: 'פחות מ־30 דק׳', icon: '⏱️' },
  { id: '30to60', label: '30–60 דק׳', icon: '🕐' },
  { id: '1to2hours', label: '1–2 שעות', icon: '🕑' },
  { id: 'more2hours', label: 'יותר מ־2 שעות', icon: '🕒' },
  { id: 'unknown', label: 'לא יודע / לא עקבי', icon: '❓' },
];

const styleOptions = [
  { id: 'directive', label: 'מסביר איך צריך לעשות ומוודא ביצוע', icon: '📋' },
  { id: 'coaching', label: 'שואל שאלות ומכוון לחשיבה עצמאית', icon: '💡' },
  { id: 'collaborative', label: 'נכנס יחד לביצוע ("בוא נעשה ביחד")', icon: '🤝' },
  { id: 'avoiding', label: 'דוחה את זה כי אין זמן / זה ייקח יותר מדי אנרגיה', icon: '⏳' },
];

const blockerOptions = [
  { id: 'noTime', label: 'אני לא מפנה לזה זמן ביומן', icon: '📅' },
  { id: 'control', label: 'קשה לי לשחרר שליטה', icon: '🎮' },
  { id: 'noMethod', label: 'אין לי שיטה ברורה', icon: '📋' },
  { id: 'frustrated', label: 'אני מתייאש כי זה לא זז מהר', icon: '😤' },
  { id: 'notExpected', label: 'זה לא מתוגמל / לא מצופה ממני', icon: '🎯' },
];

const priceTypeOptions = [
  { id: 'overload', label: 'עומס וזמינות יתר', icon: '📊' },
  { id: 'exhaustion', label: 'עייפות ושחיקה', icon: '😓' },
  { id: 'noPriorities', label: 'חוסר פניות לדברים החשובים באמת', icon: '🎯' },
  { id: 'stuckGrowth', label: 'תקיעות בהתפתחות האישית שלי', icon: '📈' },
  { id: 'noPrice', label: 'כמעט לא גובה מחיר', icon: '✅' },
];

const CoachingStep: React.FC<CoachingStepProps> = ({
  coaching: coachingProp,
  onCoachingChange,
  onNext,
  onBack,
}) => {
  const coaching = coachingProp || initialCoachingData;
  const [currentLayer, setCurrentLayer] = useState(1);
  const totalLayers = 7;

  const updateCoaching = (updates: Partial<CoachingData>) => {
    onCoachingChange({ ...coaching, ...updates });
  };

  const canProceedToNextLayer = () => {
    switch (currentLayer) {
      case 1: return true; // Identity score has default
      case 2: return coaching.timeInvestment !== '';
      case 3: return coaching.coachingStyle !== '';
      case 4: return true; // Effectiveness score has default
      case 5: return true; // Recurrence score has default
      case 6: return coaching.internalBlocker !== '';
      case 7: return coaching.personalPriceType !== '';
      default: return true;
    }
  };

  const handleNextLayer = () => {
    if (currentLayer < totalLayers) {
      setCurrentLayer(currentLayer + 1);
    } else {
      onNext();
    }
  };

  const handlePrevLayer = () => {
    if (currentLayer > 1) {
      setCurrentLayer(currentLayer - 1);
    } else {
      onBack();
    }
  };

  // Show insight after layer 2 if there's a gap
  const showGapInsight = currentLayer >= 3 && 
    coaching.identityScore >= 4 && 
    ['less30', 'unknown'].includes(coaching.timeInvestment);

  const renderScaleButtons = (
    value: number, 
    onChange: (val: number) => void,
    lowLabel: string,
    highLabel: string
  ) => (
    <div>
      <div className="flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            onClick={() => onChange(score)}
            className={`
              w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
              ${value === score
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
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  const renderChoiceButtons = (
    options: { id: string; label: string; icon: string }[],
    selectedId: string,
    onChange: (id: string) => void
  ) => (
    <div className="grid gap-3">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`
            w-full p-4 rounded-xl text-right transition-all duration-200
            flex items-center gap-3 border-2
            ${selectedId === option.id
              ? 'border-primary bg-accent shadow-soft'
              : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
            }
          `}
        >
          <span className="text-2xl">{option.icon}</span>
          <span className="flex-1 font-medium text-foreground">{option.label}</span>
          {selectedId === option.id && (
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Check className="w-4 h-4 text-primary-foreground" />
            </div>
          )}
        </button>
      ))}
    </div>
  );

  const renderLayerContent = () => {
    switch (currentLayer) {
      case 1:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              עד כמה חניכה ופיתוח אנשים הם חלק מרכזי מהזהות הניהולית שלך, ולא "עוד משהו שחשוב אבל נדחק"?
            </label>
            {renderScaleButtons(
              coaching.identityScore,
              (val) => updateCoaching({ identityScore: val }),
              'לא חלק מרכזי',
              'חלק מרכזי מאוד'
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              בשבוע עבודה ממוצע, כמה זמן בפועל אתה מקדיש לחניכה מכוונת (שיחות פיתוח, ליווי, משוב עומק – לא ניהול שוטף)?
            </label>
            {renderChoiceButtons(timeOptions, coaching.timeInvestment, (id) => updateCoaching({ timeInvestment: id }))}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {showGapInsight && (
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  דירגת חניכה כחשובה מאוד, אך בפועל אתה משקיע בה פחות משעה בשבוע.
                </p>
            </div>
            )}
            <label className="block text-foreground font-medium mb-4">
              כשאתה חונך עובד, מה אתה עושה בדרך כלל?
            </label>
            {renderChoiceButtons(styleOptions, coaching.coachingStyle, (id) => updateCoaching({ coachingStyle: id }))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              תחשוב על עובד אחד שאתה חונך. עד כמה בעקבות העבודה שלך הוא היום:
              <span className="block text-sm text-muted-foreground mt-2">
                מקבל החלטות לבד, פותר בעיות בלי לחזור אליך, לוקח אחריות רחבה יותר
              </span>
            </label>
            {renderScaleButtons(
              coaching.effectivenessScore,
              (val) => updateCoaching({ effectivenessScore: val }),
              'כמעט ללא שינוי',
              'שיפור משמעותי'
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              עד כמה אתה מוצא את עצמך "מטפל שוב ושוב" באותם נושאים אצל אותם עובדים?
            </label>
            {renderScaleButtons(
              coaching.recurrenceScore,
              (val) => updateCoaching({ recurrenceScore: val }),
              'כמעט לא קורה',
              'קורה כל הזמן'
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              מה הכי מחזיק אותך מלעשות חניכה אפקטיבית יותר?
            </label>
            {renderChoiceButtons(blockerOptions, coaching.internalBlocker, (id) => updateCoaching({ internalBlocker: id }))}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <label className="block text-foreground font-medium mb-4">
                באיזו מידה חוסר עצמאות של הצוות גובה ממך היום מחיר אישי?
              </label>
              {renderScaleButtons(
                coaching.personalPriceScore,
                (val) => updateCoaching({ personalPriceScore: val }),
                'כמעט לא',
                'מאוד'
              )}
            </div>

            <div className="mb-6">
              <label className="block text-foreground font-medium mb-4">
                מה סוג המחיר העיקרי?
              </label>
              {renderChoiceButtons(priceTypeOptions, coaching.personalPriceType, (id) => updateCoaching({ personalPriceType: id }))}
            </div>

            {/* Gold Question */}
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30">
              <label className="block text-foreground font-medium mb-3">
                ✨ שאלת הזהב: אם היית צריך לבחור דבר אחד קטן שתעשה אחרת בשבוע הקרוב כדי לפתח עובד אחד – מה זה היה?
              </label>
              <Textarea
                value={coaching.oneSmallThing}
                onChange={(e) => updateCoaching({ oneSmallThing: e.target.value })}
                placeholder="מה הדבר הקטן שתשנה..."
                rows={2}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-slide-up">
        <ProgressBar currentStep={5} totalSteps={8} />

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                חניכה ופיתוח עובדים
              </h2>
              <p className="text-muted-foreground">
                Coaching & Development
              </p>
            </div>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {currentLayer} / {totalLayers}
            </div>
          </div>

          {/* Layer Progress */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: totalLayers }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx < currentLayer ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[400px]">
            {renderLayerContent()}
          </div>

          {/* Insight at the end */}
          {currentLayer === totalLayers && coaching.personalPriceType && (
            <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-primary/20">
              <p className="text-sm text-foreground font-medium">
                💡 {getCoachingInsight(coaching)}
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={handlePrevLayer} className="flex-1">
              <ChevronRight className="w-4 h-4 ml-2" />
              חזרה
            </Button>
            <Button 
              variant="hero" 
              onClick={handleNextLayer} 
              className="flex-1"
              disabled={!canProceedToNextLayer()}
            >
              {currentLayer === totalLayers ? 'המשך' : 'הבא'}
              <ChevronLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachingStep;
