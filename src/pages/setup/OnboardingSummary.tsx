import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowLeft, ArrowRight, Rocket } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { loadWithExpiry } from '@/lib/storageUtils';
import { BigRock } from '@/types/focus';

export default function OnboardingSummary() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Load all data from localStorage
    const questionnaireData = loadWithExpiry<any>('questionnaire-data');
    const bigRocks = loadWithExpiry<BigRock[]>('big-rocks-order');
    const onboardingData = loadWithExpiry<any>('focus-tracker-onboarding');

    setData({
      questionnaire: questionnaireData,
      bigRocks: bigRocks || [],
      onboarding: onboardingData || {},
    });
  }, []);

  const handleStartPlan = async () => {
    if (!user) {
      toast.error(isRTL ? 'יש להתחבר כדי להמשיך' : 'Please log in to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Get the 12-week goal from the first big rock
      const twelveWeekGoal = data?.bigRocks?.[0]?.title || '';

      // Prepare the focus plan data
      const focusPlanData = {
        user_id: user.id,
        focus_area: 'big-rocks', // Default focus area
        twelve_week_goal: twelveWeekGoal,
        weekly_time_target: data?.onboarding?.weeklyHours || 50,
        tasks: data?.onboarding?.tasks || [],
        energy_boosters: data?.onboarding?.energyBoosters || [],
        stakeholders: data?.onboarding?.stakeholders || [],
        dependency_level: data?.onboarding?.dependencyLevel || 50,
        big_rocks: data?.bigRocks || [],
        status: 'active',
        start_date: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Create/update focus_plan in Supabase
      const { error } = await supabase
        .from('focus_plans')
        .upsert(focusPlanData, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error creating focus plan:', error);
        toast.error(isRTL ? 'שגיאה ביצירת התוכנית' : 'Error creating plan');
        return;
      }

      toast.success(isRTL ? 'התוכנית נוצרה בהצלחה!' : 'Plan created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'שגיאה ביצירת התוכנית' : 'Error creating plan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    navigate('/setup/focus-area');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container max-w-4xl mx-auto px-4 py-12"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Check className="h-8 w-8 text-green-500" />
              <div>
                <CardTitle className="text-3xl">{t.summary.title}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {t.summary.subtitle}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Focus Area */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-muted-foreground">
                {t.summary.focusArea}
              </h3>
              <p className="text-xl">{t.focusAreas['big_rocks']}</p>
            </div>

            {/* 12-Week Goal */}
            {data.bigRocks && data.bigRocks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {t.summary.goal}
                </h3>
                <p className="text-xl">{data.bigRocks[0].title}</p>
                {data.bigRocks.length > 1 && (
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-2">
                    {data.bigRocks.slice(1).map((rock: BigRock, index: number) => (
                      <li key={index}>{rock.title}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Weekly Hours */}
            {data.onboarding?.weeklyHours && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {t.summary.weeklyTarget}
                </h3>
                <p className="text-xl">
                  {data.onboarding.weeklyHours} {t.dashboard.hours}
                </p>
              </div>
            )}

            {/* Tasks */}
            {data.onboarding?.tasks && data.onboarding.tasks.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {t.summary.tasks}
                </h3>
                <ul className="space-y-2">
                  {data.onboarding.tasks.map((task: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {task.text}
                        {task.recurring && (
                          <span className="text-sm text-muted-foreground ml-2">
                            ({isRTL ? 'חוזר' : 'Recurring'})
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stakeholders */}
            {data.onboarding?.stakeholders && data.onboarding.stakeholders.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {t.summary.stakeholders}
                </h3>
                <ul className="space-y-2">
                  {data.onboarding.stakeholders.map((stakeholder: any, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>
                        {stakeholder.name}
                        {stakeholder.role && (
                          <span className="text-sm text-muted-foreground ml-2">
                            - {stakeholder.role}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex-1"
                disabled={isLoading}
              >
                {isRTL ? <ArrowRight className="h-4 w-4 ml-2" /> : <ArrowLeft className="h-4 w-4 mr-2" />}
                {t.summary.editPlan}
              </Button>
              <Button
                onClick={handleStartPlan}
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    {t.summary.startPlan}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
