import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ChevronLeft, ArrowRight } from 'lucide-react';
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

function cleanMessageForDisplay(text: string): string {
  return text.replace(/```\w*\s*[\s\S]*?```/g, '').replace(/\{"rocks"\s*:\s*\[[\s\S]*?\]\}/g, '').trim();
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

      const fallbackOpening = 'אבנים גדולות – בחירה אסטרטגית\n\nגם כשיש תמונת עתיד ברורה, בלי בחירה מודעת במה להתמקד – האנרגיה מתפזרת על משימות קטנות ועומס יומיומי.\n\nאבנים גדולות הן מעט מוקדים משמעותיים, שאם הם זזים – החיים זזים.\n\nאבן גדולה היא לא משימה ולא פרויקט קצר.\nזו יוזמה מתמשכת או תחום תוצאה רחב, עם אימפקט גבוה, שדורש השקעה לאורך זמן.\n\nעכשיו, על בסיס תמונת העתיד שבנינו יחד, נזקק ממנה את האבנים הגדולות.';

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContinueWithRocks = () => {
    if (!extractedRocks) return;

    const bigRocks: BigRock[] = extractedRocks.map((title, index) => ({
      id: `rock-${Date.now()}-${index}`,
      title,
      order: index,
      practices: [],
      isBreakthrough: index === 0
    }));

    saveWithExpiry('big-rocks-order', bigRocks);
    navigate('/setup/focus-area');
  };

  const handleBack = () => {
    navigate('/intro-rocks-video');
  };

  const handleSkip = () => {
    navigate('/setup/focus-area');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col" dir="rtl">
      <Header />

      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4">
        <div className="flex-1 overflow-y-auto space-y-4 pb-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
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

        {extractedRocks && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border-2 border-primary/30 rounded-2xl p-5 mb-4 shadow-md"
          >
            <h3 className="font-bold text-foreground mb-3 text-lg">האבנים הגדולות שזוקקנו:</h3>
            <div className="space-y-2 mb-4">
              {extractedRocks.map((rock, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-accent/50 rounded-xl">
                  <span className="text-lg">🪨</span>
                  <span className="text-foreground font-medium">{rock}</span>
                </div>
              ))}
            </div>
            <Button onClick={handleContinueWithRocks} size="lg" className="w-full gap-2">
              <ChevronLeft className="w-4 h-4" />
              המשך עם האבנים האלה
            </Button>
          </motion.div>
        )}

        {!extractedRocks && (
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

            <div className="flex justify-between items-center mt-3">
              <Button variant="ghost" size="sm" onClick={handleBack} className="gap-1 text-muted-foreground">
                <ArrowRight className="w-4 h-4" />
                חזרה
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                דלג בינתיים
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
