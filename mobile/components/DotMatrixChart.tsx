import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors } from '@/constants/Colors';
import { FontFamily } from '@/constants/Typography';

const DOT_ROWS = 11;
const DOT_R    = 2.5;
const DOT_SIZE = 5;   // DOT_R * 2
const DOT_GAP  = 4;   // gap between dots
// Total chart height: 11 × 5 + 10 × 4 = 95px
const CHART_H  = DOT_ROWS * DOT_SIZE + (DOT_ROWS - 1) * DOT_GAP;

// Bottom-up per dot — native driver, all columns simultaneously
const DOT_DURATION = 80;   // ms per dot fade-in
const ROW_STAGGER  = 35;   // ms between rows (bottom → top)
// Max total: (DOT_ROWS - 1) × 35 + 80 = 430ms

// Colors.dotEmpty is rgba(255,255,255,0.06).
// Pressed column's empty dots should feel "lit up" — ~4x brighter.
// We use inline backgroundColor strings rather than new Color tokens.
const DOT_EMPTY_PRESSED = 'rgba(255,255,255,0.22)';

interface Props {
  data: { label: string; value: number }[];
  width: number;
  isGain?: boolean;
  formatValue?: (v: number) => string;
}

export function DotMatrixChart({ data, width, isGain = true, formatValue }: Props) {
  const [pressedCol, setPressedCol] = useState<number | null>(null);
  // Only true while a touch that began ON this chart is active.
  const touchActiveRef = useRef(false);
  // Chart's left edge in page coordinates, recorded at touch start.
  // Used in onTouchMove instead of locationX, which becomes unreliable
  // when the parent ScrollView intercepts the gesture.
  const chartOriginX = useRef(0);

  const colCount = data.length;
  const colW     = width / colCount;
  const values   = data.map((d) => d.value);
  const minVal   = Math.min(...values);
  const maxVal   = Math.max(...values);
  const range    = maxVal - minVal || 1;

  const tooltipW    = 88;
  const tooltipLeft = pressedCol !== null
    ? Math.max(0, Math.min(width - tooltipW, colW * pressedCol + colW / 2 - tooltipW / 2))
    : 0;

  // Shared col-detection logic used by both onTouchStart and onTouchMove
  function colFromX(locationX: number): number {
    const col = Math.floor(locationX / colW);
    return Math.max(0, Math.min(colCount - 1, col));
  }

  // Stable key derived from the dataset — changes when tab switches (D1/W1/M1 differ)
  const dataKey = `${data.length}_${data[0]?.label ?? ''}`;
  const prevDataKey = useRef('');
  const dotAnimsRef = useRef<Animated.Value[][]>([]);

  // Recreate animation values synchronously when the dataset changes.
  // New values start at 0 (base layer shows dim dots) until the effect fires.
  if (prevDataKey.current !== dataKey) {
    prevDataKey.current = dataKey;
    dotAnimsRef.current = data.map(() =>
      Array.from({ length: DOT_ROWS }, () => new Animated.Value(0))
    );
  }
  const dotAnims = dotAnimsRef.current;

  function filledDots(value: number) {
    return Math.round(2 + ((value - minVal) / range) * (DOT_ROWS - 2));
  }

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    data.forEach((col, ci) => {
      const filled = filledDots(col.value);
      // di=0 is top dot, di=filled-1 is bottom dot.
      // Bottom-up: bottom dot (di=filled-1) fires first, top dot (di=0) fires last.
      for (let di = 0; di < filled; di++) {
        animations.push(
          Animated.timing(dotAnims[ci][di], {
            toValue:         1,
            duration:        DOT_DURATION,
            delay:           (filled - 1 - di) * ROW_STAGGER,
            easing:          Easing.out(Easing.cubic),
            useNativeDriver: true,
          })
        );
      }
    });

    Animated.parallel(animations).start();
  }, [dataKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View
      style={{ width, height: CHART_H }}
      onTouchStart={(e) => {
        touchActiveRef.current = true;
        // pageX - locationX = left edge of this view in page coordinates
        chartOriginX.current = e.nativeEvent.pageX - e.nativeEvent.locationX;
        setPressedCol(colFromX(e.nativeEvent.locationX));
      }}
      onTouchMove={(e) => {
        if (!touchActiveRef.current) return;
        // pageX is stable even when the ScrollView intercepts the gesture;
        // locationX can drop to 0 in that case, causing the false column-0 snap.
        const localX = e.nativeEvent.pageX - chartOriginX.current;
        setPressedCol(colFromX(localX));
      }}
      onTouchEnd={() => {
        touchActiveRef.current = false;
        setPressedCol(null);
      }}
      onTouchCancel={() => {
        touchActiveRef.current = false;
        setPressedCol(null);
      }}
    >
      {/* Tooltip */}
      {pressedCol !== null && (
        <View style={[styles.tooltip, { left: tooltipLeft, width: tooltipW }]}>
          <Text style={styles.tooltipLabel}>{data[pressedCol].label}</Text>
          <Text style={styles.tooltipText}>
            {formatValue
              ? formatValue(data[pressedCol].value)
              : data[pressedCol].value.toString()}
          </Text>
        </View>
      )}

      {/* Base layer — all dots at dotEmpty, always visible on mount.
          Issue 1 fix: pressed column's dots switch to DOT_EMPTY_PRESSED
          (~4x brighter rgba) via inline backgroundColor, making the whole
          column feel cohesive and selected without animating. */}
      <View style={[StyleSheet.absoluteFill, styles.row]}>
        {data.map((_, ci) => {
          const isPressed = pressedCol === ci;
          return (
            <View key={ci} style={{ width: colW, alignItems: 'center', gap: DOT_GAP }}>
              {Array.from({ length: DOT_ROWS }, (_, ri) => (
                <View
                  key={ri}
                  style={[
                    styles.dotEmpty,
                    isPressed && { backgroundColor: DOT_EMPTY_PRESSED },
                  ]}
                />
              ))}
            </View>
          );
        })}
      </View>

      {/* Active dots — per-dot opacity, all columns fire simultaneously, bottom-up */}
      {data.map((col, ci) => {
        const filled    = filledDots(col.value);
        const isPressed = pressedCol === ci;

        return (
          <View
            key={ci}
            pointerEvents="none"
            style={{
              position:       'absolute',
              top:            0,
              left:           colW * ci,
              width:          colW,
              height:         CHART_H,
              alignItems:     'center',
              justifyContent: 'flex-end',
              gap:            DOT_GAP,
            }}
          >
            {Array.from({ length: filled }, (_, di) => (
              <Animated.View
                key={di}
                style={[
                  styles.dotFilled,
                  di === 0 && (isGain ? styles.dotGreen : styles.dotRed),
                  isPressed && styles.dotAccent,
                  { opacity: dotAnims[ci][di] },
                ]}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  dotEmpty: {
    width:           DOT_SIZE,
    height:          DOT_SIZE,
    borderRadius:    DOT_R,
    backgroundColor: Colors.dotEmpty,
  },
  dotFilled: {
    width:           DOT_SIZE,
    height:          DOT_SIZE,
    borderRadius:    DOT_R,
    backgroundColor: Colors.dotFilled,
  },
  dotGreen: {
    backgroundColor: Colors.green,
  },
  dotRed: {
    backgroundColor: Colors.red,
  },
  dotAccent: {
    backgroundColor: Colors.accent,
  },
  tooltip: {
    position:          'absolute',
    top:               -46,
    backgroundColor:   Colors.card,
    borderRadius:      6,
    paddingHorizontal: 8,
    paddingVertical:   5,
    alignItems:        'center',
    gap:               1,
  },
  tooltipLabel: {
    color:         Colors.gray,
    fontSize:      9,
    fontWeight:    '700',
    letterSpacing: 1,
  },
  tooltipText: {
    color:      Colors.gray,
    fontSize:   11,
    fontFamily: FontFamily.mono,
  },
});
