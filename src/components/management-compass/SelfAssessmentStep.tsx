import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { AxesData, bigStones, AxisDefinition } from '@/types/managementCompass';

type Gender = 'male' | 'female';

interface SelfAssessmentStepProps {
  axes: AxesData;
  onAxesChange: (axes: AxesData) => void;
  onNext: () => void;
  onBack: () => void;
  gender: Gender;
}

const g = (gender: Gender, male: string, female: string) =>
  gender === 'female' ? female : male;

const colorClasses: Record<string, { border: string; bg: string; badge: string; selected: string; hover: string }> = {
  blue: {
    border: 'border-blue-200',
    bg: 'bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-800',
    selected: 'border-blue-500 bg-blue-50 ring-2 ring-blue-300',
    hover: 'hover:border-blue-300 hover:bg-blue-50/70',
  },
  green: {
    border: 'border-emerald-200',
    bg: 'bg-emerald-50/50',
    badge: 'bg-emerald-100 text-emerald-800',
    selected: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-300',
    hover: 'hover:border-emerald-300 hover:bg-emerald-50/70',
  },
  purple: {
    border: 'border-purple-200',
    bg: 'bg-purple-50/50',
    badge: 'bg-purple-100 text-purple-800',
    selected: 'border-purple-500 bg-purple-50 ring-2 ring-purple-300',
    hover: 'hover:border-purple-300 hover:bg-purple-50/70',
  },
  orange: {
    border: 'border-orange-200',
    bg: 'bg-orange-50/50',
    badge: 'bg-orange-100 text-orange-800',
    selected: 'border-orange-500 bg-orange-50 ring-2 ring-orange-300',
    hover: 'hover:border-orange-300 hover:bg-orange-50/70',
  },
  red: {
    border: 'border-rose-200',
    bg: 'bg-rose-50/50',
    badge: 'bg-rose-100 text-rose-800',
    selected: 'border-rose-500 bg-rose-50 ring-2 ring-rose-300',
    hover: 'hover:border-rose-300 hover:bg-rose-50/70',
  },
};

const levelLabels = ['1', '2', '3', '4', '5'];

interface AxisCardProps {
  axis: AxisDefinition;
  value: number;
  color: string;
  onChange: (val: number) => void;
}

const AxisCard: React.FC<AxisCardProps> = ({ axis, value, color, onChange }) => {
  const c = colorClasses[color];

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <h4 className="font-semibold text-foreground mb-4 text-base">{axis.title}</h4>
      <div className="space-y-2">
        {axis.levels.map((levelText, idx) => {
          const levelNum = idx + 1;
          const isSelected = value === levelNum;
          return (
            <button
              key={levelNum}
              onClick={() => onChange(levelNum)}
              className={`w-full text-right p-3 rounded-lg border transition-all duration-150 flex gap-3 items-start ${
                isSelected
                  ? c.selected
                  : `border-border bg-card ${c.hover}`
              }`}
            >
              <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mt-0.5 ${
                isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isSelected ? <Check className="w-4 h-4" /> : levelLabels[idx]}
              </span>
              <span className={`text-sm leading-relaxed ${isSelected ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {levelText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SelfAssessmentStep: React.FC<SelfAssessmentStepProps> = ({
  axes,
  onAxesChange,
  onNext,
  onBack,
  gender,
}) => {
  const [currentStoneIndex, setCurrentStoneIndex] = useState(0);

  const currentStone = bigStones[currentStoneIndex];
  const isLastStone = currentStoneIndex === bigStones.length - 1;
  const isFirstStone = currentStoneIndex === 0;

  const stoneAxesComplete = currentStone.axes.every(
    (ax) => axes[ax.key] > 0
  );

  const handleAxisChange = (key: keyof AxesData, val: number) => {
    onAxesChange({ ...axes, [key]: val });
  };

  const handleNext = () => {
    if (isLastStone) {
      onNext();
    } else {
      setCurrentStoneIndex((i) => i + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (isFirstStone) {
      onBack();
    } else {
      setCurrentStoneIndex((i) => i - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const c = colorClasses[currentStone.color];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              אבן {currentStoneIndex + 1} מתוך {bigStones.length}
            </span>
            <div className="flex gap-1">
              {bigStones.map((stone, idx) => (
                <button
                  key={stone.id}
                  onClick={() => setCurrentStoneIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    idx === currentStoneIndex
                      ? 'w-6 bg-primary'
                      : idx < currentStoneIndex
                      ? 'w-2 bg-primary/50'
                      : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${((currentStoneIndex + 1) / bigStones.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="mb-6">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${c.badge}`}>
            אבן {currentStoneIndex + 1}
          </span>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {currentStone.title}
          </h2>
          <p className="text-muted-foreground text-sm">
            {g(gender,
              'בחר את הרמה שמשקפת באופן המיטבי את המציאות שלך – ציר אחד בכל פעם.',
              'בחרי את הרמה שמשקפת באופן המיטבי את המציאות שלך – ציר אחד בכל פעם.'
            )}
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {currentStone.axes.map((axis) => (
            <AxisCard
              key={axis.key}
              axis={axis}
              value={axes[axis.key]}
              color={currentStone.color}
              onChange={(val) => handleAxisChange(axis.key, val)}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            {isFirstStone ? 'חזרה' : 'אבן קודמת'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!stoneAxesComplete}
            className="flex-1 flex items-center justify-center gap-2"
          >
            {isLastStone ? 'סיום שאלון – לשלב הבא' : 'לאבן הבאה'}
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>

        {!stoneAxesComplete && (
          <p className="text-center text-sm text-muted-foreground mt-3">
            {g(gender,
              'יש לבחור רמה בכל ציר לפני המעבר לאבן הבאה',
              'יש לבחור רמה בכל ציר לפני המעבר לאבן הבאה'
            )}
          </p>
        )}
      </div>
    </div>
  );
};

export default SelfAssessmentStep;
