import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ScrollView,
  Animated, Easing,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { useApp } from '@/contexts/AppContext';

type Tab = 'signin' | 'signup';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signUp, signIn } = useApp();
  const [tab, setTab]           = useState<Tab>('signup');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  // ── Entrance animations ──────────────────────────────────────────────────────
  const headerY   = useRef(new Animated.Value(24)).current;
  const headerOp  = useRef(new Animated.Value(0)).current;
  const tabBarY   = useRef(new Animated.Value(16)).current;
  const tabBarOp  = useRef(new Animated.Value(0)).current;
  const formY     = useRef(new Animated.Value(20)).current;
  const formOp    = useRef(new Animated.Value(0)).current;
  const trustY    = useRef(new Animated.Value(12)).current;
  const trustOp   = useRef(new Animated.Value(0)).current;

  // ── Confirm field slide animation (signup only) ──────────────────────────────
  const confirmHeight = useRef(new Animated.Value(tab === 'signup' ? 1 : 0)).current;
  const confirmOp     = useRef(new Animated.Value(tab === 'signup' ? 1 : 0)).current;

  useEffect(() => {
    const ease = Easing.out(Easing.cubic);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerY,  { toValue: 0, duration: 280, useNativeDriver: true, easing: ease }),
        Animated.timing(headerOp, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(tabBarY,  { toValue: 0, duration: 220, useNativeDriver: true, easing: ease }),
        Animated.timing(tabBarOp, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(formY,  { toValue: 0, duration: 260, useNativeDriver: true, easing: ease }),
        Animated.timing(formOp, { toValue: 1, duration: 260, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(trustY,  { toValue: 0, duration: 200, useNativeDriver: true, easing: ease }),
        Animated.timing(trustOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Handle tab switch — animate confirm field in/out
  function handleTabChange(t: Tab) {
    setTab(t);
    const showing = t === 'signup';
    Animated.parallel([
      Animated.timing(confirmHeight, {
        toValue:         showing ? 1 : 0,
        duration:        240,
        useNativeDriver: false,   // height is not natively animatable
        easing:          Easing.out(Easing.cubic),
      }),
      Animated.timing(confirmOp, {
        toValue:         showing ? 1 : 0,
        duration:        200,
        useNativeDriver: false,
      }),
    ]).start();
  }

  // Map 0→1 to 0→76 (input height ~76px including label + input + gap)
  const confirmMaxHeight = confirmHeight.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, 80],
    extrapolate: 'clamp',
  });

  function handleSubmit() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === 'signup') {
        signUp();
      } else {
        signIn();
      }
      router.replace('/(tabs)');
    }, 900);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          s.scroll,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Button
          variant="icon"
          icon={Icons.back}
          bordered
          onPress={() => router.back()}
          accessibilityLabel="Go back"
        />

        {/* Header */}
        <Animated.View
          style={[
            s.header,
            { opacity: headerOp, transform: [{ translateY: headerY }] },
          ]}
        >
          <View style={s.logoMark}>
            <Text style={s.logoChar}>N</Text>
          </View>
          <Text style={s.wordmark}>NEXUS</Text>
          <Text style={s.tagline}>Your portfolio, unified.</Text>
        </Animated.View>

        {/* Tab switcher */}
        <Animated.View
          style={[
            s.tabBar,
            { opacity: tabBarOp, transform: [{ translateY: tabBarY }] },
          ]}
        >
          {(['signup', 'signin'] as Tab[]).map((t) => (
            <TouchableOpacity
              key={t}
              style={[s.tabItem, tab === t && s.tabItemActive]}
              onPress={() => handleTabChange(t)}
              activeOpacity={0.8}
            >
              <Text style={[s.tabLabel, tab === t && s.tabLabelActive]}>
                {t === 'signup' ? 'Create account' : 'Sign in'}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Form */}
        <Animated.View
          style={[
            s.form,
            { opacity: formOp, transform: [{ translateY: formY }] },
          ]}
        >
          <Input
            label="EMAIL"
            leadingIcon={Icons.mail}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="PASSWORD"
            leadingIcon={Icons.lock}
            value={password}
            onChangeText={setPassword}
            placeholder={tab === 'signup' ? 'Min. 8 characters' : '••••••••'}
            secure
          />

          {/* Confirm password — animated height in/out on tab switch */}
          <Animated.View
            style={{
              height:   confirmMaxHeight,
              opacity:  confirmOp,
              overflow: 'hidden',
            }}
          >
            <Input
              label="CONFIRM PASSWORD"
              leadingIcon={Icons.lock}
              value={confirm}
              onChangeText={setConfirm}
              placeholder="Repeat password"
              secure
            />
          </Animated.View>

          <Button
            variant="primary"
            label={tab === 'signup' ? 'Create Account' : 'Sign In'}
            icon={Icons.forward}
            onPress={handleSubmit}
            loading={loading}
            accessibilityLabel={tab === 'signup' ? 'Create account' : 'Sign in'}
          />
        </Animated.View>

        {/* Trust note */}
        <Animated.View
          style={[
            s.trust,
            { opacity: trustOp, transform: [{ translateY: trustY }] },
          ]}
        >
          <Icon icon={Icons.shieldCheck} size={12} color={Colors.gray} />
          <Text style={s.trustText}>Read-only · AES-256 encrypted · Never trades your funds</Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  scroll: { flexGrow: 1, paddingHorizontal: Spacing[7], gap: Spacing[7] },  // 28

  header: { alignItems: 'center', gap: Spacing[2], paddingVertical: Spacing[2] },
  logoMark: {
    width:           56,
    height:          56,
    borderRadius:    Radii.cardSM,
    backgroundColor: Colors.card,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    alignItems:      'center',
    justifyContent:  'center',
  },
  logoChar: {
    color: Colors.white,
    ...TypeScale.title.lg,
  },
  wordmark: {
    color:         Colors.white,
    ...TypeScale.title.sm,
    letterSpacing: 4,
  },
  tagline: {
    color: Colors.gray,
    ...TypeScale.body.lg,
  },

  tabBar: {
    flexDirection:   'row',
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    padding:          Spacing[1],  // 4
  },
  tabItem: {
    flex:          1,
    paddingVertical: 12,
    borderRadius:  Radii.input,
    alignItems:    'center',
  },
  tabItemActive: {
    backgroundColor: Colors.cardElevated,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
  },
  tabLabel: {
    color: Colors.gray,
    ...TypeScale.body.mdMedium,
  },
  tabLabelActive: {
    color:      Colors.white,
    fontWeight: '700',
  },

  form: { gap: Spacing[4] },  // 16

  trust: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:             Spacing[1],   // 4
  },
  trustText: {
    color:     Colors.gray,
    ...TypeScale.body.md,
    textAlign: 'center',
  },
});
