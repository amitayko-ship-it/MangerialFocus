import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadWithExpiry, saveWithExpiry } from '@/lib/storageUtils';
import { motion } from 'framer-motion';
import {
  BigRock, PracticeSchedule, ScheduledEvent,
  KeystoneSuccess, ExecutionStakeholder, TimeWindow,
  WeeklyTracker,
} from '@/types/focus';
import {
  Plus, Target, Trophy, Sparkles, Calendar,
  CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Clock, Zap, Flame, Sun
} from 'lucide-react';
import { StreakWidget, ProgressWidget } from '@/components/motivation/MotivationWidgets';
import { MorningRitual } from '@/components/morning-ritual/MorningRitual';

const DAY_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const TIME_WINDOW_LABEL: Record<TimeWindow, string> = {
  morning: 'בוקר',
  afternoon: 'צהריים',
  evening: 'ערב',
};

interface ExecutionPlanData {
  rockTitle: string;
  schedules: PracticeSchedule[];
  events: ScheduledEvent[];
  totalWeeklyMinutes: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [executionPlan, setExecutionPlan] = useState<ExecutionPlanData | null>(null);
  const [keystoneSuccess, setKeystoneSuccess] = useState<KeystoneSuccess | null>(null);
  const [tracker, setTracker] = useState<WeeklyTracker | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showRitual, setShowRitual] = useState(false);
  const [progress, setProgress] = useState({ currentStreak: 0, longestStreak: 0 });
  const [bigRocks, setBigRocks] = useState<BigRock[]>([]);

  useEffect(() => {
    const plan = loadWithExpiry<ExecutionPlanData>('execution-plan');
    const ks = loadWithExpiry<KeystoneSuccess>('keystone-success');
    const savedTracker = loadWithExpiry<WeeklyTracker>('weekly-tracker');
    const savedRocks = loadWithExpiry<BigRock[]>('big-rocks-order');

    setExecutionPlan(plan);
    setKeystoneSuccess(ks);
    setBigRocks(savedRocks || []);

    if (savedTracker) {
      setTracker(savedTracker);
      const start = new Date(savedTracker.startDate);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const currentWeek = Math.min(Math.max(Math.floor(diffDays / 7) + 1, 1), 4);
      setSelectedWeek(currentWeek);
    } else if (plan) {
      const newTracker: WeeklyTracker = {
        startDate: new Date().toISOString(),
        weeks: {},
      };
      setTracker(newTracker);
      saveWithExpiry('weekly-tracker', newTracker, 90 * 24 * 60 * 60 * 1000);
      setSelectedWeek(1);
    }

    // Check if ritual was done today
    const lastRitual = localStorage.getItem('last-morning-ritual');
    const today = new Date().toDateString();
    if (lastRitual !== today) {
      setShowRitual(true);
    }

    // Fetch progress from API
    fetch('/api/motivation/progress')
      .then(res => res.json())
      .then(data => setProgress({ 
        currentStreak: data.current_streak || 0, 
        longestStreak: data.longest_streak || 0 
      }))
      .catch(console.error);
  }, []);

  const handleRitualComplete = async (selected: string[]) => {
    localStorage.setItem('last-morning-ritual', new Date().toDateString());
    setShowRitual(false);
    
    // Log activity to API
    try {
      const res = await fetch('/api/motivation/activity', { method: 'POST' });
      const data = await res.json();
      setProgress({ 
        currentStreak: data.current_streak, 
        longestStreak: data.longest_streak 
      });
    } catch (e) {
      console.error(e);
    }
  };

  const practices = executionPlan?.schedules || [];

  const getWeekData = (week: number) => {
    if (!tracker?.weeks[week]) {
      return {
        practiceCompletions: {} as Record<number, boolean[]>,
        keystoneDays: Array(7).fill(false),
        notes: '',
      };
    }
    return tracker.weeks[week];
  };

  const togglePracticeDay = (weekNum: number, practiceIdx: number, dayIdx: number) => {
    if (!tracker) return;

    const updated = { ...tracker };
    if (!updated.weeks[weekNum]) {
      updated.weeks[weekNum] = {
        practiceCompletions: {},
        keystoneDays: Array(7).fill(false),
        notes: '',
      };
    }

    const week = updated.weeks[weekNum];
    if (!week.practiceCompletions[practiceIdx]) {
      week.practiceCompletions[practiceIdx] = Array(7).fill(false);
    }

    week.practiceCompletions[practiceIdx][dayIdx] = !week.practiceCompletions[practiceIdx][dayIdx];

    setTracker({ ...updated });
    saveWithExpiry('weekly-tracker', updated, 90 * 24 * 60 * 60 * 1000);
  };

  const toggleKeystoneDay = (weekNum: number, dayIdx: number) => {
    if (!tracker) return;

    const updated = { ...tracker };
    if (!updated.weeks[weekNum]) {
      updated.weeks[weekNum] = {
        practiceCompletions: {},
        keystoneDays: Array(7).fill(false),
        notes: '',
      };
    }

    updated.weeks[weekNum].keystoneDays[dayIdx] = !updated.weeks[weekNum].keystoneDays[dayIdx];

    setTracker({ ...updated });
    saveWithExpiry('weekly-tracker', updated, 90 * 24 * 60 * 60 * 1000);
  };

  const weekData = getWeekData(selectedWeek);

  const weeklyStats = useMemo(() => {
    let completed = 0;
    let total = 0;

    practices.forEach((p, pIdx) => {
      const freq = p.weeklyFrequency;
      total += freq;
      const days = weekData.practiceCompletions[pIdx] || [];
      completed += days.filter(Boolean).length;
    });

    const keystoneDone = weekData.keystoneDays.filter(Boolean).length;
    if (keystoneSuccess) {
      total += 7;
      completed += keystoneDone;
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      keystonePct: Math.round((keystoneDone / 7) * 100),
    };
  }, [practices, weekData, keystoneSuccess]);

  const overallStats = useMemo(() => {
    if (!tracker) return { completed: 0, total: 0, percentage: 0 };

    let completed = 0;
    let total = 0;

    for (let w = 1; w <= 4; w++) {
      const wd = tracker.weeks[w];
      practices.forEach((p, pIdx) => {
        total += p.weeklyFrequency;
        if (wd?.practiceCompletions[pIdx]) {
          completed += wd.practiceCompletions[pIdx].filter(Boolean).length;
        }
      });
      if (keystoneSuccess) {
        total += 7;
        if (wd?.keystoneDays) {
          completed += wd.keystoneDays.filter(Boolean).length;
        }
      }
    }

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [tracker, practices, keystoneSuccess]);

  if (!executionPlan) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4" dir="rtl">
          <Card>
            <CardHeader>
              <CardTitle>אין תוכנית פעילה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                צור תוכנית חדשה כדי להתחיל לעקוב אחרי ההתקדמות שלך
              </p>
              <Button onClick={() => navigate('/setup/execution-stakeholders')}>
                <Plus className="h-4 w-4 ml-2" />
                צור תוכנית חדשה
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const progressColor = overallStats.percentage >= 80 ? 'text-green-600' :
    overallStats.percentage >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-6 px-4 space-y-6" dir="rtl">
        {showRitual && executionPlan && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <MorningRitual 
              practices={practices.map((p, i) => ({ id: i.toString(), title: p.practice, duration: p.duration }))}
              onComplete={handleRitualComplete}
            />
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">הדשבורד שלי</h1>
              <p className="text-muted-foreground text-sm mt-1">תוכנית 30 יום</p>
            </div>
            <div className={`text-3xl font-bold ${progressColor}`}>
              {overallStats.percentage}%
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">האבנים הגדולות שלי</h2>
                </div>
                <div className="grid gap-3">
                  {bigRocks.length > 0 ? (
                    bigRocks.map((rock, idx) => {
                      const isKeystone = rock.title === executionPlan.rockTitle;
                      return (
                        <Card key={idx} className={`transition-all ${isKeystone ? 'border-primary/40 bg-primary/5 shadow-md ring-1 ring-primary/20' : 'bg-card'}`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                isKeystone ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                              }`}>
                                <Target className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className={`font-bold text-lg truncate ${isKeystone ? 'text-primary' : 'text-foreground'}`}>
                                    {rock.title}
                                  </p>
                                  {isKeystone && (
                                    <span className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      אבן מפתח
                                    </span>
                                  )}
                                </div>
                                {isKeystone ? (
                                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{(executionPlan.totalWeeklyMinutes / 60).toFixed(1)} שעות בשבוע</span>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground mt-1">ממתין להגדרת פרקטיקות</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  ) : (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Target className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground">האבן הגדולה</p>
                            <p className="font-semibold text-lg">{executionPlan.rockTitle}</p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{(executionPlan.totalWeeklyMinutes / 60).toFixed(1)} שעות בשבוע</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <StreakWidget currentStreak={progress.currentStreak} longestStreak={progress.longestStreak} />
               <Card>
                 <CardContent className="p-4 space-y-4">
                   <ProgressWidget label="התקדמות חודשית" current={overallStats.completed} total={overallStats.total} />
                   <ProgressWidget label="הרגל מפתח" current={weekData.keystoneDays.filter(Boolean).length * 4} total={28} />
                 </CardContent>
               </Card>
            </div>
          </div>

          <div className="space-y-6">
            {keystoneSuccess && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-sm">הרגל מפתח</span>
                    </div>
                    <p className="text-sm bg-muted/50 p-2 rounded-lg">
                      מיד אחרי <strong>{keystoneSuccess.keystone.trigger}</strong>, אני אבצע{' '}
                      <strong>{keystoneSuccess.keystone.action}</strong> למשך {keystoneSuccess.keystone.duration || 5} דקות.
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-muted-foreground">מדד הצלחה:</span>
                      <span className="text-sm font-medium">{keystoneSuccess.successMetric}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold">מעקב שבועי</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={selectedWeek <= 1}
                    onClick={() => setSelectedWeek(w => w - 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium min-w-[80px] text-center">
                    שבוע {selectedWeek} מתוך 4
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={selectedWeek >= 4}
                    onClick={() => setSelectedWeek(w => w + 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">פרקטיקות</span>
                    <span className="font-medium">{weeklyStats.completed}/{weeklyStats.total}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${weeklyStats.percentage}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
                {keystoneSuccess && (
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">הרגל מפתח</span>
                      <span className="font-medium">{weekData.keystoneDays.filter(Boolean).length}/7</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-yellow-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${weeklyStats.keystonePct}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {practices.map((practice, pIdx) => (
                  <div key={pIdx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate flex-1 ml-2">{practice.practice}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {practice.weeklyFrequency}x | {practice.duration}ד׳ | {TIME_WINDOW_LABEL[practice.timeWindow]}
                      </span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {DAY_NAMES.map((day, dayIdx) => {
                        const isDone = weekData.practiceCompletions[pIdx]?.[dayIdx] || false;
                        const isScheduled = executionPlan.events.some(
                          e => e.practice === practice.practice && e.day === dayIdx
                        );
                        return (
                          <button
                            key={dayIdx}
                            onClick={() => togglePracticeDay(selectedWeek, pIdx, dayIdx)}
                            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all text-xs ${
                              isDone
                                ? 'bg-primary/15 text-primary border border-primary/30'
                                : isScheduled
                                ? 'bg-muted/80 border border-dashed border-primary/20 hover:bg-muted'
                                : 'bg-muted/30 hover:bg-muted/60'
                            }`}
                          >
                            <span className="text-[10px] text-muted-foreground">{day}</span>
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-primary" />
                            ) : (
                              <Circle className={`w-4 h-4 ${isScheduled ? 'text-primary/40' : 'text-muted-foreground/30'}`} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {keystoneSuccess && (
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">הרגל מפתח - {keystoneSuccess.keystone.action}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {DAY_NAMES.map((day, dayIdx) => {
                        const isDone = weekData.keystoneDays[dayIdx] || false;
                        return (
                          <button
                            key={dayIdx}
                            onClick={() => toggleKeystoneDay(selectedWeek, dayIdx)}
                            className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg transition-all text-xs ${
                              isDone
                                ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                                : 'bg-muted/30 hover:bg-muted/60'
                            }`}
                          >
                            <span className="text-[10px] text-muted-foreground">{day}</span>
                            {isDone ? (
                              <Flame className="w-4 h-4 text-yellow-500" />
                            ) : (
                              <Circle className="w-4 h-4 text-muted-foreground/30" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">סיכום 30 יום</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(w => {
                  const wd = tracker?.weeks[w];
                  let weekCompleted = 0;
                  let weekTotal = 0;
                  practices.forEach((p, pIdx) => {
                    weekTotal += p.weeklyFrequency;
                    if (wd?.practiceCompletions[pIdx]) {
                      weekCompleted += wd.practiceCompletions[pIdx].filter(Boolean).length;
                    }
                  });
                  if (keystoneSuccess) {
                    weekTotal += 7;
                    if (wd?.keystoneDays) {
                      weekCompleted += wd.keystoneDays.filter(Boolean).length;
                    }
                  }
                  const pct = weekTotal > 0 ? Math.round((weekCompleted / weekTotal) * 100) : 0;
                  const isActive = w === selectedWeek;

                  return (
                    <button
                      key={w}
                      onClick={() => setSelectedWeek(w)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <div className="text-xs mb-1">שבוע {w}</div>
                      <div className="text-lg font-bold">{pct}%</div>
                      <div className="text-[10px] opacity-70">{weekCompleted}/{weekTotal}</div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {executionPlan.events.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm">לוח שבועי</span>
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {DAY_NAMES.map((day, i) => (
                    <div key={i} className="text-center">
                      <div className="text-xs font-medium text-muted-foreground mb-1 pb-1 border-b">{day}</div>
                      <div className="space-y-1 min-h-[40px]">
                        {executionPlan.events
                          .filter(e => e.day === i)
                          .map((event, ei) => (
                            <div
                              key={ei}
                              className="text-[10px] leading-tight p-1 rounded bg-primary/10 text-primary border border-primary/20"
                              title={`${event.practice} - ${event.duration} דקות`}
                            >
                              <div className="truncate font-medium">{event.practice.substring(0, 8)}</div>
                              <div className="opacity-70">{event.duration}ד׳</div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
