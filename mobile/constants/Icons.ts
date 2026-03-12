/**
 * Nexus Icon Registry
 *
 * Single source of truth for all icons in the app.
 * The rest of the codebase NEVER imports from @hugeicons/core-free-icons directly —
 * only this file does. If an icon name changes, fix it here once.
 *
 * Library: HugeIcons (free tier) — Stroke Rounded style
 * Package: @hugeicons/react-native + @hugeicons/core-free-icons
 *
 * Install:
 *   npx expo install @hugeicons/react-native @hugeicons/core-free-icons
 *
 * Usage in components:
 *   import { Icons } from '@/constants';
 *   <Icon icon={Icons.portfolio} size={24} color={Colors.white} />
 *
 * Note: react-native-svg is already installed as a dependency.
 */

// ─── Navigation ───────────────────────────────────────────────────────────────
import {
  Briefcase01Icon,
  Exchange01Icon,
  Settings01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Home01Icon,
} from '@hugeicons/core-free-icons';

// ─── Actions ─────────────────────────────────────────────────────────────────
import {
  Add01Icon,
  Cancel01Icon,
  Search01Icon,
  FilterIcon,
  RefreshIcon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';

// ─── UI indicators ────────────────────────────────────────────────────────────
import {
  InformationCircleIcon,
  CheckmarkCircle01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';

// ─── Finance / data ──────────────────────────────────────────────────────────
import {
  ChartIncreaseIcon,
  ChartDecreaseIcon,
  BarChartIcon,
} from '@hugeicons/core-free-icons';

// ─── Security / trust ────────────────────────────────────────────────────────
import {
  ShieldKeyIcon,
  Shield01Icon,
  LockIcon,
  FingerPrintIcon,
  Key01Icon,
} from '@hugeicons/core-free-icons';

// ─── Form / input ─────────────────────────────────────────────────────────────
import {
  Mail01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from '@hugeicons/core-free-icons';

// ─── Notification / status ────────────────────────────────────────────────────
import {
  Notification02Icon,
  AlertCircleIcon,
} from '@hugeicons/core-free-icons';

// ─── Misc ─────────────────────────────────────────────────────────────────────
import {
  FlashIcon,
  Layers01Icon,
  Money01Icon,
  File01Icon,
  SourceCodeCircleIcon,
} from '@hugeicons/core-free-icons';

// ─── Semantic icon map ────────────────────────────────────────────────────────
// Map semantic names used throughout the app to HugeIcon components.

export const Icons = {
  // Navigation / tabs
  portfolio:     Briefcase01Icon,
  exchanges:     Exchange01Icon,
  settings:      Settings01Icon,
  home:          Home01Icon,
  back:          ArrowLeft01Icon,
  forward:       ArrowRight01Icon,

  // Actions
  add:           Add01Icon,
  close:         Cancel01Icon,
  clear:         Cancel01Icon,
  search:        Search01Icon,
  filter:        FilterIcon,
  refresh:       RefreshIcon,
  logout:        Logout01Icon,

  // UI indicators
  chevronRight:  ArrowRight01Icon,
  info:          InformationCircleIcon,
  checkCircle:   CheckmarkCircle01Icon,
  check:         Tick01Icon,
  tick:          Tick01Icon,

  // Finance / data
  trendUp:       ChartIncreaseIcon,
  trendDown:     ChartDecreaseIcon,
  barChart:      BarChartIcon,
  analytics:     BarChartIcon,

  // Security / trust
  shieldCheck:   ShieldKeyIcon,
  shield:        Shield01Icon,
  lock:          LockIcon,
  fingerprint:   FingerPrintIcon,
  key:           Key01Icon,

  // Form / input
  mail:          Mail01Icon,
  eyeShow:       ViewIcon,
  eyeHide:       ViewOffSlashIcon,

  // Notification / status
  notification:  Notification02Icon,
  alertCircle:   AlertCircleIcon,

  // Misc
  flash:         FlashIcon,
  layers:        Layers01Icon,
  money:         Money01Icon,
  document:      File01Icon,
  code:          SourceCodeCircleIcon,
} as const;

export type IconKey = keyof typeof Icons;
