import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { FontFamily, TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { CoinIcon } from '@/components/CoinIcon';
import { ExchangeLogo } from '@/components/ExchangeLogo';
import { DotMatrixChart } from '@/components/DotMatrixChart';
import { TopoBackground } from '@/components/TopoBackground';
import { ASSETS, EXCHANGES, formatUSD, formatAmount, formatPrice } from '@/data/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 40;

type TabType = 'DAILY' | 'WEEKLY' | 'MONTHLY';
const TABS: TabType[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('DAILY');

  const asset = ASSETS.find((a) => a.id === id);
  if (!asset) return null;

  const isGain = asset.change24hPercent >= 0;

  const chartData = activeTab === 'DAILY'
    ? asset.priceDaily
    : activeTab === 'WEEKLY'
    ? asset.priceWeekly
    : asset.priceMonthly;

  // ── Hero value count-up ────────────────────────────────────────────────────
  const countAnim  = useRef(new Animated.Value(0)).current;
  const [displayVal, setDisplayVal] = useState(0);

  // ── Screen-level entrance: fade + scale (0.97 → 1.0) ─────────────────────
  // With transparentModal, the previous screen stays visible underneath.
  // This makes the detail feel like it expands out of the tapped card
  // rather than appearing from nowhere.
  // Both use useNativeDriver: true — opacity + transform are composited.
  const screenOpacity = useRef(new Animated.Value(0)).current;
  const screenScale   = useRef(new Animated.Value(0.97)).current;

  // ── Content entrance animations ──────────────────────────────────────────────────────
  // Everything animates in together as one cohesive unit.
  // Header slides down from -8, everything else lifts from +16.
  // Duration: 280ms, Easing.out(Easing.cubic) — snaps into place.
  const headerOp  = useRef(new Animated.Value(0)).current;
  const headerY   = useRef(new Animated.Value(-8)).current;
  const heroOp    = useRef(new Animated.Value(0)).current;
  const heroY     = useRef(new Animated.Value(16)).current;

  // Holding rows: max 30ms stagger between items, 280ms each.
  // All rows are visible within 280ms + (n-1)*30ms of screen open.
  const holdingAnims = useRef(asset.holdings.map(() => ({
    opacity:    new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    const listenerId = countAnim.addListener(({ value }) => setDisplayVal(value));

    // Count-up starts immediately alongside the screen entrance
    Animated.timing(countAnim, {
      toValue:         asset.totalValueUSD,
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
        // Header fades down into place
        Animated.timing(headerOp, { toValue: 1, duration: 280, useNativeDriver: true, easing: ease }),
        Animated.timing(headerY,  { toValue: 0, duration: 280, useNativeDriver: true, easing: ease }),

        // Hero card lifts up
        Animated.timing(heroOp, { toValue: 1, duration: 280, useNativeDriver: true, easing: ease }),
        Animated.timing(heroY,  { toValue: 0, duration: 280, useNativeDriver: true, easing: ease }),

        // Holding rows stagger — 30ms apart, same 280ms duration
        Animated.stagger(
          30,
          holdingAnims.map(({ opacity, translateY }) =>
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
      <TopoBackground data={asset.sparkline} color={asset.color} width={width} height={360} />

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
          <CoinIcon symbol={asset.symbol} color={asset.color} size={28} noContainer />
          <Text style={s.headerName}>{asset.name}</Text>
          <Text style={s.headerSymbol}>{asset.symbol}</Text>
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

            {/* Row 1: HOLDINGS label + time tabs */}
            <View style={s.topRow}>
              <Text style={s.heroLabel}>HOLDINGS</Text>
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

            {/* Row 2: Big dollar value (counts up) */}
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
                {isGain ? '+' : ''}{asset.change24hPercent.toFixed(2)}%
              </Text>
            </View>

          </View>

          {/* Divider */}
          <View style={s.divider} />

          {/* Stat row */}
          <View style={s.statRow}>
            <View style={s.statBox}>
              <Text style={s.statLabel}>UNITS IN HAND</Text>
              <Text style={s.statValue}>{formatAmount(asset.totalAmount, asset.symbol)}</Text>
            </View>
            <View style={s.statSeparator} />
            <View style={s.statBox}>
              <Text style={s.statLabel}>PRICE PER UNIT</Text>
              <Text style={s.statValue}>{formatPrice(asset.priceUSD)}</Text>
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
              formatValue={formatPrice}
            />
          </View>
        </Animated.View>

        {/* ── Holdings per exchange (tight stagger) ── */}
        <View style={s.holdingsList}>
          {asset.holdings.map((h, i) => {
            const exc    = EXCHANGES.find((e) => e.id === h.exchangeId);
            const pct    = (h.valueUSD / asset.totalValueUSD) * 100;
            const isLast = i === asset.holdings.length - 1;
            const { opacity, translateY } = holdingAnims[i];

            return (
              <Animated.View
                key={h.exchangeId}
                style={[
                  s.holdingBorderWrap,
                  !isLast && s.holdingBorder,
                  { opacity, transform: [{ translateY }] },
                ]}
              >
                <View style={s.holdingRow}>
                  <ExchangeLogo
                    exchangeId={h.exchangeId}
                    color={Colors.gray}
                    colorDim={Colors.muted}
                    size={26}
                    noContainer
                  />
                  <View style={s.holdingMid}>
                    <View style={s.holdingNameRow}>
                      <Text style={s.holdingExc}>{exc?.name}</Text>
                      <View style={s.holdingPctBadge}>
                        <Text style={s.holdingPctText}>{pct.toFixed(0)}%</Text>
                      </View>
                    </View>
                    <Text style={s.holdingAmt}>{formatAmount(h.amount, asset.symbol)}</Text>
                    <View style={s.holdingBar}>
                      <View style={[s.holdingBarFill, { width: `${pct}%` }]} />
                    </View>
                  </View>
                  <Text style={s.holdingValue}>{formatUSD(h.valueUSD)}</Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Research section ── */}
        <View style={s.researchSection}>
          <Text style={s.researchLabel}>RESEARCH</Text>
          <View style={s.researchCard}>
            {/* ATH */}
            <View style={s.researchRow}>
              <Text style={s.researchKey}>All-Time High</Text>
              <View style={s.researchValueGroup}>
                <Text style={s.researchValue}>{formatPrice(asset.fundamentals.ath)}</Text>
                <Text style={s.researchMeta}>{asset.fundamentals.athDate}</Text>
              </View>
            </View>
            <View style={s.researchDivider} />
            {/* Market Cap */}
            <View style={s.researchRow}>
              <Text style={s.researchKey}>Market Cap</Text>
              <Text style={s.researchValue}>${asset.fundamentals.marketCapBn.toFixed(1)}B</Text>
            </View>
            <View style={s.researchDivider} />
            {/* Rank */}
            <View style={s.researchRow}>
              <Text style={s.researchKey}>Rank</Text>
              <Text style={s.researchValue}>#{asset.fundamentals.rank}</Text>
            </View>
            <View style={s.researchDivider} />
            {/* Circulating Supply */}
            <View style={s.researchRow}>
              <Text style={s.researchKey}>Circulating Supply</Text>
              <Text style={s.researchValue}>
                {asset.fundamentals.circulatingSupplyM >= 1000
                  ? `${(asset.fundamentals.circulatingSupplyM / 1000).toFixed(1)}B`
                  : `${asset.fundamentals.circulatingSupplyM.toFixed(1)}M`}
                {' '}{asset.symbol}
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
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
  headerSymbol: {
    color: Colors.gray,
    ...TypeScale.body.lg,
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
    paddingHorizontal: 8,
    paddingVertical:   4,
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
    paddingHorizontal: 8,
    paddingVertical:   4,
    borderRadius:      Radii.pill,
  },
  changeText: {
    ...TypeScale.body.md,
    fontWeight: '700',
  },

  statRow:      { flexDirection: 'row' },
  statBox: {
    flex:           1,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical: Spacing[2],
    gap:             Spacing[1],
  },
  statSeparator: { width: 1, alignSelf: 'stretch', backgroundColor: Colors.cardBorder },
  statLabel: {
    color: Colors.gray,
    ...TypeScale.label.sm,
    letterSpacing: 1.5,
  },
  statValue: {
    color:      Colors.white,
    ...TypeScale.label.sm,
    fontFamily: FontFamily.mono,
    letterSpacing: 0.5,
  },

  divider:      { height: 1, backgroundColor: Colors.cardBorder },
  chartSection: {
    paddingHorizontal: Spacing.cardPad,
    paddingTop:        Spacing.cardPad,
    paddingBottom:     Spacing.cardPad,
  },

  // ── Holdings per exchange ──────────────────────────────────────────────────
  holdingsList: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
    marginBottom:    Spacing[1],
  },
  holdingBorderWrap: {},
  holdingBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  holdingRow: {
    flexDirection: 'row',
    alignItems:    'center',
    padding:        Spacing.cardPad,
    gap:            Spacing[3],
  },
  holdingMid:    { flex: 1, gap: Spacing[1] },
  holdingNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  holdingExc: {
    color:      Colors.white,
    ...TypeScale.body.lgStrong,
    fontWeight: '700',
  },
  holdingPctBadge: {
    paddingHorizontal: Spacing[1],
    paddingVertical:   Spacing[1],
    borderRadius:      Radii.pill,
    backgroundColor:   Colors.cardElevated,
  },
  holdingPctText: {
    color: Colors.gray,
    ...TypeScale.label.sm,
  },
  holdingAmt: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },
  holdingBar: {
    height:          4,
    backgroundColor: Colors.cardBorder,
    borderRadius:    Radii.micro,
    marginTop:       Spacing[1],
    overflow:        'hidden',
  },
  holdingBarFill: { height: 4, borderRadius: Radii.micro, backgroundColor: Colors.gray },
  holdingValue: {
    color: Colors.white,
    ...TypeScale.numeric.sm,
  },

  // ── Research section ───────────────────────────────────────────────────────
  researchSection:    { marginTop: Spacing[2] },
  researchLabel:      { color: Colors.gray, ...TypeScale.label.md, marginBottom: Spacing[2] },
  researchCard:       { backgroundColor: Colors.card, borderRadius: Radii.card, overflow: 'hidden' },
  researchRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   Spacing[3],
    minHeight:         Spacing.touchTarget,
  },
  researchDivider:    { height: 1, backgroundColor: Colors.cardBorder, marginHorizontal: Spacing.cardPad },
  researchKey:        { color: Colors.gray, ...TypeScale.body.lg },
  researchValue:      { color: Colors.white, ...TypeScale.numeric.xs, fontFamily: FontFamily.mono },
  researchValueGroup: { alignItems: 'flex-end', gap: Spacing[1] },
  researchMeta:       { color: Colors.gray, ...TypeScale.body.md },
});
