/**
 * Input — single component with variant prop
 *
 * Variants:
 *   default  — standard labeled text field with optional leading icon and trailing action
 *   search   — compact, no label, search icon, rounded pill style
 *
 * Usage:
 *   <Input
 *     variant="default"
 *     label="API KEY"
 *     placeholder="Paste your API key"
 *     value={apiKey}
 *     onChangeText={setApiKey}
 *     leadingIcon={Icons.key}
 *     showClear
 *   />
 *
 *   <Input
 *     variant="default"
 *     label="PASSWORD"
 *     secure
 *     value={password}
 *     onChangeText={setPassword}
 *   />
 *
 *   <Input variant="search" placeholder="Search coins..." value={q} onChangeText={setQ} />
 */

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, TextInputProps,
} from 'react-native';
import { Icon } from './Icon';
import { Icons } from '@/constants/Icons';
import { Colors } from '@/constants/Colors';
import { Radii, Spacing } from '@/constants/Spacing';
import { FontFamily } from '@/constants/Typography';

type HugeIconElement = React.ComponentProps<typeof Icon>['icon'];

// ─── Props ────────────────────────────────────────────────────────────────────

interface InputProps extends Omit<TextInputProps, 'style'> {
  variant?: 'default' | 'search';

  /** Uppercase label rendered above the input (default variant only) */
  label?: string;

  /** Icon shown inside the leading edge of the input */
  leadingIcon?: HugeIconElement;

  /** Whether to show a secure-text toggle (eye icon) */
  secure?: boolean;

  /** Show a clear (×) button when value is non-empty */
  showClear?: boolean;

  /** Tooltip content shown below the label when the info icon is tapped */
  tooltip?: string;

  /** Additional content rendered to the right of the label (e.g. a badge) */
  labelAccessory?: React.ReactNode;

  /** Use monospaced font for input text (API keys, passwords) */
  mono?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Input({
  variant = 'default',
  label,
  leadingIcon,
  secure = false,
  showClear = false,
  tooltip,
  labelAccessory,
  mono = false,
  value,
  onChangeText,
  placeholder,
  ...rest
}: InputProps) {
  const [showText, setShowText] = useState(!secure);
  const [showTooltip, setShowTooltip] = useState(false);

  const isSearch = variant === 'search';

  return (
    <View style={isSearch ? undefined : s.fieldWrap}>

      {/* Label row — default variant only */}
      {!isSearch && label && (
        <View style={s.labelRow}>
          <Text style={s.label}>{label}</Text>

          <View style={s.labelRight}>
            {/* Tooltip trigger */}
            {tooltip && (
              <TouchableOpacity
                onPress={() => setShowTooltip((v) => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Icon
                  icon={Icons.info}
                  size="xs"
                  color={showTooltip ? Colors.white : Colors.gray}
                />
              </TouchableOpacity>
            )}

            {/* Arbitrary accessory (badge, etc.) */}
            {labelAccessory}
          </View>
        </View>
      )}

      {/* Tooltip bubble */}
      {tooltip && showTooltip && (
        <View style={s.tooltip}>
          <Text style={s.tooltipText}>{tooltip}</Text>
        </View>
      )}

      {/* Input row */}
      <View style={[s.wrap, isSearch && s.wrapSearch]}>
        {leadingIcon && (
          <Icon icon={leadingIcon} size="xs" color={Colors.gray} />
        )}
        {isSearch && !leadingIcon && (
          <Icon icon={Icons.search} size="xs" color={Colors.gray} />
        )}

        <TextInput
          style={[s.input, mono && s.inputMono]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.gray}
          secureTextEntry={secure && !showText}
          autoCapitalize="none"
          autoCorrect={false}
          {...rest}
        />

        {/* Clear button */}
        {showClear && value && value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText?.('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={s.trailingBtn}
          >
            <Icon icon={Icons.clear} size="xs" color={Colors.gray} />
          </TouchableOpacity>
        )}

        {/* Secure toggle */}
        {secure && (
          <TouchableOpacity
            onPress={() => setShowText((v) => !v)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={s.trailingBtn}
          >
            <Icon
              icon={showText ? Icons.eyeHide : Icons.eyeShow}
              size="xs"
              color={Colors.gray}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  fieldWrap: {
    gap: 0,
  },

  // Label row
  labelRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   Spacing.fieldLabelGap,  // 8
  },
  labelRight: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           8,
  },
  label: {
    color:         Colors.white,
    fontSize:      12,
    fontWeight:    '800',
    letterSpacing: 2,
  },

  // Tooltip
  tooltip: {
    backgroundColor: Colors.cardElevated,
    borderRadius:    Radii.inner,
    paddingHorizontal: 12,
    paddingVertical:    8,
    marginBottom:       8,
  },
  tooltipText: {
    color:      Colors.gray,
    fontSize:   12,
    lineHeight: 20,
  },

  // Input container
  wrap: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:                8,
    backgroundColor:   Colors.cardElevated,
    borderRadius:      Radii.input,
    paddingHorizontal: Spacing.cardPad,
    height:            52,  // 4px grid: 52 = 4 × 13
  },
  wrapSearch: {
    backgroundColor: Colors.card,
    borderRadius:    Radii.pill,
    height:          44,  // touchTarget minimum
  },

  // TextInput
  input: {
    flex:       1,
    color:      Colors.white,
    fontSize:   16,
    lineHeight: 24,
  },
  inputMono: {
    fontFamily: FontFamily.mono,
    fontSize:   16,
  },

  // Trailing buttons
  trailingBtn: {
    padding: 4,
  },
});
