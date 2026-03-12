import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Dimensions, Animated, Easing, RefreshControl,
} from 'react-native';
import Svg, {
  Defs, RadialGradient as SvgRadialGradient, Stop, Rect,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { BottomFade, Radii, Spacing } from '@/constants/Spacing';
import { TypeScale, FontFamily } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { DotMatrixChart } from '@/components/DotMatrixChart';
import { CoinIcon } from '@/components/CoinIcon';
import { ExchangeLogo } from '@/components/ExchangeLogo';
import { CoachMark } from '@/components/CoachMark';
import { useApp } from '@/contexts/AppContext';
import {
  ASSETS, INSIGHTS, TOTAL_PORTFOLIO,
  PORTFOLIO_DAILY, PORTFOLIO_WEEKLY, PORTFOLIO_MONTHLY,
  formatUSD, formatAmount,
} from '@/data/mockData';

const { width } = Dimensions.get('window');
const TILE_SIZE  = width - Spacing.screenH * 2;

type TabType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function insightAccentColor(type: string): string {
  if (type === 'warning') return Colors.red;
  if (type === 'tip')     return Colors.accent;
  return Colors.gray;
}

// ─── Hero Card ────────────────────────────────────────────────────────────────

interface HeroCardProps {
  activeTab:    TabType;
  onTabChange:  (tab: TabType) => void;
  displayValue: number;
  intFormatted: string;
  displayDec:   string;
  isGain:       boolean;
}

function HeroCard({ activeTab, onTabChange, displayValue, intFormatted, displayDec, isGain }: HeroCardProps) {
  const TABS: TabType[] = ['DAILY', 'WEEKLY', 'MONTHLY'];

  return (
    <View style={hero.card}>
      {/* ── Top: stats + tabs ── */}
      <View style={hero.top}>
        {/* Row 1: PORTFOLIO label (left) + time tabs (right) */}
        <View style={hero.topRow}>
          <Text style={hero.label}>PORTFOLIO</Text>
          <View style={hero.tabs}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[hero.tab, activeTab === tab && hero.tabActive]}
                onPress={() => onTabChange(tab)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              >
                <Text style={[hero.tabText, activeTab === tab && hero.tabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Row 2: Large value */}
        <View style={hero.valueRow}>
          <Text style={hero.valueCurrency}>$</Text>
          <Text style={hero.valueInt} numberOfLines={1} adjustsFontSizeToFit>
            {intFormatted}
          </Text>
          <Text style={hero.valueDec}>
            .{displayValue >= TOTAL_PORTFOLIO.valueUSD ? displayDec : '00'}
          </Text>
        </View>

        {/* Row 3: Change pill */}
        <View style={[hero.changePill, { backgroundColor: isGain ? Colors.greenDim : Colors.redDim }]}>
          <Icon
            icon={isGain ? Icons.trendUp : Icons.trendDown}
            size={12}
            color={isGain ? Colors.green : Colors.red}
          />
          <Text style={[hero.changeText, { color: isGain ? Colors.green : Colors.red }]}>
            {isGain ? '+' : ''}{TOTAL_PORTFOLIO.change24hPercent.toFixed(2)}%
          </Text>
        </View>
      </View>

      {/* ── Divider ── */}
      <View style={hero.divider} />

      {/* ── Bottom: dot matrix chart ── */}
      <View style={hero.chartSection}>
        <DotMatrixChart
          key={activeTab}
          data={activeTab === 'DAILY' ? PORTFOLIO_DAILY : activeTab === 'WEEKLY' ? PORTFOLIO_WEEKLY : PORTFOLIO_MONTHLY}
          width={TILE_SIZE - Spacing.cardPad * 2 - 4}
          isGain={isGain}
          formatValue={formatUSD}
        />
      </View>
    </View>
  );
}

const hero = StyleSheet.create({
  card: {
    width:           TILE_SIZE,
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
  },
  top: {
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
  label: {
    color: Colors.gray,
    ...TypeScale.label.md,
  },
  tabs: {
    flexDirection: 'row',
    gap:            Spacing[1],
  },
  tab: {
    paddingHorizontal: Spacing[2],
    paddingVertical:   Spacing[1],
    borderRadius:      Radii.pill,
    minWidth:          Spacing.touchTarget,
    alignItems:        'center',
  },
  tabActive: {
    backgroundColor: Colors.cardElevated,
  },
  tabText: {
    ...TypeScale.label.sm,
    color: Colors.gray,
  },
  tabTextActive: {
    color: Colors.white,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems:    'flex-end',
    gap:            Spacing[1],
  },
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
  divider: {
    height:          1,
    backgroundColor: Colors.cardBorder,
  },
  chartSection: {
    paddingHorizontal: Spacing.cardPad,
    paddingTop:        Spacing.cardPad,
    paddingBottom:     Spacing.cardPad,
  },
});

// ─── Zero State ────────────────────────────────────────────────────────────────

function ZeroState({ onConnect }: { onConnect: () => void }) {
  const float1    = useRef(new Animated.Value(0)).current;
  const float2    = useRef(new Animated.Value(0)).current;
  const float3    = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    function makeFloat(anim: Animated.Value, delay: number) {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -12, duration: 2200, useNativeDriver: true, delay, easing: Easing.inOut(Easing.sin) }),
          Animated.timing(anim, { toValue: 0,   duration: 2200, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        ])
      );
    }

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,   duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowPulse, { toValue: 0.6, duration: 2400, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );

    Animated.parallel([
      makeFloat(float1, 0),
      makeFloat(float2, 700),
      makeFloat(float3, 1400),
      pulseAnim,
    ]).start();

    return () => {
      float1.stopAnimation();
      float2.stopAnimation();
      float3.stopAnimation();
      glowPulse.stopAnimation();
    };
  }, []);

  const ORBS = [
    { id: 'binance',  color: Colors.excBinance,  colorDim: Colors.excBinanceDim,  float: float1, offset: -70 },
    { id: 'coinbase', color: Colors.excCoinbase, colorDim: Colors.excCoinbaseDim, float: float2, offset: 0 },
    { id: 'kraken',   color: Colors.excKraken,   colorDim: Colors.excKrakenDim,   float: float3, offset: 70 },
  ];

  return (
    <View style={zs.wrap}>
      <Animated.View style={[zs.glow, { opacity: glowPulse }]} />
      <View style={zs.orbs}>
        {ORBS.map((orb) => (
          <Animated.View
            key={orb.id}
            style={[zs.orb, { transform: [{ translateY: orb.float }, { translateX: orb.offset }] }]}
          >
            <ExchangeLogo
              exchangeId={orb.id}
              color={orb.color}
              colorDim={orb.colorDim}
              size={64}
            />
          </Animated.View>
        ))}
      </View>
      <View style={zs.text}>
        <Text style={zs.eyebrow}>NO EXCHANGES CONNECTED</Text>
        <Text style={zs.headline}>Your portfolio{'\n'}lives here.</Text>
        <Text style={zs.body}>
          Connect Binance, Coinbase, Kraken and more.{'\n'}
          Nexus aggregates everything in real time.
        </Text>
      </View>
      <TouchableOpacity style={zs.cta} onPress={onConnect} activeOpacity={0.85}>
        <Icon icon={Icons.add} size={20} color={Colors.onAccent} />
        <Text style={zs.ctaText}>Connect an Exchange</Text>
      </TouchableOpacity>
      <Text style={zs.trustNote}>
        Takes less than 2 minutes · Read-only access only
      </Text>
    </View>
  );
}

const zs = StyleSheet.create({
  wrap: {
    flex:              1,
    alignItems:        'center',
    justifyContent:    'center',
    paddingHorizontal: Spacing[8],
    gap:               Spacing[8],
    marginTop:         -20,
  },
  glow: {
    position:        'absolute',
    width:           280,
    height:          280,
    borderRadius:    140,
    backgroundColor: Colors.surfaceGlow,
  },
  orbs: {
    height:         100,
    width:          '100%',
    alignItems:     'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
  },
  text: {
    alignItems: 'center',
    gap:         Spacing[3],
  },
  eyebrow: {
    color: Colors.gray,
    ...TypeScale.label.md,
  },
  headline: {
    color:     Colors.white,
    ...TypeScale.display.md,
    textAlign: 'center',
  },
  body: {
    color:     Colors.gray,
    ...TypeScale.body.lg,
    textAlign: 'center',
  },
  cta: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[2],
    backgroundColor:   Colors.accent,
    borderRadius:      Radii.pill,
    paddingVertical:   16,
    paddingHorizontal: Spacing[8],
    width:             '100%',
    justifyContent:    'center',
  },
  ctaText: {
    color:      Colors.onAccent,
    ...TypeScale.body.lgStrong,
    fontWeight: '800',
  },
  trustNote: {
    color:     Colors.gray,
    ...TypeScale.body.md,
    textAlign: 'center',
  },
});

// ─── Coach mark definitions ────────────────────────────────────────────────────

const COACH_MARKS = [
  {
    id:    'portfolio-value',
    icon:  Icons.barChart,
    title: 'Your portfolio is live',
    body:  'This is your total balance across all connected exchanges, updated every time you sync.',
  },
  {
    id:    'asset-tap',
    icon:  Icons.layers,
    title: 'Tap any asset for details',
    body:  'See price history, exchange breakdown, and exact holdings for each coin.',
  },
];

// ─── Top 3 Assets ─────────────────────────────────────────────────────────────
// Sort by totalValueUSD descending and take the first 3

const TOP_ASSETS = [...ASSETS]
  .sort((a, b) => b.totalValueUSD - a.totalValueUSD)
  .slice(0, 3);

// ─── Top 3 Insights ───────────────────────────────────────────────────────────

const TOP_INSIGHTS = INSIGHTS.slice(0, 3);

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { isNewUser, connectedExchanges, markCoachMarkSeen, hasSeenCoachMark } = useApp();

  const [refreshing, setRefreshing]       = useState(false);
  const [lastSynced, setLastSynced]       = useState('just now');
  const [displayValue, setDisplayValue]   = useState(0);
  const [coachMarkStep, setCoachMarkStep] = useState(0);
  const [activeTab, setActiveTab]         = useState<TabType>('DAILY');

  // ── Animated values ────────────────────────────────────────────────────────
  const scrollY     = useRef(new Animated.Value(0)).current;
  const countAnim   = useRef(new Animated.Value(0)).current;

  // Asset row entrance animations (top 3 only)
  const rowAnims = useRef(TOP_ASSETS.map(() => ({
    opacity:    new Animated.Value(0),
    translateY: new Animated.Value(28),
  }))).current;

  // Insight row entrance animations (top 3 only)
  const insightAnims = useRef(TOP_INSIGHTS.map(() => ({
    opacity:    new Animated.Value(0),
    translateY: new Animated.Value(16),
  }))).current;

  const prevCount   = useRef(connectedExchanges.length);
  const hasAnimated = useRef(false);

  // ── scrollY interpolations ─────────────────────────────────────────────────
  const stickyOpacity = scrollY.interpolate({
    inputRange: [90, 140], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const syncLabelOpacity = scrollY.interpolate({
    inputRange: [0, 90], outputRange: [1, 0], extrapolate: 'clamp',
  });

  // ── Count-up listener ──────────────────────────────────────────────────────
  useEffect(() => {
    const id = countAnim.addListener(({ value }) => setDisplayValue(value));
    return () => countAnim.removeListener(id);
  }, []);

  useEffect(() => {
    if (connectedExchanges.length === 0) return;
    if (!isNewUser) {
      setDisplayValue(TOTAL_PORTFOLIO.valueUSD);
      rowAnims.forEach(({ opacity, translateY }) => {
        opacity.setValue(1);
        translateY.setValue(0);
      });
      insightAnims.forEach(({ opacity, translateY }) => {
        opacity.setValue(1);
        translateY.setValue(0);
      });
    } else if (!hasAnimated.current) {
      hasAnimated.current = true;
      runPopulateAnimation();
    }
  }, []);

  useEffect(() => {
    const curr = connectedExchanges.length;
    if (curr > 0 && prevCount.current === 0 && isNewUser && !hasAnimated.current) {
      hasAnimated.current = true;
      runPopulateAnimation();
    }
    prevCount.current = curr;
  }, [connectedExchanges]);

  function runPopulateAnimation() {
    countAnim.setValue(0);
    Animated.timing(countAnim, {
      toValue:         TOTAL_PORTFOLIO.valueUSD,
      duration:        1500,
      useNativeDriver: false,
      easing:          Easing.out(Easing.cubic),
    }).start();

    // Asset rows stagger in
    Animated.stagger(
      75,
      rowAnims.map(({ opacity, translateY }) =>
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }),
          Animated.timing(opacity,    { toValue: 1, duration: 320, useNativeDriver: true }),
        ])
      )
    ).start();

    // Insight rows stagger in after assets
    const rowDelay = TOP_ASSETS.length * 75 + 200;
    setTimeout(() => {
      Animated.stagger(
        60,
        insightAnims.map(({ opacity, translateY }) =>
          Animated.parallel([
            Animated.timing(opacity,    { toValue: 1, duration: 280, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
            Animated.timing(translateY, { toValue: 0, duration: 280, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
          ])
        )
      ).start();

      if (!hasSeenCoachMark('portfolio-value')) setCoachMarkStep(1);
    }, rowDelay);
  }

  function dismissCoachMark() {
    const current = COACH_MARKS[coachMarkStep - 1];
    if (current) markCoachMarkSeen(current.id);
    if (coachMarkStep < COACH_MARKS.length) {
      setCoachMarkStep(0);
      setTimeout(() => setCoachMarkStep(coachMarkStep + 1), 350);
    } else {
      setCoachMarkStep(0);
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setLastSynced('just now');
    }, 1200);
  }, []);

  // ── Derived display values ─────────────────────────────────────────────────
  const isGain       = TOTAL_PORTFOLIO.change24hPercent >= 0;

  const displayInt   = Math.floor(displayValue);
  const displayDec   = Math.round((displayValue - displayInt) * 100).toString().padStart(2, '0');
  const intFormatted = displayInt.toLocaleString('en-US');

  // ── Zero state ────────────────────────────────────────────────────────────
  if (connectedExchanges.length === 0) {
    return (
      <View style={[s.screen, { paddingTop: insets.top }]}>
        <View style={s.header}>
          <View style={s.headerLogo}>
            <View style={s.headerLogoMark}>
              <Text style={s.headerLogoMarkText}>N</Text>
            </View>
            <Text style={s.headerLogoWord}>NEXUS</Text>
          </View>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => router.push('/add-exchange')}
            activeOpacity={0.8}
          >
            <Icon icon={Icons.add} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <ZeroState onConnect={() => router.push('/add-exchange')} />
      </View>
    );
  }

  // ── Populated dashboard ───────────────────────────────────────────────────
  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>

      {/* ── Mood-responsive ambient gradient ── */}
      <Svg style={s.moodSvg} width={width} height={300} pointerEvents="none">
        <Defs>
          <SvgRadialGradient
            id="mood"
            cx={`${width / 2}`}
            cy="0"
            r={`${width * 0.85}`}
            gradientUnits="userSpaceOnUse"
          >
            <Stop offset="0" stopColor={isGain ? Colors.green : Colors.red} stopOpacity="0.07" />
            <Stop offset="1" stopColor={isGain ? Colors.green : Colors.red} stopOpacity="0" />
          </SvgRadialGradient>
        </Defs>
        <Rect x="0" y="0" width={width} height={300} fill="url(#mood)" />
      </Svg>

      {/* ── Header — always visible, outside scroll ── */}
      <View style={s.header}>
        <View>
          <View style={s.headerLogo}>
            <View style={s.headerLogoMark}>
              <Text style={s.headerLogoMarkText}>N</Text>
            </View>
            <Text style={s.headerLogoWord}>NEXUS</Text>
          </View>
          <Animated.Text style={[s.syncLabel, { opacity: syncLabelOpacity }]}>
            Synced {lastSynced}
          </Animated.Text>
          <Animated.View style={[s.stickyContent, { opacity: stickyOpacity }]} pointerEvents="none">
            <Text style={s.stickyValue}>{formatUSD(TOTAL_PORTFOLIO.valueUSD)}</Text>
            <View style={[s.stickyPill, { backgroundColor: isGain ? Colors.greenDim : Colors.redDim }]}>
              <Text style={[s.stickyChange, { color: isGain ? Colors.green : Colors.red }]}>
                {isGain ? '+' : ''}{TOTAL_PORTFOLIO.change24hPercent.toFixed(2)}%
              </Text>
            </View>
          </Animated.View>
        </View>
        <TouchableOpacity
          style={s.addBtn}
          onPress={() => router.push('/add-exchange')}
          activeOpacity={0.8}
        >
          <Icon icon={Icons.add} size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.accent}
          />
        }
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + Spacing.tabBarClearance }]}
      >

        {/* ── Hero card ── */}
        <View style={s.heroWrap}>
          <HeroCard
            activeTab={activeTab}
            onTabChange={setActiveTab}
            displayValue={displayValue}
            intFormatted={intFormatted}
            displayDec={displayDec}
            isGain={isGain}
          />
        </View>

        {/* ══════════════════════════════════════
            TOP ASSETS section
        ══════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.assetCard}>
            {/* Title row inside card */}
            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>TOP ASSETS</Text>
              <TouchableOpacity
                onPress={() => router.push('/assets')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {TOP_ASSETS.map((asset, index) => {
              const isAssetGain = asset.change24hPercent >= 0;
              const isLast      = index === TOP_ASSETS.length - 1;
              const { opacity, translateY } = rowAnims[index];

              return (
                <Animated.View key={asset.id} style={{ opacity, transform: [{ translateY }] }}>
                  <TouchableOpacity
                    style={[s.assetRow, !isLast && s.assetBorder]}
                    onPress={() => setTimeout(() => router.push(`/asset/${asset.id}`), 50)}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={`${asset.name}, ${formatUSD(asset.totalValueUSD)}`}
                  >
                    {/* Left: coin icon + name/amount */}
                    <CoinIcon symbol={asset.symbol} color={asset.color} size={32} noContainer />
                    <View style={s.assetMid}>
                      <Text style={s.assetName}>{asset.name}</Text>
                      <Text style={s.assetAmount}>{formatAmount(asset.totalAmount, asset.symbol)}</Text>
                    </View>

                    {/* Right: value + change */}
                    <View style={s.assetRight}>
                      <Text style={s.assetValue}>{formatUSD(asset.totalValueUSD)}</Text>
                      <Text style={[s.assetChange, { color: isAssetGain ? Colors.green : Colors.red }]}>
                        {isAssetGain ? '+' : ''}{asset.change24hPercent.toFixed(2)}%
                      </Text>
                    </View>

                    <Icon icon={Icons.chevronRight} size={16} color={Colors.gray} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ══════════════════════════════════════
            INSIGHTS section
        ══════════════════════════════════════ */}
        <View style={s.section}>
          <View style={s.insightCard}>
            {/* Title row inside card */}
            <View style={s.sectionTitleRow}>
              <Text style={s.sectionTitle}>INSIGHTS</Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/analytics')}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {TOP_INSIGHTS.map((insight, index) => {
              const dotColor = insightAccentColor(insight.type);
              const isLast   = index === TOP_INSIGHTS.length - 1;
              const { opacity, translateY } = insightAnims[index];

              return (
                <Animated.View key={insight.id} style={{ opacity, transform: [{ translateY }] }}>
                  <TouchableOpacity
                    style={[s.insightRow, !isLast && s.insightBorder]}
                    onPress={() => router.push('/(tabs)/analytics')}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityLabel={insight.title}
                  >
                    {/* Type indicator dot */}
                    <View style={[s.insightDot, { backgroundColor: dotColor }]} />

                    {/* Text block */}
                    <View style={s.insightText}>
                      <Text style={s.insightTitle} numberOfLines={1}>{insight.title}</Text>
                      <Text style={s.insightBody} numberOfLines={2}>{insight.body}</Text>
                    </View>

                    <Icon icon={Icons.chevronRight} size={16} color={Colors.gray} />
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

      </Animated.ScrollView>

      {/* ── Bottom fade ── */}
      <LinearGradient
        colors={BottomFade.colors as any}
        style={s.bottomFade}
        pointerEvents="none"
      />

      {/* ── Coach marks ── */}
      {COACH_MARKS.map((mark, i) => (
        <CoachMark
          key={mark.id}
          visible={coachMarkStep === i + 1}
          icon={mark.icon}
          title={mark.title}
          body={mark.body}
          onDismiss={dismissCoachMark}
          step={i + 1}
          totalSteps={COACH_MARKS.length}
          bottomOffset={100}
        />
      ))}

    </View>
  );
}

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: Colors.bg },
  scroll:     { paddingHorizontal: Spacing.screenH, gap: Spacing[1] },
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: BottomFade.height },
  moodSvg:    { position: 'absolute', top: 0, left: 0 },

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    justifyContent:    'space-between',
    alignItems:        'center',
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[2],
  },
  headerLogo:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  headerLogoMark: {
    width:           26,
    height:          26,
    borderRadius:    Radii.micro,
    backgroundColor: Colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerLogoMarkText: {
    color:         Colors.onAccent,
    fontSize:      14,
    fontWeight:    '900',
    letterSpacing: -0.5,
  },
  headerLogoWord: {
    color:         Colors.white,
    ...TypeScale.title.xs,
    letterSpacing: 2,
  },
  syncLabel: {
    color:     Colors.gray,
    ...TypeScale.body.md,
    marginTop: Spacing[1],
  },
  addBtn: {
    width:           Spacing.touchTarget,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    alignItems:      'center',
    justifyContent:  'center',
  },

  // Sticky compact value
  stickyContent: {
    position:      'absolute',
    top:           24,
    left:          0,
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[2],
  },
  stickyValue: {
    color: Colors.white,
    ...TypeScale.numeric.sm,
  },
  stickyPill: {
    paddingHorizontal: Spacing[2],
    paddingVertical:   Spacing[1],
    borderRadius:      Radii.pill,
  },
  stickyChange: {
    ...TypeScale.body.mdMedium,
  },

  // ── Hero wrapper ──────────────────────────────────────────────────────────────
  heroWrap: {},

  // ── Sections ──────────────────────────────────────────────────────────────────
  section: {},

  // ── Asset card ────────────────────────────────────────────────────────────────
  assetCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
  },
  assetRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[3],
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   Spacing[3],
    minHeight:         Spacing.touchTarget,
  },
  assetBorder:  { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  assetMid:     { flex: 1, gap: Spacing[1] },
  assetName:    { color: Colors.white, ...TypeScale.body.lgStrong },
  assetAmount:  { color: Colors.gray,  ...TypeScale.body.md },
  assetRight:   { alignItems: 'flex-end', gap: Spacing[1] },
  assetValue:   { color: Colors.white, ...TypeScale.numeric.sm, fontFamily: FontFamily.mono },
  assetChange:  { ...TypeScale.body.md, fontWeight: '600' },

  // ── Insight card ──────────────────────────────────────────────────────────────
  insightCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
  },
  insightRow: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               Spacing[3],
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   Spacing[3],
    minHeight:         Spacing.touchTarget,
  },
  insightBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  insightDot: {
    width:        8,
    height:       8,
    borderRadius: Radii.pill,
    flexShrink:   0,
  },
  insightText: {
    flex: 1,
    gap:  Spacing[1],
  },
  insightTitle: {
    color: Colors.white,
    ...TypeScale.body.lgStrong,
  },
  insightBody: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  // ── View All button ─────────────────────────────────────────────────────────
  sectionTitleRow: {
    flexDirection:     'row',
    alignItems:        'center',
    justifyContent:    'space-between',
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    minHeight:         Spacing.touchTarget,
  },
  sectionTitle: {
    color: Colors.gray,
    ...TypeScale.label.md,
  },
  viewAllText: {
    color: Colors.gray,
    ...TypeScale.body.md,
    fontWeight: '600',
  },
});
