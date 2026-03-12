# Nexus — Prototype Specification

> The single source of truth for what we are building and what "done" looks like.
> Every feature is written here before it is coded. If it is not in this spec, it is not in scope.

**Version:** 1.0
**Prototype status:** Active — mock data only, no backend
**Last updated:** March 2026

---

## Table of Contents

1. [How to Use This Document](#1-how-to-use-this-document)
2. [Spec-Driven Workflow](#2-spec-driven-workflow)
3. [Prototype Rules](#3-prototype-rules)
4. [Build Status](#4-build-status)
5. [Navigation Map](#5-navigation-map)
6. [Screen Specs](#6-screen-specs)
7. [Component Inventory](#7-component-inventory)
8. [Mock Data Contract](#8-mock-data-contract)
9. [Backend Readiness Notes](#9-backend-readiness-notes)

---

## 1. How to Use This Document

This spec drives development. The workflow is:

1. **Spec first** — Before any screen or feature is built, write its spec in Section 6
2. **Code second** — Implement against the spec
3. **Verify third** — Check every acceptance criterion before marking done
4. **Update** — If the implementation reveals the spec was wrong, update the spec (not the other way around)

**Status keys used throughout:**
- `✅ Done` — Implemented and acceptance criteria verified
- `🔵 In Progress` — Currently being built
- `⚪ Planned` — Specced, not yet started
- `🔭 Future` — Intended but not yet specced

**Acceptance criteria** are the testable definition of done. A screen is not done until every criterion under it passes.

---

## 2. Spec-Driven Workflow

### Adding a New Feature

When a new screen or feature is requested, before writing any code:

1. Copy the **Screen Spec Template** below into Section 6
2. Fill in all fields — purpose, data, components, states, acceptance criteria
3. Get alignment on the spec before starting
4. Implement against it
5. Check off each criterion
6. Update Build Status in Section 4

### Screen Spec Template

```
### Screen Name
**Route:** `(tab)/path` or `/path`
**Status:** ⚪ Planned
**Purpose:** One sentence — what does this screen do for the user?

**Mock data used:**
- `EXPORT_NAME` from `mockData.ts` (what fields)

**Components used:**
- `<ComponentName variant="x" />` — purpose

**Layout (top → bottom):**
Brief structural description

**States:**
- **Default** — what the user normally sees
- **Loading** — how the screen behaves while waiting (skeleton, spinner, etc.)
- **Empty** — what shows when there's no data
- **Error** — what shows on failure

**Interactions:**
- User taps X → Y happens

**Acceptance criteria:**
- [ ] Criterion phrased as observable fact
```

### Updating an Existing Spec

When a shipped screen needs to change:
1. Update the spec section first — mark changed criteria, add new ones
2. Note the reason for the change with a `> Changed:` blockquote
3. Implement the change
4. Re-verify all criteria

---

## 3. Prototype Rules

These rules apply to everything built in the prototype phase. No exceptions.

### Data
- All data comes from `mobile/data/mockData.ts`. No network calls.
- Never hardcode values inline in screens — always reference `mockData.ts`
- Changing a value in `mockData.ts` must change it everywhere it appears
- Mock data shapes must match the future backend API contract (see Section 8)

### Design System
- All colors → `Colors.*` from `@/constants/Colors`. Never hardcode hex.
- All typography → `TypeScale.*` + `FontFamily.*` from `@/constants/Typography`
- All spacing/radii → `Spacing[n]` / `Radii.*` from `@/constants/Spacing`
- All icons → `<Icon icon={Icons.*} />`. Never import HugeIcons directly.
- All buttons → `<Button variant="..." />`. Never build ad-hoc touchables.
- All cards → `<Card variant="..." />`.
- All inputs → `<Input variant="..." />`.
- All badges → `<Badge variant="..." />`.
- Run `npm run lint:tokens` before every PR.

### Layout
- Tab bar is absolutely positioned (floating pill). Every scrollable screen needs `paddingBottom: insets.bottom + 88`.
- Bottom fade on every tab screen — use `BottomFade.colors` / `BottomFade.height`, never construct manually.
- Safe areas via `useSafeAreaInsets()` only.
- 4px grid: all spacing, sizes, and radii must be multiples of 4.

### Navigation
- Use Expo Router file-based routing. No manual navigation stack manipulation.
- Modals (add-exchange) use `presentation: 'modal'` in layout.
- Back navigation uses the system default — no custom back buttons unless required by design.

### No Backend Yet
- No API calls, no fetch, no axios.
- No auth token handling (login can set a simple flag in state or AsyncStorage).
- No real validation of API keys (add-exchange step 2 can simulate a 1.5s loading delay, then always succeed).

---

## 4. Build Status

| Screen / Feature | Route | Status |
|-----------------|-------|--------|
| Welcome | `/(auth)/welcome` | ✅ Done |
| Login / Register | `/(auth)/login` | ✅ Done |
| Dashboard | `/(tabs)/` | ✅ Done |
| Exchanges | `/(tabs)/exchanges` | ✅ Done |
| Settings | `/(tabs)/settings` | ✅ Done |
| Add Exchange (modal) | `/add-exchange` | ✅ Done |
| Analytics | `/(tabs)/analytics` | ✅ Done |
| Asset Detail | `/asset/[id]` | ✅ Done |
| Exchange Detail | `/exchange/[id]` | ✅ Done |
| Tab bar (floating pill) | `/(tabs)/_layout` | ✅ Done |
| Design system tokens | `constants/` | ✅ Done |
| UI component library | `components/ui/` | ✅ Done |
| Token linter | `scripts/lint-tokens.js` | ✅ Done |

**Component inventory:**

| Component | Variants | Status |
|-----------|----------|--------|
| `Button` | `primary`, `ghost`, `outline`, `icon` | ✅ Done |
| `Card` | `default`, `sm`, `elevated`, `info` + `CardDivider`, `CardRow` | ✅ Done |
| `Input` | `default`, `search` | ✅ Done |
| `Badge` | `tag`, `status`, `change`, `section` | ✅ Done |
| `Icon` | wraps HugeIcons | ✅ Done |
| `SparklineChart` | — | ✅ Done |
| `DotMatrixChart` | — | ✅ Done |
| `AllocationBar` | — | ✅ Done |
| `DonutChart` | — | ✅ Done |
| `CoinIcon` | — | ✅ Done |
| `ExchangeLogo` | — | ✅ Done |
| `Toast` | — | ✅ Done |
| `CoachMark` | — | ✅ Done |
| `TopoBackground` | — | ✅ Done |

---

## 5. Navigation Map

```
App Entry
  │
  ├── No session → (auth) stack
  │     ├── /welcome     — full-screen onboarding
  │     └── /login       — sign in / sign up tabs
  │
  └── Has session → (tabs) stack
        ├── /             — Dashboard (Portfolio tab)
        ├── /exchanges    — Exchanges tab
        ├── /analytics    — Analytics tab
        ├── /settings     — Settings tab
        │
        ├── /asset/[id]   — Asset detail (pushed from Dashboard)
        ├── /exchange/[id]— Exchange detail (pushed from Dashboard or Exchanges tab)
        └── /add-exchange — Add Exchange screen (pushed from Exchanges tab or onboarding)
```

**Tab bar items (order):** Portfolio · Exchanges · Analytics · Settings

**Add Exchange entry points:**
- "+" button on Exchanges tab header → pushes `/add-exchange`
- "Add Another Exchange" on success step → resets flow within the same screen (no re-navigation)

**Deep link targets (future):**
- `/asset/bitcoin` — direct to BTC detail
- `/exchange/binance` — direct to Binance detail

---

## 6. Screen Specs

---

### S-01: Welcome Screen

**Route:** `/(auth)/welcome`
**Status:** ✅ Done
**Purpose:** Orient new users to what Nexus is and build enough trust to start sign-up.

**Mock data used:** None — all content is static copy.

**Components used:**
- `<Button variant="primary" />` — "Get Started" CTA
- `<Button variant="ghost" />` — "I already have an account"
- `<TopoBackground />` — ambient background texture
- `<Badge variant="status" />` — "LIVE" indicator

**Layout (top → bottom):**
1. Logo + wordmark (NEXUS)
2. LIVE badge
3. Headline: "Track. Everything. In one place."
4. 3 feature stats (exchanges, portfolio size, assets)
5. Feature list (3 items with icons)
6. "Get Started" primary button
7. "I already have an account" ghost button
8. Security disclaimer ("Read-only access · Never trades or withdraws")

**States:**
- **Default** — Static. No loading states.

**Interactions:**
- "Get Started" → navigate to `/(auth)/login` (sign up tab active)
- "I already have an account" → navigate to `/(auth)/login` (sign in tab active)

**Acceptance criteria:**
- [ ] NEXUS logo and wordmark visible at top
- [ ] LIVE badge renders in `Colors.accent` with `Colors.onAccent` text
- [ ] Headline is the largest text element on screen
- [ ] 3 stats render with monospace numeric type (`TypeScale.numeric.lg`, `FontFamily.mono`)
- [ ] Security disclaimer is visible without scrolling (bottom of screen)
- [ ] "Get Started" navigates to login screen
- [ ] "I already have an account" navigates to login screen
- [ ] No hardcoded colors or spacing — all tokens
- [ ] Safe area insets respected (no content behind notch or home bar)

---

### S-02: Login / Register Screen

**Route:** `/(auth)/login`
**Status:** ✅ Done
**Purpose:** Allow users to sign in or create an account.

**Mock data used:** None — prototype accepts any non-empty input.

**Components used:**
- `<Input variant="default" />` — email and password fields
- `<Button variant="primary" />` — submit
- `<Button variant="ghost" />` — tab switch (sign in / sign up)

**Layout:**
- Segmented tab (Sign In | Sign Up) at top
- Email input
- Password input (secure, with show/hide toggle)
- Confirm password input (Sign Up tab only)
- Submit button
- Forgot password link (Sign In tab only, ghost style)

**States:**
- **Default** — Empty form
- **Filled** — User has typed; no validation yet
- **Loading** — Button shows spinner for 1.5s (simulated)
- **Success** — Navigate to `/(tabs)/` (dashboard)
- **Error** — Inline error message below relevant field

**Interactions:**
- Submit (Sign In) → 1.5s simulated delay → navigate to dashboard
- Submit (Sign Up) → 1.5s simulated delay → navigate to Add Exchange or dashboard
- Tab switch → form clears, tab animates

**Acceptance criteria:**
- [ ] Sign In and Sign Up tabs are visually distinct (active tab: `Colors.accent`)
- [ ] Password field defaults to secure entry; eye icon toggles visibility
- [ ] Confirm password only visible in Sign Up tab
- [ ] Submitting with empty fields shows inline error ("Email is required")
- [ ] Submit button shows loading state (disabled + spinner) during 1.5s delay
- [ ] After successful sign-in, user lands on Dashboard
- [ ] Keyboard pushes form up (KeyboardAvoidingView) — no input hidden behind keyboard
- [ ] All inputs use `<Input variant="default" />`

---

### S-03: Dashboard (Portfolio Tab)

**Route:** `/(tabs)/`
**Status:** ✅ Done
**Purpose:** Show the user their total portfolio value and give instant access to every asset and exchange.

**Mock data used:**
- `TOTAL_PORTFOLIO` — total value, 24h change USD + %
- `PORTFOLIO_HISTORY` (7-day) — dashboard sparkline
- `PORTFOLIO_DAILY` / `PORTFOLIO_WEEKLY` / `PORTFOLIO_MONTHLY` — chart period selector
- `ASSETS` — asset rows (symbol, name, color, value, 24h change, sparkline)
- `EXCHANGES` — exchange cards (name, color, value, change, assets count)

**Components used:**
- `<SparklineChart />` — portfolio 7-day sparkline (hero) + per-asset inline sparklines
- `<Badge variant="change" />` — 24h change pill (green / red)
- `<Badge variant="section" />` — "ASSETS", "EXCHANGES" section labels
- `<Card variant="default" />` — exchange cards
- `<AllocationBar />` — exchange allocation proportions
- `<CoinIcon />` — coin logo per asset row
- `<ExchangeLogo />` — exchange logo badge

**Layout (top → bottom):**
1. Screen header — "Portfolio" label + date
2. Hero value — `$84,473.34` in `TypeScale.display.lg` + `FontFamily.mono`
3. 24h change pill — `+$2,847.23 · +3.48%`
4. Chart period selector — 7D | 1M | 3M | 1Y tabs (pill style)
5. Portfolio chart — SparklineChart with selected period data
6. "ASSETS" section label + asset count
7. Asset rows (FlatList) — coin icon, name, amount, price, 24h change, inline sparkline, USD value
8. "EXCHANGES" section label
9. Exchange cards (per connected exchange)
10. Bottom fade over tab bar

**States:**
- **Default (populated)** — full data shown
- **Pull-to-refresh** — RefreshControl triggers 1.5s simulated refresh, data unchanged (prototype)
- **Empty** — No exchanges connected: full-screen empty state with "Connect your first exchange" CTA pointing to Exchanges tab

**Interactions:**
- Tap any asset row → navigate to `/asset/[id]`
- Tap any exchange card → navigate to `/exchange/[id]`
- Pull-to-refresh → simulate 1.5s refresh
- Chart period tab → switches chart data (7D = PORTFOLIO_HISTORY, 1M = PORTFOLIO_DAILY, 3M = PORTFOLIO_WEEKLY, 1Y = PORTFOLIO_MONTHLY)

**Acceptance criteria:**
- [ ] Total value renders in `TypeScale.display` size with `FontFamily.mono`
- [ ] 24h USD change and % both visible in the hero area
- [ ] Change pill is green (`Colors.green`) for positive, red (`Colors.red`) for negative
- [ ] Portfolio sparkline fills card width with correct stroke color (`Colors.accent`)
- [ ] Period selector switches chart data without navigation
- [ ] All 6 assets render in correct value-descending order: BTC, USDT, ETH, SOL, XRP, BNB
- [ ] Each asset row shows: coin icon, symbol, name, coin amount, USD value, 24h change badge
- [ ] Each asset row has an inline sparkline (52px wide, `Colors.accent` for positive, `Colors.red` for negative based on `change24hPercent`)
- [ ] Tapping any asset row navigates to correct asset detail
- [ ] All 3 exchange cards render with correct value, change, and asset count
- [ ] Tapping any exchange card navigates to correct exchange detail
- [ ] Bottom fade renders correctly over tab bar
- [ ] Scroll content clears floating tab bar (paddingBottom = insets.bottom + 88)
- [ ] Pull-to-refresh works and resets after 1.5s
- [ ] No hardcoded colors or spacing values

---

### S-04: Exchanges Tab

**Route:** `/(tabs)/exchanges`
**Status:** ✅ Done
**Purpose:** Show all connected exchanges with per-exchange asset breakdowns. Entry point for adding a new exchange.

**Mock data used:**
- `EXCHANGES` — all exchange data
- `getAssetsForExchange(exchangeId)` — assets per exchange

**Components used:**
- `<Card variant="default" />` — exchange cards
- `<Badge variant="status" />` — "LIVE" badge per exchange
- `<Badge variant="change" />` — 24h change
- `<Badge variant="section" />` — "EXCHANGES" label
- `<Button variant="icon" />` — "+" add button in header
- `<AllocationBar />` — exchange's share of total portfolio
- `<CoinIcon />` — asset icons within exchange card

**Layout:**
1. Screen header — "Exchanges" + total value + "+" button
2. Connected exchange count
3. Exchange cards (full width, stacked)
   - Color band header: exchange name (UPPERCASE) + LIVE badge
   - Total value (large)
   - 24h change pill
   - Allocation bar: this exchange's % of total portfolio
   - Coin icon strip: all assets on this exchange
   - Footer: allocation % + asset count
4. "Add Another Exchange" CTA button at bottom
5. Bottom fade

**States:**
- **Populated** — 3 exchange cards
- **Empty** — No exchanges: centered empty state with "Connect your first exchange" CTA → opens Add Exchange modal

**Interactions:**
- Tap exchange card → `/exchange/[id]`
- Tap "+" in header → opens Add Exchange modal
- Tap "Add Another Exchange" button → opens Add Exchange modal

**Acceptance criteria:**
- [ ] All 3 exchanges render with correct name, value, change, and asset count
- [ ] Exchange card header uses exchange's `color` and `colorDim` from mock data
- [ ] LIVE badge renders on each connected exchange
- [ ] 24h change is green/red correctly
- [ ] Allocation bar segment is proportional to exchange's share of `TOTAL_PORTFOLIO.valueUSD`
- [ ] Coin strip shows icons for all assets on that exchange
- [ ] Tapping a card navigates to correct exchange detail
- [ ] "+" button opens Add Exchange modal
- [ ] Scroll content clears tab bar
- [ ] Bottom fade renders correctly

---

### S-05: Settings Tab

**Route:** `/(tabs)/settings`
**Status:** ✅ Done
**Purpose:** Account management, security options, preferences, and sign-out.

**Mock data used:** None — all content is static UI (prototype has no real auth state).

**Components used:**
- `<Card variant="default" />` — grouped settings sections
- `<CardRow />` — individual setting items
- `<CardDivider />` — between rows within a card
- `<Button variant="primary" />` — Sign Out (red / destructive style)
- `<Badge variant="tag" />` — currency tag, version tag

**Layout (top → bottom):**
1. Screen header — "Settings"
2. **Profile card** — Avatar (initials circle), display name, email, PRO badge
3. **Security card** — Biometric lock toggle, Change password row
4. **Connected Exchanges card** — List of connected exchanges with status; "Manage" links to Exchanges tab
5. **Preferences card** — Base currency (USD), Price precision toggle
6. **About card** — Version number, Terms, Privacy Policy
7. **Sign Out** button — red destructive styling
8. Bottom fade

**States:**
- **Default** — static content
- **Sign Out** — 1s simulated delay, then navigate to `/(auth)/welcome`

**Interactions:**
- Biometric toggle → visual toggle only (no real biometric in prototype)
- "Change Password" row → navigates to change password screen (future / can show toast "Coming soon")
- Currency row → dropdown or action sheet to pick currency (prototype: visual only, no actual conversion)
- Sign Out → 1s delay → navigate to welcome screen, clear session flag

**Acceptance criteria:**
- [ ] Profile card shows avatar initials, name, email
- [ ] Each settings section is a `<Card>` with `<CardRow>` + `<CardDivider>` pattern
- [ ] Security toggles render but are interaction-only (no real effect in prototype)
- [ ] Connected exchanges section lists Binance, Coinbase, Kraken with green "Connected" status badges
- [ ] Sign Out button uses `Colors.red` fill (destructive style)
- [ ] Tapping Sign Out navigates back to Welcome screen after 1s delay
- [ ] Scroll content clears tab bar
- [ ] Bottom fade renders correctly
- [ ] No hardcoded values

---

### S-06: Add Exchange

**Route:** `/add-exchange`
**Status:** ✅ Done
**Purpose:** Walk the user through connecting a new exchange in 3 steps: choose → credentials → success.

**Mock data used:** `EXCHANGES` for the exchange list (name, color, logo).

**Components used:**
- `<Button variant="primary" />` — step CTAs
- `<Button variant="ghost" />` — "Skip" / "Cancel"
- `<Input variant="default" secure />` — API key / secret inputs
- `<Badge variant="status" />` — "Read-only" label
- `<ExchangeLogo />` — exchange logo in step 1 grid

**Layout — Step 1 (Choose Exchange):**
- "Connect Exchange" header + dismiss (×) button
- Subtitle: "Select the exchange you want to connect"
- Read-only disclaimer badge
- Grid of exchange options (Binance, Coinbase, Kraken) — 3 cards with logo + name
- Selected exchange highlighted with `Colors.accent` border

**Layout — Step 2 (Enter Credentials):**
- Exchange name + logo in header
- "API Key" input (plain text, no autocomplete)
- "API Secret" input (secure, hidden by default)
- "How to create a read-only API key" expandable accordion
- "Connect Exchange" primary button
- Progress indicator: step 2 of 3

**Layout — Step 3 (Success):**
- Checkmark animation
- "[Exchange name] Connected!"
- "Go to Dashboard" primary button
- "Connect Another Exchange" ghost button

**States:**
- **Step 1** — exchange not yet selected (buttons disabled) / selected (proceed enabled)
- **Step 2** — empty (proceed disabled) / filled (proceed enabled) / loading (1.5s simulated)
- **Step 3** — success

**Interactions:**
- Step 1: tap exchange card → select it (highlight) → "Continue" enabled
- Step 2: fill API Key + Secret → "Connect Exchange" enabled → tap → 1.5s loading → advance to step 3
- Step 3: "Go to Portfolio" → `router.replace('/(tabs)')` — replaces the stack so back would land on tabs, not re-enter this screen
- Step 3: "Add Another Exchange" → resets state back to step 1 (no navigation)
- Back button (step 1) → `router.back()` — returns to Exchanges tab
- Back button (step 2) → returns to step 1 (exchange re-selection)

**Acceptance criteria:**
- [ ] Screen slides in from right (`animation: 'slide_from_right'`) — standard push, not a modal
- [ ] Step 1 shows only exchanges not yet connected (already-connected exchanges are filtered out)
- [ ] Tapping an exchange immediately advances to step 2 (no separate "Continue" button)
- [ ] Step 2 shows correct exchange name and logo
- [ ] API Secret input is hidden by default; eye icon toggles visibility
- [ ] "Connect Exchange" is disabled until both fields have text
- [ ] Tapping Connect shows 1.5s loading state (button spinner, inputs disabled)
- [ ] Step 3 checkmark animation plays on arrival
- [ ] "Go to Dashboard" closes modal and lands on Dashboard
- [ ] "Add another exchange" resets to step 1 (selected exchange cleared, inputs wiped)
- [ ] Back button on step 1 → `router.back()` returns to Exchanges tab
- [ ] Back button on step 2 → returns to step 1 (no navigation, just state reset)
- [ ] Back button hidden on connecting and success steps
- [ ] Keyboard does not obscure inputs (KeyboardAvoidingView / scroll)
- [ ] "Go to Portfolio" uses `router.replace('/(tabs)')` so back stack doesn't re-enter this screen

---

### S-07: Asset Detail

**Route:** `/asset/[id]`
**Status:** ✅ Done
**Purpose:** Show everything the user holds in a single asset — total amount, current price, chart, and per-exchange breakdown.

**Mock data used:**
- `ASSETS.find(a => a.id === id)` — all asset fields
- `asset.priceDaily` / `priceWeekly` / `priceMonthly` — chart period data
- `asset.holdings[]` — per-exchange breakdown
- `EXCHANGES` — exchange name + color for holdings list

**Components used:**
- `<SparklineChart />` — asset price chart with period selector
- `<Badge variant="change" />` — 24h change
- `<Badge variant="section" />` — "BREAKDOWN", "HOLDINGS"
- `<AllocationBar />` — cross-exchange allocation bar
- `<Card variant="default" />` — value summary card, holdings card
- `<CardRow />` + `<CardDivider />` — per-exchange holding rows
- `<ExchangeLogo />` — small exchange logo badges

**Layout (top → bottom):**
1. Header — coin icon + name + symbol + back button
2. **Value card:**
   - Total USD value (large, mono)
   - Total coin amount (e.g., "0.72 BTC")
   - Current price + 24h change badge
   - Exchange count (e.g., "Across 2 exchanges")
3. Chart period selector — 7D | 30D | 3M | 1Y
4. Price chart (SparklineChart with period data)
5. **BREAKDOWN section:**
   - Allocation bar — colored segments per exchange with labels
   - Legend: exchange name + % allocation
6. **HOLDINGS section:**
   - Row per exchange: exchange logo + name | coin amount | allocation bar | USD value
7. Bottom fade

**States:**
- **Populated** — all sections shown
- **404** — asset id not found → show error or navigate back

**Interactions:**
- Period tab → switch chart data
- Back button → pop to previous screen
- Exchange row tap → navigate to `/exchange/[id]` (optional, enhances UX)

**Acceptance criteria:**
- [ ] Navigating from Dashboard asset row loads correct asset data
- [ ] Total USD value uses `TypeScale.display` + `FontFamily.mono`
- [ ] Coin amount shows correct precision per `formatAmount()` helper
- [ ] 24h change badge is correctly green or red
- [ ] Price uses `formatPrice()` helper
- [ ] Chart period selector shows 4 tabs: 7D, 30D, 3M, 1Y
- [ ] Switching period updates chart data correctly (7D = `sparkline`, 30D = `priceDaily`, 3M = `priceWeekly`, 1Y = `priceMonthly`)
- [ ] Allocation bar segments are proportional to each exchange's share of total holding
- [ ] Holdings section has one row per exchange in `asset.holdings[]`
- [ ] Each holding row shows exchange logo, exchange name, amount (coin), and USD value
- [ ] Bottom padding clears tab bar
- [ ] Back navigation works
- [ ] **Research section** renders below holdings with: All-Time High (price + date), Market Cap, Rank, Circulating Supply
- [ ] Research values use `FontFamily.mono` numeric type
- [ ] Supply displays as `B` suffix for ≥ 1000M (e.g., USDT), `M` suffix for < 1000M

---

### S-08: Exchange Detail

**Route:** `/exchange/[id]`
**Status:** ✅ Done
**Purpose:** Show everything held on one specific exchange — total value, performance, and full asset list.

**Mock data used:**
- `EXCHANGES.find(e => e.id === id)` — exchange data
- `getAssetsForExchange(id)` — assets on this exchange
- `TOTAL_PORTFOLIO.valueUSD` — to compute allocation %

**Components used:**
- `<Badge variant="status" />` — LIVE badge
- `<Badge variant="change" />` — 24h change
- `<Badge variant="section" />` — "ASSETS"
- `<Card variant="elevated" />` — summary card
- `<Card variant="default" />` — asset list card
- `<CardRow />` + `<CardDivider />` — per-asset rows
- `<AllocationBar />` — exchange share of total portfolio
- `<CoinIcon />` — per asset row
- `<SparklineChart />` — exchange value chart with period selector

**Layout (top → bottom):**
1. Header — exchange name (in exchange color) + back button + LIVE badge
2. **Summary card:**
   - Total value (large, mono)
   - 24h change badge
   - Exchange allocation bar (% of total portfolio)
   - Chart period selector — 7D | 30D | 3M | 1Y
   - Value chart (SparklineChart with exchange period data)
3. **ASSETS section:**
   - Row per asset: coin icon | name + symbol | amount | allocation bar | USD value | 24h change badge
4. Bottom fade

**States:**
- **Populated** — standard view
- **Error/disconnected** — exchange `isConnected: false` → show warning banner "This exchange is not connected"
- **404** — exchange id not found → navigate back

**Interactions:**
- Period tab → switch chart data (`valueDaily`, `valueWeekly`, `valueMonthly`)
- Asset row tap → navigate to `/asset/[asset.id]`
- Back button → pop to previous screen

**Acceptance criteria:**
- [ ] Exchange name renders in the exchange's `color` from mock data
- [ ] LIVE badge shows if `isConnected: true`
- [ ] Total value correct for the exchange
- [ ] 24h change badge correct color
- [ ] Allocation bar shows exchange's % of `TOTAL_PORTFOLIO.valueUSD`
- [ ] Chart period selector switches between exchange's `valueDaily`, `valueWeekly`, `valueMonthly`
- [ ] Asset list shows only assets with holdings on this exchange
- [ ] Each asset row shows coin icon, name, amount held on this exchange (not total), allocation bar, USD value
- [ ] Tapping an asset row navigates to correct asset detail
- [ ] Bottom padding clears tab bar

---

### S-09: Analytics Tab

**Route:** `/(tabs)/analytics`
**Status:** ✅ Done
**Purpose:** Give users context on how their portfolio is performing — benchmark comparisons, risk profile, and actionable insights.

**Mock data used:**
- `BENCHMARKS` — 4 benchmark comparison items (portfolio, BTC, ETH, S&P 500) with 7d change %
- `RISK_METRICS` — single object with volatility score, Sharpe ratio, concentration risk, exchange count
- `INSIGHTS` — 5 insight cards typed as warning | info | tip

**Components used:**
- `<Card variant="default" />` — benchmark card, risk metrics card
- `<CardRow />` + `<CardDivider />` — risk metric rows
- `<Badge variant="status" />` — volatility label (red), exchange risk label (green)
- `<Icon />` — row icons in risk metrics section

**Layout (top → bottom):**
1. Screen title "Analytics"
2. **BENCHMARKS section** — Card with 4 rows: `[dot] [label] [bar] [+/-X.XX%]`
3. **RISK METRICS section** — Card with 4 rows: volatility, Sharpe, concentration, exchange risk
4. **INSIGHTS section** — 5 individual insight cards with typed left borders
5. Bottom fade

**States:**
- **Default** — all sections shown with mock data
- No empty or error states (prototype: always populated)

**Interactions:**
- Benchmark bars animate in on mount (staggered, `useNativeDriver: false` for width)
- Sections fade + slide in on mount (staggered 80ms, `useNativeDriver: true`)
- Insight cards fade + slide in on mount (staggered 60ms)
- No tappable rows (read-only analytics)

**Acceptance criteria:**
- [ ] Analytics tab is 3rd in tab bar (between Exchanges and Settings)
- [ ] Tab icon matches other tabs (size, stroke weight, color behavior)
- [ ] Sliding pill animates correctly to Analytics tab position
- [ ] All 4 benchmark rows render with color dot, label, proportional bar, and return %
- [ ] Portfolio row dot uses `Colors.accent` (lime); other rows use benchmark's brand color from data
- [ ] Positive returns are `Colors.green`, negative are `Colors.red`
- [ ] Benchmark bars animate in on mount with stagger
- [ ] Volatility row shows `72/100` + red "High" badge
- [ ] Sharpe ratio `1.84` renders in `FontFamily.mono`
- [ ] Exchange risk row shows `3 exchanges` + green "Diversified" badge
- [ ] All 5 insight cards render
- [ ] Warning insights have `Colors.red` left border; tip insights `Colors.accent`; info insights `Colors.gray`
- [ ] Insight icon background uses the matching `*Dim` color
- [ ] Scroll content clears floating tab bar (paddingBottom = insets.bottom + 88)
- [ ] Bottom fade renders correctly
- [ ] No hardcoded colors or spacing values

---

## 7. Component Inventory

### Design System Components (`components/ui/`)

These are the building blocks. Never build ad-hoc alternatives to these.

#### `<Button />`
| Variant | Use Case | Background | Text |
|---------|----------|-----------|------|
| `primary` | Main CTAs | `Colors.accent` | `Colors.onAccent` |
| `ghost` | Secondary actions | transparent | `Colors.white` |
| `outline` | Tertiary actions | transparent | `Colors.white`, `Colors.accentBorder` border |
| `icon` | Icon-only actions | `Colors.muted` | — |

- Minimum height: `Spacing.touchTarget` (44)
- Loading state: activity indicator replaces label, button disabled
- Disabled state: reduced opacity, not pressable
- Destructive variant: `backgroundColor: Colors.red` (use `primary` + custom color prop, or design-system destructive variant)

#### `<Card />`
| Variant | Background | Radius | Use Case |
|---------|-----------|--------|----------|
| `default` | `Colors.card` | `Radii.card` | Standard content cards |
| `sm` | `Colors.card` | `Radii.cardSM` | Compact cards |
| `elevated` | `Colors.cardElevated` | `Radii.card` | Feature cards, summary blocks |
| `info` | `Colors.muted` | `Radii.cardSM` | Inline info blocks |

Sub-components: `<CardRow />` (standard row with label + value), `<CardDivider />` (1px separator between rows).

#### `<Input />`
| Variant | Use Case |
|---------|----------|
| `default` | Standard text input, forms |
| `search` | Search fields (magnifier icon prefix) |

Props: `secure` (password), `showClear` (× button), `mono` (monospace font), `leadingIcon`, `tooltip`.

#### `<Badge />`
| Variant | Use Case | Example |
|---------|----------|---------|
| `tag` | Label/category | "BTC", "Layer 1" |
| `status` | State indicator | "LIVE", "Connected" |
| `change` | Price/portfolio change | "+3.48%", "-1.24%" |
| `section` | Section headers | "ASSETS", "HOLDINGS" |

- `change` variant: automatically green for positive values, red for negative.
- `status` variant: green for connected/active, red for error.

#### `<Icon />`
- Wraps HugeiconsIcon with named size scale (`IconSize.feature`, `IconSize.md`, `IconSize.sm`, `IconSize.xs`)
- Default color: `Colors.gray`
- Always use `Icons.*` from `@/constants/Icons` — never import icon directly

---

### Domain Components (`components/`)

#### `<SparklineChart />`
- **Required prop:** `width` — always pass explicitly, never omit
- `data: number[]` — array of price/value points
- `color` — line color (defaults to `Colors.accent`)
- `height` — chart height in points
- Use `width={52}` for inline row sparklines, `width={chartWidth}` for full-width charts

#### `<AllocationBar />`
- `segments: { color: string; percent: number; label?: string }[]`
- Renders proportional colored segments summing to 100%
- Used for exchange allocation (dashboard), cross-exchange asset breakdown (asset detail), portfolio share (exchange detail)

#### `<DotMatrixChart />`
- Used for DotMatrix-style visualizations
- Top active dot per column = `Colors.green`

#### `<DonutChart />`
- `data: { value: number; color: string; label: string }[]`
- Used for allocation pie/donut visualization

#### `<CoinIcon />`
- `symbol: string` — renders colored circle with coin initial or a known coin logo
- `color: string` — from `asset.color` in mock data
- `size?: number`

#### `<ExchangeLogo />`
- `exchangeId: string` — renders the exchange logo/icon
- Used in holdings rows, exchange cards

---

## 8. Mock Data Contract

> The shapes in `mockData.ts` are the agreed contract between the prototype and the future backend. When the backend is built, its API responses must match these shapes. Do not change mock data shapes without updating this section and the Tech Spec.

### `Asset`
```typescript
interface Asset {
  id: string;              // CoinGecko ID — matches backend's asset identifier
  symbol: string;          // "BTC", "ETH"
  name: string;            // "Bitcoin", "Ethereum"
  color: string;           // Brand hex — UI only, not from backend
  priceUSD: number;        // Current price
  totalAmount: number;     // Sum of all holdings
  totalValueUSD: number;   // totalAmount × priceUSD
  change24hPercent: number;// Positive or negative
  sparkline: number[];     // 7 closing prices (newest last)
  priceDaily:   ChartPoint[]; // 30 points — daily closes
  priceWeekly:  ChartPoint[]; // 12 points — weekly closes
  priceMonthly: ChartPoint[]; // 12 points — monthly closes
  holdings: Holding[];     // Per-exchange breakdown
}
```

### `Holding`
```typescript
interface Holding {
  exchangeId: string;  // matches Exchange.id
  amount: number;      // Coin amount on this exchange
  valueUSD: number;    // amount × priceUSD
}
```

### `Exchange`
```typescript
interface Exchange {
  id: string;              // 'binance', 'coinbase', 'kraken'
  name: string;            // "Binance", "Coinbase", "Kraken"
  color: string;           // Brand hex — UI only
  colorDim: string;        // rgba at ~12% opacity — UI only
  isConnected: boolean;    // Backend: connection status
  totalValueUSD: number;   // Sum of all holdings on this exchange
  assetsCount: number;     // Number of assets with non-zero balance
  change24hPercent: number;// Weighted average 24h change across holdings
  valueDaily:   ChartPoint[]; // 30 points — daily closes
  valueWeekly:  ChartPoint[]; // 12 points — weekly closes
  valueMonthly: ChartPoint[]; // 12 points — monthly closes
}
```

### `Asset.fundamentals` (added Phase 5)
```typescript
fundamentals: {
  ath:                number;   // All-time high price in USD
  athDate:            string;   // ISO date: "2024-12-17"
  marketCapBn:        number;   // Market cap in billions
  rank:               number;   // CoinGecko rank
  circulatingSupplyM: number;   // Circulating supply in millions (≥1000M → display as B)
}
```

### `Benchmark` (Phase 5)
```typescript
interface Benchmark {
  id:              string;
  label:           string;
  returns7d:       number[];        // 7 normalized values, base 100
  change7dPercent: number;
  color:           string;          // benchmark brand color — data layer only
}
```

### `RiskMetrics` (Phase 5)
```typescript
interface RiskMetrics {
  volatilityScore:   number;       // 0–100
  volatilityLabel:   string;       // 'Low' | 'Moderate' | 'High'
  sharpeRatio:       number;
  concentrationRisk: string;
  topHoldingName:    string;
  topHoldingPercent: number;
  exchangeCount:     number;
  exchangeRiskLabel: string;       // 'Diversified' | 'Concentrated'
}
```

### `Insight` (Phase 5)
```typescript
type InsightType = 'warning' | 'info' | 'tip';
interface Insight {
  id:      string;
  type:    InsightType;
  title:   string;
  body:    string;
  iconKey: string;   // key in Icons registry
}
```

### `TOTAL_PORTFOLIO`
```typescript
{
  valueUSD: number;         // Sum of all exchange totals
  change24hUSD: number;     // Absolute 24h change
  change24hPercent: number; // Percentage 24h change
}
```

### Helper Functions (to keep at backend swap time)
```
formatUSD(value)    → "$84,473.34" or "$84.47K" for large values
formatAmount(n, s)  → "0.7200 BTC" or "5,246 USDT"
formatPrice(price)  → "$67,345.68" or "$0.5530"
getAssetsForExchange(exchangeId) → Asset[]
getHolding(asset, exchangeId)    → Holding | undefined
```

These format functions will remain in a `utils/format.ts` file post-backend. The data-fetching versions of `getAssetsForExchange` and `getHolding` will be replaced by API calls.

---

## 9. Backend Readiness Notes

> These are forward-looking notes only. Nothing here needs to be built now. When backend development begins, refer to the Technical Specification for implementation details.

### What will change at backend integration

| Screen | Mock source today | Backend source later |
|--------|------------------|---------------------|
| Dashboard | `TOTAL_PORTFOLIO`, `ASSETS`, `EXCHANGES` from mockData | `GET /api/v1/portfolio` |
| Asset Detail | `ASSETS.find(id)` from mockData | `GET /api/v1/assets/:id` |
| Exchange Detail | `EXCHANGES.find(id)` from mockData | `GET /api/v1/exchanges/:id` |
| Exchanges tab | `EXCHANGES` from mockData | `GET /api/v1/exchanges` |
| Add Exchange | Always succeeds after 1.5s | `POST /api/v1/exchanges` → validates key against exchange |
| Login | Accepts any input | `POST /api/v1/auth/login` → JWT |
| Settings | Static | `GET /api/v1/user`, `DELETE /api/v1/user` |

### Design decisions that protect backend swap

1. **No data logic in screens** — `formatUSD()`, `getAssetsForExchange()` etc. are in `mockData.ts`. When backend ships, move them to `utils/format.ts` + `services/api.ts`. Screen code stays the same.
2. **Mock data shapes match API contract** — The `Asset`, `Holding`, `Exchange` interfaces in `mockData.ts` directly mirror the `GET /api/v1/portfolio` response defined in the Tech Spec. No reshaping required.
3. **IDs are stable strings** — Asset IDs are CoinGecko IDs (`'bitcoin'`, `'ethereum'`). Exchange IDs are lowercase slugs (`'binance'`). These will be the same in the backend.
4. **Chart data format is consistent** — All chart arrays are `{ label: string; value: number }[]` (newest last). The backend will return the same format.
5. **Simulated loading states exist** — Login and Add Exchange already have 1.5s fake delays with correct UX (spinner, disabled inputs). Swapping mock delay for real fetch requires only changing the internals of those async functions.

### Authentication stub
The prototype does not enforce auth. When backend integration begins:
- `AsyncStorage.setItem('accessToken', ...)` on login — already structured in the login screen
- `AsyncStorage.removeItem('accessToken')` on sign out — already in Settings
- The `/(tabs)/_layout` should check for token existence on mount; redirect to `/(auth)/welcome` if absent

---

*Document version: 1.0 | Created: March 2026 | Owner: Product + Engineering | Review: Before each new feature is built*
