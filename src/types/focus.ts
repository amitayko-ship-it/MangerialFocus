export type FocusArea = 'big-rocks' | 'interfaces' | 'managing-up' | 'strategy';

export type StakeholderRole = 'partner' | 'approver' | 'fyi';
export type StakeholderStatus = 'none' | 'asked' | 'approved';

export interface Stakeholder {
  name: string;
  role: string;
  email?: string;
  action?: string;
  duration?: number;
  engagementType?: string;
  frequency?: string;
}

export interface ExecutionStakeholder {
  id: string;
  name: string;
  role: StakeholderRole;
  ask: string;
  status: StakeholderStatus;
}

export interface BigRock {
  id: string;
  title: string;
  order: number;
  practices?: string[];
  isBreakthrough?: boolean;
}

export type TimeWindow = 'morning' | 'afternoon' | 'evening';

export interface PracticeSchedule {
  practice: string;
  weeklyFrequency: number;
  duration: 15 | 30 | 45 | 60;
  timeWindow: TimeWindow;
}

export interface ScheduledEvent {
  practice: string;
  day: number;
  timeWindow: TimeWindow;
  duration: number;
}

export interface ExecutionPlan {
  rockTitle: string;
  practices: PracticeSchedule[];
  scheduledEvents: ScheduledEvent[];
  totalWeeklyMinutes: number;
}

export interface KeystoneHabit {
  trigger: string;
  action: string;
  duration: number;
}

export interface KeystoneSuccess {
  keystone: KeystoneHabit;
  successMetric: string;
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

export interface WeeklyPracticeLog {
  [practiceIndex: number]: boolean[];
}

export interface WeeklyTracker {
  startDate: string;
  weeks: {
    [weekNumber: number]: {
      practiceCompletions: WeeklyPracticeLog;
      keystoneDays: boolean[];
      notes: string;
    };
  };
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
