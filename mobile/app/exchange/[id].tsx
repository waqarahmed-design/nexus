import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { FontFamily, TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { CoinIcon } from '@/components/CoinIcon';
import { ExchangeLogo } from '@/components/ExchangeLogo';
import { DotMatrixChart } from '@/components/DotMatrixChart';
import { EXCHANGES, TOTAL_PORTFOLIO, getAssetsForExchange, formatUSD, formatAmount } from '@/data/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

type TabType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
const TABS: TabType[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

export default function ExchangeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('DAILY');

  const exchange = EXCHANGES.find((e) => e.id === id);
  if (!exchange) return null;

  const assets = getAssetsForExchange(exchange.id);
  const portfolioPct = (exchange.totalValueUSD / TOTAL_PORTFOLIO.valueUSD) * 100;
  const isGain = exchange.change24hPercent >= 0;

  const chartData = activeTab === 'DAILY'
    ? exchange.valueDaily
    : activeTab === 'WEEKLY'
    ? exchange.valueWeekly
    : exchange.valueMonthly;

  const totalVal     = Math.floor(exchange.totalValueUSD);
  const totalDec     = Math.round((exchange.totalValueUSD - totalVal) * 100).toString().padStart(2, '0');
  const intFormatted = totalVal.toLocaleString('en-US');

  // ── Hero value count-up on enter ──────────────────────────────────────────
  const countAnim    = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = useState(0);

  // ── Screen-level entrance: fade + scale (0.97 → 1.0) ─────────────────────
  // With transparentModal, the previous screen stays visible underneath.
  // This makes the detail feel like it expands out of the tapped card
  // rather than appearing from nowhere.
  // Both use useNativeDriver: true — opacity + transform are composited.
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenScale   = useRef(new Animated.Value(0.97)).current;

  // ── Content entrance animations ──────────────────────────────────────────────────────
  // Everything animates in together — no sequential reveals.
  // Header, hero card, and asset rows all start on the same frame.
  // Asset rows use a 30ms stagger — tight enough to read as one sweep.
  const headerOp  = useRef(new Animated.Value(0)).current;
  const headerY   = useRef(new Animated.Value(-8)).current;
  const heroOp    = useRef(new Animated.Value(0)).current;
  const heroY     = useRef(new Animated.Value(16)).current;

  // Per-asset row stagger — 30ms apart, all animate with same 280ms duration
  const rowAnims = useRef(assets.map(() => ({
    opacity:    new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Count-up for the hero value — starts immediately, runs 700ms
    const listenerId = countAnim.addListener(({ value }) => setDisplayVal(value));

    Animated.timing(countAnim, {
      toValue:         exchange.totalValueUSD,
      duration:        700,
      useNativeDriver: false,
      easing:          Easing.out(Easing.cubic),
    }).start();

    // Screen-level fade + scale runs first (200ms), matching the Stack
    // animation duration so the content entrance begins as the screen
    // background reaches full opacity.
    Animated.parallel([
      Animated.timing(screenOpacity, {
        toValue:         1,
        duration:        200,
        useNativeDriver: true,
        easing:          ease,
      }),
      Animated.timing(screenScale, {
        toValue:         1,
        duration:        200,
        useNativeDriver: true,
        easing:          ease,
      }),

      // Content entrance — runs in parallel with the screen fade so
      // elements animate in as the background appears. The 280ms duration
      // gives a slight overlap that makes the transition feel continuous.
      Animated.parallel([
        // Header slides down
        Animated.timing(headerOp, { toValue: 1, duration: 280, useNativeDriver: true, easing: ease }),
        Animated.timing(headerY,  { toValue: 0, duration: 280, useNativeDriver: true, easing: ease }),

        // Hero card lifts up
        Animated.timing(heroOp, { toValue: 1, duration: 280, useNativeDriver: true, easing: ease }),
        Animated.timing(heroY,  { toValue: 0, duration: 280, useNativeDriver: true, easing: ease }),

        // Asset rows: 30ms stagger, same 280ms duration
        // Total time for all rows: 280ms + (n-1)*30ms — typically under 500ms
        Animated.stagger(
          30,
          rowAnims.map(({ opacity, translateY }) =>
            Animated.parallel([
              Animated.timing(opacity,    { toValue: 1, duration: 280, useNativeDriver: true, easing: ease }),
              Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true, easing: ease }),
            ])
          )
        ),
      ]),
    ]).start();

    return () => countAnim.removeListener(listenerId);
  }, []);

  const displayInt      = Math.floor(displayVal);
  const displayDec      = Math.round((displayVal - displayInt) * 100).toString().padStart(2, '0');
  const displayFormatted = displayInt.toLocaleString('en-US');

  return (
    <Animated.View
      style={[
        s.screen,
        { paddingTop: insets.top },
        {
          opacity:   screenOpacity,
          transform: [{ scale: screenScale }],
        },
      ]}
    >
      {/* Header */}
      <Animated.View
        style={[
          s.header,
          { opacity: headerOp, transform: [{ translateY: headerY }] },
        ]}
      >
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Icon icon={Icons.back} size={20} color={Colors.gray} />
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <ExchangeLogo
            exchangeId={exchange.id}
            color={Colors.gray}
            colorDim={Colors.muted}
            size={24}
            noContainer
          />
          <Text style={s.headerName}>{exchange.name}</Text>
        </View>
        <View style={{ width: Spacing.touchTarget }} />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* ── Hero card ── */}
        <Animated.View
          style={[
            s.heroCard,
            { opacity: heroOp, transform: [{ translateY: heroY }] },
          ]}
        >
          <View style={s.heroTop}>

            {/* Row 1: EXCHANGE label + time tabs */}
            <View style={s.topRow}>
              <Text style={s.heroLabel}>EXCHANGE</Text>
              <View style={s.tabs}>
                {TABS.map((tab) => (
                  <TouchableOpacity
                    key={tab}
                    style={[s.tab, activeTab === tab && s.tabActive]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.7}
                    hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                  >
                    <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                      {tab}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Row 2: Big dollar value (counts up on enter) */}
            <View style={s.valueRow}>
              <Text style={s.valueCurrency}>$</Text>
              <Text style={s.valueInt} numberOfLines={1} adjustsFontSizeToFit>
                {displayFormatted}
              </Text>
              <Text style={s.valueDec}>.{displayDec}</Text>
            </View>

            {/* Row 3: Change pill */}
            <View style={[s.changePill, { backgroundColor: isGain ? Colors.greenDim : Colors.redDim }]}>
              <Icon
                icon={isGain ? Icons.trendUp : Icons.trendDown}
                size={12}
                color={isGain ? Colors.green : Colors.red}
              />
              <Text style={[s.changeText, { color: isGain ? Colors.green : Colors.red }]}>
                {isGain ? '+' : ''}{exchange.change24hPercent.toFixed(2)}%
              </Text>
            </View>

          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Stat row */}
          <View style={s.statRow}>
            <View style={s.statBox}>
              <Text style={s.statLabel}>ASSETS</Text>
              <Text style={s.statValue}>{exchange.assetsCount}</Text>
            </View>
            <View style={s.statSeparator} />
            <View style={s.statBox}>
              <Text style={s.statLabel}>PORTFOLIO SHARE</Text>
              <Text style={s.statValue}>{portfolioPct.toFixed(1)}%</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Dot matrix chart */}
          <View style={s.chartSection}>
            <DotMatrixChart
              key={activeTab}
              data={chartData}
              width={CARD_WIDTH - 36}
              isGain={isGain}
              formatValue={formatUSD}
            />
          </View>
        </Animated.View>

        {/* ── Asset list ── */}
        <View style={s.section}>
          <View style={s.assetList}>
            {assets.map((asset, i) => {
              const holding = asset.holdings.find((h) => h.exchangeId === exchange.id);
              if (!holding) return null;
              const assetPct = (holding.valueUSD / exchange.totalValueUSD) * 100;
              const isAssetGain = asset.change24hPercent >= 0;
              const isLast = i === assets.length - 1;
              const { opacity, translateY } = rowAnims[i];

              return (
                <Animated.View
                  key={asset.id}
                  style={{ opacity, transform: [{ translateY }] }}
                >
                  <TouchableOpacity
                    style={[s.assetRow, !isLast && s.assetBorder]}
                    onPress={() => setTimeout(() => router.push(`/asset/${asset.id}`), 50)}
                    activeOpacity={0.75}
                  >
                    <CoinIcon symbol={asset.symbol} color={asset.color} size={28} noContainer />
                    <View style={s.assetMid}>
                      <Text style={s.assetName}>{asset.name}</Text>
                      <Text style={s.assetAmt}>{formatAmount(holding.amount, asset.symbol)}</Text>
                      <View style={s.assetBar}>
                        <View style={[s.assetBarFill, { width: `${assetPct}%` }]} />
                      </View>
                    </View>
                    <View style={s.assetRight}>
                      <Text style={s.assetValue}>{formatUSD(holding.valueUSD)}</Text>
                      <View style={[s.assetChangePill, { backgroundColor: isAssetGain ? Colors.greenDim : Colors.redDim }]}>
                        <Text style={[s.assetChangeText, { color: isAssetGain ? Colors.green : Colors.red }]}>
                          {isAssetGain ? '+' : ''}{asset.change24hPercent.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Info callout */}
        <Card
          variant="info"
          icon={Icons.info}
          text="Some assets may be held across multiple exchanges. Tap any asset to see its full breakdown."
          style={{ marginBottom: Spacing[4] }}
        />
      </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[3],
    paddingBottom:     Spacing[4],
  },
  backBtn: {
    width:           Spacing.touchTarget,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  headerName: {
    color: Colors.white,
    ...TypeScale.title.xs,
  },

  scroll: { paddingHorizontal: Spacing.screenH },

  // ── Hero card ─────────────────────────────────────────────────────────────
  heroCard: {
    width:           CARD_WIDTH,
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
    marginBottom:    Spacing[1],
  },
  heroTop: {
    paddingHorizontal: Spacing.cardPad,
    paddingTop:        Spacing.cardPad,
    paddingBottom:     Spacing.cardPad,
    gap:               Spacing[3],
  },
  topRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: Colors.gray,
    ...TypeScale.label.md,
  },
  tabs: { flexDirection: 'row', gap: Spacing[1] },
  tab: {
    paddingHorizontal: Spacing[2],
    paddingVertical:   Spacing[1],
    borderRadius:      Radii.pill,
    minWidth:          Spacing.touchTarget,
    alignItems:        'center',
  },
  tabActive: { backgroundColor: Colors.cardElevated },
  tabText: {
    ...TypeScale.label.sm,
    color: Colors.gray,
  },
  tabTextActive: { color: Colors.white },

  valueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing[1] },
  valueCurrency: {
    color:        Colors.white,
    ...TypeScale.numeric.sm,
    marginBottom: Spacing[1],
    opacity:      0.5,
  },
  valueInt: {
    color: Colors.white,
    ...TypeScale.numeric.xl,
  },
  valueDec: {
    color:        Colors.white,
    ...TypeScale.numeric.md,
    marginBottom: Spacing[1],
    opacity:      0.4,
  },

  changePill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[1],
    alignSelf:        'flex-start',
    paddingHorizontal: Spacing[2],
    paddingVertical:   Spacing[1],
    borderRadius:      Radii.pill,
  },
  changeText: {
    ...TypeScale.body.md,
    fontWeight: '700',
  },

  statRow:      { flexDirection: 'row' },
  statBox: {
    flex:            1,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: Spacing[2],
    gap:             Spacing[1],
  },
  statSeparator: { width: 1, alignSelf: 'stretch', backgroundColor: Colors.cardBorder },
  statLabel: {
    color:         Colors.gray,
    ...TypeScale.label.sm,
    letterSpacing: 1.5,
  },
  statValue: {
    color:         Colors.white,
    ...TypeScale.label.sm,
    fontFamily:    FontFamily.mono,
    letterSpacing: 0.5,
  },

  divider:      { height: 1, backgroundColor: Colors.cardBorder },
  chartSection: {
    paddingHorizontal: Spacing.cardPad,
    paddingTop:        Spacing.cardPad,
    paddingBottom:     Spacing.cardPad,
  },

  // ── Asset list ─────────────────────────────────────────────────────────────
  section:   { marginBottom: Spacing[4] },
  assetList: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:        Spacing.cardPad,
    gap:            Spacing[3],
  },
  assetBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  assetMid:    { flex: 1, gap: Spacing[1] },
  assetName: {
    color: Colors.white,
    ...TypeScale.body.lgStrong,
  },
  assetAmt: {
    color:        Colors.gray,
    ...TypeScale.body.md,
    marginBottom: Spacing[1],
  },
  assetBar: {
    height:          3,
    backgroundColor: Colors.cardBorder,
    borderRadius:    2,
    overflow:        'hidden',
  },
  assetBarFill:  { height: 3, borderRadius: 2, backgroundColor: Colors.gray },
  assetRight:    { alignItems: 'flex-end', gap: Spacing[1] },
  assetValue: {
    color: Colors.white,
    ...TypeScale.numeric.sm,
  },
  assetChangePill: {
    alignSelf:         'flex-start',
    paddingHorizontal: Spacing[2],
    paddingVertical:   Spacing[1],
    borderRadius:      Radii.pill,
  },
  assetChangeText: {
    ...TypeScale.body.md,
    fontWeight: '700',
  },
});
