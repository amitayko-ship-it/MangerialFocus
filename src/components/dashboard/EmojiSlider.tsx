import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface EmojiSliderProps {
  value: number;
  onChange: (value: number) => void;
  type: 'energy' | 'passion';
  disabled?: boolean;
  isRTL?: boolean;
}

const ENERGY_EMOJIS = ['🪫', '🔋', '🔋', '⚡', '⚡'];
const PASSION_EMOJIS = ['😴', '🙂', '😊', '🔥', '🔥'];

const LABELS = {
  energy: {
    he: ['מתרוקן', 'נמוך', 'בינוני', 'גבוה', 'מלא אנרגיה'],
    en: ['Drained', 'Low', 'Medium', 'High', 'Energized'],
  },
  passion: {
    he: ['אדיש', 'בסדר', 'מעורב', 'נלהב', 'בוער'],
    en: ['Indifferent', 'Okay', 'Engaged', 'Excited', 'On fire'],
  },
};

export function EmojiSlider({ value, onChange, type, disabled = false, isRTL = false }: EmojiSliderProps) {
  const emojis = type === 'energy' ? ENERGY_EMOJIS : PASSION_EMOJIS;
  const labels = LABELS[type][isRTL ? 'he' : 'en'];

  return (
    <div className="space-y-3">
      <div className={cn('flex gap-2 justify-center', isRTL && 'flex-row-reverse')}>
        {emojis.map((emoji, index) => {
          const isSelected = value === index + 1;
          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => !disabled && onChange(index + 1)}
              disabled={disabled}
              className={cn(
                'relative p-3 rounded-full text-3xl transition-all',
                'hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                isSelected && 'ring-2 ring-primary scale-110 bg-muted'
              )}
              whileHover={!disabled ? { scale: 1.1 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
            >
              {emoji}
            </motion.button>
          );
        })}
      </div>
      {value > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-muted-foreground"
        >
          {labels[value - 1]}
        </motion.div>
      )}
    </div>
  );
}
