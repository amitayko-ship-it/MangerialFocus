import React from 'react';
import { motion } from 'framer-motion';

interface WeeklyProgressRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  isRTL?: boolean;
}

export function WeeklyProgressRing({
  current,
  target,
  size = 160,
  strokeWidth = 12,
  isRTL = false,
}: WeeklyProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 100) return 'hsl(142.1 76.2% 36.3%)'; // green
    if (percentage >= 70) return 'hsl(262.1 83.3% 57.8%)'; // primary
    if (percentage >= 40) return 'hsl(47.9 95.8% 53.1%)'; // yellow
    return 'hsl(0 84.2% 60.2%)'; // red
  };

  const color = getColor();

  return (
    <div className="flex items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color }}>
            {current}
          </div>
          <div className="text-sm text-muted-foreground">
            {isRTL ? 'מתוך' : 'of'} {target}
          </div>
          <div className="text-xs text-muted-foreground mt-1">{Math.round(percentage)}%</div>
        </div>
      </div>
    </div>
  );
}
