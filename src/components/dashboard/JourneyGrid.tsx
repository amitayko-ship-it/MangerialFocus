import React from 'react';
import { cn } from '@/lib/utils';

interface WeekData {
  weekNumber: number;
  completed: boolean;
  current: boolean;
}

interface JourneyGridProps {
  weeks: WeekData[];
  isRTL?: boolean;
}

export function JourneyGrid({ weeks, isRTL = false }: JourneyGridProps) {
  // Ensure we have exactly 12 weeks
  const allWeeks: WeekData[] = Array.from({ length: 12 }, (_, i) => {
    const weekData = weeks.find((w) => w.weekNumber === i + 1);
    return weekData || { weekNumber: i + 1, completed: false, current: false };
  });

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {allWeeks.map((week) => (
        <div
          key={week.weekNumber}
          className={cn(
            'aspect-square rounded-lg flex items-center justify-center font-semibold text-sm transition-all',
            week.completed && 'bg-primary text-primary-foreground',
            week.current && 'ring-2 ring-primary ring-offset-2 bg-background',
            !week.completed && !week.current && 'bg-muted text-muted-foreground'
          )}
        >
          {isRTL ? `שבוע ${week.weekNumber}` : `W${week.weekNumber}`}
        </div>
      ))}
    </div>
  );
}
