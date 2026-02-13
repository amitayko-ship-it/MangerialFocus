import React from 'react';
import { motion } from 'framer-motion';
import { BigRock } from '@/types/focus';

interface StoneCairnProps {
  rocks: BigRock[];
  keystoneTitle?: string;
}

const STONE_COLORS = [
  { fill: '#1B6B7A', shadow: '#145862' },
  { fill: '#3A9E8F', shadow: '#2D7F73' },
  { fill: '#7BAF4C', shadow: '#6A9A40' },
  { fill: '#B8A44C', shadow: '#9E8D3E' },
  { fill: '#D9A21B', shadow: '#C08E15' },
];

export function StoneCairn({ rocks, keystoneTitle }: StoneCairnProps) {
  const displayRocks = rocks.length > 0 ? rocks.slice(0, 5) : [];
  const stoneCount = Math.max(displayRocks.length, 1);
  const stoneHeight = 28;
  const stoneGap = 6;
  const totalHeight = stoneCount * (stoneHeight + stoneGap) + 20;

  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <div className="relative" style={{ width: 130, height: totalHeight }}>
        <svg
          viewBox={`0 0 130 ${totalHeight}`}
          width="130"
          height={totalHeight}
          className="overflow-visible"
        >
          {displayRocks.map((_, idx) => {
            const bottomIdx = displayRocks.length - 1 - idx;
            const colorIdx = bottomIdx % STONE_COLORS.length;
            const color = STONE_COLORS[colorIdx];
            const yPos = idx * (stoneHeight + stoneGap) + 10;
            const maxWidth = 110;
            const minWidth = 40;
            const widthRange = maxWidth - minWidth;
            const stoneWidth = minWidth + (idx / Math.max(displayRocks.length - 1, 1)) * widthRange;
            const xCenter = 65;

            return (
              <motion.g
                key={idx}
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bottomIdx * 0.12, duration: 0.5, ease: 'easeOut' }}
              >
                <ellipse
                  cx={xCenter}
                  cy={yPos + stoneHeight / 2 + 3}
                  rx={stoneWidth / 2}
                  ry={stoneHeight / 2 - 1}
                  fill={color.shadow}
                  opacity={0.25}
                />
                <ellipse
                  cx={xCenter}
                  cy={yPos + stoneHeight / 2}
                  rx={stoneWidth / 2}
                  ry={stoneHeight / 2}
                  fill={color.fill}
                />
                <ellipse
                  cx={xCenter - stoneWidth * 0.08}
                  cy={yPos + stoneHeight / 2 - 4}
                  rx={stoneWidth / 3.5}
                  ry={stoneHeight / 5}
                  fill="white"
                  opacity={0.15}
                />
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col justify-center gap-1" style={{ minHeight: totalHeight }}>
        {displayRocks.map((rock, idx) => {
          const bottomIdx = displayRocks.length - 1 - idx;
          const isKeystone = rock.title === keystoneTitle;
          const colorIdx = bottomIdx % STONE_COLORS.length;
          return (
            <motion.div
              key={rock.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: bottomIdx * 0.12 + 0.2, duration: 0.4 }}
              className="flex items-center gap-2"
              style={{ height: stoneHeight + stoneGap }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: STONE_COLORS[colorIdx].fill }}
              />
              <span className={`text-sm leading-tight ${isKeystone ? 'text-primary font-bold' : 'text-foreground font-medium'}`}>
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
