import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVisionInterview } from '@/hooks/useVisionInterview';
import { ChatMessage } from '@/components/vision/ChatMessage';
import { ChatInput } from '@/components/vision/ChatInput';
import VisionSummaryCard from '@/components/vision/VisionSummaryCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const FutureVision: React.FC = () => {
  const { user } = useAuth();
  const { t, language, isRTL } = useLanguage();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages, isLoading, isComplete, progress, phase,
    sendMessage, saveVision, visionId, hasExistingVision,
    narrative, tiles,
  } = useVisionInterview(user?.id);

  const [inputValue, setInputValue] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const [showExistingChoice, setShowExistingChoice] = useState(false);
  const [wantsToEdit, setWantsToEdit] = useState(false);

  const vt = t.vision;

  // Never Ask Twice: show choice if user already has a completed vision
  useEffect(() => {
    if (hasExistingVision && isComplete && !wantsToEdit) {
      setShowExistingChoice(true);
    }
  }, [hasExistingVision, isComplete, wantsToEdit]);

  // Auto-show summary when interview completes
  useEffect(() => {
    if (isComplete && (narrative || tiles.length > 0) && !showExistingChoice) {
      setShowSummary(true);
    }
  }, [isComplete, narrative, tiles, showExistingChoice]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleEditExisting = () => {
    setShowExistingChoice(false);
    setWantsToEdit(true);
    setShowSummary(true);
  };

  const handleContinueWithExisting = () => {
    navigate('/setup/focus-area');
  };

  const handleSkip = () => {
    navigate('/setup/focus-area');
  };

  const handleContinue = async () => {
    await saveVision();
    navigate('/setup/focus-area');
  };

  // Phase label
  const phaseLabel = (() => {
    if (isComplete) return `✅ ${vt.completed}`;
    const phaseNum = phase === 'personalization' ? 1
      : phase === 'narrative' ? 2
      : phase === 'clustering' ? 3
      : phase === 'hardening' ? 4 : 5;
    return `${vt.step} ${phaseNum}/4`;
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with progress */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">{vt.title}</h1>
                <p className="text-xs text-muted-foreground">{phaseLabel}</p>
              </div>
            </div>
            {!showSummary && (
              <Button variant="ghost" size="sm" onClick={handleSkip}>
                {vt.skipForNow}
              </Button>
            )}
          </div>
          {!showSummary && <Progress value={progress} className="h-2" />}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Existing Vision Choice (Never Ask Twice) */}
          {showExistingChoice ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-8 border shadow-soft text-center space-y-6"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{vt.alreadyHaveVision}</h2>
              <p className="text-muted-foreground text-sm">{vt.editOrContinue}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={handleEditExisting}>
                  {vt.edit}
                </Button>
                <Button onClick={handleContinueWithExisting}>
                  {vt.continueNext}
                  {isRTL ? <ArrowLeft className="w-4 h-4 mr-2" /> : <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </motion.div>

          ) : !showSummary ? (
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <ChatMessage key={index} message={msg} isRTL={isRTL} />
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-muted-foreground p-4">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-primary opacity-60 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-primary opacity-60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-primary opacity-60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">{vt.thinking}</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input or Complete button */}
              {isComplete ? (
                <div className="sticky bottom-4">
                  <Button onClick={() => setShowSummary(true)} size="lg" className="w-full gap-2">
                    <Check className="w-4 h-4" />
                    {vt.showSummary}
                  </Button>
                </div>
              ) : (
                <div className="sticky bottom-4">
                  <ChatInput
                    value={inputValue}
                    onChange={setInputValue}
                    onSend={handleSend}
                    disabled={isLoading}
                    isRTL={isRTL}
                    placeholder={vt.placeholder}
                  />
                </div>
              )}
            </div>

          ) : (
            /* Summary View */
            <>
              <VisionSummaryCard
                narrative={narrative}
                tiles={tiles}
                isRTL={isRTL}
              />
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSummary(false)}
                  className="flex-1"
                >
                  {vt.editAnswers}
                </Button>
                <Button onClick={handleContinue} className="flex-1">
                  <Check className="w-4 h-4 ml-2" />
                  {vt.looksGood}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FutureVision;
