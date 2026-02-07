import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ChevronLeft, ChevronRight, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';
import ExecutionNavBar from '@/components/execution/ExecutionNavBar';
import { saveWithExpiry, loadWithExpiry } from '@/lib/storageUtils';
import { KeystoneSuccess as KeystoneSuccessType } from '@/types/focus';
import { toast } from 'sonner';

const TRIGGER_OPTIONS = [
  { value: 'after-coffee', label: 'הקפה הראשון' },
  { value: 'open-computer', label: 'פתיחת מחשב' },
  { value: 'arrive-office', label: 'הגעה למשרד' },
  { value: 'end-of-day', label: 'סוף יום' },
  { value: 'custom', label: 'מותאם אישית' },
];

export default function KeystoneSuccess() {
  const navigate = useNavigate();

  const [selectedTrigger, setSelectedTrigger] = useState('after-coffee');
  const [customTrigger, setCustomTrigger] = useState('');
  const [action, setAction] = useState('');
  const [successMetric, setSuccessMetric] = useState('');

  useEffect(() => {
    const saved = loadWithExpiry<KeystoneSuccessType>('keystone-success');
    if (saved) {
      const triggerOption = TRIGGER_OPTIONS.find(t => t.label === saved.keystone.trigger);
      if (triggerOption) {
        setSelectedTrigger(triggerOption.value);
      } else {
        setSelectedTrigger('custom');
        setCustomTrigger(saved.keystone.trigger);
      }
      setAction(saved.keystone.action);
      setSuccessMetric(saved.successMetric);
    }
  }, []);

  const getTriggerLabel = () => {
    if (selectedTrigger === 'custom') return customTrigger;
    return TRIGGER_OPTIONS.find(t => t.value === selectedTrigger)?.label || '';
  };

  const handleContinue = () => {
    if (!action.trim()) {
      toast.error('יש להגדיר את הפעולה');
      return;
    }
    if (!successMetric.trim()) {
      toast.error('יש להגדיר מדד הצלחה');
      return;
    }

    const data: KeystoneSuccessType = {
      keystone: {
        trigger: getTriggerLabel(),
        action: action.trim(),
        duration: 5,
      },
      successMetric: successMetric.trim(),
    };

    saveWithExpiry('keystone-success', data);
    toast.success('התוכנית נשמרה!');
    navigate('/dashboard');
  };

  const handleBack = () => {
    const triggerLabel = getTriggerLabel();
    if (action.trim() || successMetric.trim()) {
      saveWithExpiry('keystone-success', {
        keystone: { trigger: triggerLabel, action: action.trim(), duration: 5 },
        successMetric: successMetric.trim(),
      });
    }
    navigate('/setup/thirty-day-plan');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
      <Header />
      <ExecutionNavBar />

      <main className="flex-1 p-4">
        <div className="w-full max-w-2xl mx-auto space-y-6 py-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">הרגל מפתח והצלחה</h1>
            <p className="text-muted-foreground text-sm">נעל הרגל פתיחה + מדד הצלחה ל-30 יום</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-semibold text-lg">הרגל מפתח (Keystone)</h2>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">זה יקרה מיד אחרי ש...</label>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGER_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedTrigger(opt.value)}
                        className={`px-3 py-2 rounded-xl text-sm transition-colors ${
                          selectedTrigger === opt.value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {selectedTrigger === 'custom' && (
                    <Input
                      value={customTrigger}
                      onChange={e => setCustomTrigger(e.target.value)}
                      placeholder="תאר את הטריגר שלך..."
                      className="mt-2"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">אני אבצע:</label>
                  <Input
                    value={action}
                    onChange={e => setAction(e.target.value)}
                    placeholder="למשל: סקירת משימות, כתיבה חופשית..."
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">משך: 5 דקות (קבוע)</span>
                </div>

                {action.trim() && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <p className="text-sm">
                      מיד אחרי <strong>{getTriggerLabel() || '...'}</strong>, אני אבצע <strong>{action}</strong> למשך 5 דקות.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <h2 className="font-semibold text-lg">מדד הצלחה</h2>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">מה ייחשב הצלחה מדידה בעוד 30 יום?</label>
                  <Input
                    value={successMetric}
                    onChange={e => setSuccessMetric(e.target.value)}
                    placeholder='למשל: "3 פגישות מכירה נסגרו"'
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">משפט אחד בלבד</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronRight className="h-4 w-4 ml-2" />
              חזרה
            </Button>
            <Button
              onClick={handleContinue}
              className="flex-1"
              disabled={!action.trim() || !successMetric.trim()}
            >
              סיום ומעבר לדשבורד
              <ChevronLeft className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Clock(props: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
