import React, { useRef } from 'react';
import { Tabs } from 'expo-router';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, LayoutChangeEvent, Easing,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';

const TABS = [
  { name: 'index',     label: 'Portfolio', icon: Icons.portfolio },
  { name: 'exchanges', label: 'Exchanges', icon: Icons.exchanges  },
  { name: 'settings',  label: 'Settings',  icon: Icons.settings   },
];

function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  const slideX     = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const initialized = useRef(false);

  // Update synchronously in render body — onLayout closures always read the current index
  const activeIndex = useRef(state.index);
  activeIndex.current = state.index;

  function onTabLayout(index: number, e: LayoutChangeEvent) {
    if (index !== activeIndex.current) return;

    const { x, width } = e.nativeEvent.layout;

    if (!initialized.current) {
      slideX.setValue(x);
      slideWidth.setValue(width);
      initialized.current = true;
      return;
    }

    Animated.parallel([
      Animated.timing(slideX, {
        toValue: x,
        duration: 260,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideWidth, {
        toValue: width,
        duration: 260,
        useNativeDriver: false,
        easing: Easing.out(Easing.cubic),
      }),
    ]).start();
  }

  return (
    <View style={[s.barOuter, { paddingBottom: insets.bottom + 10 }]} pointerEvents="box-none">
      <BlurView intensity={55} tint="dark" style={s.bar}>

        {/* Sliding pill indicator */}
        <Animated.View style={[s.slider, { left: slideX, width: slideWidth }]} />

        {TABS.map((tab, i) => {
          const focused = state.index === i;
          return (
            <TouchableOpacity
              key={tab.name}
              style={s.tabBtn}
              onLayout={e => onTabLayout(i, e)}
              onPress={() => navigation.navigate(state.routes[i].name)}
              activeOpacity={0.8}
            >
              <Icon
                icon={tab.icon}
                size={18}
                color={focused ? Colors.accent : Colors.gray}
                strokeWidth={focused ? 2 : 1.5}
              />
              {focused && (
                <Text style={s.label}>{tab.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}

      </BlurView>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="exchanges" />
      <Tabs.Screen name="settings" />
    </Tabs>
  );
}

const s = StyleSheet.create({
  barOuter: {
    position:  'absolute',
    bottom:    0,
    left:      0,
    right:     0,
    paddingTop: Spacing[2],   // 8
    alignItems: 'center',
  },

  bar: {
    flexDirection:   'row',
    alignItems:      'center',
    alignSelf:       'center',
    borderRadius:    Radii.pill,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    paddingVertical:  Spacing[1],   // 4
    paddingHorizontal: Spacing[1],  // 4
    overflow:        'hidden',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.5,
    shadowRadius:    12,
    elevation:       10,
  },

  slider: {
    position:        'absolute',
    top:             Spacing[1],   // 4
    bottom:          Spacing[1],   // 4
    borderRadius:    Radii.pill,
    backgroundColor: Colors.cardElevated,
    borderWidth:     1,
    borderColor:     Colors.accentBorder,
  },

  tabBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:              Spacing[2],   // 8
    paddingHorizontal: 18,
    paddingVertical:   10,
    borderRadius:    Radii.pill,
  },

  label: {
    color:      Colors.accent,
    ...TypeScale.body.mdMedium,
  },
});
