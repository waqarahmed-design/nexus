export const Colors = {
  // ── Surfaces — pure monochrome (no blue tints) ────────────────────────────
  bg:           '#080808',
  card:         '#111111',
  cardElevated: '#171717',
  cardBorder:   '#222222',

  // ── Accent — neon lime (use VERY sparingly: primary CTAs only) ────────────
  accent:        '#C8E847',
  accentBright:  '#D6F05A',
  accentDim:     'rgba(200,232,71,0.08)',
  accentBorder:  'rgba(200,232,71,0.15)',
  accentGlow:    'rgba(200,232,71,0.04)',

  // ── Financial signals ─────────────────────────────────────────────────────
  green:    '#4ADE80',
  greenDim: 'rgba(74,222,128,0.10)',
  red:      '#F87171',
  redDim:   'rgba(248,113,113,0.10)',

  // ── Text ──────────────────────────────────────────────────────────────────
  white:     '#F2F2F2',   // Cool white — primary text
  gray:      '#666666',   // Secondary text
  muted:     '#1C1C1C',   // Barely-there fills (NEVER use as text/icon color)
  onAccent:  '#080808',   // Text/icons placed on accent (#C8E847) backgrounds

  // ── Component internals — chart & tooltip ────────────────────────────────
  dotFilled:    'rgba(255,255,255,0.30)',  // DotMatrixChart filled dot (non-pressed)
  dotEmpty:     'rgba(255,255,255,0.06)',  // DotMatrixChart empty dot
  tooltipBg:    'rgba(16,16,16,0.96)',    // SparklineChart tooltip background
  tooltipBorder:'rgba(255,255,255,0.10)', // SparklineChart tooltip border
  surfaceGlow:  'rgba(255,255,255,0.025)',// Decorative orb / radial glow surface

  // ── 3D bevel effect tokens (raised cards and inset troughs) ──────────────
  // Asymmetric border pairs: top/left catches light, bottom/right recedes.
  bevelHighlight:   'rgba(255,255,255,0.12)', // top/left edge highlight
  bevelHighlightLg: 'rgba(255,255,255,0.18)', // stronger highlight (accent-tinted surfaces)
  bevelShadow:      'rgba(0,0,0,0.50)',        // bottom/right edge shadow
  bevelShadowSm:    'rgba(0,0,0,0.30)',        // lighter shadow variant

  // ── Advanced effect fills (SVG layers, bar tracks, dividers) ─────────────
  surfaceSubtle:  'rgba(255,255,255,0.06)',  // near-invisible white fill
  surfaceDivider: 'rgba(255,255,255,0.04)',  // ultra-subtle rule line

  // ── Mesh gradient palette (Analytics hero card SVG blob colors) ───────────
  meshBase:  '#0A0F08',  // near-black with green tint, SVG rect base fill
  meshOlive: '#1A3300',  // deep forest olive, large ambient blob
  meshTeal:  '#006655',  // dark teal, atmosphere blob center-right
  meshFern:  '#4A6B00',  // mid olive, smaller accent blob

  // ── Accent border/fill variants for effect overlays ───────────────────────
  accentBorderLg:   'rgba(200,232,71,0.18)', // stronger lime border (mesh card top)
  accentBorderMd:   'rgba(200,232,71,0.10)', // medium lime border (mesh card left)
  accentFillSubtle: 'rgba(200,232,71,0.08)', // lime fill on portfolio bar track

  // ── Coin brand colors ─────────────────────────────────────────────────────
  coinBTC:  '#F7931A',
  coinETH:  '#627EEA',
  coinBNB:  '#F0B90B',
  coinSOL:  '#9945FF',
  coinUSDT: '#26A17B',
  coinXRP:  '#0085C3',

  // ── Exchange brand colors (real brands — do not change) ───────────────────
  excBinance:    '#F0B90B',
  excBinanceDim: 'rgba(240,185,11,0.12)',
  excCoinbase:    '#4D7FFF',
  excCoinbaseDim: 'rgba(77,127,255,0.12)',
  excKraken:      '#8B7FF7',
  excKrakenDim:   'rgba(139,127,247,0.12)',
  excOKX:        '#D4D4D4',
  excOKXDim:     'rgba(212,212,212,0.10)',
  excBybit:      '#F7A600',
  excBybitDim:   'rgba(247,166,0,0.12)',
  excKuCoin:     '#23AF91',
  excKuCoinDim:  'rgba(35,175,145,0.12)',
  excGateIO:     '#E40C5B',
  excGateIODim:  'rgba(228,12,91,0.12)',
  excMEXC:       '#2C9DFF',
  excMEXCDim:    'rgba(44,157,255,0.12)',
};
