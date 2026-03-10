/**
 * Card — single component with variant prop
 *
 * Variants:
 *   default   — Colors.card (#111111), borderRadius 20. Main content cards.
 *   sm        — Colors.card, borderRadius 16. Asset list containers.
 *   elevated  — Colors.cardElevated (#171717), borderRadius 20. Nested surfaces.
 *   info      — Colors.card, borderRadius 16, row layout. Trust/note callouts.
 *
 * Usage:
 *   <Card variant="default" style={{ padding: Spacing.cardPad }}>...</Card>
 *   <Card variant="info" icon={Icons.shield} text="Read-only access." />
 *
 * Sub-components (named exports):
 *   CardDivider  — 1px horizontal rule inside a card
 *   CardRow      — pre-padded horizontal row inside a card
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Icon } from './Icon';
import { Icons } from '@/constants/Icons';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';

type HugeIconElement = React.ComponentProps<typeof Icon>['icon'];

// ─── Card ─────────────────────────────────────────────────────────────────────

type CardVariant = 'default' | 'sm' | 'elevated' | 'info';

interface CardProps {
  children?: React.ReactNode;
  variant?: CardVariant;
  /** Extra styles applied on top of the variant defaults */
  style?: ViewStyle;
  /** info variant only — icon shown before text */
  icon?: HugeIconElement;
  /** info variant only */
  text?: string;
  /** info variant only — icon color override */
  iconColor?: string;
}

export function Card({
  children, variant = 'default', style,
  icon, text, iconColor = Colors.gray,
}: CardProps) {
  if (variant === 'info') {
    return (
      <View style={[s.info, style]}>
        {icon && (
          <View style={{ marginTop: 2 }}>
            <Icon icon={icon} size="sm" color={iconColor} />
          </View>
        )}
        {text && <Text style={s.infoText}>{text}</Text>}
        {children}
      </View>
    );
  }

  return (
    <View style={[s.base, s[variant], style]}>
      {children}
    </View>
  );
}

// ─── CardDivider ──────────────────────────────────────────────────────────────

interface CardDividerProps {
  /** Left inset — use to align with content (e.g. 62 to clear icon + gap) */
  inset?: number;
  /** Override horizontal margin to bleed past card padding */
  bleed?: number;
}

export function CardDivider({ inset = 0, bleed = 0 }: CardDividerProps) {
  return (
    <View
      style={[
        s.divider,
        inset > 0 ? { marginLeft: inset } : null,
        bleed > 0 ? { marginHorizontal: -bleed } : null,
      ]}
    />
  );
}

// ─── CardRow ──────────────────────────────────────────────────────────────────
// Pre-padded horizontal row — use inside Card variant="sm" list containers.

interface CardRowProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function CardRow({ children, style }: CardRowProps) {
  return (
    <View style={[s.row, style]}>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  base: {
    backgroundColor: Colors.card,
    overflow:        'hidden',
  },

  // Variants
  default: {
    borderRadius: Radii.card,
    padding:      Spacing.cardPad,
  },
  sm: {
    borderRadius: Radii.cardSM,
    overflow:     'hidden',
  },
  elevated: {
    backgroundColor: Colors.cardElevated,
    borderRadius:    Radii.card,
    padding:         Spacing.cardPad,
  },
  info: {
    flexDirection:   'row',
    alignItems:      'flex-start',
    gap:             12,
    backgroundColor: Colors.card,
    borderRadius:    Radii.cardSM,
    padding:         Spacing.cardPad,
  },

  infoText: {
    flex:       1,
    color:      Colors.gray,
    fontSize:   12,
    fontWeight: '400',
    lineHeight: 20,
  },

  divider: {
    height:          1,
    backgroundColor: Colors.cardBorder,
  },

  row: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: Spacing.cardPad,
    paddingVertical:   12,
  },
});
