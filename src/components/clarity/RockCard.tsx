import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BigRock } from '@/types/focus';

interface RockCardProps {
  rock: BigRock;
  onRemove: () => void;
  onTitleChange: (value: string) => void;
  onPracticeChange: (index: number, value: string) => void;
  isRTL: boolean;
  practiceLabel: string;
}

export function RockCard({
  rock,
  onRemove,
  onTitleChange,
  onPracticeChange,
  isRTL,
  practiceLabel,
}: RockCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: isRTL ? 100 : -100 }}
      className="bg-white rounded-lg border p-4 space-y-3"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-3">
          <Textarea
            value={rock.title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={isRTL ? 'שם האבן הגדולה' : 'Big rock name'}
            className="min-h-[60px] resize-none font-semibold"
            dir={isRTL ? 'rtl' : 'ltr'}
          />

          <div className="space-y-2">
            {rock.practices?.map((practice, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-20 shrink-0" dir={isRTL ? 'rtl' : 'ltr'}>
                  {practiceLabel} {idx + 1}
                </span>
                <Textarea
                  value={practice}
                  onChange={(e) => onPracticeChange(idx, e.target.value)}
                  placeholder={isRTL ? 'תאר את הפרקטיקה...' : 'Describe the practice...'}
                  className="min-h-[50px] resize-none text-sm"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="text-gray-400 hover:text-red-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
