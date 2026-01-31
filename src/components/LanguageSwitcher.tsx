import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === 'he' ? 'en' : 'he')}
      className="gap-1.5 text-xs"
    >
      <Globe className="h-4 w-4" />
      {language === 'he' ? 'EN' : 'עב'}
    </Button>
  );
};
