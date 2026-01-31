import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { loadWithExpiry } from '@/lib/storageUtils';
import { generateRockSuggestions, getQuestionnaireData } from '@/lib/rockSuggestions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import BigRockStack from '@/components/clarity/BigRockStack';
import { BigRock } from '@/types/focus';

export default function FocusAreaSelection() {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [rocks, setRocks] = useState<BigRock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize rocks from localStorage or generate from questionnaire
    const savedRocks = loadWithExpiry<BigRock[]>('big-rocks-order');
    if (savedRocks && savedRocks.length > 0) {
      setRocks(savedRocks);
    } else {
      const questionnaireData = getQuestionnaireData();
      if (questionnaireData) {
        const suggestions = generateRockSuggestions(questionnaireData, isRTL);
        setRocks(suggestions);
      } else {
        // Fallback to empty array
        setRocks([]);
      }
    }
  }, [isRTL]);

  const handleContinue = async () => {
    if (rocks.length === 0) {
      toast.error(isRTL ? 'יש להוסיף לפחות אבן גדולה אחת' : 'Please add at least one big rock');
      return;
    }

    if (!user) {
      toast.error(isRTL ? 'יש להתחבר כדי להמשיך' : 'Please log in to continue');
      return;
    }

    setIsLoading(true);

    try {
      // Save rocks to localStorage
      localStorage.setItem('big-rocks-order', JSON.stringify(rocks));

      // Upsert to Supabase focus_plans table
      const { error } = await supabase
        .from('focus_plans')
        .upsert({
          user_id: user.id,
          big_rocks: rocks,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) {
        console.error('Error saving big rocks:', error);
        toast.error(isRTL ? 'שגיאה בשמירת הנתונים' : 'Error saving data');
        return;
      }

      toast.success(isRTL ? 'האבנים הגדולות נשמרו בהצלחה' : 'Big rocks saved successfully');
      navigate('/setup/tasks-energy');
    } catch (error) {
      console.error('Error:', error);
      toast.error(isRTL ? 'שגיאה בשמירה' : 'Error saving');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

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
              <Sparkles className="h-8 w-8 text-yellow-500" />
              <div>
                <CardTitle className="text-3xl">{t.rocks.title}</CardTitle>
                <CardDescription className="text-lg mt-2">
                  {t.rocks.subtitle}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <BigRockStack
              rocks={rocks}
              onRocksChange={setRocks}
              maxRocks={5}
              title={t.rocks.bigRocksTitle}
              subtitle={t.rocks.bigRocksSubtitle}
              showBreakthroughStar={true}
              isRTL={isRTL}
              addRockLabel={t.rocks.addRock}
              practiceLabel={t.rocks.practice}
              practiceHint={t.rocks.practiceHint}
              rockPlaceholder={t.rocks.rockPlaceholder}
            />

            <div className="flex gap-3 pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
                disabled={isLoading}
              >
                {isRTL ? <ChevronRight className="h-4 w-4 ml-2" /> : <ChevronLeft className="h-4 w-4 mr-2" />}
                {t.common.back}
              </Button>
              <Button
                onClick={handleContinue}
                className="flex-1"
                disabled={isLoading || rocks.length === 0}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    {t.common.continue}
                    {isRTL ? <ChevronLeft className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 ml-2" />}
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
