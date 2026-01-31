import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WeeklyProgressRing } from '@/components/dashboard/WeeklyProgressRing';
import { JourneyGrid } from '@/components/dashboard/JourneyGrid';
import { getWeek, getYear } from 'date-fns';
import { CalendarCheck, MessageSquare, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface FocusPlan {
  id: string;
  weekly_work_hours: number;
  tasks: string[];
}

interface WeeklyCheck {
  week_number: number;
  year: number;
  minutes_focused: number;
  tasks_completed: string[];
  energy_level: number;
  passion_level: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [focusPlan, setFocusPlan] = useState<FocusPlan | null>(null);
  const [currentWeekCheck, setCurrentWeekCheck] = useState<WeeklyCheck | null>(null);
  const [allWeeklyChecks, setAllWeeklyChecks] = useState<WeeklyCheck[]>([]);

  const currentWeek = getWeek(new Date());
  const currentYear = getYear(new Date());

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load active focus plan
      const { data: planData, error: planError } = await supabase
        .from('focus_plans')
        .select('id, weekly_work_hours, tasks')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (planError && planError.code !== 'PGRST116') {
        throw planError;
      }

      setFocusPlan(planData);

      if (planData) {
        // Load current week's check-in
        const { data: currentCheck } = await supabase
          .from('weekly_checks')
          .select('*')
          .eq('focus_plan_id', planData.id)
          .eq('week_number', currentWeek)
          .eq('year', currentYear)
          .single();

        setCurrentWeekCheck(currentCheck);

        // Load all weekly checks for the journey
        const { data: allChecks } = await supabase
          .from('weekly_checks')
          .select('*')
          .eq('focus_plan_id', planData.id)
          .eq('year', currentYear)
          .order('week_number', { ascending: true });

        setAllWeeklyChecks(allChecks || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const getJourneyWeeks = () => {
    return Array.from({ length: 12 }, (_, i) => {
      const weekNumber = i + 1;
      const check = allWeeklyChecks.find((c) => c.week_number === weekNumber);
      return {
        weekNumber,
        completed: !!check,
        current: weekNumber === currentWeek,
      };
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!focusPlan) {
    return (
      <DashboardLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.dashboard.noActivePlan}</CardTitle>
              <CardDescription>
                {isRTL
                  ? 'צור תוכנית חדשה כדי להתחיל לעקוב אחרי ההתקדמות שלך'
                  : 'Create a new plan to start tracking your progress'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/setup/focus-areas')}>
                <Plus className="h-4 w-4 mr-2" />
                {t.dashboard.createPlan}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const hoursFocused = currentWeekCheck ? currentWeekCheck.minutes_focused / 60 : 0;
  const targetHours = focusPlan.weekly_work_hours;

  return (
    <DashboardLayout>
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t.dashboard.title}</h1>
        </div>

        <Tabs defaultValue="week" className="space-y-6">
          <TabsList>
            <TabsTrigger value="week">{t.dashboard.myWeek}</TabsTrigger>
            <TabsTrigger value="journey">{t.dashboard.journey}</TabsTrigger>
            <TabsTrigger value="insights">{t.dashboard.insights}</TabsTrigger>
          </TabsList>

          <TabsContent value="week" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Progress Ring Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.dashboard.weeklyProgress}</CardTitle>
                  <CardDescription>
                    {t.dashboard.week} {currentWeek}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                  <WeeklyProgressRing current={hoursFocused} target={targetHours} isRTL={isRTL} />
                </CardContent>
              </Card>

              {/* Tasks Card */}
              <Card>
                <CardHeader>
                  <CardTitle>{t.dashboard.tasks}</CardTitle>
                  <CardDescription>
                    {currentWeekCheck?.tasks_completed?.length || 0} {isRTL ? 'מתוך' : 'of'}{' '}
                    {focusPlan.tasks?.length || 0} {isRTL ? 'הושלמו' : 'completed'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {focusPlan.tasks?.map((task, index) => {
                      const isCompleted = currentWeekCheck?.tasks_completed?.includes(task);
                      return (
                        <div
                          key={index}
                          className={cn(
                            'p-3 rounded-lg border',
                            isCompleted && 'bg-muted border-primary/50 line-through text-muted-foreground'
                          )}
                        >
                          {task}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate('/weekly-checkin')} size="lg">
                <CalendarCheck className="h-5 w-5 mr-2" />
                {t.dashboard.weeklyCheckin}
              </Button>
              <Button onClick={() => navigate('/feedback-request')} variant="outline" size="lg">
                <MessageSquare className="h-5 w-5 mr-2" />
                {t.dashboard.requestFeedback}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="journey">
            <Card>
              <CardHeader>
                <CardTitle>{t.dashboard.journey}</CardTitle>
                <CardDescription>
                  {isRTL ? 'המסע שלך ב-12 השבועות' : 'Your 12-week journey'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JourneyGrid weeks={getJourneyWeeks()} isRTL={isRTL} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights">
            <Card>
              <CardHeader>
                <CardTitle>{t.dashboard.insights}</CardTitle>
              </CardHeader>
              <CardContent className="py-12 text-center text-muted-foreground">
                {isRTL ? 'בקרוב...' : 'Coming soon...'}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default Dashboard;
