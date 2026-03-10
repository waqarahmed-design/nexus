/**
 * Nexus Typography System — strict 4px grid
 *
 * ALL font sizes and line heights are multiples of 4.
 * Previous sizes → grid-aligned replacements:
 *   9 → 8    10 → 12   11 → 12   13 → 12
 *   14 → 16  15 → 16   17 → 16   22 → 24
 *   26 → 28  38 → 40   46 → 48
 *
 * Fonts:
 *   JetBrainsMono_400Regular — hero values, prices, amounts, API key inputs
 *   Georgia                  — small inline numeric accents only (legend %, tooltip)
 *   System (default)         — all other text
 *
 * Import from '@/constants' barrel: { FontFamily, TypeScale }
 */

import { TextStyle } from 'react-native';

// ─── Font families ────────────────────────────────────────────────────────────

export const FontFamily = {
  /** Monospaced — numeric/financial values, API key inputs */
  mono:  'JetBrainsMono_400Regular',
  /** Serif — small inline numeric accents only (legend %, sparkline tooltip) */
  serif: 'Georgia',
} as const;

// ─── Typescale ────────────────────────────────────────────────────────────────
//
// Naming: role.size  e.g. TypeScale.display.xl, TypeScale.body.md
// All values are multiples of 4. lineHeight is always fontSize + 4 or +8 for readability.

export const TypeScale = {

  // ── Display — onboarding headlines, hero logo text ──────────────────────────

  display: {
    /** 56/64 — (reserved, not yet used) */
    xxl: { fontSize: 56, fontWeight: '900', letterSpacing: -2,   lineHeight: 64 } as TextStyle,

    /** 52/60 — Welcome screen main headline */
    xl:  { fontSize: 52, fontWeight: '900', letterSpacing: -1.5, lineHeight: 60 } as TextStyle,

    /** 48/56 — Logo mark text (large "N") */
    lg:  { fontSize: 48, fontWeight: '900', letterSpacing: -1.5, lineHeight: 56 } as TextStyle,

    /** 40/48 — Portfolio hero value, zero state headline */
    md:  { fontSize: 40, fontWeight: '900', letterSpacing: -1.2, lineHeight: 48 } as TextStyle,

    /** 32/40 — (reserved) */
    sm:  { fontSize: 32, fontWeight: '900', letterSpacing: -1,   lineHeight: 40 } as TextStyle,
  },

  // ── Title — screen headers, card section titles ──────────────────────────────

  title: {
    /** 28/36 — Tab screen page titles (Portfolio, Exchanges, Settings) */
    lg:  { fontSize: 28, fontWeight: '900', letterSpacing: -0.5, lineHeight: 36 } as TextStyle,

    /** 24/32 — Step titles, modal sub-headers, success titles */
    md:  { fontSize: 24, fontWeight: '900', letterSpacing: -0.5, lineHeight: 32 } as TextStyle,

    /** 20/28 — Section subtitles */
    sm:  { fontSize: 20, fontWeight: '800', letterSpacing: -0.3, lineHeight: 28 } as TextStyle,

    /** 16/24 — Screen modal nav bar titles, detail screen headers */
    xs:  { fontSize: 16, fontWeight: '800', letterSpacing: -0.2, lineHeight: 24 } as TextStyle,
  },

  // ── Body — readable prose, descriptions, row labels ──────────────────────────

  body: {
    /** 16/24 — Primary row labels, body copy, CTA text, form inputs */
    lg:  { fontSize: 16, fontWeight: '400', lineHeight: 24 } as TextStyle,

    /** 16/24 — Semibold row labels, exchange names, asset names */
    lgStrong: { fontSize: 16, fontWeight: '700', lineHeight: 24 } as TextStyle,

    /** 12/20 — Secondary text, descriptions, meta, note cards, tooltips */
    md:  { fontSize: 12, fontWeight: '400', lineHeight: 20 } as TextStyle,

    /** 12/20 — Medium-weight secondary (connected labels, row values) */
    mdMedium: { fontSize: 12, fontWeight: '600', lineHeight: 20 } as TextStyle,
  },

  // ── Label — uppercase eyebrows, section headers, badges ──────────────────────
  // Used UPPERCASE in JSX. Positive letterSpacing intentional.

  label: {
    /** 12/16 — Field labels, section headers above cards */
    md:  { fontSize: 12, fontWeight: '800', letterSpacing: 2,   lineHeight: 16 } as TextStyle,

    /** 8/12 — Micro badge labels (PRO, HIDDEN, status tags) */
    sm:  { fontSize:  8, fontWeight: '800', letterSpacing: 1.2, lineHeight: 12 } as TextStyle,
  },

  // ── Numeric — JetBrainsMono financial values ─────────────────────────────────

  numeric: {
    /** 40/48 — Hero portfolio integer value */
    xl:  { fontSize: 40, fontFamily: FontFamily.mono, letterSpacing: -1.5, lineHeight: 48 } as TextStyle,

    /** 24/32 — Exchange total value on detail screen */
    lg:  { fontSize: 24, fontFamily: FontFamily.mono, letterSpacing: -0.5, lineHeight: 32 } as TextStyle,

    /** 20/28 — Hero value decimal part */
    md:  { fontSize: 20, fontFamily: FontFamily.mono, letterSpacing: -0.5, lineHeight: 28 } as TextStyle,

    /** 16/24 — Currency symbol ($), sticky compact value */
    sm:  { fontSize: 16, fontFamily: FontFamily.mono,                      lineHeight: 24 } as TextStyle,

    /** 12/16 — Asset/holding values in list rows, stat values */
    xs:  { fontSize: 12, fontFamily: FontFamily.mono, fontWeight: '700',   lineHeight: 16 } as TextStyle,

    /** 8/12 — Micro step numbers inside 24×24 bubbles */
    xxs: { fontSize:  8, fontFamily: FontFamily.mono, fontWeight: '700',   lineHeight: 12 } as TextStyle,
  },

  // ── Serif Numeric — Georgia for small inline editorial numbers ────────────────
  // Use only in: AllocationBar legend, SparklineChart tooltip, settings summary.

  serifNumeric: {
    /** 16/24 — Settings summary values */
    md: { fontSize: 16, fontFamily: FontFamily.serif, fontWeight: '400', lineHeight: 24 } as TextStyle,

    /** 12/16 — Allocation bar legend %, sparkline tooltip */
    sm: { fontSize: 12, fontFamily: FontFamily.serif, fontWeight: '400', lineHeight: 16 } as TextStyle,
  },

} as const;
