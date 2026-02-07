import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, InterviewPhase, VisionTile } from '@/types/vision';
import { OPENING_PROMPT } from '@/lib/visionSystemPrompt';

interface UseVisionInterviewReturn {
  messages: Message[];
  isLoading: boolean;
  isComplete: boolean;
  progress: number;
  phase: InterviewPhase;
  sendMessage: (text: string) => Promise<void>;
  finishEarly: () => Promise<void>;
  saveVision: () => Promise<void>;
  visionId: string | null;
  hasExistingVision: boolean;
  userName: string;
  userGender: 'male' | 'female' | null;
  narrative: string;
  tiles: VisionTile[];
  userMessageCount: number;
}

export function useVisionInterview(userId: string | number | undefined): UseVisionInterviewReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<InterviewPhase>('narrative');
  const [visionId, setVisionId] = useState<string | null>(null);
  const [hasExistingVision, setHasExistingVision] = useState(false);
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<'male' | 'female' | null>(null);
  const [narrative, setNarrative] = useState('');
  const [tiles, setTiles] = useState<VisionTile[]>([]);

  const isComplete = phase === 'complete';
  const userMessageCount = messages.filter(m => m.role === 'user').length;

  const progress = (() => {
    switch (phase) {
      case 'narrative': return Math.min(10 + messages.length * 5, 50);
      case 'clustering': return 60;
      case 'hardening': return 80;
      case 'complete': return 100;
      default: return 5;
    }
  })();

  const loadCompassUserInfo = () => {
    try {
      const raw = localStorage.getItem('management-compass-data');
      if (raw) {
        const parsed = JSON.parse(raw);
        const compassData = parsed.value || parsed;
        if (compassData.userInfo?.name) setUserName(compassData.userInfo.name);
        if (compassData.userInfo?.gender) setUserGender(compassData.userInfo.gender);
      }
    } catch {}
  };

  // Load existing vision on mount
  useEffect(() => {
    loadCompassUserInfo();

    if (!userId) return;

    const loadExisting = async () => {
      try {
        const { data, error } = await supabase
          .from('future_visions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          // Demo mode or Supabase not configured - start fresh
          console.log('Starting fresh (demo mode or no Supabase)');
          setHasExistingVision(false);
          startInterview();
          return;
        }

        if (data) {
          setVisionId(data.id);
          setHasExistingVision(true);

          const history = (data.conversation_history as unknown as Message[]) || [];
          setMessages(history);
          setNarrative(data.narrative || '');

          const savedGoals = (data.goals as string[]) || [];
          if (savedGoals.length > 0) {
            setPhase('complete');
          }

          // Restore user info from vision data, compass data takes priority
          if (data.user_name && !userName) setUserName(data.user_name);
          if (data.user_gender && !userGender) setUserGender(data.user_gender);
        } else {
          // New user: start with personalization
          setHasExistingVision(false);
          startInterview();
        }
      } catch (err) {
        // Demo mode - start fresh
        console.log('Starting fresh (demo mode):', err);
        setHasExistingVision(false);
        startInterview();
      }
    };

    loadExisting();
  }, [userId]);

  const startInterview = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: OPENING_PROMPT,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setPhase('narrative');
  };

  const callAI = async (
    conversationHistory: Message[],
    overrideName?: string,
    overrideGender?: 'male' | 'female'
  ): Promise<string> => {
    const aiMessages = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await fetch('/api/vision/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: aiMessages,
        userName: overrideName || userName,
        userGender: overrideGender || userGender,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    return data.response || '';
  };

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    const currentUserCount = updatedMessages.filter(m => m.role === 'user').length;

    if (currentUserCount >= 20) {
      const allUserText = updatedMessages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join('\n\n');
      setNarrative(allUserText);
      setPhase('complete');

      const closingMessage: Message = {
        role: 'assistant',
        content: 'תודה רבה על השיתוף! אספנו מספיק תוכן כדי לבנות את תמונת העתיד שלך. לחץ על הכפתור למטה כדי לראות את הסיכום.',
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, closingMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await callAI(updatedMessages);

      if (response.includes('זיהיתי כמה תחומים') || response.includes('תחומים מרכזיים')) {
        setPhase('clustering');
      } else if (response.includes('פעולה מדידה') || response.includes('הרגל קבוע') || response.includes('פעולות מרכזיות')) {
        setPhase('hardening');
      } else if (response.includes('[חלק 1') || response.includes('נרטיב אישי') || response.includes('Vision Board תפעולי')) {
        setPhase('complete');
        extractFinalOutput(response);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages([...updatedMessages, assistantMessage]);

      await saveProgress([...updatedMessages]);
    } catch (error) {
      console.error('Error in vision interview:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'מצטער, הייתה שגיאה. אפשר לנסות שוב?',
        timestamp: new Date(),
      };
      setMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, phase, userName, userGender, userId]);

  const finishEarly = useCallback(async () => {
    if (isLoading) return;

    const allUserText = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    if (allUserText.trim()) {
      setNarrative(allUserText);
    }
    setPhase('complete');

    const closingMessage: Message = {
      role: 'assistant',
      content: 'מעולה! אספנו את התוכן שלך. בוא נמשיך להגדרת האבנים הגדולות.',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, closingMessage]);
    await saveProgress();
  }, [messages, isLoading]);

  const extractFinalOutput = (text: string) => {
    // Extract narrative (Part 1)
    const narrativeMatch = text.match(/\[חלק 1[^\]]*\]\s*([\s\S]*?)(?=\[חלק 2|\*\*\[חלק 2|$)/);
    if (narrativeMatch) {
      setNarrative(narrativeMatch[1].trim());
    }

    // Extract tiles (Part 2)
    const tilesMatch = text.match(/\[חלק 2[^\]]*\]\s*([\s\S]*?)(?=\[חלק 3|\*\*\[חלק 3|$)/);
    if (tilesMatch) {
      const tilesText = tilesMatch[1];
      const tileBlocks = tilesText.split(/\*\*\[|###\s*/).filter(Boolean);
      const parsedTiles: VisionTile[] = [];

      for (const block of tileBlocks) {
        const nameMatch = block.match(/^([^\]]*)\]/);
        if (nameMatch) {
          const tile: VisionTile = {
            name: nameMatch[1].trim(),
            snapshot: '',
            actions: [],
            routine: '',
          };

          const snapshotMatch = block.match(/תמונת מצב:\s*(.+)/);
          if (snapshotMatch) tile.snapshot = snapshotMatch[1].trim();

          const actionsMatches = block.match(/פעול[הו]t?\s*\d*[.:]\s*(.+)/g);
          if (actionsMatches) {
            tile.actions = actionsMatches.map(a => a.replace(/פעול[הו]t?\s*\d*[.:]\s*/, '').trim());
          }

          const routineMatch = block.match(/שגרה[^:]*:\s*(.+)/);
          if (routineMatch) tile.routine = routineMatch[1].trim();

          parsedTiles.push(tile);
        }
      }

      if (parsedTiles.length > 0) setTiles(parsedTiles);
    }
  };

  const saveProgress = async (msgs?: Message[]) => {
    if (!userId) return;

    try {
      const conversationHistory = msgs || messages;
      const visionData: Record<string, unknown> = {
        user_id: userId,
        conversation_history: JSON.parse(JSON.stringify(conversationHistory)),
        goals: tiles.map(t => t.name),
        narrative,
        is_complete: phase === 'complete',
        phase,
        user_name: userName,
        user_gender: userGender,
        updated_at: new Date().toISOString(),
      };

      if (visionId) {
        await supabase.from('future_visions').update(visionData).eq('id', visionId);
      } else {
        const { data } = await supabase
          .from('future_visions')
          .insert(visionData)
          .select('id')
          .single();
        if (data) setVisionId(data.id);
      }
    } catch (err) {
      // Demo mode - skip saving to Supabase
      console.log('Skipping save (demo mode):', err);
    }
  };

  const saveVision = async () => {
    await saveProgress();
  };

  return {
    messages,
    isLoading,
    isComplete,
    progress,
    phase,
    sendMessage,
    finishEarly,
    saveVision,
    visionId,
    hasExistingVision,
    userName,
    userGender,
    narrative,
    tiles,
    userMessageCount,
  };
}
