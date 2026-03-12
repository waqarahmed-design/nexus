/**
 * Assets Screen — /assets
 *
 * Full list of all assets across the portfolio, ranked by value.
 * Reached by tapping "View All" on the Dashboard TOP ASSETS section.
 * Tapping any row navigates to /asset/[id].
 */

import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, Dimensions, Animated, Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { BottomFade, Radii, Spacing } from '@/constants/Spacing';
import { TypeScale, FontFamily } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { CoinIcon } from '@/components/CoinIcon';
import { SparklineChart } from '@/components/SparklineChart';
import { ASSETS, TOTAL_PORTFOLIO, formatUSD, formatAmount } from '@/data/mockData';

const { width } = Dimensions.get('window');

// Assets sorted by total value descending — matches the spec (BTC, USDT, ETH, SOL, XRP, BNB order)
const SORTED_ASSETS = [...ASSETS].sort((a, b) => b.totalValueUSD - a.totalValueUSD);

// Sparkline width for inline charts — fixed 52px per established pattern
const SPARK_WIDTH = 52;

export default function AssetsScreen() {
  const insets = useSafeAreaInsets();

  // ── Entrance animations ──────────────────────────────────────────────────────
  // Header fades + slides down from -8
  const headerOp = useRef(new Animated.Value(0)).current;
  const headerY  = useRef(new Animated.Value(-12)).current;

  // Each asset row staggers up from +28
  const rowAnims = useRef(
    SORTED_ASSETS.map(() => ({
      opacity:    new Animated.Value(0),
      translateY: new Animated.Value(28),
    }))
  ).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.sequence([
      // Header slides in first
      Animated.parallel([
        Animated.timing(headerOp, { toValue: 1, duration: 240, useNativeDriver: true, easing: ease }),
        Animated.timing(headerY,  { toValue: 0, duration: 240, useNativeDriver: true, easing: ease }),
      ]),
      // Asset rows stagger up
      Animated.stagger(
        55,
        rowAnims.map(({ opacity, translateY }) =>
          Animated.parallel([
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }),
            Animated.timing(opacity,    { toValue: 1, duration: 280, useNativeDriver: true }),
          ])
        )
      ),
    ]).start();
  }, []);

  // Total portfolio value for allocation display
  const totalValue = TOTAL_PORTFOLIO.valueUSD;

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>

      {/* ── Header ── */}
      <Animated.View
        style={[
          s.header,
          { opacity: headerOp, transform: [{ translateY: headerY }] },
        ]}
      >
        {/* Back button */}
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Icon icon={Icons.back} size={20} color={Colors.white} />
        </TouchableOpacity>

        {/* Title block */}
        <View style={s.titleBlock}>
          <Text style={s.title}>Assets</Text>
          <Text style={s.subtitle}>{SORTED_ASSETS.length} holdings</Text>
        </View>

        {/* Portfolio total (contextual anchor) */}
        <View style={s.totalBlock}>
          <Text style={s.totalLabel}>TOTAL</Text>
          <Text style={s.totalValue}>{formatUSD(totalValue)}</Text>
        </View>
      </Animated.View>

      {/* ── Column headers ── */}
      <View style={s.columnHeaders}>
        <Text style={s.colLeft}>ASSET</Text>
        <Text style={s.colCenter}>7D</Text>
        <Text style={s.colRight}>VALUE</Text>
      </View>

      {/* ── Asset list ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          s.scroll,
          { paddingBottom: insets.bottom + Spacing.tabBarClearance },
        ]}
      >
        <View style={s.listCard}>
          {SORTED_ASSETS.map((asset, index) => {
            const isGain      = asset.change24hPercent >= 0;
            const isLast      = index === SORTED_ASSETS.length - 1;
            const allocation  = (asset.totalValueUSD / totalValue) * 100;
            const { opacity, translateY } = rowAnims[index];

            return (
              <Animated.View
                key={asset.id}
                style={{ opacity, transform: [{ translateY }] }}
              >
                <TouchableOpacity
                  style={[s.row, !isLast && s.rowBorder]}
                  onPress={() => setTimeout(() => router.push(`/asset/${asset.id}`), 50)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityLabel={`${asset.name}, ${formatUSD(asset.totalValueUSD)}, ${isGain ? '+' : ''}${asset.change24hPercent.toFixed(2)}%`}
                >
                  {/* Rank number */}
                  <Text style={s.rank}>{index + 1}</Text>

                  {/* Coin icon */}
                  <CoinIcon symbol={asset.symbol} color={asset.color} size={36} noContainer />

                  {/* Name + amount */}
                  <View style={s.nameBlock}>
                    <Text style={s.assetName}>{asset.name}</Text>
                    <Text style={s.assetAmount}>{formatAmount(asset.totalAmount, asset.symbol)}</Text>
                  </View>

                  {/* 7-day sparkline */}
                  <View style={s.sparkWrap}>
                    <SparklineChart
                      data={asset.sparkline}
                      height={28}
                      color={isGain ? Colors.green : Colors.red}
                      horizontalPadding={0}
                      width={SPARK_WIDTH}
                      animateIn={false}
                    />
                  </View>

                  {/* Value + change */}
                  <View style={s.valueBlock}>
                    <Text style={s.assetValue}>{formatUSD(asset.totalValueUSD)}</Text>
                    <Text style={[s.assetChange, { color: isGain ? Colors.green : Colors.red }]}>
                      {isGain ? '+' : ''}{asset.change24hPercent.toFixed(2)}%
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Allocation bar — a thin stripe below each row */}
                {!isLast && (
                  <View style={s.allocBar}>
                    <View
                      style={[
                        s.allocBarFill,
                        {
                          width:           `${allocation}%` as any,
                          backgroundColor: asset.color,
                        },
                      ]}
                    />
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Summary footer */}
        <View style={s.footer}>
          <View style={s.footerRow}>
            <View style={s.footerItem}>
              <Text style={s.footerLabel}>ASSETS</Text>
              <Text style={s.footerValue}>{SORTED_ASSETS.length}</Text>
            </View>
            <View style={s.footerDivider} />
            <View style={s.footerItem}>
              <Text style={s.footerLabel}>TOTAL VALUE</Text>
              <Text style={s.footerValue}>{formatUSD(totalValue)}</Text>
            </View>
            <View style={s.footerDivider} />
            <View style={s.footerItem}>
              <Text style={s.footerLabel}>24H CHANGE</Text>
              <Text style={[
                s.footerValue,
                { color: TOTAL_PORTFOLIO.change24hPercent >= 0 ? Colors.green : Colors.red },
              ]}>
                {TOTAL_PORTFOLIO.change24hPercent >= 0 ? '+' : ''}{TOTAL_PORTFOLIO.change24hPercent.toFixed(2)}%
              </Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* ── Bottom fade ── */}
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

  // ── Header ────────────────────────────────────────────────────────────────────
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[3],
    gap:               Spacing[3],
  },

  backBtn: {
    width:           Spacing.touchTarget,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },

  titleBlock: {
    flex: 1,
    gap:  Spacing[1],
  },

  title: {
    color: Colors.white,
    ...TypeScale.title.md,
  },

  subtitle: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  totalBlock: {
    alignItems: 'flex-end',
    gap:         Spacing[1],
    flexShrink: 0,
  },

  totalLabel: {
    color: Colors.gray,
    ...TypeScale.label.sm,
  },

  totalValue: {
    color:      Colors.white,
    ...TypeScale.numeric.sm,
    fontFamily: FontFamily.mono,
  },

  // ── Column labels ─────────────────────────────────────────────────────────────
  columnHeaders: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing.screenH + Spacing.cardPad,
    paddingBottom:     Spacing[2],
    gap:               Spacing[3],
  },

  colLeft: {
    flex:          1,
    color:         Colors.gray,
    ...TypeScale.label.sm,
  },

  colCenter: {
    width:     SPARK_WIDTH,
    textAlign: 'center',
    color:     Colors.gray,
    ...TypeScale.label.sm,
  },

  colRight: {
    width:     72,
    textAlign: 'right',
    color:     Colors.gray,
    ...TypeScale.label.sm,
  },

  // ── Scroll & list ─────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.screenH,
    gap:               Spacing[3],
  },

  listCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
  },

  // ── Asset row ─────────────────────────────────────────────────────────────────
  row: {
    flexDirection:     'row',
    alignItems:        'center',
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   Spacing[3],
    minHeight:         Spacing.touchTarget,
    gap:               Spacing[3],
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },

  rank: {
    width:      20,
    color:      Colors.gray,
    ...TypeScale.body.md,
    textAlign:  'right',
    flexShrink: 0,
  },

  nameBlock: {
    flex: 1,
    gap:  Spacing[1],
  },

  assetName: {
    color: Colors.white,
    ...TypeScale.body.lgStrong,
  },

  assetAmount: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  sparkWrap: {
    width:      SPARK_WIDTH,
    flexShrink: 0,
  },

  valueBlock: {
    width:      72,
    alignItems: 'flex-end',
    gap:         Spacing[1],
    flexShrink:  0,
  },

  assetValue: {
    color:      Colors.white,
    ...TypeScale.numeric.xs,
    fontFamily: FontFamily.mono,
    textAlign:  'right',
  },

  assetChange: {
    ...TypeScale.body.md,
    fontWeight: '600',
    textAlign:  'right',
  },

  // ── Allocation bar (per row) ───────────────────────────────────────────────────
  allocBar: {
    height:            2,
    backgroundColor:   Colors.muted,
    marginHorizontal:  Spacing.cardPad,
  },

  allocBarFill: {
    height: 2,
  },

  // ── Footer summary card ───────────────────────────────────────────────────────
  footer: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    overflow:        'hidden',
  },

  footerRow: {
    flexDirection:   'row',
    paddingVertical: Spacing[4],
  },

  footerItem: {
    flex:           1,
    alignItems:     'center',
    gap:             Spacing[1],
  },

  footerDivider: {
    width:           1,
    backgroundColor: Colors.cardBorder,
    marginVertical:  Spacing[1],
  },

  footerLabel: {
    color: Colors.gray,
    ...TypeScale.label.sm,
  },

  footerValue: {
    color:      Colors.white,
    ...TypeScale.numeric.xs,
    fontFamily: FontFamily.mono,
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
