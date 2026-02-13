import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';

const YOUTUBE_VIDEO_ID = 'YtJ9mi6zLLw';

const IntroRocksVideo: React.FC = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/setup/big-rocks-agent');
  };

  const handleSkip = () => {
    navigate('/setup/big-rocks-agent');
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
              מה זה &quot;אבנים גדולות&quot;?
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              בסרטון הקצר הזה נסביר את העיקרון של &quot;האבנים הגדולות&quot; ואיך הוא יעזור לך להתמקד במה שבאמת חשוב.
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
              title="סרטון הסבר - אבנים גדולות"
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
              className="gap-2 w-full h-12 text-base"
            >
              <ChevronLeft className="w-4 h-4" />
              צפיתי, בוא נמשיך
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground w-full h-11"
            >
              דלג בינתיים
            </Button>
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/setup/vision')}
              className="gap-1 text-muted-foreground"
            >
              <ArrowRight className="w-4 h-4" />
              חזרה
            </Button>
          </motion.div>

          <p className="text-center text-xs text-muted-foreground">
            הסוכן מציע ניסוח ושיקוף בלבד. הבחירה וההחלטה תמיד שלך.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IntroRocksVideo;
