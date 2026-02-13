import React from 'react';
import { motion } from 'framer-motion';
import { BigRock } from '@/types/focus';

interface StoneCairnProps {
  rocks: BigRock[];
  keystoneTitle?: string;
}

const STONE_COLORS = [
  { fill: '#1A7A7A', shadow: '#146363' },
  { fill: '#2A8F8F', shadow: '#1F7373' },
  { fill: '#7BAF4C', shadow: '#6A9A40' },
  { fill: '#B8A44C', shadow: '#9E8D3E' },
  { fill: '#D9A21B', shadow: '#C08E15' },
];

export function StoneCairn({ rocks, keystoneTitle }: StoneCairnProps) {
  const displayRocks = rocks.length > 0 ? rocks.slice(0, 5) : [];
  const stoneCount = Math.max(displayRocks.length, 1);

  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <div className="relative" style={{ width: 120, height: stoneCount * 44 + 20 }}>
        <svg
          viewBox={`0 0 120 ${stoneCount * 44 + 20}`}
          width="120"
          height={stoneCount * 44 + 20}
          className="overflow-visible"
        >
          {displayRocks.map((_, idx) => {
            const reverseIdx = displayRocks.length - 1 - idx;
            const colorIdx = reverseIdx % STONE_COLORS.length;
            const color = STONE_COLORS[colorIdx];
            const yPos = idx * 44 + 10;
            const baseWidth = 50 + (displayRocks.length - 1 - idx) * 14;
            const stoneWidth = Math.min(baseWidth, 110);
            const stoneHeight = 30;
            const xCenter = 60;

            return (
              <motion.g
                key={idx}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (displayRocks.length - 1 - idx) * 0.15, duration: 0.5, ease: 'easeOut' }}
              >
                <ellipse
                  cx={xCenter}
                  cy={yPos + stoneHeight / 2 + 3}
                  rx={stoneWidth / 2}
                  ry={stoneHeight / 2 - 2}
                  fill={color.shadow}
                  opacity={0.3}
                />
                <ellipse
                  cx={xCenter}
                  cy={yPos + stoneHeight / 2}
                  rx={stoneWidth / 2}
                  ry={stoneHeight / 2}
                  fill={color.fill}
                />
                <ellipse
                  cx={xCenter - stoneWidth * 0.1}
                  cy={yPos + stoneHeight / 2 - 4}
                  rx={stoneWidth / 3}
                  ry={stoneHeight / 4}
                  fill="white"
                  opacity={0.12}
                />
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col justify-center gap-2" style={{ minHeight: stoneCount * 44 + 20 }}>
        {displayRocks.map((rock, idx) => {
          const isKeystone = rock.title === keystoneTitle;
          return (
            <motion.div
              key={rock.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (displayRocks.length - 1 - idx) * 0.15 + 0.2, duration: 0.4 }}
              className="flex items-center gap-2"
              style={{ height: 44 }}
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: STONE_COLORS[(displayRocks.length - 1 - idx) % STONE_COLORS.length].fill }}
              />
              <span className={`text-sm font-medium leading-tight ${isKeystone ? 'text-primary font-bold' : 'text-foreground'}`}>
                {rock.title}
              </span>
              {isKeystone && (
                <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full font-bold whitespace-nowrap">
                  מפתח
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
