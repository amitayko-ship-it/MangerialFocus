import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Rocket, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { loadWithExpiry, saveWithExpiry } from '@/lib/storageUtils';
import { BigRock } from '@/types/focus';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';

export default function OnboardingSummary() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const bigRocks = loadWithExpiry<BigRock[]>('big-rocks-order');
    const onboardingData = loadWithExpiry<any>('focus-tracker-onboarding');

    setData({
      bigRocks: bigRocks || [],
      onboarding: onboardingData || {},
    });
  }, []);

  const handleStartPlan = () => {
    saveWithExpiry('onboarding-complete', true);
    toast.success('התוכנית נוצרה בהצלחה!');
    navigate('/dashboard');
  };

  const handleEdit = () => {
    navigate('/setup/focus-area');
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container max-w-4xl mx-auto py-8"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Check className="h-8 w-8 text-green-500" />
                <div>
                  <CardTitle className="text-3xl">סיכום</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    הנה סיכום המידע שהזנת
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {data.bigRocks && data.bigRocks.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    האבנים הגדולות
                  </h3>
                  <ul className="space-y-2">
                    {data.bigRocks.map((rock: BigRock, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{rock.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.onboarding?.stakeholders && data.onboarding.stakeholders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-muted-foreground">
                    בעלי עניין
                  </h3>
                  <ul className="space-y-2">
                    {data.onboarding.stakeholders.map((stakeholder: any, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>
                          {stakeholder.name}
                          {stakeholder.role && (
                            <span className="text-sm text-muted-foreground mr-2">
                              - {stakeholder.role}
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex-1"
                >
                  <ChevronRight className="h-4 w-4 ml-2" />
                  עריכה
                </Button>
                <Button
                  onClick={handleStartPlan}
                  className="flex-1"
                >
                  <Rocket className="h-4 w-4 ml-2" />
                  בואו נתחיל
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
