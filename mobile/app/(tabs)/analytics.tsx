import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing, BottomFade } from '@/constants/Spacing';
import { FontFamily, TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { InsightsList } from '@/components/InsightsList';
import { SparklineChart } from '@/components/SparklineChart';
import { BENCHMARKS, RISK_METRICS, ASSETS, EXCHANGES, TOTAL_PORTFOLIO } from '@/data/mockData';

// ─── Constants ────────────────────────────────────────────────────────────────

const DONUT_SIZE    = 120;
const DONUT_STROKE  = 10;
const GAUGE_SIZE    = 88;
const GAUGE_STROKE  = 10;

// ─── Animated gauge arc (uses JS driver — SVG strokeDashoffset) ────────────────

interface GaugeArcProps {
  score: number;        // 0–100
  color: string;
  size: number;
  strokeWidth: number;
  progress: Animated.Value;
}

function GaugeArc({ score, color, size, strokeWidth, progress }: GaugeArcProps) {
  const r             = (size - strokeWidth) / 2;
  const cx            = size / 2;
  const cy            = size / 2;
  const circumference = Math.PI * r;  // half-circle arc

  const dashOffset = progress.interpolate({
    inputRange:  [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <Svg width={size} height={size / 2 + strokeWidth / 2}>
      {/* Track */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={Colors.muted}
        strokeWidth={strokeWidth}
        strokeDasharray={[circumference, circumference]}
        rotation={-180}
        originX={cx}
        originY={cy}
        strokeLinecap="round"
      />
      {/* Fill */}
      <AnimatedCircle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        rotation={-180}
        originX={cx}
        originY={cy}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Animated allocation donut ─────────────────────────────────────────────────

interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

interface AnimatedDonutProps {
  segments: DonutSegment[];
  size: number;
  strokeWidth: number;
  progress: Animated.Value;
}

function AnimatedDonut({ segments, size, strokeWidth, progress }: AnimatedDonutProps) {
  const r             = (size - strokeWidth) / 2;
  const cx            = size / 2;
  const cy            = size / 2;
  const circumference = 2 * Math.PI * r;
  const total         = segments.reduce((s, seg) => s + seg.value, 0);

  let cumulativePct = 0;
  const AnimatedCircle = Animated.createAnimatedComponent(Circle);

  return (
    <Svg width={size} height={size}>
      {/* Track */}
      <Circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={Colors.muted}
        strokeWidth={strokeWidth}
      />
      {segments.map((seg, i) => {
        const pct        = seg.value / total;
        const dashLength = progress.interpolate({
          inputRange:  [0, 1],
          outputRange: [0, Math.max(0, pct * circumference - strokeWidth * 1.2)],
          extrapolate: 'clamp',
        });
        const dashGap = progress.interpolate({
          inputRange:  [0, 1],
          outputRange: [circumference, circumference - (pct * circumference - strokeWidth * 1.2)],
          extrapolate: 'clamp',
        });
        const rotation = -90 + cumulativePct * 360;
        cumulativePct += pct;

        return (
          <AnimatedCircle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={[dashLength as any, dashGap as any]}
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

// ─── Benchmark sparkline row ───────────────────────────────────────────────────

interface BenchRowProps {
  label:     string;
  change:    number;
  color:     string;
  data:      number[];
  isPortfolio: boolean;
  barAnim:   Animated.Value;
  maxReturn: number;
  chartW:    number;
}

function BenchRow({ label, change, color, data, isPortfolio, barAnim, maxReturn, chartW }: BenchRowProps) {
  const isPos = change >= 0;

  return (
    <View style={br.row}>
      {/* Label */}
      <View style={br.labelCol}>
        <View style={[br.dot, { backgroundColor: color }]} />
        <Text style={[br.label, isPortfolio && br.labelBold]} numberOfLines={1}>
          {label}
        </Text>
      </View>

      {/* Mini sparkline */}
      <View style={br.sparkCol}>
        <SparklineChart
          data={data}
          height={28}
          color={color}
          width={chartW}
          animateIn={false}
          noEdgeFade
        />
      </View>

      {/* Return value */}
      <Text style={[br.returnVal, { color: isPos ? Colors.green : Colors.red }]}>
        {isPos ? '+' : ''}{change.toFixed(2)}%
      </Text>
    </View>
  );
}

const br = StyleSheet.create({
  row: {
    flexDirection:  'row',
    alignItems:     'center',
    minHeight:      Spacing.touchTarget,
    gap:            Spacing[3],
  },
  labelCol: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[2],
    width:         100,
  },
  dot: {
    width:        6,
    height:       6,
    borderRadius: Radii.pill,
    flexShrink:   0,
  },
  label: {
    color:      Colors.gray,
    ...TypeScale.body.md,
    flex:       1,
  },
  labelBold: {
    color:      Colors.white,
    ...TypeScale.body.mdMedium,
  },
  sparkCol: {
    flex: 1,
  },
  returnVal: {
    ...TypeScale.numeric.xs,
    fontFamily: FontFamily.mono,
    width:      52,
    textAlign:  'right',
  },
});

// ─── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, meta }: { label: string; meta?: string }) {
  return (
    <View style={sh.row}>
      <Text style={sh.label}>{label}</Text>
      <View style={sh.rule} />
      {meta && <Text style={sh.meta}>{meta}</Text>}
    </View>
  );
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[3],
    marginBottom:  Spacing[2],
  },
  label: {
    color:      Colors.gray,
    ...TypeScale.label.md,
    flexShrink: 0,
  },
  rule: {
    flex:              1,
    height:            1,
    backgroundColor:   Colors.cardBorder,
  },
  meta: {
    color:      Colors.gray,
    ...TypeScale.body.md,
    flexShrink: 0,
  },
});

// ─── Main screen ───────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const CARD_W      = width - Spacing.screenH * 2;
  const BENCH_W     = CARD_W - Spacing.cardPad * 2 - 100 - Spacing[3] * 2 - 52;
  const HALF_W      = Math.floor((CARD_W - Spacing[2]) / 2);  // two-column tile width

  // ── Animation values ──────────────────────────────────────────────────────
  const gaugeAnim  = useRef(new Animated.Value(0)).current;
  const donutAnim  = useRef(new Animated.Value(0)).current;
  const barAnims   = useRef(BENCHMARKS.map(() => new Animated.Value(0))).current;

  // Section entrance animations
  const sectionAnims = useRef(
    [0, 1, 2, 3].map(() => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Stagger section entrances
    Animated.stagger(
      80,
      sectionAnims.map(({ opacity, translateY }) =>
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 1, duration: 300, useNativeDriver: true, easing: ease }),
          Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true, easing: ease }),
        ])
      )
    ).start();

    // Gauge arc — delayed slightly so the section is visible first
    Animated.timing(gaugeAnim, {
      toValue:         RISK_METRICS.volatilityScore,
      duration:        800,
      delay:           250,
      useNativeDriver: false,
      easing:          Easing.out(Easing.cubic),
    }).start();

    // Donut
    Animated.timing(donutAnim, {
      toValue:         1,
      duration:        700,
      delay:           300,
      useNativeDriver: false,
      easing:          Easing.out(Easing.cubic),
    }).start();

  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  // Asset allocation donut segments — sorted by value desc
  const donutSegments = [...ASSETS]
    .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
    .map((a) => ({
      value: a.totalValueUSD,
      color: a.color,
      label: a.symbol,
    }));

  // Exchange allocation for reference row
  const exchTotal = EXCHANGES.reduce((s, e) => s + e.totalValueUSD, 0);

  const isGain = TOTAL_PORTFOLIO.change24hPercent >= 0;
  const MAX_RETURN = Math.max(...BENCHMARKS.map((b) => Math.abs(b.change7dPercent)));

  // Volatility gauge color
  const gaugeColor =
    RISK_METRICS.volatilityScore >= 70 ? Colors.red :
    RISK_METRICS.volatilityScore >= 40 ? Colors.excBinance :
    Colors.green;

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + 88 },
        ]}
      >

        {/* ── Page title ── */}
        <View style={s.titleRow}>
          <Text style={s.title}>Analytics</Text>
          <Badge variant="status" label="7D" />
        </View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 1 — PERFORMANCE: benchmark chart + 7d lines
        ══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[0].opacity,
              transform: [{ translateY: sectionAnims[0].translateY }],
            },
          ]}
        >
          <SectionHeader label="PERFORMANCE" meta="7 days" />

          <View style={s.card}>
            {/* Portfolio benchmark highlight row */}
            {BENCHMARKS.map((bench, i) => {
              const isPortfolio = bench.id === 'portfolio';
              const color       = isPortfolio ? Colors.accent : bench.color;
              const isLast      = i === BENCHMARKS.length - 1;

              return (
                <View key={bench.id}>
                  <BenchRow
                    label={bench.label}
                    change={bench.change7dPercent}
                    color={color}
                    data={bench.returns7d}
                    isPortfolio={isPortfolio}
                    barAnim={barAnims[i]}
                    maxReturn={MAX_RETURN}
                    chartW={BENCH_W}
                  />
                  {!isLast && <View style={s.divider} />}
                </View>
              );
            })}

            {/* Performance edge highlight — lime tint under portfolio row */}
            <View style={s.benchAccentBar} pointerEvents="none" />
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2 — ALLOCATION: donut + top-5 legend
        ══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[1].opacity,
              transform: [{ translateY: sectionAnims[1].translateY }],
            },
          ]}
        >
          <SectionHeader label="ALLOCATION" meta={`${ASSETS.length} assets`} />

          <View style={s.card}>
            <View style={s.allocRow}>
              {/* Left: donut with center label */}
              <View style={s.donutWrap}>
                <AnimatedDonut
                  segments={donutSegments}
                  size={DONUT_SIZE}
                  strokeWidth={DONUT_STROKE}
                  progress={donutAnim}
                />
                {/* Center overlay */}
                <View style={s.donutCenter}>
                  <Text style={s.donutCenterValue}>
                    {donutSegments[0].label}
                  </Text>
                  <Text style={s.donutCenterSub}>
                    {((donutSegments[0].value / TOTAL_PORTFOLIO.valueUSD) * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>

              {/* Right: legend */}
              <View style={s.donutLegend}>
                {donutSegments.map((seg) => {
                  const pct = (seg.value / TOTAL_PORTFOLIO.valueUSD) * 100;
                  return (
                    <View key={seg.label} style={s.legendRow}>
                      <View style={[s.legendDot, { backgroundColor: seg.color }]} />
                      <Text style={s.legendLabel}>{seg.label}</Text>
                      <View style={s.legendBarTrack}>
                        <View
                          style={[
                            s.legendBarFill,
                            { backgroundColor: seg.color, width: `${pct}%` as any },
                          ]}
                        />
                      </View>
                      <Text style={s.legendPct}>{pct.toFixed(0)}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Exchange allocation strip */}
            <View style={s.divider} />
            <View style={s.excAllocRow}>
              <Text style={s.excAllocLabel}>BY EXCHANGE</Text>
              <View style={s.excAllocBar}>
                {EXCHANGES.map((exc, i) => {
                  const pct = (exc.totalValueUSD / exchTotal) * 100;
                  return (
                    <View
                      key={exc.id}
                      style={[
                        s.excAllocSegment,
                        {
                          flex:            pct,
                          backgroundColor: exc.color,
                        },
                        i > 0 && { marginLeft: 2 },
                      ]}
                    />
                  );
                })}
              </View>
              <View style={s.excAllocLegend}>
                {EXCHANGES.map((exc) => {
                  const pct = (exc.totalValueUSD / exchTotal) * 100;
                  return (
                    <View key={exc.id} style={s.excAllocItem}>
                      <View style={[s.excAllocDot, { backgroundColor: exc.color }]} />
                      <Text style={s.excAllocName}>{exc.name}</Text>
                      <Text style={s.excAllocPct}>{pct.toFixed(0)}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3 — RISK: gauge + four stat tiles
        ══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[2].opacity,
              transform: [{ translateY: sectionAnims[2].translateY }],
            },
          ]}
        >
          <SectionHeader label="RISK" />

          {/* Top row: gauge tile + Sharpe tile */}
          <View style={s.riskTopRow}>
            {/* Volatility gauge tile */}
            <View style={[s.riskTile, s.riskTileLg]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.barChart} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>VOLATILITY</Text>
              </View>
              <View style={s.gaugeWrap}>
                <GaugeArc
                  score={RISK_METRICS.volatilityScore}
                  color={gaugeColor}
                  size={GAUGE_SIZE}
                  strokeWidth={GAUGE_STROKE}
                  progress={gaugeAnim}
                />
                {/* Score badge centred on arc */}
                <View style={s.gaugeScore}>
                  <Text style={[s.gaugeScoreVal, { color: gaugeColor }]}>
                    {RISK_METRICS.volatilityScore}
                  </Text>
                  <Text style={s.gaugeScoreMax}>/100</Text>
                </View>
              </View>
              <View style={s.riskTileBadge}>
                <Badge
                  variant="status"
                  label={RISK_METRICS.volatilityLabel}
                  color={Colors.red}
                  bgColor={Colors.redDim}
                />
              </View>
            </View>

            {/* Sharpe ratio tile */}
            <View style={[s.riskTile, s.riskTileSm]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.trendUp} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>SHARPE</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.sharpeRatio.toFixed(2)}</Text>
              <Text style={s.riskTileUnit}>ratio</Text>
              <View style={s.riskTileBadge}>
                <Badge
                  variant="status"
                  label="Favorable"
                  color={Colors.green}
                  bgColor={Colors.greenDim}
                />
              </View>
            </View>
          </View>

          {/* Bottom row: two equal tiles */}
          <View style={s.riskBottomRow}>
            {/* Top holding concentration tile */}
            <View style={[s.riskTile, { width: HALF_W }]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.layers} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>TOP ASSET</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.topHoldingPercent.toFixed(0)}%</Text>
              <Text style={s.riskTileUnit}>of portfolio</Text>
              <Text style={s.riskTileFooter}>{RISK_METRICS.topHoldingName}</Text>
            </View>

            {/* Exchange risk tile */}
            <View style={[s.riskTile, { width: HALF_W }]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.shield} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>EXCHANGES</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.exchangeCount}</Text>
              <Text style={s.riskTileUnit}>connected</Text>
              <View style={s.riskTileBadge}>
                <Badge
                  variant="status"
                  label={RISK_METRICS.exchangeRiskLabel}
                  color={Colors.green}
                  bgColor={Colors.greenDim}
                />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════
            SECTION 4 — INSIGHTS
        ══════════════════════════════════════════════════════════ */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[3].opacity,
              transform: [{ translateY: sectionAnims[3].translateY }],
            },
          ]}
        >
          <SectionHeader label="INSIGHTS" meta={`${5} signals`} />
          <InsightsList animated={true} />
        </Animated.View>

      </ScrollView>

      {/* Bottom fade */}
      <LinearGradient
        colors={BottomFade.colors as any}
        style={s.bottomFade}
        pointerEvents="none"
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex:            1,
    backgroundColor: Colors.bg,
  },

  scroll: {
    paddingHorizontal: Spacing.screenH,
  },

  // ── Title row ────────────────────────────────────────────────────────────────
  titleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   Spacing[5],
  },
  title: {
    color: Colors.white,
    ...TypeScale.title.lg,
  },

  // ── Section spacing ──────────────────────────────────────────────────────────
  section: {
    marginBottom: Spacing[5],
  },

  // ── Generic card container ───────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    paddingHorizontal: Spacing.cardPad,
    overflow:        'hidden',
  },

  divider: {
    height:           1,
    backgroundColor:  Colors.cardBorder,
    marginHorizontal: -Spacing.cardPad,
  },

  // ── Performance section: subtle lime accent on first row ─────────────────────
  benchAccentBar: {
    position:        'absolute',
    top:             0,
    left:            0,
    right:           0,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.accentGlow,
    borderTopLeftRadius:  Radii.card,
    borderTopRightRadius: Radii.card,
  },

  // ── Allocation section ───────────────────────────────────────────────────────
  allocRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[4],
    paddingVertical: Spacing.cardPad,
  },

  donutWrap: {
    width:          DONUT_SIZE,
    height:         DONUT_SIZE,
    alignItems:     'center',
    justifyContent: 'center',
    flexShrink:     0,
  },

  donutCenter: {
    position:       'absolute',
    alignItems:     'center',
    justifyContent: 'center',
  },

  donutCenterValue: {
    color:      Colors.white,
    ...TypeScale.label.md,
    textAlign:  'center',
  },

  donutCenterSub: {
    color:      Colors.gray,
    ...TypeScale.body.md,
    textAlign:  'center',
  },

  donutLegend: {
    flex: 1,
    gap:  Spacing[2],
  },

  legendRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[2],
  },

  legendDot: {
    width:        6,
    height:       6,
    borderRadius: Radii.pill,
    flexShrink:   0,
  },

  legendLabel: {
    color:      Colors.gray,
    ...TypeScale.body.md,
    width:      36,
    flexShrink: 0,
  },

  legendBarTrack: {
    flex:            1,
    height:          4,
    borderRadius:    Radii.micro,
    backgroundColor: Colors.muted,
    overflow:        'hidden',
  },

  legendBarFill: {
    height:       4,
    borderRadius: Radii.micro,
  },

  legendPct: {
    color:      Colors.white,
    ...TypeScale.numeric.xxs,
    fontFamily: FontFamily.mono,
    width:      28,
    textAlign:  'right',
    flexShrink: 0,
  },

  // Exchange allocation strip
  excAllocRow: {
    gap:            Spacing[2],
    paddingVertical: Spacing[3],
  },

  excAllocLabel: {
    color: Colors.gray,
    ...TypeScale.label.sm,
  },

  excAllocBar: {
    flexDirection:   'row',
    height:          4,
    borderRadius:    Radii.micro,
    overflow:        'hidden',
    backgroundColor: Colors.muted,
  },

  excAllocSegment: {
    height: 4,
  },

  excAllocLegend: {
    flexDirection: 'row',
    gap:            Spacing[4],
  },

  excAllocItem: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[1],
  },

  excAllocDot: {
    width:        6,
    height:       6,
    borderRadius: Radii.pill,
  },

  excAllocName: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  excAllocPct: {
    color:      Colors.white,
    ...TypeScale.serifNumeric.sm,
  },

  // ── Risk section ─────────────────────────────────────────────────────────────
  riskTopRow: {
    flexDirection: 'row',
    gap:            Spacing[2],
    marginBottom:  Spacing[2],
  },

  riskBottomRow: {
    flexDirection: 'row',
    gap:            Spacing[2],
  },

  riskTile: {
    backgroundColor: Colors.cardElevated,
    borderRadius:    Radii.cardSM,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    padding:         Spacing.cardPad,
    gap:             Spacing[1],
  },

  riskTileLg: {
    flex: 1,
  },

  riskTileSm: {
    flex: 1,
  },

  riskTileHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[1],
    marginBottom:  Spacing[1],
  },

  riskTileLabel: {
    color:      Colors.gray,
    ...TypeScale.label.sm,
  },

  riskTileValue: {
    color:      Colors.white,
    ...TypeScale.numeric.lg,
    fontFamily: FontFamily.mono,
  },

  riskTileUnit: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  riskTileBadge: {
    marginTop:  Spacing[2],
    alignItems: 'flex-start',
  },

  riskTileFooter: {
    marginTop:  Spacing[2],
    color:      Colors.gray,
    ...TypeScale.body.mdMedium,
  },

  // Gauge
  gaugeWrap: {
    alignItems:     'center',
    justifyContent: 'flex-end',
    position:       'relative',
    marginVertical: Spacing[1],
  },

  gaugeScore: {
    position:       'absolute',
    bottom:         0,
    flexDirection:  'row',
    alignItems:     'baseline',
    gap:             2,
  },

  gaugeScoreVal: {
    ...TypeScale.numeric.md,
    fontFamily: FontFamily.mono,
  },

  gaugeScoreMax: {
    color:      Colors.gray,
    ...TypeScale.body.md,
  },

  // ── Bottom fade ───────────────────────────────────────────────────────────────
  bottomFade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   BottomFade.height,
  },
});
