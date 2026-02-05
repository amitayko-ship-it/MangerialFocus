import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface ReflectionResult {
  themes: string[];
  summary: string;
}

interface ClarifyRockResult {
  isRock: boolean;
  feedback: string;
  suggestion?: string;
}

export function useCoachAgent() {
  const { language } = useLanguage();
  const [reflectLoading, setReflectLoading] = useState(false);
  const [clarifyLoading, setClarifyLoading] = useState(false);

  const reflectVision = useCallback(async (visionText: string): Promise<ReflectionResult | null> => {
    setReflectLoading(true);
    
    try {
      const response = await fetch('/api/coach/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visionText, language }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get reflection');
      }
      
      const result = await response.json();
      return result as ReflectionResult;
    } catch (err) {
      const errorMsg = language === 'he' ? 'לא הצלחנו לקבל שיקוף' : 'Failed to get reflection';
      toast.error(errorMsg);
      return null;
    } finally {
      setReflectLoading(false);
    }
  }, [language]);

  const clarifyRock = useCallback(async (rockText: string): Promise<ClarifyRockResult | null> => {
    setClarifyLoading(true);
    
    try {
      const response = await fetch('/api/coach/clarify-rock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rockText, language }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to clarify rock');
      }
      
      const result = await response.json();
      return result as ClarifyRockResult;
    } catch (err) {
      const errorMsg = language === 'he' ? 'לא הצלחנו לבדוק את הניסוח' : 'Failed to check wording';
      toast.error(errorMsg);
      return null;
    } finally {
      setClarifyLoading(false);
    }
  }, [language]);

  return {
    reflectLoading,
    clarifyLoading,
    reflectVision,
    clarifyRock,
  };
}
