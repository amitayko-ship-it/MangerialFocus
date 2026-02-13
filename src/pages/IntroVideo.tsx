import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { loadWithExpiry, saveWithExpiry } from '@/lib/storageUtils';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';

const YOUTUBE_VIDEO_ID = 'KeVBfS1Ho6M';

const IntroVideo: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [hasWatched, setHasWatched] = useState(false);

  useEffect(() => {
    const watched = loadWithExpiry<boolean>('intro_video_completed');
    if (watched) {
      setHasWatched(true);
    }
  }, []);

  const handleContinue = () => {
    saveWithExpiry('intro_video_completed', true);
    navigate('/setup/vision');
  };

  const handleSkip = () => {
    navigate('/setup/vision');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50/30 via-background to-green-50/15 flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'לפני שמתחילים – 2 דקות שיעשו סדר' : 'Before we start – 2 minutes that will make a difference'}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {isRTL 
                ? 'בסרטון הקצר הזה נסביר: מהי "תמונת הצלחה", למה זה קריטי למיקוד ניהולי, ואיך זה ישמש אותך בהמשך האפליקציה.'
                : 'In this short video we\'ll explain: what is a "success vision", why it\'s critical for management focus, and how it will serve you throughout the app.'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full aspect-video bg-card rounded-2xl border shadow-stone overflow-hidden"
          >
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?rel=0&modestbranding=1`}
              title="Introduction Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 items-center w-full max-w-sm mx-auto"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="gap-2 w-full h-12 text-base rounded-full"
            >
              {isRTL ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  צפיתי, בוא נמשיך
                </>
              ) : (
                <>
                  I watched, let's continue
                  <ChevronLeft className="w-4 h-4 rotate-180" />
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground w-full h-11 rounded-full"
            >
              {isRTL ? 'דלג בינתיים' : 'Skip for now'}
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/compass')}
              className="gap-1 text-muted-foreground"
            >
              {isRTL ? (
                <>
                  <ArrowRight className="w-4 h-4" />
                  חזרה
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back
                </>
              )}
            </Button>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground">
            {isRTL 
              ? 'הסוכן מציע ניסוח ושיקוף בלבד. הבחירה וההחלטה תמיד שלך.'
              : 'The coach offers suggestions and reflections only. The choice and decision is always yours.'}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IntroVideo;
