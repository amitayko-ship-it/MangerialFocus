export type FocusArea = 'big-rocks' | 'interfaces' | 'managing-up' | 'strategy';

export interface Stakeholder {
  name: string;
  role: string;
  email?: string;
  action?: string;
  duration?: number;
  engagementType?: string;
  frequency?: string;
}

export interface BigRock {
  id: string;
  title: string;
  order: number;
  practices?: string[];
  isBreakthrough?: boolean;
}

export interface OnboardingData {
  focusArea: FocusArea;
  twelveWeekGoal: string;
  weeklyTimeTarget: number;
  initialEnergy: 1 | 2 | 3 | 4 | 5;
  passionLevel: 1 | 2 | 3 | 4 | 5;
  stakeholders: Stakeholder[];
  tasks?: { text: string; recurring: boolean }[];
  energyBoosters?: string[];
  dependencyLevel?: number;
  successVision?: string;
}

export interface WeeklyProgress {
  weekNumber: number;
  year: number;
  minutesFocused: number;
  minutesTarget: number;
  tasksCompleted: boolean[];
  energyLevel: number;
  passionLevel: number;
  completed: boolean;
}

export interface FocusPlanSummary {
  focusArea: FocusArea;
  goal: string;
  weeklyTarget: number;
  tasks: string[];
  stakeholders: Stakeholder[];
  startDate: Date;
  currentWeek: number;
  totalWeeks: 12;
}
