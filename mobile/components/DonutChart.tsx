import React from 'react';
import Svg, { Circle } from 'react-native-svg';

interface Segment {
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  size: number;
  strokeWidth?: number;
}

export function DonutChart({ segments, size, strokeWidth = 14 }: DonutChartProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  let cumulativePct = 0;

  return (
    <Svg width={size} height={size}>
      {/* Background track */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={strokeWidth}
      />

      {segments.map((seg, i) => {
        const pct = seg.value / total;
        const dashLength = Math.max(0, pct * circumference - strokeWidth * 1.5);
        const rotation = -90 + cumulativePct * 360;
        cumulativePct += pct;

        return (
          <Circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={[dashLength, circumference - dashLength]}
            strokeLinecap="round"
            rotation={rotation}
            originX={cx}
            originY={cy}
          />
        );
      })}
    </Svg>
  );
}
