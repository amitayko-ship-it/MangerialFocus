import { useState } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RockCard } from './RockCard';
import { BigRock } from '@/types/focus';

interface BigRockStackProps {
  rocks: BigRock[];
  onRocksChange: (rocks: BigRock[]) => void;
  maxRocks?: number;
  title: string;
  subtitle: string;
  showBreakthroughStar?: boolean;
  isRTL: boolean;
  addRockLabel: string;
  practiceLabel: string;
  practiceHint: string;
  rockPlaceholder: string;
}

export default function BigRockStack({
  rocks,
  onRocksChange,
  maxRocks = 5,
  title,
  subtitle,
  showBreakthroughStar = false,
  isRTL,
  addRockLabel,
  practiceLabel,
  practiceHint,
  rockPlaceholder,
}: BigRockStackProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newRockTitle, setNewRockTitle] = useState('');

  const handleAddRock = () => {
    if (newRockTitle.trim() && rocks.length < maxRocks) {
      const newRock: BigRock = {
        id: `rock-${Date.now()}`,
        title: newRockTitle,
        order: rocks.length,
        practices: ['', '', ''],
      };
      onRocksChange([...rocks, newRock]);
      setNewRockTitle('');
      setIsAdding(false);
    }
  };

  const handleRemoveRock = (id: string) => {
    const updated = rocks
      .filter((r) => r.id !== id)
      .map((rock, idx) => ({ ...rock, order: idx }));
    onRocksChange(updated);
  };

  const handleTitleChange = (id: string, value: string) => {
    const updated = rocks.map((rock) =>
      rock.id === id ? { ...rock, title: value } : rock
    );
    onRocksChange(updated);
  };

  const handlePracticeChange = (id: string, practiceIndex: number, value: string) => {
    const updated = rocks.map((rock) => {
      if (rock.id === id) {
        const practices = [...(rock.practices || ['', '', ''])];
        practices[practiceIndex] = value;
        return { ...rock, practices };
      }
      return rock;
    });
    onRocksChange(updated);
  };

  return (
    <div className="space-y-6">
      <div className={`space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
        <div className="flex items-center gap-2">
          {showBreakthroughStar && <Sparkles className="h-6 w-6 text-yellow-500" />}
          <h2 className="text-2xl font-bold">{title}</h2>
          <span className="text-sm text-gray-500">
            ({rocks.length}/{maxRocks})
          </span>
        </div>
        <p className="text-gray-600">{subtitle}</p>
        <p className="text-xs text-gray-500 italic" dir={isRTL ? 'rtl' : 'ltr'}>
          {practiceHint}
        </p>
      </div>

      <div className="space-y-3">
        {rocks.map((rock) => (
          <RockCard
            key={rock.id}
            rock={rock}
            onRemove={() => handleRemoveRock(rock.id)}
            onTitleChange={(value) => handleTitleChange(rock.id, value)}
            onPracticeChange={(idx, value) => handlePracticeChange(rock.id, idx, value)}
            isRTL={isRTL}
            practiceLabel={practiceLabel}
          />
        ))}
      </div>

      {isAdding ? (
        <div className="bg-white rounded-lg border p-4 space-y-3">
          <Textarea
            value={newRockTitle}
            onChange={(e) => setNewRockTitle(e.target.value)}
            placeholder={rockPlaceholder}
            className="min-h-[60px]"
            dir={isRTL ? 'rtl' : 'ltr'}
            autoFocus
          />

          <div className="flex gap-2 justify-end flex-wrap">
            <Button variant="outline" onClick={() => setIsAdding(false)}>
              {isRTL ? 'ביטול' : 'Cancel'}
            </Button>
            <Button onClick={handleAddRock} disabled={!newRockTitle.trim()}>
              {isRTL ? 'הוסף' : 'Add'}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setIsAdding(true)}
          disabled={rocks.length >= maxRocks}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addRockLabel}
        </Button>
      )}
    </div>
  );
}
