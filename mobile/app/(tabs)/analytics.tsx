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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing, BottomFade } from '@/constants/Spacing';
import { FontFamily, TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { Card, CardDivider } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { InsightsList } from '@/components/InsightsList';
import { BENCHMARKS, RISK_METRICS } from '@/data/mockData';


export default function AnalyticsScreen() {
  const insets    = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  // Two-column grid: screen minus horizontal padding (×2) minus gap between tiles
  const GRID_GAP   = Spacing[2]; // 8
  const TILE_WIDTH = Math.floor(
    (width - Spacing.screenH * 2 - GRID_GAP) / 2
  );

  // Max absolute return — used to size bars proportionally
  const MAX_RETURN = Math.max(...BENCHMARKS.map((b) => Math.abs(b.change7dPercent)));

  // ── Bar width animations (useNativeDriver: false — width animations) ───────
  const barAnims = useRef(
    BENCHMARKS.map(() => new Animated.Value(0))
  ).current;

  // ── Section entrance animations (useNativeDriver: true — opacity/translateY) ─
  const sectionAnims = useRef(
    [0, 1, 2].map(() => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(20),
    }))
  ).current;


  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Section stagger: 80ms between sections
    Animated.stagger(
      80,
      sectionAnims.map(({ opacity, translateY }) =>
        Animated.parallel([
          Animated.timing(opacity,    { toValue: 1, duration: 320, useNativeDriver: true, easing: ease }),
          Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true, easing: ease }),
        ])
      )
    ).start();

    // Bar width stagger: 60ms between bars, delayed slightly after section appears
    Animated.stagger(
      60,
      barAnims.map((anim, i) =>
        Animated.timing(anim, {
          toValue:  Math.abs(BENCHMARKS[i].change7dPercent) / MAX_RETURN * 100,
          duration: 500,
          useNativeDriver: false,
          easing:   ease,
          delay:    120,
        })
      )
    ).start();

  }, []);

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + Spacing[4], paddingBottom: insets.bottom + 88 },
        ]}
      >
        {/* Screen title */}
        <Text style={s.screenTitle}>Analytics</Text>

        {/* ── Section 1: Benchmark Comparison ── */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[0].opacity,
              transform: [{ translateY: sectionAnims[0].translateY }],
            },
          ]}
        >
          <Text style={s.sectionLabel}>BENCHMARKS</Text>
          <Card variant="default">
            {BENCHMARKS.map((bench, i) => {
              const isPos       = bench.change7dPercent >= 0;
              const isPortfolio = bench.id === 'portfolio';
              const isLast      = i === BENCHMARKS.length - 1;

              return (
                <View key={bench.id}>
                  <View style={s.benchRow}>
                    {/* Color dot */}
                    <View
                      style={[
                        s.benchDot,
                        { backgroundColor: isPortfolio ? Colors.accent : bench.color },
                      ]}
                    />

                    {/* Label */}
                    <Text style={[s.benchLabel, isPortfolio && s.benchLabelPortfolio]}>
                      {bench.label}
                    </Text>

                    {/* Bar track + animated fill */}
                    <View style={s.benchBarTrack}>
                      <Animated.View
                        style={[
                          s.benchBarFill,
                          {
                            backgroundColor: isPortfolio ? Colors.accent : bench.color,
                            width: barAnims[i].interpolate({
                              inputRange:  [0, 100],
                              outputRange: ['0%', '100%'],
                            }),
                          },
                        ]}
                      />
                    </View>

                    {/* Return % */}
                    <Text style={[s.benchReturn, { color: isPos ? Colors.green : Colors.red }]}>
                      {isPos ? '+' : ''}{bench.change7dPercent.toFixed(2)}%
                    </Text>
                  </View>
                  {!isLast && <CardDivider />}
                </View>
              );
            })}
          </Card>
        </Animated.View>

        {/* ── Section 2: Risk Metrics — 2×2 square stat grid ── */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[1].opacity,
              transform: [{ translateY: sectionAnims[1].translateY }],
            },
          ]}
        >
          <Text style={s.sectionLabel}>RISK METRICS</Text>

          <View style={s.riskGrid}>
            {/* Tile 1: Volatility */}
            <View style={[s.riskTile, { width: TILE_WIDTH }]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.barChart} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>VOLATILITY</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.volatilityScore}</Text>
              <Text style={s.riskTileUnit}>out of 100</Text>
              <View style={s.riskTileBadgeRow}>
                <Badge
                  variant="status"
                  label={RISK_METRICS.volatilityLabel}
                  color={Colors.red}
                  bgColor={Colors.redDim}
                />
              </View>
            </View>

            {/* Tile 2: Sharpe Ratio */}
            <View style={[s.riskTile, { width: TILE_WIDTH }]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.trendUp} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>SHARPE</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.sharpeRatio.toFixed(2)}</Text>
              <Text style={s.riskTileUnit}>ratio</Text>
              <View style={s.riskTileBadgeRow}>
                <Badge
                  variant="status"
                  label="Favorable"
                  color={Colors.green}
                  bgColor={Colors.greenDim}
                />
              </View>
            </View>

            {/* Tile 3: Concentration */}
            <View style={[s.riskTile, { width: TILE_WIDTH }]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.layers} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>TOP ASSET</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.topHoldingPercent.toFixed(0)}%</Text>
              <Text style={s.riskTileUnit}>of portfolio</Text>
              <View style={s.riskTileBadgeRow}>
                <Text style={s.riskTileSubtext}>{RISK_METRICS.topHoldingName}</Text>
              </View>
            </View>

            {/* Tile 4: Exchange Risk */}
            <View style={[s.riskTile, { width: TILE_WIDTH }]}>
              <View style={s.riskTileHeader}>
                <Icon icon={Icons.shield} size={16} color={Colors.gray} />
                <Text style={s.riskTileLabel}>EXCHANGES</Text>
              </View>
              <Text style={s.riskTileValue}>{RISK_METRICS.exchangeCount}</Text>
              <Text style={s.riskTileUnit}>connected</Text>
              <View style={s.riskTileBadgeRow}>
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

        {/* ── Section 3: Insights ── */}
        <Animated.View
          style={[
            s.section,
            {
              opacity:   sectionAnims[2].opacity,
              transform: [{ translateY: sectionAnims[2].translateY }],
            },
          ]}
        >
          <Text style={s.sectionLabel}>INSIGHTS</Text>
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
  screen: { flex: 1, backgroundColor: Colors.bg },

  scroll: {
    paddingHorizontal: Spacing.screenH,
  },

  screenTitle: {
    color:        Colors.white,
    ...TypeScale.title.lg,
    marginBottom: Spacing[5],
  },

  section: {
    marginBottom: Spacing[5],
  },

  sectionLabel: {
    color:        Colors.gray,
    ...TypeScale.label.md,
    marginBottom: Spacing[2],
  },

  // ── Benchmark rows ────────────────────────────────────────────────────────
  benchRow: {
    flexDirection: 'row',
    alignItems:    'center',
    minHeight:     Spacing.touchTarget,
    gap:           Spacing[2],
  },

  benchDot: {
    width:        8,
    height:       8,
    borderRadius: Radii.pill,
  },

  benchLabel: {
    flex:  1,
    color: Colors.gray,
    ...TypeScale.body.lg,
  },

  benchLabelPortfolio: {
    color: Colors.white,
    ...TypeScale.body.lgStrong,
  },

  benchBarTrack: {
    width:           80,
    height:          4,
    backgroundColor: Colors.muted,
    borderRadius:    Radii.micro,
    overflow:        'hidden',
  },

  benchBarFill: {
    height:       4,
    borderRadius: Radii.micro,
  },

  benchReturn: {
    ...TypeScale.numeric.xs,
    fontFamily: FontFamily.mono,
    minWidth:   52,
    textAlign:  'right',
  },

  // ── Risk Metrics: 2×2 grid ────────────────────────────────────────────────
  riskGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           Spacing[2], // 8px gap — 4px grid
  },

  riskTile: {
    backgroundColor: Colors.cardElevated,
    borderRadius:    Radii.card,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    padding:         Spacing.cardPad, // 16
    justifyContent:  'flex-start',
    gap:             Spacing[1],      // 4 — deliberate vertical rhythm between all children
  },

  riskTileHeader: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing[1],        // 4
    marginBottom:  Spacing[1],        // 4 — extra separation before the value
  },

  riskTileLabel: {
    color:      Colors.gray,
    ...TypeScale.label.sm,
  },

  riskTileValue: {
    color:      Colors.white,
    ...TypeScale.numeric.lg,          // includes lineHeight: 32 — no override needed
    fontFamily: FontFamily.mono,
  },

  riskTileUnit: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  riskTileBadgeRow: {
    marginTop:  Spacing[2],           // 8 — clear visual break before the badge
    alignItems: 'flex-start',
  },

  riskTileSubtext: {
    color:      Colors.gray,
    ...TypeScale.body.mdMedium,
  },

  // ── Bottom fade ───────────────────────────────────────────────────────────
  bottomFade: {
    position: 'absolute',
    bottom:   0,
    left:     0,
    right:    0,
    height:   BottomFade.height,
  },
});
