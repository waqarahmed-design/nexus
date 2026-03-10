import React, { useEffect, useRef } from 'react';
import {
  Animated, Text, View, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';
import { Icons } from '@/constants/Icons';
import { Icon } from '@/components/ui/Icon';

type HugeIconElement = React.ComponentProps<typeof Icon>['icon'];

interface CoachMarkProps {
  visible: boolean;
  icon: HugeIconElement;
  title: string;
  body: string;
  onDismiss: () => void;
  step?: number;
  totalSteps?: number;
  bottomOffset?: number;
}

export function CoachMark({
  visible,
  icon,
  title,
  body,
  onDismiss,
  step,
  totalSteps,
  bottomOffset = 100,
}: CoachMarkProps) {
  const translateY = useRef(new Animated.Value(180)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(180);
      opacity.setValue(0);
      scale.setValue(0.96);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 55,
          friction: 11,
          delay: 350,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
          delay: 350,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 55,
          friction: 11,
          delay: 350,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 180,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View
      style={[
        s.wrap,
        {
          bottom: bottomOffset,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={s.content}>
        <View style={s.iconWrap}>
          <Icon icon={icon} size={22} color={Colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.body}>{body}</Text>
        </View>
        {step !== undefined && totalSteps !== undefined && (
          <Text style={s.stepCount}>{step}/{totalSteps}</Text>
        )}
      </View>

      <TouchableOpacity style={s.btn} onPress={onDismiss} activeOpacity={0.85}>
        <Text style={s.btnText}>Got it</Text>
        <Icon icon={Icons.tick} size={15} color={Colors.onAccent} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position:        'absolute',
    left:            Spacing[4],   // 16
    right:           Spacing[4],   // 16
    backgroundColor: Colors.card,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    borderRadius:    Radii.card,   // 20
    padding:         Spacing[4],   // 16
    gap:             Spacing[3],   // 12
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 8 },
    shadowOpacity:   0.5,
    shadowRadius:    24,
    elevation:       14,
    zIndex:          998,
  },
  content: {
    flexDirection: 'row',
    alignItems:    'flex-start',
    gap:            Spacing[3],  // 12
  },
  iconWrap: {
    width:           Spacing.touchTarget,  // 44
    height:          Spacing.touchTarget,  // 44
    borderRadius:    Radii.input,          // 12
    backgroundColor: Colors.cardElevated,
    borderWidth:     1,
    borderColor:     Colors.cardBorder,
    alignItems:      'center',
    justifyContent:  'center',
    flexShrink:      0,
  },
  title: {
    color:         Colors.white,
    ...TypeScale.body.lgStrong,
    fontWeight:    '800',
    marginBottom:  Spacing[1],   // 4
    letterSpacing: -0.2,
  },
  body: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },
  stepCount: {
    color:       Colors.gray,
    ...TypeScale.body.md,
    fontWeight:  '700',
    letterSpacing: 0.5,
    alignSelf:   'flex-start',
    marginTop:    Spacing[1],   // 4
    flexShrink:   0,
  },
  btn: {
    backgroundColor: Colors.accent,
    borderRadius:    Radii.pill,
    paddingVertical: 13,
    flexDirection:   'row',
    alignItems:      'center',
    justifyContent:  'center',
    gap:              Spacing[1],  // 4
  },
  btnText: {
    color:      Colors.onAccent,
    ...TypeScale.body.lgStrong,
    fontWeight: '800',
  },
});
