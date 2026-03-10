import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { TypeScale } from '@/constants/Typography';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const translateY = useRef(new Animated.Value(60)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(60);
      opacity.setValue(0);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 12,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 60,
            duration: 260,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => onHide());
      }, 2800);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[s.toast, { transform: [{ translateY }], opacity }]}>
      <Text style={s.message}>{message}</Text>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  toast: {
    position:          'absolute',
    bottom:            108,
    alignSelf:         'center',
    backgroundColor:   Colors.cardElevated,
    borderWidth:       1,
    borderColor:       Colors.cardBorder,
    borderRadius:      Radii.pill,
    paddingHorizontal: Spacing[5],   // 20
    paddingVertical:   Spacing[2],   // 8
    shadowColor:       '#000',
    shadowOffset:      { width: 0, height: 4 },
    shadowOpacity:     0.3,
    shadowRadius:      8,
    elevation:         8,
    zIndex:            9999,
  },
  message: {
    color: Colors.gray,
    ...TypeScale.body.md,
  },
});
