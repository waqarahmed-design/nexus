import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, ActivityIndicator,
  Animated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { BottomFade, Radii, Spacing } from '@/constants/Spacing';
import { FontFamily, TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ExchangeLogo } from '@/components/ExchangeLogo';
import { useApp } from '@/contexts/AppContext';

const { width } = Dimensions.get('window');

const EXCHANGES = [
  { id: 'binance',  name: 'Binance',  color: Colors.excBinance,  colorDim: Colors.excBinanceDim,  region: 'Global' },
  { id: 'coinbase', name: 'Coinbase', color: Colors.excCoinbase, colorDim: Colors.excCoinbaseDim, region: 'US & Global' },
  { id: 'kraken',   name: 'Kraken',   color: Colors.excKraken,   colorDim: Colors.excKrakenDim,   region: 'Global' },
  { id: 'okx',      name: 'OKX',      color: Colors.excOKX,      colorDim: Colors.excOKXDim,      region: 'Global (not US)' },
  { id: 'bybit',    name: 'Bybit',    color: Colors.excBybit,    colorDim: Colors.excBybitDim,    region: 'Global' },
  { id: 'kucoin',   name: 'KuCoin',   color: Colors.excKuCoin,   colorDim: Colors.excKuCoinDim,   region: 'Global' },
  { id: 'gateio',   name: 'Gate.io',  color: Colors.excGateIO,   colorDim: Colors.excGateIODim,   region: 'Global' },
  { id: 'mexc',     name: 'MEXC',     color: Colors.excMEXC,     colorDim: Colors.excMEXCDim,     region: 'Global' },
];

const HOW_TO_STEPS: Record<string, string[]> = {
  binance:  ['Log in and go to Account', 'Open API Management', 'Tap Create API and label it "Nexus"', 'Enable "Read Info" only — disable everything else', 'Save and copy both values below'],
  coinbase: ['Log in and go to Settings', 'Open the API section', 'Tap New API Key', 'Set Permissions to "View" only', 'Copy the key and secret below'],
  kraken:   ['Log in and go to Security', 'Open API and tap Add Key', 'Check "Query Funds" only', 'Leave all trading permissions unchecked', 'Generate the key and copy both values'],
  okx:      ['Log in and go to Account', 'Open API and tap Create API Key', 'Set a label: "Nexus"', 'Choose Read Only as the permission level', 'Confirm and copy both values below'],
  bybit:    ['Log in and go to Account', 'Open API Management', 'Tap Create New Key, choose Standard API Key', 'Set permissions to Read-Only', 'Submit and copy both values below'],
  kucoin:   ['Log in and go to Account', 'Open API Management', 'Tap Create API and label it "Nexus"', 'Select General (read-only) permissions', 'Save and copy both values below'],
  gateio:   ['Log in and go to API Management', 'Tap Create API Key', 'Set a label: "Nexus"', 'Enable Read Only permissions only', 'Submit and copy both values below'],
  mexc:     ['Log in and go to Account', 'Open API Management', 'Tap Create API Key', 'Select Read Only permissions', 'Submit and copy both values below'],
};

const PERMISSIONS: Record<string, { enable: string; disable: string }> = {
  binance:  { enable: 'Read Info',      disable: 'Spot Trading, Withdrawals, Futures' },
  coinbase: { enable: 'View (read)',    disable: 'Send, Buy, Trade' },
  kraken:   { enable: 'Query Funds',   disable: 'Create Orders, Withdraw Funds' },
  okx:      { enable: 'Read Only',     disable: 'Trade, Withdraw' },
  bybit:    { enable: 'Read-Only',     disable: 'Trade, Transfer' },
  kucoin:   { enable: 'General (read)', disable: 'Trade, Transfer, Withdraw' },
  gateio:   { enable: 'Read Only',     disable: 'Spot Trade, Withdraw' },
  mexc:     { enable: 'Read Only',     disable: 'Trade, Withdraw' },
};

type Step = 'choose' | 'credentials' | 'connecting' | 'success';

const CONNECT_STEPS = [
  { label: 'Verifying API key',    duration: 900 },
  { label: 'Checking permissions', duration: 700 },
  { label: 'Syncing portfolio',    duration: 1100 },
];

// ─── Particle for success burst ───────────────────────────────────────────────
interface ParticleConfig {
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  color: string;
}

const PARTICLE_COLORS = [Colors.accent, Colors.green, Colors.white, Colors.excBinance, Colors.excCoinbase];

function createParticles(count: number): ParticleConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    x:       new Animated.Value(0),
    y:       new Animated.Value(0),
    opacity: new Animated.Value(0),
    scale:   new Animated.Value(0),
    color:   PARTICLE_COLORS[i % PARTICLE_COLORS.length],
  }));
}

// ─── Exchange list item with press scale ──────────────────────────────────────
function ExchangeListItem({ exc, onPress }: { exc: typeof EXCHANGES[0]; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, tension: 300, friction: 10 }).start();
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
    >
      <Animated.View style={[s.excCard, { transform: [{ scale }] }]}>
        <View style={s.excLogoWrap}>
          <ExchangeLogo
            exchangeId={exc.id}
            color={Colors.gray}
            colorDim={Colors.muted}
            size={28}
            noContainer
          />
        </View>
        <View style={s.excInfo}>
          <Text style={s.excName}>{exc.name}</Text>
          <Text style={s.excRegion}>{exc.region}</Text>
        </View>
        <Icon icon={Icons.chevronRight} size={16} color={Colors.gray} />
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Success screen with animated checkmark + particle burst ──────────────────
function SuccessStep({ selected, onGoToDashboard, onAddAnother }: {
  selected: typeof EXCHANGES[0];
  onGoToDashboard: () => void;
  onAddAnother: () => void;
}) {
  // Orb: scale + fade in
  const orbScale   = useRef(new Animated.Value(0.4)).current;
  const orbOpacity = useRef(new Animated.Value(0)).current;

  // Checkmark badge: scale spring in after orb
  const checkScale   = useRef(new Animated.Value(0)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;

  // Text block slide up
  const textY  = useRef(new Animated.Value(20)).current;
  const textOp = useRef(new Animated.Value(0)).current;

  // Stats row
  const statsY  = useRef(new Animated.Value(16)).current;
  const statsOp = useRef(new Animated.Value(0)).current;

  // Buttons
  const btnsY  = useRef(new Animated.Value(12)).current;
  const btnsOp = useRef(new Animated.Value(0)).current;

  // Particles — 12 particles burst out from checkmark
  const PARTICLE_COUNT = 12;
  const particles = useRef(createParticles(PARTICLE_COUNT)).current;

  // Glow pulse (looping)
  const glowPulse = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    // 1. Orb springs in
    Animated.parallel([
      Animated.spring(orbScale,   { toValue: 1, useNativeDriver: true, tension: 65, friction: 9 }),
      Animated.timing(orbOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start(() => {
      // 2. Checkmark pops in with overshoot spring
      Animated.parallel([
        Animated.spring(checkScale,   { toValue: 1, useNativeDriver: true, tension: 200, friction: 6 }),
        Animated.timing(checkOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start(() => {
        // 3. Particle burst
        const particleAnims = particles.map((p, i) => {
          const angle  = (i / PARTICLE_COUNT) * Math.PI * 2;
          const radius = 55 + Math.random() * 35;
          const tx = Math.cos(angle) * radius;
          const ty = Math.sin(angle) * radius;

          return Animated.parallel([
            Animated.timing(p.opacity, { toValue: 1, duration: 80, useNativeDriver: false }),
            Animated.timing(p.scale,   { toValue: 1, duration: 80, useNativeDriver: false }),
            Animated.sequence([
              Animated.parallel([
                Animated.timing(p.x, { toValue: tx,   duration: 380, useNativeDriver: false, easing: Easing.out(Easing.cubic) }),
                Animated.timing(p.y, { toValue: ty,   duration: 380, useNativeDriver: false, easing: Easing.out(Easing.cubic) }),
              ]),
              Animated.parallel([
                Animated.timing(p.opacity, { toValue: 0, duration: 220, useNativeDriver: false }),
                Animated.timing(p.scale,   { toValue: 0, duration: 220, useNativeDriver: false }),
              ]),
            ]),
          ]);
        });

        Animated.parallel(particleAnims).start();
      });

      // 4. Text + stats + buttons cascade after orb
      Animated.sequence([
        Animated.parallel([
          Animated.timing(textY,  { toValue: 0, duration: 260, useNativeDriver: true, easing: ease }),
          Animated.timing(textOp, { toValue: 1, duration: 260, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(statsY,  { toValue: 0, duration: 220, useNativeDriver: true, easing: ease }),
          Animated.timing(statsOp, { toValue: 1, duration: 220, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(btnsY,  { toValue: 0, duration: 200, useNativeDriver: true, easing: ease }),
          Animated.timing(btnsOp, { toValue: 1, duration: 200, useNativeDriver: true }),
        ]),
      ]).start();
    });

    // Glow pulse loop
    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1,   duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(glowPulse, { toValue: 0.6, duration: 1800, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    pulseAnim.start();
    return () => { pulseAnim.stop(); };
  }, []);

  return (
    <View style={s.centeredScreen}>
      {/* Ambient glow behind orb */}
      <Animated.View
        style={[
          s.successGlow,
          {
            backgroundColor: selected.colorDim,
            opacity: glowPulse,
          },
        ]}
      />

      {/* Orb + checkmark + particles */}
      <View style={s.successOrbContainer}>
        {/* Particle layer */}
        {particles.map((p, i) => (
          <Animated.View
            key={i}
            style={[
              s.particle,
              {
                backgroundColor: p.color,
                opacity:   p.opacity,
                transform: [
                  { translateX: p.x },
                  { translateY: p.y },
                  { scale: p.scale },
                ],
              },
            ]}
          />
        ))}

        {/* Orb */}
        <Animated.View
          style={[
            s.successOrb,
            {
              backgroundColor: selected.colorDim,
              opacity:   orbOpacity,
              transform: [{ scale: orbScale }],
            },
          ]}
        >
          <ExchangeLogo
            exchangeId={selected.id}
            color={Colors.gray}
            colorDim={Colors.muted}
            size={52}
            noContainer
          />
        </Animated.View>

        {/* Checkmark badge */}
        <Animated.View
          style={[
            s.successCheck,
            {
              opacity:   checkOpacity,
              transform: [{ scale: checkScale }],
            },
          ]}
        >
          <Icon icon={Icons.tick} size={14} color={Colors.onAccent} />
        </Animated.View>
      </View>

      {/* Text */}
      <Animated.View
        style={[
          s.successTextBlock,
          { opacity: textOp, transform: [{ translateY: textY }] },
        ]}
      >
        <Text style={s.successTitle}>{selected.name} connected</Text>
        <Text style={s.successSub}>
          Your portfolio is syncing now. It will be ready in a few seconds.
        </Text>
      </Animated.View>

      {/* Stats */}
      <Animated.View
        style={[
          s.successStats,
          { opacity: statsOp, transform: [{ translateY: statsY }] },
        ]}
      >
        <View style={s.successStat}>
          <Text style={s.successStatValue}>Read-only</Text>
          <Text style={s.successStatLabel}>ACCESS LEVEL</Text>
        </View>
        <View style={s.successStatDivider} />
        <View style={s.successStat}>
          <Text style={s.successStatValue}>AES-256</Text>
          <Text style={s.successStatLabel}>ENCRYPTION</Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        style={[
          s.successBtns,
          { opacity: btnsOp, transform: [{ translateY: btnsY }] },
        ]}
      >
        <Button
          variant="primary"
          label="Go to Portfolio"
          icon={Icons.forward}
          onPress={onGoToDashboard}
        />
        <Button
          variant="ghost"
          label="Add another exchange"
          onPress={onAddAnother}
        />
      </Animated.View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AddExchangeScreen() {
  const insets = useSafeAreaInsets();
  const { addExchange, connectedExchanges } = useApp();
  const availableExchanges = EXCHANGES.filter((e) => !connectedExchanges.includes(e.id));
  const [step, setStep]                 = useState<Step>('choose');
  const [selected, setSelected]         = useState<typeof EXCHANGES[0] | null>(null);
  const [apiKey, setApiKey]             = useState('');
  const [apiSecret, setApiSecret]       = useState('');
  const [connectStep, setConnectStep]   = useState(0);
  const [connectLabel, setConnectLabel] = useState('');

  const canConnect = apiKey.trim().length > 0 && apiSecret.trim().length > 0;

  // ── Step transition: content fades when switching steps ────────────────────
  const contentOp = useRef(new Animated.Value(1)).current;

  function transitionTo(nextStep: Step) {
    Animated.timing(contentOp, {
      toValue:         0,
      duration:        120,
      useNativeDriver: true,
      easing:          Easing.out(Easing.cubic),
    }).start(() => {
      setStep(nextStep);
      Animated.timing(contentOp, {
        toValue:         1,
        duration:        200,
        useNativeDriver: true,
        easing:          Easing.out(Easing.cubic),
      }).start();
    });
  }

  function handleChoose(exc: typeof EXCHANGES[0]) {
    setSelected(exc);
    transitionTo('credentials');
  }

  function handleConnect() {
    transitionTo('connecting');
    setConnectStep(0);
    setConnectLabel(CONNECT_STEPS[0].label);

    let i = 0;
    function runStep() {
      if (i >= CONNECT_STEPS.length) {
        setStep('success');
        return;
      }
      setConnectStep(i);
      setConnectLabel(CONNECT_STEPS[i].label);
      setTimeout(() => {
        i++;
        runStep();
      }, CONNECT_STEPS[i]?.duration ?? 800);
    }
    setTimeout(runStep, 200);
  }

  // ── Connecting step dot animation ──────────────────────────────────────────
  const connectingDotScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (step !== 'connecting') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(connectingDotScale, { toValue: 1.3, duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
        Animated.timing(connectingDotScale, { toValue: 1,   duration: 600, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [step]);

  return (
    <View style={[s.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* ── Header ── */}
      <View style={s.header}>
        {step !== 'connecting' && step !== 'success' ? (
          <TouchableOpacity
            style={s.navBtn}
            onPress={() => step === 'credentials' ? transitionTo('choose') : router.back()}
            activeOpacity={0.7}
          >
            <Icon icon={Icons.back} size={20} color={Colors.gray} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: Spacing.touchTarget }} />
        )}

        <Text style={s.headerTitle}>
          {step === 'choose'      && 'Add Exchange'}
          {step === 'credentials' && selected?.name}
          {step === 'connecting'  && 'Connecting'}
          {step === 'success'     && 'Connected'}
        </Text>

        <View style={{ width: Spacing.touchTarget }} />
      </View>

      {/* ── Step content (fades on transition) ── */}
      <Animated.View style={[{ flex: 1 }, { opacity: contentOp }]}>

        {/* ══ Step: Choose exchange ══ */}
        {step === 'choose' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={s.scroll}
          >
            <Text style={s.stepTitle}>Choose an exchange</Text>
            <Text style={s.stepSub}>
              Connect via read-only API key. Nexus cannot trade or withdraw.
            </Text>

            {availableExchanges.length === 0 ? (
              <View style={s.emptyState}>
                <Icon icon={Icons.checkCircle} size={40} color={Colors.gray} />
                <Text style={s.emptyTitle}>All caught up</Text>
                <Text style={s.emptyText}>You've connected all supported exchanges.</Text>
              </View>
            ) : (
              <View style={s.exchangeList}>
                {availableExchanges.map((exc) => (
                  <ExchangeListItem
                    key={exc.id}
                    exc={exc}
                    onPress={() => handleChoose(exc)}
                  />
                ))}
              </View>
            )}

            <Card variant="info" icon={Icons.shieldCheck} text="All connections are read-only. Keys are encrypted with AES-256-GCM and never leave our servers." />
          </ScrollView>
        )}

        {/* ══ Step: Credentials ══ */}
        {step === 'credentials' && selected && (
          <View style={s.credentialsContainer}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={s.credentialsScroll}
              keyboardShouldPersistTaps="handled"
            >
              <View style={s.securityBadge}>
                <View style={s.securityBadgeIconWrap}>
                  <Icon icon={Icons.lock} size={14} color={Colors.green} />
                </View>
                <Text style={s.securityBadgeText}>
                  Read-only access only. Nexus cannot trade, withdraw, or modify your account.
                </Text>
              </View>

              <Text style={s.stepTitle}>API key setup</Text>
              <Text style={s.stepSub}>
                Create a read-only key on {selected.name}, then paste both values below.
              </Text>

              <View style={s.form}>
                <Input
                  label="API KEY"
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Paste your API key here"
                  showClear
                  mono
                  tooltip="From your exchange API management page"
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                  keyboardType="visible-password"
                />

                <Input
                  label="API SECRET"
                  value={apiSecret}
                  onChangeText={setApiSecret}
                  placeholder="Paste your API secret"
                  secure
                  mono
                  tooltip="Found next to your API key on the exchange"
                  labelAccessory={<Badge variant="tag" label="HIDDEN BY DEFAULT" />}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  autoComplete="off"
                />
              </View>

              <View style={s.instructionsCard}>
                <Text style={s.instructionsSectionLabel}>HOW TO CREATE YOUR KEY</Text>

                <View style={s.stepsList}>
                  {(HOW_TO_STEPS[selected.id] ?? []).map((text, index) => (
                    <View key={index} style={s.howToStep}>
                      <View style={s.howToStepNum}>
                        <Text style={s.howToStepNumText}>{index + 1}</Text>
                      </View>
                      <Text style={s.howToStepText}>{text}</Text>
                    </View>
                  ))}
                </View>

                <View style={s.instructionsDivider} />

                <View style={s.permissionsBlock}>
                  <View style={s.permissionRow}>
                    <View style={s.permissionIconWrap}>
                      <Icon icon={Icons.tick} size={12} color={Colors.green} />
                    </View>
                    <View style={s.permissionTextGroup}>
                      <Text style={[s.permissionAction, s.permissionActionEnable]}>ENABLE</Text>
                      <Text style={s.permissionValue}>{PERMISSIONS[selected.id]?.enable ?? 'Read Only'}</Text>
                    </View>
                  </View>

                  <View style={s.permissionRow}>
                    <View style={[s.permissionIconWrap, s.permissionIconWrapRed]}>
                      <Icon icon={Icons.close} size={12} color={Colors.red} />
                    </View>
                    <View style={s.permissionTextGroup}>
                      <Text style={[s.permissionAction, s.permissionActionDisable]}>DISABLE</Text>
                      <Text style={s.permissionValue}>{PERMISSIONS[selected.id]?.disable ?? 'Trading, Withdrawals'}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>

            <LinearGradient
              colors={BottomFade.colors as any}
              style={s.credentialsFade}
              pointerEvents="none"
            />

            <View style={s.floatingBtnWrap}>
              <Button
                variant="primary"
                label={`Connect ${selected.name}`}
                icon={Icons.forward}
                onPress={handleConnect}
                disabled={!canConnect}
              />
              <View style={s.footerTrust}>
                <Icon icon={Icons.lock} size={12} color={Colors.gray} />
                <Text style={s.footerTrustText}>Encrypted with AES-256-GCM before storage</Text>
              </View>
            </View>
          </View>
        )}

        {/* ══ Step: Connecting ══ */}
        {step === 'connecting' && (
          <View style={s.centeredScreen}>
            <Animated.View
              style={[
                s.connectingOrb,
                {
                  backgroundColor: selected?.colorDim,
                  transform: [{ scale: connectingDotScale }],
                },
              ]}
            >
              <ActivityIndicator size="large" color={selected?.color} />
            </Animated.View>

            <Text style={[s.connectingExcName, { color: selected?.color }]}>
              {selected?.name.toUpperCase()}
            </Text>

            <Text style={s.connectingLabel}>{connectLabel}</Text>

            <View style={s.connectingSteps}>
              {CONNECT_STEPS.map((cs, i) => {
                const isDone   = i < connectStep;
                const isActive = i === connectStep;
                return (
                  <View key={i} style={s.connectingStep}>
                    <View style={[
                      s.connectingDot,
                      isDone   && s.connectingDotDone,
                      isActive && s.connectingDotActive,
                    ]} />
                    <Text style={[
                      s.connectingStepText,
                      (isDone || isActive) && s.connectingStepTextActive,
                    ]}>
                      {cs.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* ══ Step: Success ══ */}
        {step === 'success' && selected && (
          <SuccessStep
            selected={selected}
            onGoToDashboard={() => {
              addExchange(selected.id);
              router.replace('/(tabs)');
            }}
            onAddAnother={() => {
              setStep('choose');
              setSelected(null);
              setApiKey('');
              setApiSecret('');
            }}
          />
        )}

      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    flexDirection:    'row',
    alignItems:       'center',
    justifyContent:   'space-between',
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[4],
    paddingBottom:     Spacing[3],
  },
  navBtn: {
    width:           Spacing.touchTarget,
    height:          Spacing.touchTarget,
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    alignItems:      'center',
    justifyContent:  'center',
  },
  headerTitle: {
    color: Colors.white,
    ...TypeScale.title.xs,
  },

  // ── Scroll ────────────────────────────────────────────────────────────────
  scroll: {
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[1],
    paddingBottom:     Spacing[8],
    gap:               Spacing[5],
  },
  credentialsContainer: { flex: 1 },
  credentialsScroll: {
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[1],
    paddingBottom:     Spacing[4],
    gap:               Spacing[5],
  },

  // ── Step header copy ─────────────────────────────────────────────────────
  stepTitle: {
    color:        Colors.white,
    ...TypeScale.title.sm,
    marginBottom: 0,
  },
  stepSub: {
    color:      Colors.gray,
    ...TypeScale.body.lg,
    lineHeight: 24,
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    alignItems:    'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap:            Spacing[3],
  },
  emptyTitle: {
    color:      Colors.white,
    fontSize:   16,
    fontWeight: '700',
  },
  emptyText: {
    color:     Colors.gray,
    ...TypeScale.body.lg,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Exchange list ─────────────────────────────────────────────────────────
  exchangeList: { gap: Spacing[1] },
  excCard: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: Colors.card,
    borderRadius:    Radii.card,
    padding:         Spacing.cardPad,
    gap:             Spacing[3],
  },
  excLogoWrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  excInfo:     { flex: 1, gap: Spacing[1] },
  excName: {
    color:         Colors.white,
    ...TypeScale.body.lgStrong,
    letterSpacing: -0.2,
  },
  excRegion: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },

  // ── Security badge ────────────────────────────────────────────────────────
  securityBadge: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:               Spacing[2],
    backgroundColor:  Colors.greenDim,
    borderRadius:     Radii.input,
    paddingVertical:  12,
    paddingHorizontal: Spacing.cardPad,
  },
  securityBadgeIconWrap: {
    width:           28,
    height:          28,
    borderRadius:    Radii.micro,
    backgroundColor: Colors.greenDim,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  securityBadgeText: {
    flex:       1,
    color:      Colors.green,
    ...TypeScale.body.md,
    fontWeight: '500',
  },

  // ── Form ──────────────────────────────────────────────────────────────────
  form: { gap: Spacing[3] },

  // ── Instructions card ─────────────────────────────────────────────────────
  instructionsCard: {
    backgroundColor:  Colors.card,
    borderRadius:     Radii.card,
    paddingTop:       Spacing.cardPad,
    paddingBottom:    Spacing.cardPad,
    paddingHorizontal: Spacing.cardPad,
    gap:              0,
  },
  instructionsSectionLabel: {
    ...TypeScale.label.md,
    color:        Colors.gray,
    marginBottom: Spacing[3],
    opacity:      0.7,
  },
  stepsList: { gap: Spacing[3] },
  howToStep: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:            Spacing[3],
  },
  howToStepNum: {
    width:           24,
    height:          24,
    borderRadius:    Radii.micro,
    backgroundColor: Colors.muted,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
    marginTop:       1,
  },
  howToStepNumText: {
    ...TypeScale.body.md,
    fontWeight: '700',
    color:      Colors.white,
    fontFamily: FontFamily.mono,
  },
  howToStepText: {
    flex:       1,
    color:      Colors.white,
    ...TypeScale.body.md,
    opacity:    0.6,
    lineHeight: 20,
  },
  instructionsDivider: {
    height:          1,
    backgroundColor: Colors.cardBorder,
    marginTop:       Spacing[4],
    marginBottom:    Spacing[4],
  },
  permissionsBlock: { gap: Spacing[3] },
  permissionRow: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:            Spacing[2],
  },
  permissionIconWrap: {
    width:           24,
    height:          24,
    borderRadius:    Radii.micro,
    backgroundColor: Colors.greenDim,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       1,
    flexShrink:      0,
  },
  permissionIconWrapRed: { backgroundColor: Colors.redDim },
  permissionTextGroup: { flex: 1, gap: Spacing[1] },
  permissionAction: {
    ...TypeScale.label.sm,
    color: Colors.gray,
  },
  permissionActionEnable:  { color: Colors.green },
  permissionActionDisable: { color: Colors.red },
  permissionValue: {
    color:      Colors.white,
    ...TypeScale.body.md,
    fontWeight: '500',
  },

  // ── Gradient + floating button ─────────────────────────────────────────────
  credentialsFade: {
    position: 'absolute',
    bottom: 96, left: 0, right: 0,
    height: 64,
  },
  floatingBtnWrap: {
    paddingHorizontal: Spacing.screenH,
    paddingTop:        Spacing[3],
    paddingBottom:     Spacing[2],
    gap:               Spacing[3],
    backgroundColor:   Colors.bg,
  },
  footerTrust: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:             Spacing[1],
  },
  footerTrustText: {
    color:   Colors.gray,
    ...TypeScale.body.md,
    opacity: 0.7,
  },

  // ── Shared centered layout ─────────────────────────────────────────────────
  centeredScreen: {
    flex:             1,
    alignItems:       'center',
    justifyContent:   'center',
    paddingHorizontal: 28,
    gap:               Spacing[5],
  },

  // ── Connecting ─────────────────────────────────────────────────────────────
  connectingOrb: {
    width:           112,
    height:          112,
    borderRadius:    56,
    alignItems:      'center',
    justifyContent:  'center',
    marginBottom:    Spacing[1],
  },
  connectingExcName: {
    ...TypeScale.label.md,
    letterSpacing: 3.5,
  },
  connectingLabel: {
    color:     Colors.white,
    ...TypeScale.body.lgStrong,
    textAlign: 'center',
  },
  connectingSteps: {
    gap:     Spacing[3],
    marginTop: Spacing[2],
    width:   '100%',
  },
  connectingStep: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            Spacing[3],
  },
  connectingDot: {
    width:           8,
    height:          8,
    borderRadius:    Radii.micro,
    backgroundColor: Colors.cardBorder,
  },
  connectingDotDone:   { backgroundColor: Colors.green },
  connectingDotActive: { backgroundColor: Colors.accent },
  connectingStepText:  { color: Colors.gray, ...TypeScale.body.lgStrong, fontWeight: '500' },
  connectingStepTextActive: { color: Colors.white },

  // ── Success ────────────────────────────────────────────────────────────────
  successGlow: {
    position:     'absolute',
    width:        240,
    height:       240,
    borderRadius: 120,
  },
  successOrbContainer: {
    width:          104,
    height:         104,
    alignItems:     'center',
    justifyContent: 'center',
    position:       'relative',
  },
  particle: {
    position:     'absolute',
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  successOrb: {
    width:          104,
    height:         104,
    borderRadius:   52,
    alignItems:     'center',
    justifyContent: 'center',
  },
  successCheck: {
    position:        'absolute',
    bottom:          2,
    right:           2,
    width:           28,
    height:          28,
    borderRadius:    14,
    backgroundColor: Colors.green,
    alignItems:      'center',
    justifyContent:  'center',
    borderWidth:     2.5,
    borderColor:     Colors.bg,
  },
  successTextBlock: { alignItems: 'center', gap: Spacing[2] },
  successTitle: {
    color:     Colors.white,
    ...TypeScale.title.md,
    textAlign: 'center',
  },
  successSub: {
    color:      Colors.gray,
    ...TypeScale.body.lg,
    textAlign:  'center',
    lineHeight: 24,
    maxWidth:   260,
  },
  successStats: {
    flexDirection:   'row',
    backgroundColor: Colors.card,
    borderRadius:    Radii.cardSM,
    paddingVertical: Spacing[4],
    width:           '100%',
  },
  successStat:        { flex: 1, alignItems: 'center', gap: Spacing[1] },
  successStatDivider: { width: 1, backgroundColor: Colors.cardBorder, alignSelf: 'stretch' },
  successStatValue: {
    color:      Colors.white,
    ...TypeScale.numeric.xs,
    fontWeight: '700',
  },
  successStatLabel: {
    color: Colors.gray,
    ...TypeScale.label.sm,
  },
  successBtns: {
    width: '100%',
    gap: Spacing[2],
  },
});
