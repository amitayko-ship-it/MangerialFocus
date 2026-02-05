import { useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reflectVision = useCallback(async (visionText: string): Promise<ReflectionResult | null> => {
    setLoading(true);
    setError(null);
    
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
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [language]);

  const clarifyRock = useCallback(async (rockText: string): Promise<ClarifyRockResult | null> => {
    setLoading(true);
    setError(null);
    
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
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [language]);

  return {
    loading,
    error,
    reflectVision,
    clarifyRock,
  };
}
