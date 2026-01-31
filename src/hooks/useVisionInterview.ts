import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, InterviewPhase, VisionTile } from '@/types/vision';
import { getVisionSystemPrompt, PERSONALIZATION_PROMPT } from '@/lib/visionSystemPrompt';

interface UseVisionInterviewReturn {
  messages: Message[];
  isLoading: boolean;
  isComplete: boolean;
  progress: number;
  phase: InterviewPhase;
  sendMessage: (text: string) => Promise<void>;
  saveVision: () => Promise<void>;
  visionId: string | null;
  hasExistingVision: boolean;
  userName: string;
  userGender: 'male' | 'female' | null;
  narrative: string;
  tiles: VisionTile[];
}

export function useVisionInterview(userId: string | undefined): UseVisionInterviewReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<InterviewPhase>('personalization');
  const [visionId, setVisionId] = useState<string | null>(null);
  const [hasExistingVision, setHasExistingVision] = useState(false);
  const [userName, setUserName] = useState('');
  const [userGender, setUserGender] = useState<'male' | 'female' | null>(null);
  const [narrative, setNarrative] = useState('');
  const [tiles, setTiles] = useState<VisionTile[]>([]);

  const isComplete = phase === 'complete';

  // Calculate progress based on phase and message count
  const progress = (() => {
    switch (phase) {
      case 'personalization': return 5;
      case 'narrative': return Math.min(10 + messages.length * 5, 50);
      case 'clustering': return 60;
      case 'hardening': return 80;
      case 'complete': return 100;
      default: return 0;
    }
  })();

  // Load existing vision on mount
  useEffect(() => {
    if (!userId) return;

    const loadExisting = async () => {
      const { data } = await supabase
        .from('future_visions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

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

        // Restore user info from vision data
        if (data.user_name) setUserName(data.user_name);
        if (data.user_gender) setUserGender(data.user_gender);
      } else {
        // New user: start with personalization
        setHasExistingVision(false);
        startPersonalization();
      }
    };

    loadExisting();
  }, [userId]);

  const startPersonalization = () => {
    const welcomeMessage: Message = {
      role: 'assistant',
      content: PERSONALIZATION_PROMPT,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
    setPhase('personalization');
  };

  const parsePersonalization = (text: string): { name: string; gender: 'male' | 'female' } | null => {
    const lower = text.toLowerCase();
    // Try to detect gender
    let gender: 'male' | 'female' = 'male';
    if (lower.includes('נקבה') || lower.includes('נקבית') || lower.includes('בנקבה') || lower.includes('female')) {
      gender = 'female';
    }

    // Extract name - take the first substantial word that isn't a gender indicator
    const cleanText = text
      .replace(/נקבה|זכר|בנקבה|בזכר|female|male/gi, '')
      .replace(/קוראים לי|שמי|אני|שם/gi, '')
      .trim();

    const words = cleanText.split(/[\s,،.]+/).filter(w => w.length > 1);
    const name = words[0] || '';

    if (!name) return null;
    return { name, gender };
  };

  const callAI = async (conversationHistory: Message[], systemPrompt?: string): Promise<string> => {
    const aiMessages = [];

    if (systemPrompt) {
      aiMessages.push({ role: 'system', content: systemPrompt });
    }

    for (const msg of conversationHistory) {
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    const { data, error } = await supabase.functions.invoke('vision-interview', {
      body: {
        userId,
        messages: aiMessages,
      },
    });

    if (error) throw error;
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

    try {
      if (phase === 'personalization') {
        // Parse name and gender from response
        const parsed = parsePersonalization(text);
        if (parsed) {
          setUserName(parsed.name);
          setUserGender(parsed.gender);

          // Generate the opening message using the full system prompt
          const systemPrompt = getVisionSystemPrompt(parsed.name, parsed.gender);
          const response = await callAI(
            [{ role: 'user', content: `שמי ${parsed.name} ואני מעדיפ${parsed.gender === 'female' ? 'ה' : ''} פנייה ב${parsed.gender === 'female' ? 'נקבה' : 'זכר'}` }],
            systemPrompt
          );

          const assistantMessage: Message = {
            role: 'assistant',
            content: response,
            timestamp: new Date(),
          };

          setMessages([...updatedMessages, assistantMessage]);
          setPhase('narrative');
        } else {
          // Couldn't parse - ask again
          const retryMessage: Message = {
            role: 'assistant',
            content: 'לא הצלחתי לקלוט את השם. אפשר לנסות שוב? מה השם שלך ואיך לפנות אליך - בזכר או בנקבה?',
            timestamp: new Date(),
          };
          setMessages([...updatedMessages, retryMessage]);
        }
      } else {
        // Regular interview flow - send to AI with system prompt
        const systemPrompt = userName && userGender
          ? getVisionSystemPrompt(userName, userGender)
          : undefined;

        const response = await callAI(updatedMessages, systemPrompt);

        // Detect phase transitions from AI response
        const responseContent = response;
        if (responseContent.includes('זיהיתי כמה תחומים') || responseContent.includes('תחומים מרכזיים')) {
          setPhase('clustering');
        } else if (responseContent.includes('פעולה מדידה') || responseContent.includes('הרגל קבוע') || responseContent.includes('פעולות מרכזיות')) {
          setPhase('hardening');
        } else if (responseContent.includes('[חלק 1') || responseContent.includes('נרטיב אישי') || responseContent.includes('Vision Board תפעולי')) {
          setPhase('complete');
          extractFinalOutput(responseContent);
        }

        const assistantMessage: Message = {
          role: 'assistant',
          content: responseContent,
          timestamp: new Date(),
        };

        setMessages([...updatedMessages, assistantMessage]);
      }

      // Auto-save progress
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
    saveVision,
    visionId,
    hasExistingVision,
    userName,
    userGender,
    narrative,
    tiles,
  };
}
