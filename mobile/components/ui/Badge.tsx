/**
 * Badge — single component with variant prop
 *
 * Variants:
 *   tag      — pill label (e.g. "PRO", "HIDDEN BY DEFAULT", "ACTIVE")
 *   status   — colored dot + label (e.g. connected status, live indicator)
 *   change   — gain/loss pill with optional trend icon (e.g. +3.48% today)
 *   section  — eyebrow label above a card group (UPPERCASE, no background)
 *
 * Usage:
 *   <Badge variant="tag" label="PRO" />
 *   <Badge variant="status" label="Active" color={Colors.green} />
 *   <Badge variant="change" value={3.48} suffix="today" />
 *   <Badge variant="change" value={-1.2} size="sm" />
 *   <Badge variant="section" label="CONNECTED" meta="$84,473 total" rule />
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Icon } from './Icon';
import { Icons } from '@/constants/Icons';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';

// ─── Props ────────────────────────────────────────────────────────────────────

interface BadgeProps {
  variant: 'tag' | 'status' | 'change' | 'section';

  // ── tag / status / section ──
  label?: string;

  // ── status ──
  /** Dot + text color for status variant */
  color?: string;
  /** Background dim color for status variant */
  bgColor?: string;

  // ── change ──
  /** Signed numeric change value (e.g. 3.48 or -1.2) */
  value?: number;
  /** Whether to show a trending icon (default: true for 'change') */
  showIcon?: boolean;
  /** Text appended after the percentage (e.g. "today", "7d") */
  suffix?: string;
  /** 'sm' omits the icon and uses smaller padding */
  size?: 'md' | 'sm';

  // ── section ──
  /** Meta text on the right side (e.g. "$84,473 total") */
  meta?: string;
  /** Whether to render a horizontal rule between label and meta */
  rule?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  variant, label, color, bgColor,
  value = 0, showIcon = true, suffix, size = 'md',
  meta, rule = false,
}: BadgeProps) {

  // ── tag ─────────────────────────────────────────────────────────────────────
  if (variant === 'tag') {
    return (
      <View style={s.tag}>
        <Text style={s.tagText}>{label}</Text>
      </View>
    );
  }

  // ── status ───────────────────────────────────────────────────────────────────
  if (variant === 'status') {
    const c = color ?? Colors.green;
    const bg = bgColor ?? Colors.greenDim;
    return (
      <View style={[s.status, { backgroundColor: bg }]}>
        <View style={[s.statusDot, { backgroundColor: c }]} />
        <Text style={[s.statusText, { color: c }]}>{label}</Text>
      </View>
    );
  }

  // ── change ────────────────────────────────────────────────────────────────────
  if (variant === 'change') {
    const isGain = value >= 0;
    const fg     = isGain ? Colors.green  : Colors.red;
    const bg     = isGain ? Colors.greenDim : Colors.redDim;
    const icon   = isGain ? Icons.trendUp : Icons.trendDown;
    const label  = `${isGain ? '+' : ''}${value.toFixed(2)}%${suffix ? ` ${suffix}` : ''}`;

    return (
      <View style={[
        s.change,
        size === 'sm' ? s.changeSM : s.changeMD,
        { backgroundColor: bg },
      ]}>
        {showIcon && size !== 'sm' && (
          <Icon icon={icon} size="xs" color={fg} strokeWidth={2} />
        )}
        <Text style={[s.changeText, { color: fg }]}>{label}</Text>
      </View>
    );
  }

  // ── section ───────────────────────────────────────────────────────────────────
  if (variant === 'section') {
    if (!rule && !meta) {
      return <Text style={s.sectionLabel}>{label}</Text>;
    }
    return (
      <View style={s.sectionRow}>
        <Text style={s.sectionLabel}>{label}</Text>
        {rule && <View style={s.sectionRule} />}
        {meta && <Text style={s.sectionMeta}>{meta}</Text>}
      </View>
    );
  }

  return null;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({

  // ── tag ───────────────────────────────────────────────────────────────────────
  tag: {
    backgroundColor:   Colors.cardBorder,
    borderRadius:      Radii.pill,
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  tagText: {
    color:         Colors.white,
    fontSize:      8,
    fontWeight:    '800',
    letterSpacing: 1.2,
  },

  // ── status ────────────────────────────────────────────────────────────────────
  status: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:                4,
    borderRadius:      Radii.pill,
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  statusDot: {
    width:        4,
    height:       4,
    borderRadius: 2,
  },
  statusText: {
    fontSize:   12,
    fontWeight: '700',
  },

  // ── change ────────────────────────────────────────────────────────────────────
  change: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:            4,
    alignSelf:     'flex-start',
    borderRadius:  Radii.pill,
  },
  changeMD: {
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  changeSM: {
    paddingHorizontal: 8,
    paddingVertical:   4,
  },
  changeText: {
    fontSize:   12,
    fontWeight: '700',
  },

  // ── section ───────────────────────────────────────────────────────────────────
  sectionRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           Spacing.fieldLabelGap + 2,  // 10
  },
  sectionLabel: {
    color:         Colors.gray,
    fontSize:      12,
    fontWeight:    '800',
    letterSpacing: 2,
  },
  sectionRule: {
    flex:            1,
    height:          1,
    backgroundColor: Colors.cardBorder,
  },
  sectionMeta: {
    color:      Colors.gray,
    fontSize:   12,
    fontWeight: '600',
  },
});
