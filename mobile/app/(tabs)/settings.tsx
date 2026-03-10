import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Switch, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { BottomFade, Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Badge';
import { EXCHANGES, formatUSD, TOTAL_PORTFOLIO } from '@/data/mockData';

type HugeIconElement = React.ComponentProps<typeof Icon>['icon'];

// ─── Row with press scale feedback ────────────────────────────────────────────

function Row({
  icon, label, value, onPress, danger, toggle, toggleValue,
}: {
  icon: HugeIconElement; label: string; value?: string;
  onPress?: () => void; danger?: boolean; toggle?: boolean; toggleValue?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    if (!onPress) return;
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
  }
  function onPressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();
  }

  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={onPress ? 1 : 1}
      disabled={!onPress && !toggle}
    >
      <Animated.View
        style={[
          s.rowInner,
          { transform: [{ scale }] },
        ]}
      >
        <View style={[s.rowIcon, danger && s.rowIconDanger]}>
          <Icon icon={icon} size={16} color={danger ? Colors.red : Colors.gray} />
        </View>
        <Text style={[s.rowLabel, danger && { color: Colors.red }]}>{label}</Text>
        {value && <Text style={s.rowValue}>{value}</Text>}
        {toggle && (
          <Switch
            value={toggleValue}
            thumbColor={Colors.white}
            trackColor={{ true: Colors.cardBorder, false: Colors.muted }}
          />
        )}
        {onPress && !toggle && (
          <Icon icon={Icons.chevronRight} size={16} color={Colors.gray} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ title, children, enterAnim }: {
  title: string;
  children: React.ReactNode;
  enterAnim: { opacity: Animated.Value; translateY: Animated.Value };
}) {
  return (
    <Animated.View
      style={[
        s.section,
        { opacity: enterAnim.opacity, transform: [{ translateY: enterAnim.translateY }] },
      ]}
    >
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={s.sectionCard}>{children}</View>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  // ── Entrance animations ──────────────────────────────────────────────────────
  const headerOp  = useRef(new Animated.Value(0)).current;
  const headerY   = useRef(new Animated.Value(-8)).current;
  const profileOp = useRef(new Animated.Value(0)).current;
  const profileY  = useRef(new Animated.Value(20)).current;
  const summaryOp = useRef(new Animated.Value(0)).current;
  const summaryY  = useRef(new Animated.Value(16)).current;

  // Per-section animations
  const sectionAnims = useRef([
    { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
    { opacity: new Animated.Value(0), translateY: new Animated.Value(20) },
  ]).current;

  const signOutOp = useRef(new Animated.Value(0)).current;
  const signOutY  = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.sequence([
      // Header
      Animated.parallel([
        Animated.timing(headerOp, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(headerY,  { toValue: 0, duration: 200, useNativeDriver: true, easing: ease }),
      ]),
      // Profile card
      Animated.parallel([
        Animated.timing(profileOp, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.spring(profileY,  { toValue: 0, useNativeDriver: true, tension: 65, friction: 12 }),
      ]),
      // Summary row
      Animated.parallel([
        Animated.timing(summaryOp, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(summaryY,  { toValue: 0, duration: 220, useNativeDriver: true, easing: ease }),
      ]),
      // Sections stagger
      Animated.stagger(
        50,
        sectionAnims.map(({ opacity, translateY }) =>
          Animated.parallel([
            Animated.timing(opacity,    { toValue: 1, duration: 240, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true, easing: ease }),
          ])
        )
      ),
      // Sign out button
      Animated.parallel([
        Animated.timing(signOutOp, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(signOutY,  { toValue: 0, duration: 200, useNativeDriver: true, easing: ease }),
      ]),
    ]).start();
  }, []);

  // Sign-out button press scale
  const signOutScale = useRef(new Animated.Value(1)).current;
  function signOutPressIn() {
    Animated.spring(signOutScale, { toValue: 0.96, useNativeDriver: true, tension: 300, friction: 10 }).start();
  }
  function signOutPressOut() {
    Animated.spring(signOutScale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 8 }).start();
  }

  return (
    <View style={[s.screen, { paddingTop: insets.top }]}>
      <Animated.View
        style={[
          s.header,
          { opacity: headerOp, transform: [{ translateY: headerY }] },
        ]}
      >
        <Text style={s.headerTitle}>Settings</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 88 }]}
      >
        {/* Profile card */}
        <Animated.View
          style={[
            s.profileCard,
            { opacity: profileOp, transform: [{ translateY: profileY }] },
          ]}
        >
          <View style={s.avatar}>
            <Text style={s.avatarText}>A</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>Alex</Text>
            <Text style={s.profileEmail}>alex@example.com</Text>
          </View>
          <Badge variant="tag" label="PRO" />
        </Animated.View>

        {/* Portfolio summary */}
        <Animated.View
          style={[
            s.summaryRow,
            { opacity: summaryOp, transform: [{ translateY: summaryY }] },
          ]}
        >
          {[
            { label: 'TOTAL VALUE', value: formatUSD(TOTAL_PORTFOLIO.valueUSD) },
            { label: 'EXCHANGES',   value: `${EXCHANGES.length}` },
            { label: 'TODAY',       value: `+${TOTAL_PORTFOLIO.change24hPercent.toFixed(1)}%` },
          ].map((item, i) => (
            <React.Fragment key={item.label}>
              {i > 0 && <View style={s.summaryDivider} />}
              <View style={s.summaryItem}>
                <Text style={s.summaryValue}>{item.value}</Text>
                <Text style={s.summaryLabel}>{item.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </Animated.View>

        <Section title="EXCHANGES" enterAnim={sectionAnims[0]}>
          {EXCHANGES.map((exc, i) => (
            <View key={exc.id}>
              <TouchableOpacity
                style={s.row}
                onPress={() => router.push(`/exchange/${exc.id}`)}
                activeOpacity={0.75}
              >
                <View style={s.rowInner}>
                  <View style={s.excInitialWrap}>
                    <Text style={[s.excInitial, { color: exc.color }]}>{exc.name[0]}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowLabel}>{exc.name}</Text>
                    <Text style={s.rowSub}>{formatUSD(exc.totalValueUSD)} · {exc.assetsCount} assets</Text>
                  </View>
                  <Badge variant="status" label="Active" />
                </View>
              </TouchableOpacity>
              {i < EXCHANGES.length - 1 && <View style={s.rowDivider} />}
            </View>
          ))}
        </Section>

        <Section title="SECURITY" enterAnim={sectionAnims[1]}>
          <Row icon={Icons.fingerprint} label="Biometric Lock" toggle toggleValue={false} />
          <View style={s.rowDivider} />
          <Row icon={Icons.key} label="Change Password" onPress={() => {}} />
          <View style={s.rowDivider} />
          <Row icon={Icons.shieldCheck} label="2FA Authentication" value="Disabled" onPress={() => {}} />
        </Section>

        <Section title="PREFERENCES" enterAnim={sectionAnims[2]}>
          <Row icon={Icons.money} label="Display Currency" value="USD" onPress={() => {}} />
          <View style={s.rowDivider} />
          <Row icon={Icons.notification} label="Price Alerts" value="Off" onPress={() => {}} />
          <View style={s.rowDivider} />
          <Row icon={Icons.refresh} label="Sync Frequency" value="60s" onPress={() => {}} />
        </Section>

        <Section title="ABOUT" enterAnim={sectionAnims[3]}>
          <Row icon={Icons.info} label="Privacy Policy" onPress={() => {}} />
          <View style={s.rowDivider} />
          <Row icon={Icons.document} label="Terms of Service" onPress={() => {}} />
          <View style={s.rowDivider} />
          <Row icon={Icons.code} label="Version" value="1.0.0" />
        </Section>

        <Animated.View
          style={{
            opacity:   signOutOp,
            transform: [{ translateY: signOutY }, { scale: signOutScale }],
          }}
        >
          <TouchableOpacity
            style={s.signOutBtn}
            onPress={() => router.replace('/(auth)/welcome')}
            onPressIn={signOutPressIn}
            onPressOut={signOutPressOut}
            activeOpacity={1}
          >
            <Icon icon={Icons.logout} size={18} color={Colors.white} />
            <Text style={s.signOutText}>Sign Out</Text>
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
  screen:     { flex: 1, backgroundColor: Colors.bg },
  bottomFade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 200 },

  header: {
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[2],
  },
  headerTitle: {
    color: Colors.white,
    ...TypeScale.title.md,
  },
  scroll: {
    paddingHorizontal: Spacing.screenH,
    gap:               Spacing[4],
    paddingTop:        Spacing[4],
  },

  // ── Profile ────────────────────────────────────────────────────────────────
  profileCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:              Spacing[3],
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    padding:         Spacing.cardPad,
  },
  avatar: {
    width:           52,
    height:          52,
    borderRadius:    26,
    backgroundColor: Colors.cardElevated,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    alignItems:      'center',
    justifyContent:  'center',
  },
  avatarText: {
    color:      Colors.white,
    fontSize:   24,
    fontWeight: '900',
  },
  profileInfo: { flex: 1 },
  profileName: {
    color:        Colors.white,
    fontSize:     16,
    fontWeight:   '800',
    marginBottom: Spacing[1],
  },
  profileEmail: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  // ── Summary row ────────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection:   'row',
    backgroundColor: Colors.card,
    borderRadius:    Radii.cardSM,
    paddingVertical: Spacing[4],
  },
  summaryItem:    { flex: 1, alignItems: 'center', gap: Spacing[1] },
  summaryDivider: { width: 1, backgroundColor: Colors.cardBorder },
  summaryValue: {
    color: Colors.white,
    ...TypeScale.serifNumeric.md,
  },
  summaryLabel: {
    color: Colors.gray,
    ...TypeScale.label.sm,
  },

  // ── Section ────────────────────────────────────────────────────────────────
  section: { gap: Spacing[2] },
  sectionTitle: {
    color: Colors.gray,
    ...TypeScale.label.md,
    marginLeft: Spacing[1],
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.cardSM,
    overflow:        'hidden',
  },

  // ── Row ────────────────────────────────────────────────────────────────────
  row: {
    minHeight: Spacing.touchTarget,
  },
  rowInner: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[3],
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   Spacing[3],
    minHeight:         Spacing.touchTarget,
  },
  rowIcon: {
    width:           34,
    height:          34,
    borderRadius:    Radii.inner,
    backgroundColor: Colors.cardElevated,
    alignItems:      'center',
    justifyContent:  'center',
  },
  rowIconDanger: { backgroundColor: Colors.redDim },
  rowLabel: {
    flex:       1,
    color:      Colors.white,
    ...TypeScale.body.lgStrong,
    fontWeight: '600',
  },
  rowSub: {
    color:     Colors.gray,
    ...TypeScale.body.md,
    marginTop: 1,
  },
  rowValue: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },
  rowDivider: { height: 1, backgroundColor: Colors.cardBorder, marginLeft: 62 },

  // ── Exchange rows ──────────────────────────────────────────────────────────
  excInitialWrap: {
    width:          34,
    height:         34,
    alignItems:     'center',
    justifyContent: 'center',
  },
  excInitial: { fontSize: 20, fontWeight: '900' },

  // ── Sign out ───────────────────────────────────────────────────────────────
  signOutBtn: {
    backgroundColor: Colors.red,
    borderRadius:    Radii.pill,
    paddingVertical: 16,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:              Spacing[2],
  },
  signOutText: {
    color:      Colors.white,
    ...TypeScale.body.lgStrong,
    fontWeight: '800',
  },
});
