import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ChevronLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { loadWithExpiry, saveWithExpiry } from '@/lib/storageUtils';

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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Focus Tracker</span>
        </div>
        <LanguageSwitcher />
      </header>

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
            className="relative w-full aspect-video bg-card rounded-xl border shadow-medium overflow-hidden"
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
            className="flex flex-col sm:flex-row gap-3 justify-center items-center"
          >
            <Button
              onClick={handleContinue}
              size="lg"
              className="gap-2 min-w-[200px]"
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
              className="text-muted-foreground"
            >
              {isRTL ? 'דלג בינתיים' : 'Skip for now'}
            </Button>
          </motion.div>

          <div className="flex justify-center">
            <Button
              variant="ghost"
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
          </div>

          <p className="text-center text-xs text-muted-foreground">
            {isRTL 
              ? 'הסוכן מציע ניסוח ושיקוף בלבד. הבחירה וההחלטה תמיד שלך.'
              : 'The coach offers suggestions and reflections only. The choice and decision is always yours.'}
          </p>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; 2026 Focus Tracker
      </footer>
    </div>
  );
};

export default IntroVideo;
