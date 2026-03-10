import React, { useRef, useState, useEffect } from 'react';
import { useWindowDimensions, View, Text, PanResponder, StyleSheet, Animated, Easing } from 'react-native';
import Svg, {
  Path,
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Mask,
  Rect,
  G,
  Line,
} from 'react-native-svg';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';

interface Props {
  data: number[];
  height?: number;
  horizontalPadding?: number;
  color?: string;
  width?: number;
  interactive?: boolean;
  formatValue?: (v: number) => string;
  noEdgeFade?: boolean;
  /** Animate line drawing on mount. Default true for non-interactive, false for tiny sparklines. */
  animateIn?: boolean;
}

const TOOLTIP_W = 96;

// AnimatedPath — wraps SVG Path with a strokeDashoffset that drives the draw-on animation
// We use a JS-driven Animated.Value here because SVG props cannot use native driver.
// strokeDashoffset is a layout prop in react-native-svg.
const AnimatedPath = Animated.createAnimatedComponent(Path);

export function SparklineChart({
  data,
  height = 90,
  horizontalPadding = 48,
  color = Colors.accent,
  width: explicitWidth,
  interactive = false,
  formatValue,
  noEdgeFade = false,
  animateIn = true,
}: Props) {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = explicitWidth ?? (windowWidth - horizontalPadding * 2);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Draw-on animation: start at full dashoffset (line hidden), animate to 0 (fully drawn)
  const drawProgress = useRef(new Animated.Value(0)).current;
  const areaOpacity  = useRef(new Animated.Value(0)).current;
  const hasAnimated  = useRef(false);

  // Mutable ref so PanResponder closures always read fresh values
  const stateRef = useRef({ chartWidth, dataLen: data.length, interactive });
  stateRef.current = { chartWidth, dataLen: data.length, interactive };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => stateRef.current.interactive,
      onMoveShouldSetPanResponder: () => stateRef.current.interactive,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX;
        const { chartWidth: cw, dataLen } = stateRef.current;
        const idx = Math.round((x / cw) * (dataLen - 1));
        setActiveIndex(Math.max(0, Math.min(dataLen - 1, idx)));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX;
        const { chartWidth: cw, dataLen } = stateRef.current;
        const idx = Math.round((x / cw) * (dataLen - 1));
        setActiveIndex(Math.max(0, Math.min(dataLen - 1, idx)));
      },
      onPanResponderRelease: () => setActiveIndex(null),
      onPanResponderTerminate: () => setActiveIndex(null),
    })
  ).current;

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const PADDING_Y = 10;
  const DOT_R = noEdgeFade ? 0 : 8;
  const usableHeight = height - PADDING_Y * 2;
  const plotLeft = DOT_R;
  const plotRight = chartWidth - DOT_R;
  const plotWidth = plotRight - plotLeft;

  const points = data.map((value, i) => ({
    x: plotLeft + (i / (data.length - 1)) * plotWidth,
    y: PADDING_Y + usableHeight * (1 - (value - min) / range),
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${plotRight.toFixed(1)} ${height} L ${plotLeft.toFixed(1)} ${height} Z`;

  // Approximate path length for strokeDasharray — use chartWidth as a close enough estimate
  // (real path length would need a native measurement; this visual approximation is fine)
  const approxPathLength = chartWidth * 1.1;

  const ap = activeIndex !== null ? points[activeIndex] : null;

  const tooltipLeft = ap
    ? Math.max(0, Math.min(chartWidth - TOOLTIP_W, ap.x - TOOLTIP_W / 2))
    : 0;

  // Derive strokeDashoffset from drawProgress (0 → 1 maps to approxPathLength → 0)
  const strokeDashoffset = drawProgress.interpolate({
    inputRange:  [0, 1],
    outputRange: [approxPathLength, 0],
    extrapolate: 'clamp',
  });

  // Trigger draw-on animation on first render (if animateIn is enabled)
  useEffect(() => {
    if (!animateIn || hasAnimated.current) return;
    hasAnimated.current = true;

    // Reset to start
    drawProgress.setValue(0);
    areaOpacity.setValue(0);

    Animated.sequence([
      // Draw line first
      Animated.timing(drawProgress, {
        toValue:         1,
        duration:        600,
        easing:          Easing.out(Easing.cubic),
        useNativeDriver: false,  // SVG strokeDashoffset cannot use native driver
      }),
      // Then fade in the area fill
      Animated.timing(areaOpacity, {
        toValue:         1,
        duration:        200,
        useNativeDriver: false,
      }),
    ]).start();
  }, []);

  return (
    <View
      style={{ width: chartWidth, height }}
      {...(interactive ? panResponder.panHandlers : {})}
    >
      <Svg width={chartWidth} height={height}>
        <Defs>
          {/* Vertical area gradient */}
          <LinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </LinearGradient>
          {/* Horizontal edge-fade mask — omitted when noEdgeFade */}
          {!noEdgeFade && (
            <>
              <LinearGradient id="edgeFadeGrad" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%"   stopColor="white" stopOpacity="0" />
                <Stop offset="10%"  stopColor="white" stopOpacity="1" />
                <Stop offset="90%"  stopColor="white" stopOpacity="1" />
                <Stop offset="100%" stopColor="white" stopOpacity="0" />
              </LinearGradient>
              <Mask id="edgeFade">
                <Rect x="0" y="0" width={chartWidth} height={height} fill="url(#edgeFadeGrad)" />
              </Mask>
            </>
          )}
        </Defs>

        {/* Area fill (fades in after line is drawn) */}
        <G mask={noEdgeFade ? undefined : 'url(#edgeFade)'}>
          <AnimatedPath
            d={areaPath}
            fill="url(#areaGrad)"
            fillOpacity={animateIn ? areaOpacity : 1}
          />
          {/* Animated line draw-on */}
          <AnimatedPath
            d={linePath}
            stroke={color}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={animateIn ? `${approxPathLength} ${approxPathLength}` : undefined}
            strokeDashoffset={animateIn ? strokeDashoffset : undefined}
          />
        </G>

        {/* Crosshair when interacting */}
        {ap && (
          <G>
            <Line
              x1={ap.x} y1={PADDING_Y}
              x2={ap.x} y2={height}
              stroke="rgba(255,255,255,0.18)"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <Circle cx={ap.x} cy={ap.y} r="9" fill={color} fillOpacity="0.18" />
            <Circle cx={ap.x} cy={ap.y} r="3.5" fill={color} />
          </G>
        )}

      </Svg>

      {/* Value tooltip */}
      {ap && activeIndex !== null && (
        <View style={[tt.wrap, { left: tooltipLeft }]}>
          <Text style={tt.value}>
            {formatValue ? formatValue(data[activeIndex]) : data[activeIndex].toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const tt = StyleSheet.create({
  wrap: {
    position:          'absolute',
    top:                3,
    backgroundColor:   Colors.tooltipBg,
    borderWidth:        1,
    borderColor:       Colors.tooltipBorder,
    borderRadius:       Radii.inner,      // 8
    paddingHorizontal:  Spacing[2],       // 8
    paddingVertical:    Spacing[1],       // 4
    width:              TOOLTIP_W,
    alignItems:        'center',
  },
  value: {
    color: Colors.white,
    ...TypeScale.serifNumeric.sm,
  },
});
