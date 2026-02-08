import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
}

export const StreakWidget: React.FC<StreakWidgetProps> = ({ currentStreak, longestStreak }) => {
  return (
    <Card className="bg-orange-50/50 border-orange-100">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-orange-600 fill-orange-600' : 'text-orange-300'}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-orange-900">רצף נוכחי</p>
            <p className="text-2xl font-bold text-orange-700">{currentStreak} ימים</p>
          </div>
        </div>
        <div className="text-left">
          <p className="text-[10px] text-orange-600 uppercase font-bold tracking-wider">שיא אישי</p>
          <div className="flex items-center gap-1 justify-end">
            <Trophy className="w-3 h-3 text-orange-500" />
            <span className="text-sm font-bold text-orange-700">{longestStreak}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProgressWidgetProps {
  label: string;
  current: number;
  total: number;
  color?: string;
}

export const ProgressWidget: React.FC<ProgressWidgetProps> = ({ label, current, total, color = "bg-primary" }) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="font-bold">{percentage}%</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-[10px] text-muted-foreground text-left">{current} מתוך {total} הושלמו</p>
    </div>
  );
};
