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
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { SparklineChart } from '@/components/SparklineChart';
import { DotMatrixChart } from '@/components/DotMatrixChart';
import { CoinIcon } from '@/components/CoinIcon';
import { ExchangeLogo } from '@/components/ExchangeLogo';
import { AllocationBar } from '@/components/AllocationBar';
import { TopoBackground } from '@/components/TopoBackground';
import { CoachMark } from '@/components/CoachMark';
import { useApp } from '@/contexts/AppContext';
import {
  ASSETS, EXCHANGES, TOTAL_PORTFOLIO, PORTFOLIO_HISTORY,
  PORTFOLIO_DAILY, PORTFOLIO_WEEKLY, PORTFOLIO_MONTHLY,
  formatUSD, formatAmount,
} from '@/data/mockData';
import { InsightsList } from '@/components/InsightsList';

const { width } = Dimensions.get('window');
const TILE_SIZE = width - 40;

type TabType = 'DAILY' | 'WEEKLY' | 'MONTHLY';

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
          width={TILE_SIZE - 36}
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
    borderRadius:    Radii.card,   // 20
    overflow:        'hidden',
  },
  top: {
    paddingHorizontal: Spacing.cardPad,   // 16
    paddingTop:        Spacing.cardPad,   // 16
    paddingBottom:     Spacing.cardPad,   // 16
    gap:               Spacing[3],        // 12
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
    gap:            Spacing[1],   // 4
  },
  tab: {
    paddingHorizontal: 8,
    paddingVertical:   4,
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
    gap:            Spacing[1],   // 4
  },
  valueCurrency: {
    color:      Colors.white,
    ...TypeScale.numeric.sm,
    marginBottom: Spacing[1],   // 4
    opacity:    0.5,
  },
  valueInt: {
    color:      Colors.white,
    ...TypeScale.numeric.xl,
  },
  valueDec: {
    color:       Colors.white,
    ...TypeScale.numeric.md,
    marginBottom: Spacing[1],   // 4
    opacity:     0.4,
  },
  changePill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[1],   // 4
    alignSelf:        'flex-start',
    paddingHorizontal: 8,
    paddingVertical:   4,
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
    paddingHorizontal: Spacing.cardPad,   // 16
    paddingTop:        Spacing.cardPad,   // 16
    paddingBottom:     Spacing.cardPad,   // 16
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
      {/* Ambient center glow */}
      <Animated.View style={[zs.glow, { opacity: glowPulse }]} />

      {/* Floating exchange orbs */}
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

      {/* Text */}
      <View style={zs.text}>
        <Text style={zs.eyebrow}>NO EXCHANGES CONNECTED</Text>
        <Text style={zs.headline}>Your portfolio{'\n'}lives here.</Text>
        <Text style={zs.body}>
          Connect Binance, Coinbase, Kraken and more.{'\n'}
          Nexus aggregates everything in real time.
        </Text>
      </View>

      {/* CTA */}
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
    flex:             1,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: Spacing[8],   // 32
    gap:               Spacing[8],   // 32
    marginTop:        -20,
  },
  glow: {
    position:        'absolute',
    width:           280,
    height:          280,
    borderRadius:    140,
    backgroundColor: Colors.surfaceGlow,
  },
  orbs: {
    height:     100,
    width:      '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    position: 'absolute',
  },
  text: {
    alignItems: 'center',
    gap:         Spacing[3],   // 12
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
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[2],   // 8
    backgroundColor:  Colors.accent,
    borderRadius:     Radii.pill,
    paddingVertical:  16,
    paddingHorizontal: Spacing[8],   // 32
    width:            '100%',
    justifyContent:   'center',
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

// ─── Coach mark definitions ─────────────────────────────────────────────────

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

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { isNewUser, connectedExchanges, markCoachMarkSeen, hasSeenCoachMark } = useApp();

  const [refreshing, setRefreshing]         = useState(false);
  const [lastSynced, setLastSynced]         = useState('just now');
  const [displayValue, setDisplayValue]     = useState(0);
  const [coachMarkStep, setCoachMarkStep]   = useState(0);
  const [activeTab, setActiveTab]           = useState<'DAILY' | 'WEEKLY' | 'MONTHLY'>('DAILY');

  // ── Animated values ──────────────────────────────────────────────────────
  const scrollY      = useRef(new Animated.Value(0)).current;
  const countAnim    = useRef(new Animated.Value(0)).current;
  const rowAnims     = useRef(ASSETS.map(() => ({
    opacity:    new Animated.Value(0),
    translateY: new Animated.Value(28),
  }))).current;
  const prevCount    = useRef(connectedExchanges.length);
  const hasAnimated  = useRef(false);

  // ── scrollY interpolations for header animations ─────────────────────────
  const heroOpacity = scrollY.interpolate({
    inputRange: [0, 110], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const heroTranslateY = scrollY.interpolate({
    inputRange: [0, 150], outputRange: [0, -40], extrapolate: 'clamp',
  });
  const stickyOpacity = scrollY.interpolate({
    inputRange: [90, 140], outputRange: [0, 1], extrapolate: 'clamp',
  });
  const syncLabelOpacity = scrollY.interpolate({
    inputRange: [0, 90], outputRange: [1, 0], extrapolate: 'clamp',
  });

  // ── Count-up animation listener ──────────────────────────────────────────
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

    Animated.stagger(
      75,
      rowAnims.map(({ opacity, translateY }) =>
        Animated.parallel([
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }),
          Animated.timing(opacity,    { toValue: 1, duration: 320, useNativeDriver: true }),
        ])
      )
    ).start();

    const rowDelay = ASSETS.length * 75 + 150;
    setTimeout(() => {
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

  // ── Derived display values ───────────────────────────────────────────────
  const isGain    = TOTAL_PORTFOLIO.change24hPercent >= 0;
  const chartData = PORTFOLIO_HISTORY.map((p) => p.value);
  const totalVal  = EXCHANGES.reduce((s, e) => s + e.totalValueUSD, 0);

  const displayInt   = Math.floor(displayValue);
  const displayDec   = Math.round((displayValue - displayInt) * 100).toString().padStart(2, '0');
  const intFormatted = displayInt.toLocaleString('en-US');
  // ── Zero state ──────────────────────────────────────────────────────────
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

  // ── Populated dashboard ─────────────────────────────────────────────────
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
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 88 }]}
      >
        {/* ── Hero card ── */}
        <View style={s.tilesRow}>
          <HeroCard
            activeTab={activeTab}
            onTabChange={setActiveTab}
            displayValue={displayValue}
            intFormatted={intFormatted}
            displayDec={displayDec}
            isGain={isGain}
          />
        </View>

        <View style={s.assetContainer}>
          {ASSETS.map((asset, index) => {
            const isAssetGain = asset.change24hPercent >= 0;
            const isLastAsset = index === ASSETS.length - 1;
            const { opacity, translateY } = rowAnims[index];
            return (
              <Animated.View key={asset.id} style={{ opacity, transform: [{ translateY }] }}>
                <TouchableOpacity
                  style={[s.assetRow, !isLastAsset && s.assetBorder]}
                  onPress={() => setTimeout(() => router.push(`/asset/${asset.id}`), 50)}
                  activeOpacity={0.75}
                >
                  <CoinIcon symbol={asset.symbol} color={asset.color} size={32} noContainer />
                  <View style={s.assetMid}>
                    <Text style={s.assetName}>{asset.name}</Text>
                    <Text style={s.assetAmount}>{formatAmount(asset.totalAmount, asset.symbol)}</Text>
                  </View>
                  <View style={s.assetSparkWrap}>
                    <SparklineChart
                      data={asset.sparkline}
                      height={28}
                      color={isAssetGain ? Colors.green : Colors.red}
                      horizontalPadding={0}
                      width={52}
                      animateIn={false}
                    />
                  </View>
                  <View style={s.assetRight}>
                    <Text style={s.assetValue}>{formatUSD(asset.totalValueUSD)}</Text>
                    <Text style={[s.assetChange, { color: isAssetGain ? Colors.green : Colors.red }]}>
                      {isAssetGain ? '+' : ''}{asset.change24hPercent.toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Insights section ── */}
        <View style={s.insightsSection}>
          <Text style={s.insightsSectionLabel}>INSIGHTS</Text>
          <InsightsList animated={false} />
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
  scroll:     { paddingHorizontal: Spacing.screenH },   // 20
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },
  moodSvg:    { position: 'absolute', top: 0, left: 0 },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection:    'row',
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: Spacing.screenH,   // 20
    paddingTop:        Spacing[4],        // 16
    paddingBottom:     Spacing[2],        // 8
  },
  headerLogo:     { flexDirection: 'row', alignItems: 'center', gap: Spacing[2] },
  headerLogoMark: {
    width:           26,
    height:          26,
    borderRadius:    Radii.micro,          // 4 (was 7)
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
    color: Colors.gray,
    ...TypeScale.body.md,
    marginTop: Spacing[1],   // 4
  },
  addBtn: {
    width:           Spacing.touchTarget,  // 44
    height:          Spacing.touchTarget,  // 44
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,          // 12
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
    gap:            Spacing[2],   // 8
  },
  stickyValue: {
    color: Colors.white,
    ...TypeScale.numeric.sm,
  },
  stickyPill: {
    paddingHorizontal: 8,
    paddingVertical:   Spacing[1],   // 4
    borderRadius:      Radii.pill,
  },
  stickyChange: {
    ...TypeScale.body.mdMedium,
  },

  // ── Hero card wrapper ─────────────────────────────────────────────────────
  tilesRow: {
    marginBottom: Spacing[1],   // 4
  },

  // ── Asset list ────────────────────────────────────────────────────────────
  assetContainer: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,   // 20
    overflow:        'hidden',
    marginBottom:    Spacing[1],   // 4
  },
  assetRow: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[3],   // 12
    paddingHorizontal: Spacing.cardPad,  // 16
    paddingVertical:   12,
  },
  assetBorder:   { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  assetMid:      { flex: 1, gap: Spacing[1] },
  assetName:     { color: Colors.white, ...TypeScale.body.lgStrong },
  assetAmount:   { color: Colors.gray,  ...TypeScale.body.md },
  assetSparkWrap: { width: 52 },
  assetRight:    { alignItems: 'flex-end', gap: Spacing[1] },
  assetValue:    { color: Colors.white, ...TypeScale.numeric.sm },
  assetChange:   { ...TypeScale.body.mdMedium },

  // ── Insights section ──────────────────────────────────────────────────────
  insightsSection: {
    marginTop: Spacing[1],
  },
  insightsSectionLabel: {
    color:        Colors.gray,
    ...TypeScale.label.md,
    marginBottom: Spacing[2],
  },
});
