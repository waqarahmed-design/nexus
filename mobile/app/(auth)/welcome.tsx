import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, Animated, Easing, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';

const { width } = Dimensions.get('window');

// ─── Trust pills ──────────────────────────────────────────────────────────────
const TRUST_PILLS = [
  { icon: Icons.shieldCheck, label: 'Read-only access'  },
  { icon: Icons.flash,       label: 'Live prices'       },
  { icon: Icons.lock,        label: 'AES-256 encrypted' },
];

// ─── Animated press wrapper ────────────────────────────────────────────────────
function PressableScale({
  children,
  onPress,
  activeOpacity = 0.85,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  activeOpacity?: number;
  style?: any;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();

  // Single shared progress value drives the entire screen entrance.
  // 0 = hidden, 1 = fully visible.
  // Duration: 350ms, Easing.out(Easing.cubic) — one motion, one moment.
  const entrance = useRef(new Animated.Value(0)).current;

  // The logo gets a subtle spring scale on top of the shared fade — this
  // gives it a single punctuation beat without delaying everything else.
  const logoScale = useRef(new Animated.Value(0.82)).current;

  // Trust pills: tight 30ms stagger, each driven by their own interpolation
  // of the shared entrance value so they arrive as a unit, not a slideshow.
  const pillAnims = useRef(TRUST_PILLS.map((_, i) => new Animated.Value(0))).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // Main entrance: everything fades + translates in together
    Animated.timing(entrance, {
      toValue:         1,
      duration:        350,
      useNativeDriver: true,
      easing:          ease,
    }).start();

    // Logo spring: fires at the same moment — just adds a scale pop
    Animated.spring(logoScale, {
      toValue:         1,
      useNativeDriver: true,
      tension:         80,
      friction:        10,
    }).start();

    // Pills stagger: 30ms apart, each 300ms — all start within first 100ms
    // so they land as a near-simultaneous cluster
    Animated.stagger(
      30,
      pillAnims.map((anim) =>
        Animated.timing(anim, {
          toValue:         1,
          duration:        300,
          useNativeDriver: true,
          easing:          ease,
        })
      )
    ).start();
  }, []);

  // Shared interpolations — all elements share the same entrance curve
  const sharedOpacity    = entrance;
  const sharedTranslateY = entrance.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  // Logo uses a tighter lift since it's at the top
  const logoTranslateY   = entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] });

  // CTAs use a slightly deeper lift for visual hierarchy
  const ctaTranslateY    = entrance.interpolate({ inputRange: [0, 1], outputRange: [28, 0] });

  return (
    <ImageBackground
      source={require('@/assets/images/welcome-bg.jpg')}
      style={s.screen}
      resizeMode="cover"
      imageStyle={{ opacity: 0.3 }}
    >
      {/* ── Content ── */}
      <View
        style={[
          s.content,
          {
            paddingTop:    insets.top + 56,
            paddingBottom: insets.bottom + 28,
          },
        ]}
      >
        {/* Hero: logomark + wordmark — all one animated unit */}
        <Animated.View
          style={[
            s.hero,
            {
              opacity:   sharedOpacity,
              transform: [{ translateY: logoTranslateY }],
            },
          ]}
        >
          <Animated.View
            style={[
              s.logoMark,
              { transform: [{ scale: logoScale }] },
            ]}
          >
            <Text style={s.logoMarkText}>N</Text>
          </Animated.View>

          <Text style={s.wordmark}>NEXUS</Text>
        </Animated.View>

        {/* Main copy — arrives with the screen */}
        <Animated.View
          style={{
            opacity:   sharedOpacity,
            transform: [{ translateY: sharedTranslateY }],
          }}
        >
          <Text style={s.headline}>{'Every exchange.\nOne number.'}</Text>
          <Text style={s.subHeadline}>
            Connect Binance, Coinbase, Kraken. See your total
            portfolio in real time. Read-only, always.
          </Text>
        </Animated.View>

        {/* Trust pills — near-simultaneous cluster */}
        <View style={s.pillsRow}>
          {TRUST_PILLS.map((pill, i) => {
            const pillOpacity    = pillAnims[i];
            const pillTranslateY = pillAnims[i].interpolate({
              inputRange:  [0, 1],
              outputRange: [10, 0],
            });

            return (
              <Animated.View
                key={pill.label}
                style={[
                  s.pill,
                  {
                    opacity:   pillOpacity,
                    transform: [{ translateY: pillTranslateY }],
                  },
                ]}
              >
                <Icon icon={pill.icon} size={12} color={Colors.gray} />
                <Text style={s.pillText}>{pill.label}</Text>
              </Animated.View>
            );
          })}
        </View>

        {/* Spacer — pushes CTAs to bottom */}
        <View style={s.spacer} />

        {/* Bottom CTAs — same entrance wave, deeper lift for hierarchy */}
        <Animated.View
          style={[
            s.ctas,
            {
              opacity:   sharedOpacity,
              transform: [{ translateY: ctaTranslateY }],
            },
          ]}
        >
          <PressableScale
            onPress={() => router.push('/(auth)/login')}
            style={s.primaryBtn}
          >
            <View style={s.primaryBtnInner}>
              <Text style={s.primaryBtnText}>Get Started</Text>
              <Icon icon={Icons.forward} size={18} color={Colors.onAccent} />
            </View>
          </PressableScale>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.65}
            accessibilityRole="button"
            accessibilityLabel="Sign in to existing account"
          >
            <Text style={s.secondaryBtnText}>
              Already have an account?{' '}
              <Text style={s.secondaryBtnLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ImageBackground>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  screen: {
    flex:            1,
    backgroundColor: Colors.bg,
  },

  content: {
    flex:             1,
    paddingHorizontal: Spacing[8],   // 32
  },

  // ── Hero ────────────────────────────────────────────────────────────────────
  hero: {
    alignItems:   'flex-start',
    gap:           Spacing[3],   // 12
    marginBottom:  Spacing[12] + Spacing[4],   // 48 + 16 = 64
  },
  logoMark: {
    width:           88,
    height:          88,
    borderRadius:    Radii.card,
    backgroundColor: Colors.accent,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoMarkText: {
    color:         Colors.onAccent,
    ...TypeScale.display.lg,
    letterSpacing: -2,
    lineHeight:    48,
  },
  wordmark: {
    color:         Colors.gray,
    ...TypeScale.label.md,
    letterSpacing: 5,
  },

  // ── Copy ────────────────────────────────────────────────────────────────────
  headline: {
    color:         Colors.white,
    ...TypeScale.display.xl,
    marginBottom:  Spacing[5],   // 20
  },
  subHeadline: {
    color: Colors.gray,
    ...TypeScale.body.lg,
  },

  // ── Pills ───────────────────────────────────────────────────────────────────
  pillsRow: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:            Spacing[2],  // 8
    marginTop:      Spacing[7],  // 28
  },
  pill: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[1],   // 4
    backgroundColor:  Colors.card,
    borderWidth:      1,
    borderColor:      Colors.cardBorder,
    borderRadius:     Radii.pill,
    paddingHorizontal: 12,
    paddingVertical:   8,
  },
  pillText: {
    color: Colors.gray,
    ...TypeScale.body.mdMedium,
  },

  // ── Layout ──────────────────────────────────────────────────────────────────
  spacer: { flex: 1 },
  ctas:   { gap: Spacing[4] },  // 16

  // ── Buttons ─────────────────────────────────────────────────────────────────
  primaryBtn: {
    backgroundColor: Colors.accent,
    borderRadius:    Radii.pill,
    width:           '100%',
  },
  primaryBtnInner: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:              Spacing[2],
    paddingVertical: 18,
  },
  primaryBtnText: {
    color:         Colors.onAccent,
    ...TypeScale.body.lgStrong,
    fontWeight:    '800',
  },
  secondaryBtn: {
    alignItems:     'center',
    paddingVertical: 10,
    minHeight:       Spacing.touchTarget,  // 44
    justifyContent:  'center',
  },
  secondaryBtnText: {
    color: Colors.gray,
    ...TypeScale.body.lg,
  },
  secondaryBtnLink: {
    color:      Colors.white,
    fontWeight: '600',
  },
});
