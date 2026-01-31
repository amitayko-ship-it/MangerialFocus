import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { saveWithExpiry } from '@/lib/storageUtils';

const TOTAL_STEPS = 4;

const Questionnaire: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
    q4: '',
  });

  const questions = [
    { key: 'q1', label: t.questionnaire.q1 },
    { key: 'q2', label: t.questionnaire.q2 },
    { key: 'q3', label: t.questionnaire.q3 },
    { key: 'q4', label: t.questionnaire.q4 },
  ];

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / TOTAL_STEPS) * 100;

  const handleAnswerChange = (value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Save answers and navigate to vision
      saveWithExpiry('questionnaire-data', answers);
      navigate('/setup/vision');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = answers[currentQuestion.key]?.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="w-full p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Focus Tracker</span>
        </div>
        <LanguageSwitcher />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title and Subtitle */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-foreground">{t.questionnaire.title}</h1>
            <p className="text-muted-foreground">{t.questionnaire.subtitle}</p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {t.vision.step} {currentStep + 1} {t.vision.of} {TOTAL_STEPS}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <div className="bg-card rounded-lg border shadow-sm p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Question Label */}
                <div className="space-y-2">
                  <label className="text-lg font-medium text-foreground">
                    {currentQuestion.label}
                  </label>
                </div>

                {/* Answer Textarea */}
                <Textarea
                  value={answers[currentQuestion.key]}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder={t.questionnaire.placeholder}
                  className="min-h-[150px] text-base"
                  autoFocus
                />

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="gap-2"
                  >
                    {isRTL ? (
                      <>
                        {t.common.back}
                        <ChevronRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <ChevronLeft className="w-4 h-4" />
                        {t.common.back}
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleNext}
                    disabled={!canProceed}
                    className="gap-2"
                  >
                    {currentStep === TOTAL_STEPS - 1 ? (
                      <>
                        {t.common.continue}
                        {isRTL ? (
                          <ChevronLeft className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    ) : (
                      <>
                        {t.common.continue}
                        {isRTL ? (
                          <ChevronLeft className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        &copy; 2026 Focus Tracker
      </footer>
    </div>
  );
};

export default Questionnaire;
