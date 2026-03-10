/**
 * Nexus Spacing System — strict 4px grid
 *
 * ALL values are multiples of 4. No exceptions (pill radius is a special case).
 * Import from '@/constants' barrel: { Spacing, Radii, IconSize, Elevation, BottomFade }
 */

// ─── Base scale ───────────────────────────────────────────────────────────────

export const Spacing = {
  0:    0,
  1:    4,   // xs
  2:    8,   // sm
  3:    12,  // md
  4:    16,  // lg  ← standard card padding, field gaps
  5:    20,  // xl  ← screen horizontal padding
  6:    24,  // 2xl
  7:    28,  // 3xl
  8:    32,  // 4xl
  9:    36,  // 5xl
  10:   40,  // 6xl
  11:   44,  // 7xl ← minimum touch target
  12:   48,  // 8xl

  // ── Semantic aliases ─────────────────────────────────────────────────────────

  /** Screen horizontal padding (20) */
  screenH:         20,

  /** Standard card interior padding (16) */
  cardPad:         16,

  /** Hero/detail card interior padding (20) */
  cardPadLG:       20,

  /** Gap between sibling cards in a list (4) */
  cardGap:          4,

  /** Gap between a label and its input field (8) */
  fieldLabelGap:    8,

  /** Gap between sibling form fields (12) */
  fieldGap:        12,

  /** Gap between form sections (16) */
  sectionGap:      16,

  /** Bottom scroll clearance to clear the floating tab bar (88) */
  tabBarClearance: 88,

  /** Minimum accessible touch target size (44) */
  touchTarget:     44,
} as const;

// ─── Border radius scale — all multiples of 4 ────────────────────────────────

export const Radii = {
  /** 100 — Pill: primary buttons, tag badges, tab pills (intentionally > grid) */
  pill:    100,

  /** 20 — Card: main content cards, hero cards, exchange/asset cards */
  card:     20,

  /** 16 — CardSM: asset list containers, settings sections */
  cardSM:   16,

  /** 12 — Input: text inputs, icon nav buttons (40×40), back buttons */
  input:    12,

  /** 8 — Inner: tooltips, security badge icons, step numbers (22×22) */
  inner:     8,

  /** 4 — Micro: thin progress bars, micro elements */
  micro:     4,
} as const;

// ─── Icon container sizes — all multiples of 4 ───────────────────────────────

export const IconContainerSize = {
  /** 48×48 — Large feature icons (zero state orbs) */
  lg:  48,

  /** 40×40 — Primary icon buttons (add, back, nav) */
  md:  40,

  /** 32×32 — Medium row icon containers */
  sm:  32,

  /** 24×24 — Small containers (security badge, permission indicators) */
  xs:  24,
} as const;

// ─── Raw icon sizes — all multiples of 4 ─────────────────────────────────────

export const IconSize = {
  /** 32 — Feature icons */
  feature: 32,

  /** 24 — Standard UI icons */
  md:      24,

  /** 20 — Small UI icons (nav bars, row actions) */
  sm:      20,

  /** 16 — Micro icons (badges, inline labels) */
  xs:      16,
} as const;

// ─── Elevation / Shadow presets ───────────────────────────────────────────────

export const Elevation = {
  /** Floating tab bar */
  tabBar: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius:  12,
    elevation:     10,
  },

  /** Tooltip / popover */
  tooltip: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius:  8,
    elevation:     4,
  },
} as const;

// ─── Bottom fade gradient — standard for all tab screens ─────────────────────

export const BottomFade = {
  /** 3-stop fade: transparent → semi-opaque → solid bg */
  colors: ['transparent', 'rgba(8,8,8,0.75)', '#080808'] as const,

  /** Height of the gradient overlay */
  height: 200,
} as const;
