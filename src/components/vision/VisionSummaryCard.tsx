import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, RotateCcw } from 'lucide-react';
import { VisionTile } from '@/types/vision';

interface VisionSummaryCardProps {
  narrative: string;
  tiles: VisionTile[];
  isRTL?: boolean;
}

const VisionSummaryCard: React.FC<VisionSummaryCardProps> = ({
  narrative,
  tiles,
  isRTL = true,
}) => {
  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Narrative Section */}
      {narrative && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl border border-border p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">
              {isRTL ? 'תמונת העתיד שלך' : 'Your Future Vision'}
            </h3>
          </div>
          <div className="text-sm leading-relaxed text-muted-foreground prose prose-sm max-w-none">
            <ReactMarkdown>{narrative}</ReactMarkdown>
          </div>
        </motion.div>
      )}

      {/* Tiles Section */}
      {tiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-lg font-semibold px-1">
            {isRTL ? 'Vision Board תפעולי' : 'Operational Vision Board'}
          </h3>

          {tiles.map((tile, index) => (
            <motion.div
              key={tile.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + index * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 shadow-soft"
            >
              <h4 className="font-semibold text-foreground mb-2">{tile.name}</h4>

              {tile.snapshot && (
                <p className="text-sm text-muted-foreground mb-3 italic">
                  {tile.snapshot}
                </p>
              )}

              {tile.actions.length > 0 && (
                <ul className="space-y-1.5 mb-3">
                  {tile.actions.map((action, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              )}

              {tile.routine && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-2">
                  <RotateCcw className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{tile.routine}</span>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default VisionSummaryCard;
