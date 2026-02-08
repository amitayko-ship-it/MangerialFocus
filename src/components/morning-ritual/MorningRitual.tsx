import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coffee, Sun, CheckCircle2, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MorningRitualProps {
  practices: { id: string; title: string; duration: number }[];
  onComplete: (selectedPractices: string[]) => void;
}

export const MorningRitual: React.FC<MorningRitualProps> = ({ practices, onComplete }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [step, setStep] = useState<'intro' | 'selection' | 'confirm'>('intro');

  const togglePractice = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Card className="border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary" />
          <CardTitle className="text-lg">Morning Ritual</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Coffee className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold">בוקר טוב!</h3>
                <p className="text-muted-foreground mt-2">מה הפוקוס שלך היום? בוא נבחר את האבנים שנקדם.</p>
              </div>
              <Button onClick={() => setStep('selection')} className="w-full">
                בוא נתחיל
              </Button>
            </motion.div>
          )}

          {step === 'selection' && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-muted-foreground mb-4">בחר את הפרקטיקות לביצוע היום:</p>
              <div className="space-y-2">
                {practices.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePractice(p.id)}
                    className={`w-full p-4 rounded-xl border flex items-center justify-between transition-all ${
                      selected.includes(p.id) 
                        ? 'border-primary bg-primary/5 shadow-sm' 
                        : 'border-muted hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {selected.includes(p.id) ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{p.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{p.duration} דק׳</span>
                  </button>
                ))}
              </div>
              <Button 
                onClick={() => setStep('confirm')} 
                className="w-full mt-6"
                disabled={selected.length === 0}
              >
                המשך ללו״ז
              </Button>
            </motion.div>
          )}

          {step === 'confirm' && (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold">החלטה מצוינת.</h3>
                <p className="text-muted-foreground">הפרקטיקות שנבחרו יופיעו בלו״ז שלך להיום.</p>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl space-y-2">
                {selected.map(id => {
                  const p = practices.find(practice => practice.id === id);
                  return (
                    <div key={id} className="flex justify-between text-sm">
                      <span className="font-medium">{p?.title}</span>
                      <span>{p?.duration} דק׳</span>
                    </div>
                  );
                })}
              </div>
              <Button onClick={() => onComplete(selected)} className="w-full">
                יאללה לעבודה
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
