import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Clock, MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type PageState = 'loading' | 'form' | 'success' | 'expired' | 'invalid' | 'error';

interface FeedbackRequest {
  id: string;
  user_id: string;
  manager_name: string;
  expires_at: string;
}

const ratingQuestions = [
  { id: 'clarity', he: 'עד כמה ברור לך מה הציפיות ממך?', en: 'How clear are the expectations from you?' },
  { id: 'support', he: 'עד כמה אתה מרגיש שאתה מקבל תמיכה?', en: 'How supported do you feel?' },
  { id: 'communication', he: 'איך היית מדרג את התקשורת?', en: 'How would you rate the communication?' },
  { id: 'growth', he: 'עד כמה אתה מרגיש שאתה מתפתח?', en: 'How much do you feel you are growing?' },
];

const FeedbackPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { t, isRTL } = useLanguage();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [request, setRequest] = useState<FeedbackRequest | null>(null);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});
  const [openFeedback, setOpenFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [improvements, setImprovements] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setPageState('invalid'); return; }

    const loadRequest = async () => {
      const { data, error } = await supabase
        .from('feedback_requests')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (error || !data) { setPageState('invalid'); return; }

      if (new Date(data.expires_at) < new Date()) {
        setPageState('expired');
        return;
      }

      setRequest(data);
      setPageState('form');
    };

    loadRequest();
  }, [token]);

  const handleSubmit = async () => {
    if (!request) return;
    setSubmitting(true);

    try {
      const { error } = await supabase.from('feedback_responses').insert({
        request_id: request.id,
        ratings,
        open_feedback: openFeedback,
        strengths,
        improvements,
      });

      if (error) throw error;
      setPageState('success');
    } catch {
      toast.error(isRTL ? 'שגיאה בשליחת המשוב' : 'Error submitting feedback');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (pageState === 'expired') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4">
          <Clock className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">{t.feedback.expired}</h1>
        </div>
      </div>
    );
  }

  if (pageState === 'invalid') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">{t.feedback.invalid}</h1>
        </div>
      </div>
    );
  }

  if (pageState === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold">{t.feedback.thankYou}</h1>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="p-4 flex justify-between items-center max-w-2xl mx-auto">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <span className="font-semibold">{t.feedback.formTitle} {request?.manager_name}</span>
        </div>
        <LanguageSwitcher />
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-6 pb-12">
        <p className="text-sm text-muted-foreground text-center">{t.feedback.anonymous}</p>

        {/* Rating Questions */}
        {ratingQuestions.map((q) => (
          <Card key={q.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{isRTL ? q.he : q.en}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={ratings[q.id]?.toString() || ''}
                onValueChange={(val) => setRatings(prev => ({ ...prev, [q.id]: parseInt(val) }))}
                className={cn('flex gap-2', isRTL && 'flex-row-reverse')}
              >
                {[1, 2, 3, 4, 5].map((v) => (
                  <div key={v} className="flex items-center">
                    <RadioGroupItem value={v.toString()} id={`${q.id}-${v}`} className="peer sr-only" />
                    <Label
                      htmlFor={`${q.id}-${v}`}
                      className={cn(
                        'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                        'hover:bg-primary/10 hover:border-primary',
                        'peer-data-[state=checked]:bg-primary peer-data-[state=checked]:text-primary-foreground peer-data-[state=checked]:border-primary'
                      )}
                    >
                      {v}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}

        {/* Open-ended Questions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'מהן החוזקות הבולטות?' : 'What are the key strengths?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={strengths} onChange={(e) => setStrengths(e.target.value)} rows={3} dir={isRTL ? 'rtl' : 'ltr'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'מה ניתן לשפר?' : 'What can be improved?'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} rows={3} dir={isRTL ? 'rtl' : 'ltr'} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {isRTL ? 'משוב חופשי' : 'Open feedback'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea value={openFeedback} onChange={(e) => setOpenFeedback(e.target.value)} rows={3} dir={isRTL ? 'rtl' : 'ltr'} />
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} disabled={submitting} size="lg" className="w-full">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {t.feedback.submit}
        </Button>
      </main>
    </div>
  );
};

export default FeedbackPage;
