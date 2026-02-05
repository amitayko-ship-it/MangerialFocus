import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import ProgressBar from './ProgressBar';
import { InterfaceJourneyData, initialInterfaceJourneyData } from '@/types/managementCompass';

interface InterfacesMapStepProps {
  interfaceJourney?: InterfaceJourneyData;
  onInterfaceJourneyChange: (data: InterfaceJourneyData) => void;
  onNext: () => void;
  onBack: () => void;
}

const frictionReasons = [
  { id: 'priorities', label: 'העומס / סדרי העדיפויות של הצד השני', icon: '📊' },
  { id: 'roles', label: 'חוסר בהירות תפקידית / תחומי אחריות', icon: '🎯' },
  { id: 'goals', label: 'מטרות סותרות', icon: '⚔️' },
  { id: 'communication', label: 'סגנון תקשורת / יחסים', icon: '💬' },
  { id: 'self', label: 'לא ניהלתי את זה מספיק טוב', icon: '🪞' },
];

const actionNatureOptions = [
  { id: 'explained', label: 'הסברתי את הצרכים שלי וקיוויתי שזה יסתדר', icon: '📢' },
  { id: 'pointSolution', label: 'ניסינו לפתור נקודה נקודתית שעלתה', icon: '🔧' },
  { id: 'sharedGoal', label: 'הגדרנו מטרה משותפת וצעדים ברורים', icon: '🎯' },
  { id: 'vague', label: 'השיחה נשארה כללית / מרומזת', icon: '🌫️' },
  { id: 'avoided', label: 'נמנעתי משיחה כזו', icon: '🚫' },
];

const influenceMomentOptions = [
  { id: 'yes', label: 'כן, היה רגע כזה', icon: '✅' },
  { id: 'maybe', label: 'אולי, אבל לא נתתי לזה המשך', icon: '🤔' },
  { id: 'no', label: 'לא, לא היה רגע כזה', icon: '❌' },
];

const futureLeverageOptions = [
  { id: 'earlyTalk', label: 'ליזום שיחה מוקדמת וברורה יותר', icon: '🗣️' },
  { id: 'clearGoals', label: 'להגדיר מטרה וגבולות בצורה חדה', icon: '🎯' },
  { id: 'buildTrust', label: 'להשקיע קודם בבניית אמון', icon: '🤝' },
  { id: 'buildProcess', label: 'לבנות שגרה / תהליך עבודה', icon: '📋' },
  { id: 'nothing', label: 'לא בטוח שיש לי מה לעשות אחרת', icon: '🤷' },
];

const priceTypeOptions = [
  { id: 'time', label: 'זמן', icon: '⏰' },
  { id: 'energy', label: 'אנרגיה', icon: '🔋' },
  { id: 'nerves', label: 'עצבים', icon: '😤' },
  { id: 'delay', label: 'עיכוב ביצוע', icon: '⏳' },
  { id: 'result', label: 'פגיעה בתוצאה', icon: '📉' },
];

const InterfacesMapStep: React.FC<InterfacesMapStepProps> = ({
  interfaceJourney: journeyProp,
  onInterfaceJourneyChange,
  onNext,
  onBack,
}) => {
  const journey = journeyProp || initialInterfaceJourneyData;
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 9;

  const updateJourney = (updates: Partial<InterfaceJourneyData>) => {
    onInterfaceJourneyChange({ ...journey, ...updates });
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 0: return true; // General influence has default
      case 1: return journey.interfaceRole.trim() !== '';
      case 2: return true; // Situation influence has default
      case 3: return journey.frictionReason !== '';
      case 4: return true; // Initiative score has default
      case 5: return journey.actionNature !== '';
      case 6: return true; // Change score has default
      case 7: return journey.futureLeverage !== '';
      case 8: return true; // Price score has default
      default: return true;
    }
  };

  const handleNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onNext();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

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

  const togglePriceType = (typeId: string) => {
    const currentTypes = journey.priceTypes || [];
    if (currentTypes.includes(typeId)) {
      updateJourney({ priceTypes: currentTypes.filter(t => t !== typeId) });
    } else {
      updateJourney({ priceTypes: [...currentTypes, typeId] });
    }
  };

  // Generate insight based on data
  const getInsight = (): string => {
    const highGeneral = journey.generalInfluence >= 4;
    const lowSituation = journey.situationInfluence <= 2;
    const lowInitiative = journey.initiativeScore <= 2;
    const hadInfluence = journey.influenceMoment === 'yes' || journey.influenceMoment === 'maybe';

    if (highGeneral && lowInitiative) {
      return 'באופן כללי אתה מאמין שיש לך יכולת להשפיע על ממשקים, אך במקרה שבחרת כמעט ולא הופעלו מהלכים שיכלו לממש את ההשפעה הזו.';
    }

    if (hadInfluence && lowSituation) {
      return 'גם במקרה שנתפס כ"לא בשליטתך", זיהית רגע שבו פעולה שלך כן השפיעה – מה שמרמז שיש לך יותר יכולת השפעה ממה שאתה נוטה לייחס לעצמך.';
    }

    if (journey.frictionReason === 'self') {
      return 'העובדה שאתה לוקח אחריות על חלקך בחיכוך מראה על מודעות עצמית גבוהה – זו נקודת מוצא טובה לשינוי.';
    }

    return 'המקרה שבחרת מלמד על הפוטנציאל להשפעה גדולה יותר בממשקים שלך.';
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              באופן כללי, עד כמה אתה מאמין שיש לך יכולת אמיתית להשפיע על איכות העבודה בממשקים המרכזיים שלך?
            </label>
            {renderScaleButtons(
              journey.generalInfluence,
              (val) => updateJourney({ generalInfluence: val }),
              'כמעט אין לי השפעה',
              'יש לי השפעה משמעותית'
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-accent/30 border border-primary/20 mb-4">
              <p className="text-foreground">
                עכשיו בחר ממשק אחד ספציפי מהחודש האחרון
                <span className="block text-sm text-muted-foreground mt-1">
                  (אדם / צוות / פונקציה) שבו הרגשת חיכוך, תקיעות או בזבוז אנרגיה.
                </span>
              </p>
            </div>
            <label className="block text-foreground font-medium mb-2">
              תפקיד / ממשק (לא שם פרטי):
            </label>
            <Input
              value={journey.interfaceRole}
              onChange={(e) => updateJourney({ interfaceRole: e.target.value })}
              placeholder="למשל: מנהל מכירות, צוות פיתוח..."
              className="text-right"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              במקרה הספציפי הזה, עד כמה הרגשת שיש לך יכולת להשפיע על איך הדברים מתנהלים?
            </label>
            {renderScaleButtons(
              journey.situationInfluence,
              (val) => updateJourney({ situationInfluence: val }),
              'כמעט לא הרגשתי יכולת',
              'הרגשתי שליטה גבוהה'
            )}
            {journey.generalInfluence >= 4 && journey.situationInfluence <= 2 && (
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/30 flex items-start gap-3 mt-4">
                <AlertCircle className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  יש פער בין התפיסה הכללית שלך (השפעה גבוהה) לבין מה שחווית במקרה הספציפי.
                </p>
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              כשאתה חושב על המקרה הזה, מה בעיניך הסיבה המרכזית לכך שהוא תקוע?
            </label>
            {renderChoiceButtons(frictionReasons, journey.frictionReason, (id) => updateJourney({ frictionReason: id }))}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              במקרה הזה, עד כמה יזמת אתה פעולה מכוונת כדי לשפר את הממשק?
              <span className="block text-sm text-muted-foreground mt-1">
                (שיחה, הבהרת ציפיות, ניסיון להגדיר מטרה משותפת)
              </span>
            </label>
            {renderScaleButtons(
              journey.initiativeScore,
              (val) => updateJourney({ initiativeScore: val }),
              'לא יזמתי כלל',
              'יזמתי מהלך ברור'
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              אם התקיימה שיחה או ניסיון טיפול – מה הכי קרוב למה שקרה בפועל?
            </label>
            {renderChoiceButtons(actionNatureOptions, journey.actionNature, (id) => updateJourney({ actionNature: id }))}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              אחרי מה שקרה (או לא קרה), עד כמה משהו בהתנהלות הממשק השתנה בפועל?
            </label>
            {renderScaleButtons(
              journey.changeScore,
              (val) => updateJourney({ changeScore: val }),
              'שום דבר לא השתנה',
              'יש שיפור ברור'
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <label className="block text-foreground font-medium mb-4">
              אם אותו מקרה היה חוזר מחר – מה דבר אחד שאתה יכול לעשות אחרת, שנמצא בשליטתך?
            </label>
            {renderChoiceButtons(futureLeverageOptions, journey.futureLeverage, (id) => updateJourney({ futureLeverage: id }))}
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div className="mb-6">
              <label className="block text-foreground font-medium mb-4">
                עד כמה המקרה הזה גבה ממך מחיר ניהולי?
              </label>
              {renderScaleButtons(
                journey.priceScore,
                (val) => updateJourney({ priceScore: val }),
                'כמעט לא',
                'מחיר כבד'
              )}
            </div>

            <div>
              <label className="block text-foreground font-medium mb-4">
                מה סוג המחיר? (ניתן לבחור מספר)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {priceTypeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => togglePriceType(option.id)}
                    className={`
                      p-3 rounded-xl text-right transition-all duration-200
                      flex items-center gap-2 border-2
                      ${(journey.priceTypes || []).includes(option.id)
                        ? 'border-primary bg-accent shadow-soft'
                        : 'border-border bg-background hover:border-primary/50 hover:bg-muted/50'
                      }
                    `}
                  >
                    <span className="text-xl">{option.icon}</span>
                    <span className="text-sm font-medium text-foreground">{option.label}</span>
                    {(journey.priceTypes || []).includes(option.id) && (
                      <Check className="w-4 h-4 text-primary mr-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Insight */}
            <div className="mt-6 p-4 rounded-xl bg-accent/50 border border-primary/20">
              <p className="text-sm text-foreground font-medium">
                💡 {getInsight()}
              </p>
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
        <ProgressBar currentStep={4} totalSteps={8} />

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                ניהול ממשקים
              </h2>
              <p className="text-muted-foreground">
                פער תפיסה דרך מקרה אמיתי
              </p>
            </div>
            <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {currentStep + 1} / {totalSteps}
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex gap-1 mb-6">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          <div className="flex gap-4 mt-6">
            <Button variant="outline" onClick={handlePrevStep} className="flex-1">
              <ChevronRight className="w-4 h-4 ml-2" />
              חזרה
            </Button>
            <Button 
              variant="hero" 
              onClick={handleNextStep} 
              className="flex-1"
              disabled={!canProceedToNextStep()}
            >
              {currentStep === totalSteps - 1 ? 'המשך' : 'הבא'}
              <ChevronLeft className="w-4 h-4 mr-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterfacesMapStep;
