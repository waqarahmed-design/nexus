import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { BottomFade, Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { CoinIcon } from '@/components/CoinIcon';
import { ExchangeLogo } from '@/components/ExchangeLogo';
import { EXCHANGES, TOTAL_PORTFOLIO, getAssetsForExchange, formatUSD, type Exchange } from '@/data/mockData';

const COIN_ICON_SIZE = 20;
const COIN_OVERLAP   = 8;

// ─── Press-scale card ─────────────────────────────────────────────────────────
function ExchangeCard({ exchange, enterAnim }: { exchange: Exchange; enterAnim: { opacity: Animated.Value; translateY: Animated.Value } }) {
  const pct        = (exchange.totalValueUSD / TOTAL_PORTFOLIO.valueUSD) * 100;
  const assets     = getAssetsForExchange(exchange.id);
  const stackWidth = COIN_ICON_SIZE + (assets.length - 1) * (COIN_ICON_SIZE - COIN_OVERLAP);

  const pressScale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(pressScale, {
      toValue: 0.97,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }

  function onPressOut() {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 8,
    }).start();
  }

  return (
    <Animated.View
      style={{
        opacity:   enterAnim.opacity,
        transform: [
          { translateY: enterAnim.translateY },
          { scale: pressScale },
        ],
      }}
    >
      <TouchableOpacity
        style={s.card}
        onPress={() => router.push(`/exchange/${exchange.id}`)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        activeOpacity={1}
      >
        <View style={s.cardHeader}>
          <View style={s.cardHeaderLeft}>
            <ExchangeLogo exchangeId={exchange.id} color={Colors.gray} colorDim={Colors.muted} size={28} noContainer />
            <View style={s.nameBlock}>
              <Text style={s.excName}>{exchange.name}</Text>
              <Text style={s.excMeta}>{exchange.assetsCount} assets</Text>
            </View>
          </View>
          <View style={{ width: stackWidth, height: COIN_ICON_SIZE }}>
            {assets.map((a, i) => (
              <View key={a.id} style={{ position: 'absolute', left: i * (COIN_ICON_SIZE - COIN_OVERLAP) }}>
                <CoinIcon symbol={a.symbol} color={a.color} size={COIN_ICON_SIZE} noContainer />
              </View>
            ))}
          </View>
        </View>

        <View style={s.divider} />

        <View style={s.cardValueRow}>
          <View>
            <Text style={s.excValue}>{formatUSD(exchange.totalValueUSD)}</Text>
            <Text style={s.excMeta}>{pct.toFixed(1)}% of portfolio</Text>
          </View>
          <Icon icon={Icons.chevronRight} size={16} color={Colors.gray} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function ExchangesScreen() {
  const insets = useSafeAreaInsets();

  // ── Entrance animations ──────────────────────────────────────────────────────
  // Header fades + slides down
  const headerOp = useRef(new Animated.Value(0)).current;
  const headerY  = useRef(new Animated.Value(-12)).current;

  // Each exchange card staggers in
  const cardAnims = useRef(EXCHANGES.map(() => ({
    opacity:    new Animated.Value(0),
    translateY: new Animated.Value(28),
  }))).current;

  // Add-exchange CTA
  const ctaOp = useRef(new Animated.Value(0)).current;
  const ctaY  = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.sequence([
      // Header slides in
      Animated.parallel([
        Animated.timing(headerOp, { toValue: 1, duration: 240, useNativeDriver: true, easing: ease }),
        Animated.timing(headerY,  { toValue: 0, duration: 240, useNativeDriver: true, easing: ease }),
      ]),
      // Cards stagger up
      Animated.stagger(
        60,
        cardAnims.map(({ opacity, translateY }) =>
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }),
            Animated.timing(opacity,    { toValue: 1, duration: 280, useNativeDriver: true }),
          ])
        )
      ),
      // CTA fades in last
      Animated.parallel([
        Animated.timing(ctaOp, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(ctaY,  { toValue: 0, duration: 220, useNativeDriver: true, easing: ease }),
      ]),
    ]).start();
  }, []);

  // Add CTA press scale
  const ctaScale = useRef(new Animated.Value(1)).current;
  function ctaPressIn() {
    Animated.spring(ctaScale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  }
  function ctaPressOut() {
    Animated.spring(ctaScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>

      {/* Sticky header */}
      <Animated.View
        style={[
          s.header,
          { opacity: headerOp, transform: [{ translateY: headerY }] },
        ]}
      >
        <View style={s.headerRow}>
          <Text style={s.headerTitle}>Exchanges</Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => router.push('/add-exchange')}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon icon={Icons.add} size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <View style={s.portfolioRow}>
          <Text style={s.portfolioLabel}>PORTFOLIO</Text>
          <Text style={s.portfolioValue}>{formatUSD(TOTAL_PORTFOLIO.valueUSD)}</Text>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 88 }]}
      >
        {EXCHANGES.map((exc, i) => (
          <ExchangeCard
            key={exc.id}
            exchange={exc}
            enterAnim={cardAnims[i]}
          />
        ))}

        <Animated.View
          style={{
            opacity:   ctaOp,
            transform: [{ translateY: ctaY }, { scale: ctaScale }],
          }}
        >
          <TouchableOpacity
            style={s.addCard}
            onPress={() => router.push('/add-exchange')}
            onPressIn={ctaPressIn}
            onPressOut={ctaPressOut}
            activeOpacity={1}
          >
            <View style={s.addIconWrap}>
              <Icon icon={Icons.add} size={20} color={Colors.gray} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.addCardTitle}>Connect Another Exchange</Text>
              <Text style={s.addCardSub}>OKX, Bybit, KuCoin and more</Text>
            </View>
            <Icon icon={Icons.chevronRight} size={16} color={Colors.gray} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

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

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[4],
    gap:               Spacing[4],
  },
  headerRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    alignItems:     'center',
  },
  headerTitle: {
    color: Colors.white,
    ...TypeScale.title.md,
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
  portfolioRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  portfolioLabel: {
    color: Colors.gray,
    ...TypeScale.label.md,
  },
  portfolioValue: {
    color: Colors.gray,
    ...TypeScale.numeric.sm,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.screenH,
    gap:               Spacing[1],
  },

  // ── Exchange card ─────────────────────────────────────────────────────────────
  card: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    padding:         Spacing.cardPad,
    gap:             Spacing[3],
  },
  cardHeader: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[3],
  },
  nameBlock: { gap: Spacing[1] },
  excName: {
    color:         Colors.white,
    ...TypeScale.body.lgStrong,
    letterSpacing: -0.2,
  },
  excMeta: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },
  divider: {
    height:           1,
    backgroundColor:  Colors.cardBorder,
    marginHorizontal: -Spacing.cardPad,
  },
  cardValueRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  excValue: {
    color: Colors.white,
    ...TypeScale.numeric.lg,
  },

  // ── Add exchange CTA ──────────────────────────────────────────────────────────
  addCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:              Spacing[3],
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    padding:         Spacing.cardPad,
  },
  addIconWrap: {
    width:           Spacing.touchTarget,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.muted,
    borderRadius:    Radii.input,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  addCardTitle: {
    color:        Colors.white,
    ...TypeScale.body.lgStrong,
    marginBottom: Spacing[1],
  },
  addCardSub: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  // ── Bottom fade ───────────────────────────────────────────────────────────────
  bottomFade: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: BottomFade.height,
  },
});
