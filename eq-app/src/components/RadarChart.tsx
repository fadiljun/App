import React from 'react';
import Svg, { Polygon, Circle, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '../lib/theme';
import { PILLAR_LABEL } from '../lib/scoring';
import type { Pillar, PillarScores } from '../lib/types';

interface Props {
  scores: PillarScores;
  size?: number;
}

const ORDER: Pillar[] = [
  'selfAwareness',
  'selfRegulation',
  'empathy',
  'socialSkills',
  'motivation',
];

export function RadarChart({ scores, size = 280 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const n = ORDER.length;

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;

  const point = (i: number, value: number) => {
    const r = radius * (value / 100);
    const a = angleFor(i);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
  };

  const ringPoints = (frac: number) =>
    ORDER.map((_, i) => {
      const r = radius * frac;
      const a = angleFor(i);
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    }).join(' ');

  const dataPoints = ORDER.map((p, i) => {
    const [x, y] = point(i, scores[p]);
    return `${x},${y}`;
  }).join(' ');

  return (
    <Svg width={size} height={size}>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <Polygon
          key={f}
          points={ringPoints(f)}
          fill="none"
          stroke={theme.border}
          strokeWidth={1}
        />
      ))}
      {ORDER.map((_, i) => {
        const a = angleFor(i);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={cx + radius * Math.cos(a)}
            y2={cy + radius * Math.sin(a)}
            stroke={theme.border}
            strokeWidth={1}
          />
        );
      })}
      <Polygon
        points={dataPoints}
        fill={theme.accent}
        fillOpacity={0.25}
        stroke={theme.accent}
        strokeWidth={2}
      />
      {ORDER.map((p, i) => {
        const [x, y] = point(i, scores[p]);
        return (
          <Circle
            key={p}
            cx={x}
            cy={y}
            r={4}
            fill={theme.pillar[p] ?? theme.accent}
          />
        );
      })}
      {ORDER.map((p, i) => {
        const a = angleFor(i);
        const labelR = radius + 22;
        const x = cx + labelR * Math.cos(a);
        const y = cy + labelR * Math.sin(a) + 4;
        return (
          <SvgText
            key={`${p}-label`}
            x={x}
            y={y}
            fill={theme.textMuted}
            fontSize={11}
            textAnchor="middle"
          >
            {PILLAR_LABEL[p]}
          </SvgText>
        );
      })}
    </Svg>
  );
}
