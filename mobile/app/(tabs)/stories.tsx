import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions,
  NativeScrollEvent, NativeSyntheticEvent,
} from 'react-native';
import Svg, { Defs, RadialGradient as SvgRadialGradient, Stop, Rect } from 'react-native-svg';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { CoinIcon } from '@/components/CoinIcon';
import { SparklineChart } from '@/components/SparklineChart';
import { DonutChart } from '@/components/DonutChart';
import {
  ASSETS, EXCHANGES, TOTAL_PORTFOLIO, PORTFOLIO_HISTORY,
  formatUSD, formatPrice, formatAmount,
} from '@/data/mockData';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = height;

// ─── Deck structure ───────────────────────────────────────────────────────────

type DeckCard =
  | { type: 'portfolio' }
  | { type: 'allocation' }
  | { type: 'asset'; assetId: string }
  | { type: 'summary' };

const DECK: DeckCard[] = [
  { type: 'portfolio' },
  { type: 'allocation' },
  ...ASSETS.map((a) => ({ type: 'asset' as const, assetId: a.id })),
  { type: 'summary' },
];

// ─── Card 1: Portfolio ────────────────────────────────────────────────────────

function PortfolioCard({ topPad, botPad }: { topPad: number; botPad: number }) {
  const isGain = TOTAL_PORTFOLIO.change24hPercent >= 0;
  const chartData = PORTFOLIO_HISTORY.map((p) => p.value);
  const moodColor = isGain ? Colors.green : Colors.red;

  return (
    <View style={[styles.card, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Mood gradient */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            <SvgRadialGradient id="pg" cx="50%" cy="30%" r="60%">
              <Stop offset="0%" stopColor={moodColor} stopOpacity="0.09" />
              <Stop offset="100%" stopColor={moodColor} stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#pg)" />
        </Svg>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.eyebrow}>TOTAL PORTFOLIO</Text>
        <Text style={styles.portfolioValue}>{formatUSD(TOTAL_PORTFOLIO.valueUSD)}</Text>

        <View style={[styles.pill, { backgroundColor: isGain ? Colors.greenDim : Colors.redDim }]}>
          <Ionicons
            name={isGain ? 'trending-up' : 'trending-down'}
            size={14}
            color={isGain ? Colors.green : Colors.red}
          />
          <Text style={[styles.pillText, { color: isGain ? Colors.green : Colors.red }]}>
            {isGain ? '+' : ''}{TOTAL_PORTFOLIO.change24hPercent.toFixed(2)}%
            {' · '}{isGain ? '+' : ''}{formatUSD(TOTAL_PORTFOLIO.change24hUSD)} today
          </Text>
        </View>

        <View style={styles.chartWrap}>
          <SparklineChart
            data={chartData}
            height={120}
            color={Colors.accent}
            horizontalPadding={0}
            width={width - 48}
            formatValue={formatUSD}
          />
          <Text style={styles.chartPeriod}>7-DAY PERFORMANCE</Text>
        </View>

        {/* Exchange breakdown */}
        <View style={styles.excRow}>
          {EXCHANGES.map((exc) => (
            <View key={exc.id} style={styles.excChip}>
              <View style={[styles.excDot, { backgroundColor: exc.color }]} />
              <Text style={styles.excName}>{exc.name}</Text>
              <Text style={styles.excValue}>{formatUSD(exc.totalValueUSD)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.swipeHint}>
        <Ionicons name="chevron-down" size={14} color={Colors.gray} />
        <Text style={styles.swipeText}>Swipe up</Text>
      </View>
    </View>
  );
}

// ─── Card 2: Allocation ───────────────────────────────────────────────────────

function AllocationCard({ topPad, botPad }: { topPad: number; botPad: number }) {
  const total = EXCHANGES.reduce((s, e) => s + e.totalValueUSD, 0);
  const donutSegments = EXCHANGES.map((e) => ({ value: e.totalValueUSD, color: e.color }));

  return (
    <View style={[styles.card, { paddingTop: topPad, paddingBottom: botPad }]}>
      <View style={styles.cardContent}>
        <Text style={styles.eyebrow}>EXCHANGE ALLOCATION</Text>
        <Text style={styles.cardTitle}>Where your{'\n'}money sits</Text>

        <View style={styles.donutContainer}>
          <DonutChart segments={donutSegments} size={180} strokeWidth={22} />
          <View style={styles.donutCenter}>
            <Text style={styles.donutLabel}>TOTAL</Text>
            <Text style={styles.donutValue}>{formatUSD(total)}</Text>
          </View>
        </View>

        <View style={styles.excList}>
          {EXCHANGES.map((exc) => {
            const pct = (exc.totalValueUSD / total) * 100;
            const isExcGain = exc.change24hPercent >= 0;
            return (
              <View key={exc.id} style={styles.excListRow}>
                <View style={[styles.excColorBar, { backgroundColor: exc.color }]} />
                <View style={styles.excRowMid}>
                  <Text style={styles.excRowName}>{exc.name}</Text>
                  <View style={styles.excBarTrack}>
                    <View style={[styles.excBarFill, {
                      width: `${pct}%`,
                      backgroundColor: exc.color,
                    }]} />
                  </View>
                </View>
                <View style={styles.excRowRight}>
                  <Text style={styles.excRowValue}>{formatUSD(exc.totalValueUSD)}</Text>
                  <Text style={[styles.excRowChange, {
                    color: isExcGain ? Colors.green : Colors.red,
                  }]}>
                    {isExcGain ? '+' : ''}{exc.change24hPercent.toFixed(2)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Card 3–8: Asset ──────────────────────────────────────────────────────────

function AssetCard({
  assetId, topPad, botPad,
}: { assetId: string; topPad: number; botPad: number }) {
  const asset = ASSETS.find((a) => a.id === assetId)!;
  const isGain = asset.change24hPercent >= 0;

  return (
    <View style={[styles.card, { paddingTop: topPad, paddingBottom: botPad }]}>
      {/* Ambient asset color */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg width={width} height={height}>
          <Defs>
            <SvgRadialGradient id={`ac-${asset.id}`} cx="80%" cy="15%" r="50%">
              <Stop offset="0%" stopColor={asset.color} stopOpacity="0.07" />
              <Stop offset="100%" stopColor={asset.color} stopOpacity="0" />
            </SvgRadialGradient>
          </Defs>
          <Rect width={width} height={height} fill={`url(#ac-${asset.id})`} />
        </Svg>
      </View>

      <TouchableOpacity
        style={styles.cardContent}
        onPress={() => router.push(`/asset/${asset.id}`)}
        activeOpacity={0.95}
      >
        {/* Asset identity */}
        <View style={styles.assetHeader}>
          <CoinIcon symbol={asset.symbol} color={asset.color} size={44} noContainer />
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>
              {asset.symbol} · {formatAmount(asset.totalAmount, asset.symbol)}
            </Text>
            <Text style={styles.assetName}>{asset.name}</Text>
          </View>
          <View style={[styles.pill, {
            backgroundColor: isGain ? Colors.greenDim : Colors.redDim,
          }]}>
            <Text style={[styles.pillText, { color: isGain ? Colors.green : Colors.red }]}>
              {isGain ? '+' : ''}{asset.change24hPercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Value */}
        <Text style={styles.assetHoldingValue}>{formatUSD(asset.totalValueUSD)}</Text>
        <Text style={styles.assetPrice}>{formatPrice(asset.priceUSD)} per coin</Text>

        {/* 7-day chart */}
        <View style={styles.assetChartWrap}>
          <SparklineChart
            data={asset.sparkline}
            height={90}
            color={isGain ? Colors.green : Colors.red}
            horizontalPadding={0}
            width={width - 48}
            formatValue={formatPrice}
          />
        </View>

        {/* Holdings per exchange */}
        <View style={styles.holdingsList}>
          {asset.holdings.map((h) => {
            const exc = EXCHANGES.find((e) => e.id === h.exchangeId)!;
            const pct = (h.valueUSD / asset.totalValueUSD) * 100;
            return (
              <View key={h.exchangeId} style={styles.holdingRow}>
                <View style={[styles.holdingDot, { backgroundColor: exc.color }]} />
                <Text style={styles.holdingName}>{exc.name}</Text>
                <View style={styles.holdingBarTrack}>
                  <View style={[styles.holdingBarFill, {
                    width: `${pct}%`,
                    backgroundColor: exc.color,
                  }]} />
                </View>
                <Text style={styles.holdingPct}>{pct.toFixed(0)}%</Text>
                <Text style={styles.holdingValue}>{formatUSD(h.valueUSD)}</Text>
              </View>
            );
          })}
        </View>

        <Text style={styles.tapHint}>Tap for full details →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Card 9: Summary ──────────────────────────────────────────────────────────

function SummaryCard({ topPad, botPad }: { topPad: number; botPad: number }) {
  const sorted = [...ASSETS].sort((a, b) => b.change24hPercent - a.change24hPercent);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const isGain = TOTAL_PORTFOLIO.change24hPercent >= 0;

  return (
    <View style={[styles.card, { paddingTop: topPad, paddingBottom: botPad }]}>
      <View style={styles.cardContent}>
        <Text style={styles.eyebrow}>24H SUMMARY</Text>
        <Text style={styles.cardTitle}>Today's{'\n'}performance</Text>

        {/* Total P&L */}
        <View style={styles.summaryTile}>
          <Text style={styles.summaryTileLabel}>TOTAL GAIN / LOSS</Text>
          <Text style={[styles.summaryBigNum, { color: isGain ? Colors.green : Colors.red }]}>
            {isGain ? '+' : ''}{formatUSD(TOTAL_PORTFOLIO.change24hUSD)}
          </Text>
          <Text style={[styles.summarySubNum, { color: isGain ? Colors.green : Colors.red }]}>
            {isGain ? '+' : ''}{TOTAL_PORTFOLIO.change24hPercent.toFixed(2)}% on the day
          </Text>
        </View>

        {/* Best + Worst */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryHalf, { borderColor: 'rgba(74,222,128,0.18)' }]}>
            <Text style={styles.summaryTileLabel}>BEST</Text>
            <CoinIcon symbol={best.symbol} color={best.color} size={30} noContainer />
            <Text style={styles.summaryAssetName}>{best.name}</Text>
            <Text style={[styles.summaryChange, { color: Colors.green }]}>
              +{best.change24hPercent.toFixed(2)}%
            </Text>
          </View>
          <View style={[styles.summaryHalf, { borderColor: 'rgba(248,113,113,0.18)' }]}>
            <Text style={styles.summaryTileLabel}>WORST</Text>
            <CoinIcon symbol={worst.symbol} color={worst.color} size={30} noContainer />
            <Text style={styles.summaryAssetName}>{worst.name}</Text>
            <Text style={[styles.summaryChange, { color: Colors.red }]}>
              {worst.change24hPercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Portfolio composition bar */}
        <View style={styles.summaryTile}>
          <Text style={styles.summaryTileLabel}>PORTFOLIO COMPOSITION</Text>
          <View style={styles.compBar}>
            {ASSETS.map((a, i) => {
              const pct = (a.totalValueUSD / TOTAL_PORTFOLIO.valueUSD) * 100;
              return (
                <View
                  key={a.id}
                  style={[
                    styles.compBarSeg,
                    { flex: pct, backgroundColor: a.color },
                    i === 0 && { borderTopLeftRadius: 4, borderBottomLeftRadius: 4 },
                    i === ASSETS.length - 1 && { borderTopRightRadius: 4, borderBottomRightRadius: 4 },
                  ]}
                />
              );
            })}
          </View>
          <View style={styles.compLegend}>
            {ASSETS.map((a) => (
              <View key={a.id} style={styles.compLegendItem}>
                <View style={[styles.compLegendDot, { backgroundColor: a.color }]} />
                <Text style={styles.compLegendName}>{a.symbol}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StoriesScreen() {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const topPad = insets.top + 24;
  const botPad = insets.bottom + 100;

  function renderItem({ item }: { item: DeckCard }) {
    switch (item.type) {
      case 'portfolio':  return <PortfolioCard topPad={topPad} botPad={botPad} />;
      case 'allocation': return <AllocationCard topPad={topPad} botPad={botPad} />;
      case 'asset':      return <AssetCard assetId={item.assetId} topPad={topPad} botPad={botPad} />;
      case 'summary':    return <SummaryCard topPad={topPad} botPad={botPad} />;
    }
  }

  function onMomentumScrollEnd(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(e.nativeEvent.contentOffset.y / CARD_HEIGHT);
    setActiveIndex(index);
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={DECK}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: CARD_HEIGHT,
          offset: CARD_HEIGHT * index,
          index,
        })}
      />

      {/* Page indicator dots (right side) */}
      <View style={[styles.dots, { bottom: botPad }]}>
        {DECK.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  card: {
    width,
    height: CARD_HEIGHT,
    backgroundColor: Colors.bg,
  },

  cardContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 16,
  },

  // ── Shared typography ──────────────────────────────────────────────────────
  eyebrow: {
    color: Colors.gray,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
  },
  cardTitle: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 40,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
  },
  pillText: { fontSize: 13 },

  // ── Portfolio card ─────────────────────────────────────────────────────────
  portfolioValue: {
    color: Colors.white,
    fontSize: 52,
    fontFamily: 'Oswald_300Light',
    letterSpacing: -2,
  },
  chartWrap: { gap: 8 },
  chartPeriod: {
    color: Colors.gray,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
  },
  excRow: { flexDirection: 'row', gap: 0 },
  excChip: { flex: 1, gap: 4 },
  excDot: { width: 8, height: 8, borderRadius: 4 },
  excName: { color: Colors.gray, fontSize: 11 },
  excValue: { color: Colors.white, fontSize: 13, fontFamily: 'Oswald_300Light' },
  swipeHint: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 112,
  },
  swipeText: { color: Colors.gray, fontSize: 11, letterSpacing: 0.5 },

  // ── Allocation card ────────────────────────────────────────────────────────
  donutContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    gap: 2,
  },
  donutLabel: { color: Colors.gray, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  donutValue: { color: Colors.white, fontSize: 18, fontFamily: 'Oswald_300Light' },

  excList: { gap: 12 },
  excListRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  excColorBar: { width: 3, height: 34, borderRadius: 2, flexShrink: 0 },
  excRowMid: { flex: 1, gap: 5 },
  excRowName: { color: Colors.white, fontSize: 14, fontWeight: '600' },
  excBarTrack: { height: 3, backgroundColor: Colors.cardBorder, borderRadius: 2 },
  excBarFill: { height: 3, borderRadius: 2 },
  excRowRight: { alignItems: 'flex-end', gap: 2 },
  excRowValue: { color: Colors.white, fontSize: 14, fontFamily: 'Oswald_300Light' },
  excRowChange: { fontSize: 11 },

  // ── Asset card ─────────────────────────────────────────────────────────────
  assetHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetName: { color: Colors.white, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  assetHoldingValue: {
    color: Colors.white,
    fontSize: 44,
    fontFamily: 'Oswald_300Light',
    letterSpacing: -1.5,
  },
  assetPrice: { color: Colors.gray, fontSize: 14 },
  assetChartWrap: {},
  holdingsList: { gap: 10 },
  holdingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  holdingDot: { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  holdingName: { color: Colors.gray, fontSize: 12, width: 68 },
  holdingBarTrack: { flex: 1, height: 3, backgroundColor: Colors.cardBorder, borderRadius: 2 },
  holdingBarFill: { height: 3, borderRadius: 2 },
  holdingPct: { color: Colors.white, fontSize: 11, fontWeight: '700', width: 30, textAlign: 'right' },
  holdingValue: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: 'Oswald_300Light',
    width: 70,
    textAlign: 'right',
  },
  tapHint: { color: Colors.gray, fontSize: 11, textAlign: 'right' },

  // ── Summary card ───────────────────────────────────────────────────────────
  summaryTile: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    gap: 6,
  },
  summaryTileLabel: { color: Colors.gray, fontSize: 9, fontWeight: '800', letterSpacing: 2 },
  summaryBigNum: { fontSize: 30, fontFamily: 'Oswald_300Light', letterSpacing: -1 },
  summarySubNum: { fontSize: 13 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryHalf: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 14,
    gap: 6,
  },
  summaryAssetName: { color: Colors.white, fontSize: 13, fontWeight: '700' },
  summaryChange: { fontSize: 18, fontFamily: 'Oswald_300Light' },
  compBar: { flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 },
  compBarSeg: { height: '100%' },
  compLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4 },
  compLegendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  compLegendDot: { width: 7, height: 7, borderRadius: 3.5 },
  compLegendName: { color: Colors.gray, fontSize: 11 },

  // ── Dots indicator ─────────────────────────────────────────────────────────
  dots: {
    position: 'absolute',
    right: 14,
    gap: 5,
    alignItems: 'center',
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.muted },
  dotActive: { height: 14, backgroundColor: Colors.white },
});
