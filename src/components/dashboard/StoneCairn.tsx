import React from 'react';
import { motion } from 'framer-motion';
import { BigRock } from '@/types/focus';

interface StoneCairnProps {
  rocks: BigRock[];
  keystoneTitle?: string;
}

const STONE_TEMPLATES = [
  { fill: '#D9A21B', shadow: '#C08E15', rx: 16, ry: 13, offsetX: 2, rotate: -8 },
  { fill: '#B5A04A', shadow: '#9E8D3E', rx: 44, ry: 9, offsetX: 4, rotate: 4 },
  { fill: '#7BAF4C', shadow: '#6A9A40', rx: 36, ry: 14, offsetX: -2, rotate: -2 },
  { fill: '#3A9E96', shadow: '#2D7F78', rx: 44, ry: 14, offsetX: -3, rotate: 1 },
  { fill: '#1B6B7A', shadow: '#145862', rx: 52, ry: 13, offsetX: -1, rotate: -1 },
];

function getStoneConfig(totalRocks: number) {
  if (totalRocks <= 0) return [];
  if (totalRocks === 1) return [STONE_TEMPLATES[4]];
  if (totalRocks === 2) return [STONE_TEMPLATES[0], STONE_TEMPLATES[4]];
  if (totalRocks === 3) return [STONE_TEMPLATES[0], STONE_TEMPLATES[2], STONE_TEMPLATES[4]];
  if (totalRocks === 4) return [STONE_TEMPLATES[0], STONE_TEMPLATES[1], STONE_TEMPLATES[2], STONE_TEMPLATES[4]];
  return STONE_TEMPLATES;
}

export function StoneCairn({ rocks, keystoneTitle }: StoneCairnProps) {
  const displayRocks = rocks.length > 0 ? rocks.slice(0, 5) : [];
  const stoneConfigs = getStoneConfig(displayRocks.length);
  const svgWidth = 140;
  const xCenter = 70;
  const stoneSpacing = 30;
  const totalHeight = stoneConfigs.length * stoneSpacing + 30;

  return (
    <div className="flex items-center justify-center gap-8 py-4">
      <div className="relative" style={{ width: svgWidth, height: totalHeight }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${totalHeight}`}
          width={svgWidth}
          height={totalHeight}
          className="overflow-visible"
        >
          {stoneConfigs.map((stone, idx) => {
            const bottomIdx = stoneConfigs.length - 1 - idx;
            const yPos = idx * stoneSpacing + 15;

            return (
              <motion.g
                key={idx}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: bottomIdx * 0.12, duration: 0.5, ease: 'easeOut' }}
              >
                <ellipse
                  cx={xCenter + stone.offsetX}
                  cy={yPos + 3}
                  rx={stone.rx}
                  ry={stone.ry - 1}
                  fill={stone.shadow}
                  opacity={0.2}
                  transform={`rotate(${stone.rotate} ${xCenter + stone.offsetX} ${yPos + 3})`}
                />
                <ellipse
                  cx={xCenter + stone.offsetX}
                  cy={yPos}
                  rx={stone.rx}
                  ry={stone.ry}
                  fill={stone.fill}
                  transform={`rotate(${stone.rotate} ${xCenter + stone.offsetX} ${yPos})`}
                />
                <ellipse
                  cx={xCenter + stone.offsetX - stone.rx * 0.1}
                  cy={yPos - stone.ry * 0.25}
                  rx={stone.rx * 0.5}
                  ry={stone.ry * 0.35}
                  fill="white"
                  opacity={0.13}
                  transform={`rotate(${stone.rotate} ${xCenter + stone.offsetX - stone.rx * 0.1} ${yPos - stone.ry * 0.25})`}
                />
              </motion.g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-col justify-center gap-0.5" style={{ minHeight: totalHeight }}>
        {displayRocks.map((rock, idx) => {
          const isKeystone = rock.title === keystoneTitle;
          const stone = stoneConfigs[idx];
          return (
            <motion.div
              key={rock.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (stoneConfigs.length - 1 - idx) * 0.12 + 0.2, duration: 0.4 }}
              className="flex items-center gap-2"
              style={{ height: stoneSpacing }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: stone?.fill }}
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
