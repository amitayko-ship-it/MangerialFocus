import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import ProgressBar from './ProgressBar';

interface Quadrants {
  urgentImportant: number;
  importantNotUrgent: number;
  urgentNotImportant: number;
  notUrgentNotImportant: number;
}

interface TimeEnergyStepProps {
  quadrants: Quadrants;
  breathingSpace: number;
  onQuadrantsChange: (quadrants: Quadrants) => void;
  onBreathingSpaceChange: (score: number) => void;
  onNext: () => void;
  onBack: () => void;
}

const quadrantLabels: Record<keyof Quadrants, { label: string; color: string }> = {
  urgentImportant: { label: 'חשוב ודחוף', color: 'hsl(var(--destructive))' },
  importantNotUrgent: { label: 'חשוב ולא דחוף', color: 'hsl(var(--primary))' },
  urgentNotImportant: { label: 'דחוף ולא חשוב', color: 'hsl(var(--secondary))' },
  notUrgentNotImportant: { label: 'לא חשוב ולא דחוף', color: 'hsl(var(--muted))' },
};

const TimeEnergyStep: React.FC<TimeEnergyStepProps> = ({
  quadrants,
  breathingSpace,
  onQuadrantsChange,
  onBreathingSpaceChange,
  onNext,
  onBack,
}) => {
  const total = useMemo(() => {
    return Object.values(quadrants).reduce((sum, val) => sum + val, 0);
  }, [quadrants]);

  const handleSliderChange = (key: keyof Quadrants, value: number[]) => {
    onQuadrantsChange({ ...quadrants, [key]: value[0] });
  };

  // Generate pie chart segments
  const pieSegments = useMemo(() => {
    let currentAngle = 0;
    return Object.entries(quadrants).map(([key, value]) => {
      const angle = (value / 100) * 360;
      const segment = {
        key,
        startAngle: currentAngle,
        endAngle: currentAngle + angle,
        color: quadrantLabels[key as keyof Quadrants].color,
      };
      currentAngle += angle;
      return segment;
    });
  }, [quadrants]);

  const describeArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M', start.x, start.y,
      'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      'L', 50, 50,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-2xl w-full animate-slide-up">
        <ProgressBar currentStep={2} totalSteps={8} />

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-medium border border-border">
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            זמן ואנרגיה
          </h2>
          <p className="text-muted-foreground mb-6">
            4 רבעים
          </p>

          {/* Pie Chart */}
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {pieSegments.map((segment) => (
                  <path
                    key={segment.key}
                    d={describeArc(segment.startAngle, segment.endAngle, 45)}
                    fill={segment.color}
                    stroke="hsl(var(--background))"
                    strokeWidth="1"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-2xl font-bold ${total === 100 ? 'text-primary' : 'text-destructive'}`}>
                  {total}%
                </span>
              </div>
            </div>
          </div>

          {total !== 100 && (
            <p className="text-center text-destructive text-sm mb-4">
              הסכום חייב להיות 100%
            </p>
          )}

          {/* Sliders */}
          <div className="space-y-5 mb-8">
            {(Object.keys(quadrants) as Array<keyof Quadrants>).map((key) => (
              <div key={key} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: quadrantLabels[key].color }}
                    />
                    {quadrantLabels[key].label}
                  </span>
                  <span className="text-muted-foreground font-mono">{quadrants[key]}%</span>
                </div>
                <Slider
                  value={[quadrants[key]]}
                  onValueChange={(value) => handleSliderChange(key, value)}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Q4 - Breathing Space */}
          <div className="mb-8 p-4 bg-muted/50 rounded-xl">
            <label className="block text-foreground font-medium mb-4">
              באיזו מידה יש לך מרחב נשימה לחשיבה ותכנון קדימה?
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => onBreathingSpaceChange(score)}
                  className={`
                    w-12 h-12 rounded-xl font-bold text-lg transition-all duration-200
                    ${breathingSpace === score
                      ? 'bg-primary text-primary-foreground shadow-soft'
                      : 'bg-background text-muted-foreground hover:bg-accent'
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

          <div className="flex gap-4">
            <Button variant="outline" onClick={onBack} className="flex-1">
              חזרה
            </Button>
            <Button 
              variant="hero" 
              onClick={onNext} 
              className="flex-1"
              disabled={total !== 100}
            >
              המשך
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeEnergyStep;
