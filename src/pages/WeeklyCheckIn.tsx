import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { EmojiSlider } from '@/components/dashboard/EmojiSlider';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { getWeek, getYear } from 'date-fns';
import { ArrowLeft, Save, Calendar, Loader2 } from 'lucide-react';

interface FocusPlan {
  id: string;
  weekly_work_hours: number;
  tasks: string[];
}

const WeeklyCheckIn: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusPlan, setFocusPlan] = useState<FocusPlan | null>(null);

  // Form state
  const [hoursFocused, setHoursFocused] = useState<number>(0);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number>(0);
  const [passionLevel, setPassionLevel] = useState<number>(0);

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

      if (planError) {
        throw planError;
      }

      setFocusPlan(planData);

      // Load existing check-in if any
      const { data: checkData } = await supabase
        .from('weekly_checks')
        .select('*')
        .eq('focus_plan_id', planData.id)
        .eq('week_number', currentWeek)
        .eq('year', currentYear)
        .single();

      if (checkData) {
        setHoursFocused(checkData.minutes_focused / 60);
        setCompletedTasks(checkData.tasks_completed || []);
        setEnergyLevel(checkData.energy_level || 0);
        setPassionLevel(checkData.passion_level || 0);
      }
    } catch (error) {
      console.error('Error loading check-in data:', error);
      toast.error(t.common.error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskToggle = (task: string) => {
    setCompletedTasks((prev) =>
      prev.includes(task) ? prev.filter((t) => t !== task) : [...prev, task]
    );
  };

  const handleSave = async () => {
    if (!focusPlan) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('weekly_checks').upsert(
        {
          focus_plan_id: focusPlan.id,
          week_number: currentWeek,
          year: currentYear,
          minutes_focused: Math.round(hoursFocused * 60),
          tasks_completed: completedTasks,
          energy_level: energyLevel,
          passion_level: passionLevel,
        },
        {
          onConflict: 'focus_plan_id,week_number,year',
        }
      );

      if (error) throw error;

      toast.success(t.checkin.saved);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error(t.checkin.saveFailed);
    } finally {
      setSaving(false);
    }
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
        <div className="container max-w-2xl mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.common.error}</CardTitle>
              <CardDescription>
                {isRTL ? 'לא נמצאה תוכנית פעילה' : 'No active plan found'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t.common.back}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const percentage = focusPlan.weekly_work_hours > 0
    ? Math.round((hoursFocused / focusPlan.weekly_work_hours) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{t.checkin.title}</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {t.dashboard.week} {currentWeek} - {currentYear}
              </p>
            </div>
          </div>

          {/* Focus Time Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.checkin.focusTime}</CardTitle>
              <CardDescription>
                {t.checkin.outOfWeek.replace('{hours}', focusPlan.weekly_work_hours.toString())}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hours">{t.checkin.howManyHours}</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={hoursFocused}
                  onChange={(e) => setHoursFocused(parseFloat(e.target.value) || 0)}
                  className="text-lg"
                />
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{percentage}%</div>
                <div className="text-sm text-muted-foreground">{t.dashboard.ofWeek}</div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.checkin.weeklyTasks}</CardTitle>
              <CardDescription>
                {completedTasks.length} {isRTL ? 'מתוך' : 'of'} {focusPlan.tasks?.length || 0}{' '}
                {isRTL ? 'הושלמו' : 'completed'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {focusPlan.tasks?.map((task, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50">
                    <Checkbox
                      id={`task-${index}`}
                      checked={completedTasks.includes(task)}
                      onCheckedChange={() => handleTaskToggle(task)}
                    />
                    <label
                      htmlFor={`task-${index}`}
                      className={`flex-1 cursor-pointer ${
                        completedTasks.includes(task) ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Energy Level Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.checkin.energyLevel}</CardTitle>
              <CardDescription>{t.checkin.energyHow}</CardDescription>
            </CardHeader>
            <CardContent>
              <EmojiSlider
                value={energyLevel}
                onChange={setEnergyLevel}
                type="energy"
                isRTL={isRTL}
              />
            </CardContent>
          </Card>

          {/* Passion/Motivation Level Card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.checkin.motivationLevel}</CardTitle>
              <CardDescription>{t.checkin.motivationHow}</CardDescription>
            </CardHeader>
            <CardContent>
              <EmojiSlider
                value={passionLevel}
                onChange={setPassionLevel}
                type="passion"
                isRTL={isRTL}
              />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')} disabled={saving}>
              {t.common.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  {t.common.loading}
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {t.common.save}
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default WeeklyCheckIn;
