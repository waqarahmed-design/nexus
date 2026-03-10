import React, { useMemo } from 'react';
import { StyleSheet, Animated } from 'react-native';
import Svg, { G, Path } from 'react-native-svg';

interface Props {
  data: number[];
  color: string;
  width: number;
  height?: number;
  opacity?: Animated.Value | Animated.AnimatedInterpolation<number>;
}

export function TopoBackground({ data, color, width, height = 360, opacity }: Props) {
  const pathD = useMemo(() => {
    if (!data || data.length < 2) return '';
    const PADDING_Y = 20;
    const usableHeight = height - PADDING_Y * 2;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const N = data.length;
    const points = data.map((v, i) => ({
      x: (i / (N - 1)) * width,
      y: PADDING_Y + usableHeight * (1 - (v - min) / range),
    }));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  }, [data, width, height]);

  return (
    <Animated.View
      style={[styles.container, { opacity: opacity ?? 1 }]}
      pointerEvents="none"
    >
      <Svg width={width} height={height}>
        {/* Primary line */}
        <Path d={pathD} stroke={color} strokeWidth={1.5} fill="none" strokeOpacity={0.07} />
        {/* Echo above */}
        <G transform="translate(0, -36)">
          <Path d={pathD} stroke={color} strokeWidth={1.5} fill="none" strokeOpacity={0.04} />
        </G>
        {/* Echo below */}
        <G transform="translate(0, 36)">
          <Path d={pathD} stroke={color} strokeWidth={1.5} fill="none" strokeOpacity={0.025} />
        </G>
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});
