# Nexus — Product & UX Documentation

> **Maintained by:** Documentation Agent (auto-updated on every code change)
> **Last updated:** 2026-03-02
> **App version:** 1.0.0 (Prototype — mock data, no live backend)

---

## 1. Product Overview

### What is Nexus?
Nexus is a mobile crypto portfolio aggregator. It connects to multiple exchanges (Binance, Coinbase, Kraken) via read-only API keys and presents a single unified view of a user's entire crypto holdings across all accounts.

### Core Problem
Crypto investors who hold assets across multiple exchanges have no single place to see their total portfolio. They must log into each exchange separately and mentally calculate their total holdings.

### Solution
One dashboard that aggregates all exchange balances — total portfolio value, per-coin breakdown across exchanges, and per-exchange summary — all in real time.

### Target Users
Individual crypto investors (retail) who hold spot assets on 2–5 centralised exchanges.

### Current State
Fully functional UI prototype with realistic mock data. No real backend or live exchange connections yet. Designed to validate UX before building infrastructure.

---

## 2. Design System

### Color Palette
| Role | Token | Hex |
|---|---|---|
| Background | `Colors.bg` | `#07080F` |
| Surface | `Colors.surface` | `#0C0D1A` |
| Card | `Colors.card` | `#101120` |
| Card Elevated | `Colors.cardElevated` | `#161830` |
| Card Border | `Colors.cardBorder` | `#1C1E32` |
| Accent (primary) | `Colors.accent` | `#2563EB` |
| Accent Bright | `Colors.accentBright` | `#3B82F6` |
| Accent Dim | `Colors.accentDim` | `rgba(37,99,235,0.15)` |
| Accent Glow | `Colors.accentGlow` | `rgba(37,99,235,0.07)` |
| Success | `Colors.green` | `#22C55E` |
| Success Dim | `Colors.greenDim` | `rgba(34,197,94,0.12)` |
| Danger | `Colors.red` | `#F75555` |
| Danger Dim | `Colors.redDim` | `rgba(247,85,85,0.12)` |
| Text Primary | `Colors.white` | `#FFFFFF` |
| Text Secondary | `Colors.gray` | `#8B92A8` |
| Text Muted | `Colors.muted` | `#2E3150` |

### Exchange Brand Colors
| Exchange | Color | Dim |
|---|---|---|
| Binance | `#F0B90B` | `rgba(240,185,11,0.14)` |
| Coinbase | `#4D7FFF` | `rgba(77,127,255,0.14)` |
| Kraken | `#8B7FF7` | `rgba(139,127,247,0.14)` |

### Coin Brand Colors
| Coin | Color |
|---|---|
| BTC | `#F7931A` |
| ETH | `#627EEA` |
| BNB | `#F0B90B` |
| SOL | `#9945FF` |
| USDT | `#26A17B` |
| XRP | `#0085C3` |

### Typography
- **Display / Hero:** 44–52px, weight 900, letterSpacing -1.5 to -1
- **Section headers:** 19–28px, weight 800–900, letterSpacing -0.5 to -0.3
- **Card values:** 20–40px, weight 800–900
- **Labels:** 11–13px, weight 600–700, letterSpacing 1.2–1.5 (ALL CAPS for category labels)
- **Body / Subtext:** 13–15px, weight 400–500
- **Theme:** Dark only

### Shape Language
- **Pill buttons:** `borderRadius: 100` — all primary CTAs
- **Cards:** `borderRadius: 18–24`
- **Icon containers:** `borderRadius: 10–14`
- **Coin icons:** `borderRadius: size * 0.28` (rounded square)
- **Change/status badges:** `borderRadius: 100` (pill)

### Visual Effects
- **Radial blue glow** on welcome/hero screen (two layered circles with `rgba(37,99,235,...)` backgrounds)
- **Floating asset rows:** Each asset row is its own card with border + gap (not grouped in a container)
- **Allocation bars:** thin (3–10px) horizontal bars showing portfolio distribution

### Tab Bar
- Custom `PillTabButton` — active tab gets a blue-dimmed pill (`Colors.accentDim`) behind the icon
- No labels — icon-only navigation
- Height: 88px (iOS) / 68px (Android)

---

## 3. Information Architecture

```
App
├── (auth)
│   ├── welcome        — Onboarding / landing
│   └── login          — Sign in / Sign up
│
└── (tabs)             — Main app (tab bar)
    ├── index          — Dashboard (home)
    ├── exchanges       — Exchanges list
    └── settings        — Account & preferences

    + Stack screens (pushed on top of tabs)
    ├── asset/[id]     — Asset detail (per-coin breakdown)
    ├── exchange/[id]  — Exchange detail (per-exchange assets)
    └── add-exchange   — Modal: connect new exchange
```

---

## 4. User Flows

### 4.1 Onboarding Flow
```
welcome screen
  → "Get Started" or "I already have an account"
      → login screen
          → Sign In (email + password)
          → Dashboard (tabs)
```
**Key UX decisions:**
- Both CTAs on welcome go to the same login screen (sign up toggle is inside)
- Welcome shows stats preview (3 exchanges, $84K, 6 assets) to demonstrate value before sign-up

### 4.2 Portfolio View Flow
```
Dashboard
  → Scroll to see: total value → sparkline → stats → asset list → exchange cards
```
**Key UX decisions:**
- Portfolio value is the hero element (44px/900 weight, first thing visible)
- 7-day sparkline chart shows trend at a glance
- Asset rows float individually (card per row) for visual scannability

### 4.3 Asset Drill-Down Flow
```
Dashboard → tap asset row
  → Asset Detail screen
      - Total value across all exchanges
      - Exchange allocation bar (segmented, color-coded)
      - Per-exchange holding rows (value, amount, mini-bar)
      [no further navigation from here — dead end by design]
```
**Key UX decisions:**
- Exchange rows on asset detail are NOT tappable — prevents breaking the mental model of "I came here to see this coin"
- Shows percentage allocation per exchange visually

### 4.4 Exchange Drill-Down Flow
```
Dashboard → tap exchange card (horizontal scroll)
  → Exchange Detail screen
      - Summary card (total value, 24h change, portfolio %)
      - Asset list (each asset tappable → asset detail)
```
OR
```
Exchanges tab → tap exchange card
  → Exchange Detail screen (same)
```

### 4.5 Add Exchange Flow
```
Exchanges tab → "+" button or "Connect Another Exchange" CTA
  → Add Exchange modal (presented as bottom sheet)
      Step 1: Choose exchange (Binance / Coinbase / Kraken)
      Step 2: Enter API Key + API Secret
              [Security notes shown]
              [Guide: how to create read-only key on chosen exchange]
      → "Connect" button (disabled until all fields filled)
          → Loading state (1.8s simulated)
          → Success state
              → "Back to Exchanges" → dismiss modal
```

### 4.6 Sign Out Flow
```
Settings → "Sign Out" → welcome screen
```

---

## 5. Screens

### 5.1 Welcome Screen (`app/(auth)/welcome.tsx`)
**Purpose:** Marketing/onboarding — conveys the value proposition immediately.

**Key elements:**
- Radial blue glow effect (two layered circles, top-center)
- `NEXUS` pill badge (live indicator dot)
- Hero headline stack: "Track." / "Everything." / "In one place." (52px/900)
- Subtext: exchange names listed
- Stats row card: 3 Exchanges · $84K Portfolio · 6 Assets
- "Get Started" — blue gradient pill CTA
- "I already have an account" — ghost link CTA
- Security note: `🔒 Read-only access only · AES-256 encrypted`

**Navigation:** Both CTAs → `/(auth)/login`

---

### 5.2 Login Screen (`app/(auth)/login.tsx`)
**Purpose:** Authentication entry point. Doubles as sign-up.

**Key elements:**
- Back button (card style, top-left)
- Blue gradient `N` logo mark
- Title: "Welcome back" / "Create account" (switches on toggle)
- Form fields: Email, Password (+ Full Name when sign-up)
  - Icons in input fields (left-aligned)
  - Show/hide password toggle
  - "Forgot password?" link (right-aligned, only on sign-in)
- Blue gradient pill submit button
- Mode toggle: "Don't have an account? Sign Up" / "Already have an account? Sign In"
- Security note: shield icon + "256-bit encryption · Read-only access only"

**Navigation:** Submit → `/(tabs)` (replaces auth stack)

---

### 5.3 Dashboard (`app/(tabs)/index.tsx`)
**Purpose:** The home screen. Single-glance portfolio overview.

**Sections (top to bottom):**

1. **Header**
   - Greeting: "Good morning" (muted) + "Alex" (26px/900)
   - Notification bell with blue dot indicator

2. **Portfolio Card**
   - Label: "TOTAL PORTFOLIO" (11px/700, 1.5 letter-spacing)
   - Value: `$84,473.34` (44px/900, tight letter-spacing)
   - Change pill: green/red with trend icon + USD + % change
   - SparklineChart: 7-day area chart with gradient fill

3. **Quick Stats Row**
   - Three equal cards: 24h High · 24h Low · All-Time High

4. **My Assets** section
   - Floating rows (one card per asset, 8px gap between)
   - Each row: CoinIcon + name + amount + exchange tags + value + change pill + chevron
   - Tapping → Asset Detail screen

5. **Exchanges** section
   - Horizontal scroll of exchange cards (168px wide each)
   - Each card: exchange logo + name + value + change + allocation bar + "View assets" link
   - Tapping → Exchange Detail screen

---

### 5.4 Exchanges Tab (`app/(tabs)/exchanges.tsx`)
**Purpose:** Overview of all connected exchanges.

**Sections:**
1. **Header:** "Exchanges" (28px/900) + connected count + total value + "+" button
2. **Exchange cards** (full-width, stacked with 16px gap)
   - Each: logo + name + "Connected" badge + URL + value + change pill + allocation bar + coin icon previews
3. **"Connect Another Exchange"** — dashed-border CTA card at bottom

---

### 5.5 Settings (`app/(tabs)/settings.tsx`)
**Purpose:** Account management and app preferences.

**Sections:**
1. **Profile card:** Blue gradient avatar (initials) + name + email + PRO badge
2. **SECURITY:** Biometric Lock (toggle), Change Password, Two-Factor Auth
3. **PREFERENCES:** Currency, Notifications (toggle), Price Alerts (toggle), Refresh Interval
4. **DATA:** Export Portfolio, Tax Report (coming soon)
5. **ABOUT:** Privacy Policy, Terms, Version
6. **Sign Out** — red pill button
7. **Footer:** AES-256-GCM encryption note

---

### 5.6 Asset Detail (`app/asset/[id].tsx`)
**Purpose:** Deep-dive into a single coin across all exchanges.

**Sections:**
1. **Header:** Back button + CoinIcon + name + symbol
2. **Total Holdings card:** Value (40px/900) + amount + Price / 24h Change / Exchanges row
3. **Exchange Breakdown:** Segmented allocation bar (color-coded by exchange) + legend
4. **Holdings by Exchange:** Card list — exchange badge + name + % badge + amount + mini-bar + value
   - Rows are NOT tappable (intentional — prevents navigation loop)

---

### 5.7 Exchange Detail (`app/exchange/[id].tsx`)
**Purpose:** All assets held on a specific exchange.

**Sections:**
1. **Header:** Back button + exchange badge + exchange name (exchange color)
2. **Summary card:** Connected badge + domain + value (38px/900) + change pill + portfolio share bar
3. **Assets on [Exchange]:** Card list — each asset tappable → Asset Detail

---

### 5.8 Add Exchange Modal (`app/add-exchange.tsx`)
**Purpose:** 3-step wizard to connect a new exchange.

**States:**
- `select` — Choose exchange grid (3 options, selection highlighted)
- `credentials` — API Key + API Secret inputs (disabled until exchange selected)
- `loading` — Spinner + "Connecting to [Exchange]..."
- `success` — Green checkmark + success message + "Back to Exchanges" pill

**Security features displayed:**
- Read-only access only
- AES-256-GCM encryption
- Keys never logged or shared

**UX notes:**
- Connect button uses blue gradient (disabled/gray when fields empty)
- API guide shown contextually after exchange is selected
- Modal presented as bottom sheet

---

## 6. Components

### `CoinIcon` (`components/CoinIcon.tsx`)
Displays a coin symbol in a branded rounded-square container.

| Prop | Type | Default | Description |
|---|---|---|---|
| `symbol` | `string` | — | Ticker (BTC, ETH…) |
| `color` | `string` | — | Brand color hex |
| `size` | `number` | `44` | Width/height in px |

- Background: `color + '20'` (12% opacity)
- Border: `color + '35'` (21% opacity)
- Border radius: `size * 0.28` (rounded square)
- Shows up to 3 characters of symbol (2 if >3 chars)

### `SparklineChart` (`components/SparklineChart.tsx`)
SVG area chart for portfolio history.

| Prop | Type | Description |
|---|---|---|
| `data` | `number[]` | Y-axis values |
| `height` | `number` | Chart height |
| `horizontalPadding` | `number` | Left/right padding |
| `color` | `string` | Line color (defaults to accent) |

- Gradient fill from line to bottom
- Endpoint dot (circle at last data point)

---

## 7. Data Model (Mock)

### Asset
```ts
interface Asset {
  id: string;             // 'btc', 'eth'…
  symbol: string;         // 'BTC', 'ETH'…
  name: string;           // 'Bitcoin', 'Ethereum'…
  color: string;          // Brand hex
  priceUSD: number;
  totalAmount: number;    // Sum across exchanges
  totalValueUSD: number;  // Sum across exchanges
  change24hPercent: number;
  holdings: Holding[];    // Per-exchange breakdown
}

interface Holding {
  exchangeId: string;     // 'binance', 'coinbase', 'kraken'
  amount: number;
  valueUSD: number;
}
```

### Exchange
```ts
interface Exchange {
  id: string;             // 'binance'
  name: string;           // 'Binance'
  color: string;          // Brand hex
  colorDim: string;       // rgba with low opacity
  totalValueUSD: number;
  change24hPercent: number;
  assetsCount: number;
  isConnected: boolean;
}
```

### Portfolio Summary
- **Total:** $84,473.34 (+3.48% today, +$2,837.22)
- **Binance:** $58,489 (69% of portfolio)
- **Coinbase:** $21,223 (25%)
- **Kraken:** $4,761 (6%)

### Assets
| Coin | Total Value | Exchanges |
|---|---|---|
| BTC | $48,488 | Binance + Coinbase |
| ETH | $14,734 | Coinbase + Kraken |
| SOL | $12,312 | Binance |
| BNB | $5,824 | Binance |
| USDT | $5,246 | Binance + Kraken |
| XRP | $4,700 | Binance + Kraken |

---

## 8. Navigation

### Stack Structure
```
Root Stack (headerShown: false)
  ├── (auth) group       — welcome, login
  ├── (tabs) group       — tab bar (index, exchanges, settings)
  ├── asset/[id]         — pushed over tabs
  ├── exchange/[id]      — pushed over tabs
  └── add-exchange       — modal presentation
```

### Navigation Rules
| From | Action | To |
|---|---|---|
| Welcome | "Get Started" / "I already have an account" | Login |
| Login | Submit | Dashboard (replaces auth stack) |
| Dashboard asset row | Tap | Asset Detail |
| Dashboard exchange card | Tap | Exchange Detail |
| Exchanges tab card | Tap | Exchange Detail |
| Exchange Detail asset row | Tap | Asset Detail |
| Asset Detail | — | No further navigation (dead end) |
| Settings | "Sign Out" | Welcome (replaces tabs stack) |
| Exchanges "+" / CTA | Tap | Add Exchange modal |
| Add Exchange success | "Back to Exchanges" | Dismiss modal |

---

## 9. UX Principles Applied

1. **One number above the fold** — Portfolio total is always the first thing seen on the dashboard.
2. **No dead ends** — Every detail screen has a back button.
3. **Consistent drill-down** — Navigation flows in one direction: summary → detail. Never sideways from detail.
4. **Security transparency** — Encryption and read-only messaging present on welcome, login, add-exchange, and settings.
5. **Visual hierarchy through scale** — Important numbers are big (900 weight, large px). Labels are small caps.
6. **Color as identity** — Each exchange and coin has a consistent brand color used across all appearances.
7. **No navigation loops** — Asset detail holding rows are NOT tappable to prevent: exchange detail → asset detail → exchange detail → infinite loop.

---

## 10. Changelog

### 2026-03-02 — v1.0.0 Prototype Complete
- Full UI redesign to bold electric blue design system (replacing original purple)
- Pill-shaped primary buttons (`borderRadius: 100`) across all screens
- Floating asset rows — individual card per row on dashboard (not grouped container)
- Custom pill tab bar active indicator using `PillTabButton` component
- Portfolio value enlarged to 44px/900 weight
- Radial blue glow on welcome screen
- Blue gradient (`#3B82F6 → #1D4ED8`) on login and add-exchange CTAs
- CoinIcon updated to rounded-square style (`borderRadius: size * 0.28`)
- All change/status badges updated to pill shape

### 2026-03-02 — v0.2.0
- Added asset detail screen (`app/asset/[id].tsx`)
- Added exchange detail screen (`app/exchange/[id].tsx`)
- Restructured mock data: assets now have `holdings[]` array for multi-exchange support
- Fixed navigation loop: exchange holding rows on asset detail made non-tappable

### 2026-03-02 — v0.1.0 — Initial Prototype
- Project scaffolded with Expo SDK 54 + Expo Router v6
- 6 screens: welcome, login, dashboard, exchanges, settings, add-exchange
- Mock data: 6 assets, 3 exchanges, $84K total portfolio
- SparklineChart component with SVG area chart
- CoinIcon component with brand colors
