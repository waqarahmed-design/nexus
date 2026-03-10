/**
 * Button — single component with variant prop
 *
 * Variants:
 *   primary  — accent fill, full width, dark text. Main screen CTA.
 *   ghost    — no fill, gray text. Secondary/tertiary actions.
 *   outline  — transparent fill, white border. Alternative CTA.
 *   icon     — 40×40 square container for nav/action icons.
 *
 * Sizes (primary/ghost/outline only):
 *   md  — paddingVertical 16, fontSize 16 (default)
 *   sm  — paddingVertical 12, fontSize 12
 *
 * Microinteractions:
 *   - Spring scale press feedback on all variants (0.96 on down, spring back on release)
 *   - Icon variant uses tighter spring for snappier nav feel
 *   - useNativeDriver: true — smooth 60fps on transforms
 */

import React, { useRef } from 'react';
import {
  Animated, Text, View,
  StyleSheet, ActivityIndicator, ViewStyle,
  Pressable,
} from 'react-native';
import { Icon } from './Icon';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { Icons, IconKey } from '@/constants/Icons';

type HugeIconElement = React.ComponentProps<typeof Icon>['icon'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ButtonProps {
  variant: 'primary' | 'ghost' | 'outline' | 'icon';

  /** Text label — required for primary/ghost/outline, unused for icon variant */
  label?: string;

  /** Icon — required for icon variant, optional trailing icon for primary */
  icon?: HugeIconElement;

  onPress: () => void;

  /** Size scale — applies to primary/ghost/outline only */
  size?: 'md' | 'sm';

  loading?: boolean;
  disabled?: boolean;

  /** icon variant only — adds a 1px border */
  bordered?: boolean;

  /** Width override — primary defaults to '100%' */
  width?: ViewStyle['width'];

  accessibilityLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Button({
  variant,
  label,
  icon,
  onPress,
  size = 'md',
  loading = false,
  disabled = false,
  bordered = false,
  width,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Spring scale animation — each Button gets its own Animated.Value via useRef
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: variant === 'icon' ? 0.90 : 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 200,
      friction: 8,
    }).start();
  }

  if (variant === 'icon') {
    return (
      <Pressable
        onPress={isDisabled ? undefined : onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View
          style={[
            s.iconBtn,
            bordered && s.iconBtnBordered,
            { transform: [{ scale }] },
          ]}
        >
          {icon && <Icon icon={icon} size="sm" color={Colors.white} />}
        </Animated.View>
      </Pressable>
    );
  }

  const rootStyle = [
    s.base,
    size === 'sm' ? s.sizeSM : s.sizeMD,
    variant === 'primary' ? s.primary : null,
    variant === 'ghost'   ? s.ghost   : null,
    variant === 'outline' ? s.outline : null,
    isDisabled && variant === 'primary' && s.primaryDisabled,
    isDisabled && variant !== 'primary' && s.disabled,
    width != null ? { width } : (variant === 'primary' ? s.fullWidth : null),
  ];

  const textStyle = [
    size === 'sm' ? s.labelSM : s.labelMD,
    variant === 'primary' ? s.primaryText  : null,
    variant === 'ghost'   ? s.ghostText    : null,
    variant === 'outline' ? s.outlineText  : null,
  ];

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isDisabled }}
    >
      <Animated.View style={[rootStyle, { transform: [{ scale }] }]}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? Colors.onAccent : Colors.white}
          />
        ) : (
          <>
            <Text style={textStyle}>{label}</Text>
            {icon && (
              <Icon
                icon={icon}
                size="sm"
                color={variant === 'primary' ? Colors.onAccent : Colors.white}
              />
            )}
          </>
        )}
      </Animated.View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Shared base
  base: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:             8,
    borderRadius:   Radii.pill,
  },

  // Sizes
  sizeMD: { paddingVertical: 16, paddingHorizontal: 24 },
  sizeSM: { paddingVertical: 12, paddingHorizontal: 16 },

  // Widths
  fullWidth: { width: '100%' },

  // Variant: primary
  primary: {
    backgroundColor: Colors.accent,
  },
  primaryDisabled: { opacity: 0.28 },
  primaryText: {
    color:         Colors.onAccent,
    fontSize:      16,
    fontWeight:    '800',
    letterSpacing: -0.2,
  },

  // Variant: ghost
  ghost: {
    // no background, no border
    minHeight: Spacing.touchTarget,
  },
  ghostText: {
    color:      Colors.gray,
    fontSize:   16,
    fontWeight: '600',
  },

  // Variant: outline
  outline: {
    borderWidth:   1,
    borderColor:   Colors.cardBorder,
  },
  outlineText: {
    color:      Colors.white,
    fontSize:   16,
    fontWeight: '600',
  },

  // Disabled state for non-primary
  disabled: { opacity: 0.4 },

  // Label sizes
  labelMD: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  labelSM: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },

  // icon variant
  iconBtn: {
    width:           Spacing.touchTarget,   // 44px — accessibility minimum
    height:          Spacing.touchTarget,
    backgroundColor: Colors.card,
    borderRadius:    Radii.input,
    alignItems:      'center',
    justifyContent:  'center',
  },
  iconBtnBordered: {
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
});
