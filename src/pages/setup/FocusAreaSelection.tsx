import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { loadWithExpiry, saveWithExpiry } from '@/lib/storageUtils';
import { generateRockSuggestions, getQuestionnaireData } from '@/lib/rockSuggestions';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import BigRockStack from '@/components/clarity/BigRockStack';
import { BigRock } from '@/types/focus';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';

export default function FocusAreaSelection() {
  const navigate = useNavigate();
  const [rocks, setRocks] = useState<BigRock[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedRocks = loadWithExpiry<BigRock[]>('big-rocks-order');
    if (savedRocks && savedRocks.length > 0) {
      setRocks(savedRocks);
    } else {
      const questionnaireData = getQuestionnaireData();
      if (questionnaireData) {
        const suggestions = generateRockSuggestions(questionnaireData, true);
        setRocks(suggestions);
      } else {
        setRocks([]);
      }
    }
  }, []);

  const handleContinue = async () => {
    if (rocks.length === 0) {
      toast.error('יש להוסיף לפחות אבן גדולה אחת');
      return;
    }

    setIsLoading(true);

    try {
      saveWithExpiry('big-rocks-order', rocks);
      toast.success('האבנים הגדולות נשמרו בהצלחה');
      navigate('/setup/stakeholders');
    } catch (error) {
      console.error('Error:', error);
      toast.error('שגיאה בשמירה');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/setup/big-rocks-agent');
  };

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
                <Sparkles className="h-8 w-8 text-yellow-500" />
                <div>
                  <CardTitle className="text-3xl">האבנים הגדולות שלך</CardTitle>
                  <CardDescription className="text-lg mt-2">
                    בחר את 3-5 המהלכים האסטרטגיים שישנו את המשחק
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <BigRockStack
                rocks={rocks}
                onRocksChange={setRocks}
                maxRocks={5}
                title="האבנים הגדולות"
                subtitle="ערוך, הוסף או הסר אבנים גדולות לפי הצורך."
                showBreakthroughStar={true}
                isRTL={true}
                addRockLabel="הוסף אבן גדולה"
                practiceLabel="פרקטיקה"
                practiceHint="לכל אבן גדולה, הגדר 1-3 פרקטיקות שיקדמו אותה"
                rockPlaceholder="תאר מהלך אסטרטגי שישנה את המשחק..."
              />

              <div className="flex gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={isLoading}
                >
                  <ChevronRight className="h-4 w-4 ml-2" />
                  חזרה
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
                      המשך
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    </>
                  )}
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
