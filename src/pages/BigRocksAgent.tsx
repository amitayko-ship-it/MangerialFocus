import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChevronLeft, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { loadWithExpiry, saveWithExpiry } from '@/lib/storageUtils';
import { BigRock } from '@/types/focus';
import Header from '@/components/management-compass/layout/Header';
import Footer from '@/components/management-compass/layout/Footer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface PracticeItem {
  name: string;
  cadence: string;
}

interface ExtractedPractices {
  practices: PracticeItem[];
  keystone: string;
}

function extractRocksFromResponse(text: string): string[] | null {
  const fencedMatch = text.match(/```\w*\s*([\s\S]*?)```/);
  if (fencedMatch) {
    try {
      const parsed = JSON.parse(fencedMatch[1].trim());
      if (parsed.rocks && Array.isArray(parsed.rocks) && parsed.rocks.length >= 1) {
        return parsed.rocks.slice(0, 5);
      }
    } catch {}
  }
  try {
    const inlineMatch = text.match(/\{"rocks"\s*:\s*\[[\s\S]*?\]\}/);
    if (inlineMatch) {
      const parsed = JSON.parse(inlineMatch[0]);
      if (parsed.rocks && Array.isArray(parsed.rocks) && parsed.rocks.length >= 1) {
        return parsed.rocks.slice(0, 5);
      }
    }
  } catch {}
  return null;
}

function normalizePractices(parsed: any): ExtractedPractices | null {
  if (!parsed.practices || !Array.isArray(parsed.practices) || parsed.practices.length < 1) return null;
  const practices: PracticeItem[] = parsed.practices.map((p: any) => {
    if (typeof p === 'string') return { name: p, cadence: '' };
    return { name: p.name || '', cadence: p.cadence || '' };
  });
  const keystone = parsed.keystone_habit || parsed.keystone || '';
  return { practices, keystone };
}

function extractPracticesFromResponse(text: string): ExtractedPractices | null {
  const fencedMatch = text.match(/```\w*\s*([\s\S]*?)```/);
  if (fencedMatch) {
    try {
      const parsed = JSON.parse(fencedMatch[1].trim());
      const result = normalizePractices(parsed);
      if (result) return result;
    } catch {}
  }
  try {
    const jsonMatch = text.match(/\{[\s\S]*"practices"\s*:\s*\[[\s\S]*\][\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const result = normalizePractices(parsed);
      if (result) return result;
    }
  } catch {}
  return null;
}

function cleanMessageForDisplay(text: string): string {
  return text
    .replace(/```\w*\s*[\s\S]*?```/g, '')
    .replace(/\{"rocks"\s*:\s*\[[\s\S]*?\]\}/g, '')
    .replace(/\{[\s\S]*"practices"\s*:\s*\[[\s\S]*\][\s\S]*\}/g, '')
    .trim();
}

const BigRocksAgent: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedRocks, setExtractedRocks] = useState<string[] | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [phase, setPhase] = useState<'rocks' | 'practices' | 'summary'>('rocks');
  const [selectedRockIndex, setSelectedRockIndex] = useState<number | null>(null);
  const [showRockSelection, setShowRockSelection] = useState(false);
  const [practicesMessages, setPracticesMessages] = useState<ChatMessage[]>([]);
  const [extractedPractices, setExtractedPractices] = useState<ExtractedPractices | null>(null);
  const [allPractices, setAllPractices] = useState<Record<number, string[]>>({});
  const [keystoneHabit, setKeystoneHabit] = useState<string>('');

  const getUserInfo = () => {
    const raw = localStorage.getItem('questionnaire-data');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const data = parsed.value || parsed;
        return {
          userName: data.userInfo?.name || '',
          userGender: data.userInfo?.gender || 'male'
        };
      } catch {}
    }
    return { userName: '', userGender: 'male' };
  };

  useEffect(() => {
    const initChat = async () => {
      const { userName, userGender } = getUserInfo();
      const visionText = loadWithExpiry<string>('vision-narrative');

      const fallbackOpening = 'נעבוד בשני שלבים:\n\nקודם נזקק יחד אבנים גדולות מתוך תמונת העתיד שלך.\nואז נבחר אבן אחת ונגזור לה פרקטיקות קבועות שיזיזו אותה בפועל.\n\nאפשר להדביק כאן את תמונת העתיד או לכתוב את האבן שבחרת.';

      try {
        const response = await fetch('/api/coach/extract-rocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'התחל' }],
            userName,
            userGender
          }),
        });

        const openingText = response.ok
          ? (await response.json()).response
          : fallbackOpening;
        const openingMessage: ChatMessage = { role: 'assistant', content: openingText };

        if (visionText) {
          setMessages([openingMessage]);
          setInitialLoading(false);
          setIsLoading(true);

          try {
            const rocksResponse = await fetch('/api/coach/extract-rocks', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [
                  { role: 'assistant', content: openingText },
                  { role: 'user', content: visionText }
                ],
                userName,
                userGender
              }),
            });

            if (rocksResponse.ok) {
              const rocksData = await rocksResponse.json();
              const assistantMessage: ChatMessage = { role: 'assistant', content: rocksData.response };
              setMessages([openingMessage, assistantMessage]);

              const rocks = extractRocksFromResponse(rocksData.response);
              if (rocks) {
                setExtractedRocks(rocks);
              }
            } else {
              toast.error('שגיאה בעיבוד תמונת העתיד, נסו שוב');
            }
          } catch {
            toast.error('שגיאה בתקשורת עם הסוכן');
          } finally {
            setIsLoading(false);
          }
        } else {
          setMessages([openingMessage]);
          setInitialLoading(false);
        }
      } catch (error) {
        console.error('Init error:', error);
        setMessages([{ role: 'assistant', content: fallbackOpening }]);
        setInitialLoading(false);
      }
    };
    initChat();
  }, []);

  const activeMessages = phase === 'practices' ? practicesMessages : messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages, isLoading]);

  const handleSelectRock = async (index: number) => {
    if (!extractedRocks) return;
    setSelectedRockIndex(index);
    setPhase('practices');
    setIsLoading(true);

    const { userName, userGender } = getUserInfo();
    const gWrite = userGender === 'female' ? 'כתבי' : 'כתוב';
    const fallbackPracticesOpening = `${gWrite} 3 פרקטיקות מרכזיות שיעזרו לקדם את האבן הזו בשגרה.`;

    try {
      const response = await fetch('/api/coach/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'התחל' }],
          userName,
          userGender,
          rockTitle: extractedRocks[index]
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPracticesMessages([{ role: 'assistant', content: data.response }]);
      } else {
        setPracticesMessages([{ role: 'assistant', content: fallbackPracticesOpening }]);
      }
    } catch {
      setPracticesMessages([{ role: 'assistant', content: fallbackPracticesOpening }]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    if (phase === 'practices') {
      return sendPracticesMessage(trimmed);
    }

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { userName, userGender } = getUserInfo();
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/coach/extract-rocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, userName, userGender }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);

      const rocks = extractRocksFromResponse(data.response);
      if (rocks) {
        setExtractedRocks(rocks);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('שגיאה בתקשורת עם הסוכן');
    } finally {
      setIsLoading(false);
    }
  };

  const sendPracticesMessage = async (trimmed: string) => {
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...practicesMessages, userMessage];
    setPracticesMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const { userName, userGender } = getUserInfo();
      const response = await fetch('/api/coach/practices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          userName,
          userGender,
          rockTitle: extractedRocks![selectedRockIndex!]
        }),
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
      setPracticesMessages(prev => [...prev, assistantMessage]);

      const practices = extractPracticesFromResponse(data.response);
      if (practices) {
        setExtractedPractices(practices);
      }
    } catch (error) {
      console.error('Practices chat error:', error);
      toast.error('שגיאה בתקשורת עם הסוכן');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContinueWithPractices = () => {
    if (!extractedRocks) return;

    const initial: Record<number, string[]> = {};
    extractedRocks.forEach((_, i) => {
      if (i === selectedRockIndex && extractedPractices) {
        initial[i] = extractedPractices.practices.map(p =>
          p.cadence ? `${p.name} (${p.cadence})` : p.name
        );
        while (initial[i].length < 3) initial[i].push('');
      } else {
        initial[i] = ['', '', ''];
      }
    });
    setAllPractices(initial);
    if (extractedPractices?.keystone) {
      setKeystoneHabit(extractedPractices.keystone);
    }
    setPhase('summary');
  };

  const handleSaveAndContinue = () => {
    if (!extractedRocks) return;

    const bigRocks: BigRock[] = extractedRocks.map((title, index) => ({
      id: `rock-${Date.now()}-${index}`,
      title,
      order: index,
      practices: (allPractices[index] || ['', '', '']).filter(p => p.trim() !== ''),
      isBreakthrough: index === 0
    }));

    if (keystoneHabit) {
      saveWithExpiry('keystone-habit', keystoneHabit);
    }

    saveWithExpiry('big-rocks-order', bigRocks);
    navigate('/setup/focus-area');
  };

  const updatePractice = (rockIndex: number, practiceIndex: number, value: string) => {
    setAllPractices(prev => {
      const updated = { ...prev };
      const arr = [...(updated[rockIndex] || ['', '', ''])];
      arr[practiceIndex] = value;
      updated[rockIndex] = arr;
      return updated;
    });
  };

  const handleBack = () => {
    if (phase === 'summary') {
      if (selectedRockIndex !== null) {
        setPhase('practices');
      } else {
        setPhase('rocks');
      }
      return;
    }
    if (phase === 'practices') {
      setPhase('rocks');
      setSelectedRockIndex(null);
      setShowRockSelection(false);
      setPracticesMessages([]);
      setExtractedPractices(null);
      return;
    }
    navigate('/intro-rocks-video');
  };

  const handleSkip = () => {
    if (!extractedRocks) {
      navigate('/setup/focus-area');
      return;
    }
    const initial: Record<number, string[]> = {};
    extractedRocks.forEach((_, i) => {
      initial[i] = ['', '', ''];
    });
    setAllPractices(initial);
    setPhase('summary');
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">מכין את הסוכן...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const showInput = phase === 'summary'
    ? false
    : phase === 'practices'
      ? !extractedPractices
      : !extractedRocks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
        {phase !== 'summary' && (
          <>
            {phase === 'practices' && selectedRockIndex !== null && extractedRocks && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 mb-4"
              >
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <span>🪨</span>
                  <span className="font-medium">אבן גדולה:</span>
                  <span>{extractedRocks[selectedRockIndex]}</span>
                </div>
              </motion.div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              <AnimatePresence>
                {activeMessages.map((msg, i) => (
                  <motion.div
                    key={`${phase}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border border-border shadow-sm'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {msg.role === 'assistant' ? cleanMessageForDisplay(msg.content) : msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end"
                >
                  <div className="bg-card border border-border rounded-2xl px-5 py-4 shadow-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">חושב...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </>
        )}

        {phase === 'rocks' && extractedRocks && !showRockSelection && selectedRockIndex === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-primary/30 rounded-2xl p-5 mb-4 shadow-md"
          >
            <h3 className="font-bold text-foreground mb-3 text-lg">האבנים הגדולות שלך:</h3>
            <div className="space-y-2 mb-5">
              {extractedRocks.map((rock, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-accent/50 rounded-xl">
                  <span className="text-lg">🪨</span>
                  <span className="text-foreground font-medium">{rock}</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              עכשיו נבנה פרקטיקות לכל אבן גדולה. איך תעדיפו?
            </p>
            <div className="space-y-2">
              <Button onClick={() => setShowRockSelection(true)} size="lg" className="w-full gap-2">
                עזרה בזיקוק פרקטיקות עם הסוכן
              </Button>
              <Button variant="outline" onClick={handleSkip} size="lg" className="w-full">
                אמלא עצמאית
              </Button>
            </div>
          </motion.div>
        )}

        {phase === 'rocks' && extractedRocks && showRockSelection && selectedRockIndex === null && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-primary/30 rounded-2xl p-5 mb-4 shadow-md"
          >
            <h3 className="font-bold text-foreground mb-3 text-lg">בחרו אבן גדולה לעבוד עליה:</h3>
            <div className="space-y-2 mb-4">
              {extractedRocks.map((rock, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectRock(i)}
                  className="w-full flex items-center gap-3 p-3 bg-accent/50 rounded-xl hover:bg-accent transition-colors text-right"
                >
                  <span className="text-lg">🪨</span>
                  <span className="text-foreground font-medium flex-1">{rock}</span>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowRockSelection(false)} className="w-full text-muted-foreground">
              חזרה
            </Button>
          </motion.div>
        )}

        {phase === 'practices' && extractedPractices && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-primary/30 rounded-2xl p-5 mb-4 shadow-md"
          >
            <h3 className="font-bold text-foreground mb-3 text-lg">הפרקטיקות שגובשו:</h3>
            <div className="space-y-2 mb-3">
              {extractedPractices.practices.map((practice, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-accent/50 rounded-xl">
                  <span className="text-lg">⚡</span>
                  <div className="flex-1">
                    <span className="text-foreground font-medium">{practice.name}</span>
                    {practice.cadence && (
                      <span className="text-muted-foreground text-sm mr-2"> | {practice.cadence}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {extractedPractices.keystone && (
              <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl mb-4">
                <span className="text-lg">🔑</span>
                <div>
                  <span className="text-xs text-muted-foreground">הרגל מפתח</span>
                  <p className="text-foreground font-medium">{extractedPractices.keystone}</p>
                </div>
              </div>
            )}
            <Button onClick={handleContinueWithPractices} size="lg" className="w-full gap-2">
              <ChevronLeft className="w-4 h-4" />
              המשך
            </Button>
          </motion.div>
        )}

        {phase === 'summary' && extractedRocks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pb-4"
          >
            <h3 className="font-bold text-foreground text-lg text-center">אבנים גדולות ופרקטיקות</h3>
            {extractedRocks.map((rock, rockIdx) => (
              <div key={rockIdx} className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">🪨</span>
                  <span className="font-bold text-foreground">{rock}</span>
                </div>
                <div className="space-y-2">
                  {[0, 1, 2].map(pIdx => {
                    const val = (allPractices[rockIdx] || ['', '', ''])[pIdx] || '';
                    const isFilled = val.trim() !== '';
                    return (
                      <div key={pIdx} className="flex items-center gap-2">
                        <span className={`text-sm ${isFilled ? 'text-primary' : 'text-muted-foreground'}`}>
                          {isFilled ? '⚡' : `${pIdx + 1}.`}
                        </span>
                        <input
                          type="text"
                          value={val}
                          onChange={(e) => updatePractice(rockIdx, pIdx, e.target.value)}
                          placeholder="פרקטיקה חוזרת..."
                          className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {keystoneHabit && (
              <div className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-xl">
                <span className="text-lg">🔑</span>
                <div>
                  <span className="text-xs text-muted-foreground">הרגל מפתח</span>
                  <p className="text-foreground font-medium">{keystoneHabit}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <Button onClick={handleSaveAndContinue} size="lg" className="w-full gap-2">
                <ChevronLeft className="w-4 h-4" />
                המשך
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBack} className="w-full gap-1 text-muted-foreground">
                <ArrowRight className="w-4 h-4" />
                חזרה
              </Button>
            </div>
          </motion.div>
        )}

        {showInput && (
          <div className="border-t border-border pt-4 pb-2">
            <div className="flex gap-2 items-end">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => { setInput(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder="כתוב כאן..."
                className="flex-1 resize-none rounded-xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[48px] max-h-[200px]"
                rows={2}
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl h-12 w-12 shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>

            {activeMessages.filter(m => m.role === 'user').length >= 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSkip}
                disabled={isLoading}
                className="w-full mt-2 text-muted-foreground gap-1"
              >
                <Check className="w-4 h-4" />
                זהו, סיימתי – אפשר להמשיך הלאה
              </Button>
            )}

            <div className="flex justify-between items-center mt-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 text-muted-foreground">
                <ArrowRight className="w-4 h-4" />
                חזרה
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BigRocksAgent;
