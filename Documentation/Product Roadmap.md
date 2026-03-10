# Nexus — Product Roadmap

> Every feature on this roadmap serves one goal: give investors a complete, accurate, and effortless view of their total crypto holdings. Nothing here turns Nexus into a trading platform or moves it off that path.

**North Star:** *The most trusted, complete picture of a crypto investor's wealth — across every exchange, wallet, and chain — in one place.*

**Last updated:** March 2026
**Status key:** 🟢 Done · 🔵 In Progress · ⚪ Planned · 🔭 Future Consideration

---

## Roadmap Overview

```
Phase 1 ──── Phase 2 ──── Phase 3 ──── Phase 4 ──── Phase 5 ──── Phase 6
Foundation   Portfolio    Expanded     Alerts &     Analytics    Platform
  (MVP)      Intelligence  Coverage   Monitoring    & Insights   Expansion
  Q1 2026     Q2 2026      Q3 2026     Q3 2026       Q4 2026      2027
```

---

## Phase 1 — Foundation (MVP)
*Build the real backend. Make the prototype real.*

### 1.1 Backend Infrastructure
- 🔵 **Node.js + Fastify API server** — Core REST API for all mobile requests
- 🔵 **PostgreSQL database** — Persistent storage for users, connections, holdings
- 🔵 **Redis cache layer** — Price data (TTL 60s), portfolio aggregation (TTL 30s)
- 🔵 **AES-256-GCM key encryption** — All API keys encrypted at rest, never exposed to client
- 🔵 **JWT authentication** — 15-min access tokens, 7-day refresh tokens

### 1.2 Exchange Connections (3 Exchanges)
- 🔵 **Binance** — Balance sync via CCXT (`fetchBalance`), all spot assets
- 🔵 **Coinbase Advanced Trade** — Balance sync, Advanced Trade API (JWT auth)
- 🔵 **Kraken** — Balance sync, nonce-based HMAC auth

### 1.3 Portfolio Sync Engine
- 🔵 **60-second auto-sync** — node-cron job syncs all active connections
- 🔵 **Price data pipeline** — CoinGecko API with Redis caching per symbol
- 🔵 **Portfolio aggregation** — Cross-exchange totals, per-asset totals, 24h change
- 🔵 **Stale data handling** — "Last synced X minutes ago" indicator on stale data
- 🔵 **Error recovery** — Exponential backoff, clear per-exchange error states

### 1.4 Mobile ↔ Backend Integration
- 🔵 **Replace mock data** — Connect all screens to real API responses
- 🔵 **Auth flow** — Login/register connected to backend
- 🔵 **Add Exchange flow** — Live API key validation before saving
- 🔵 **Pull-to-refresh** — Forces immediate backend sync
- 🔵 **App foreground refresh** — Re-fetches when user returns to app

### 1.5 Onboarding
- ⚪ **Exchange-specific API key guides** — Step-by-step in-app instructions (Binance, Coinbase, Kraken) with screenshots
- ⚪ **First-sync loading state** — Skeleton UI with "Connecting to Binance…" progress
- ⚪ **Empty state** — Helpful prompt when no exchanges connected yet

---

## Phase 2 — Portfolio Intelligence
*Turn raw balances into meaningful investment insight.*

### 2.1 Historical Performance Charts
- ⚪ **Portfolio value history** — 7D / 30D / 90D / 1Y / All time chart on dashboard
- ⚪ **Snapshot storage** — Record portfolio value every hour (PostgreSQL time-series)
- ⚪ **Per-asset price history** — Individual asset charts on the Asset Detail screen (7D / 30D / 90D)
- ⚪ **Exchange-level history** — How much was on each exchange over time

> **Why:** Users currently only see *current* value. Historical context transforms a number into a story — "I'm up $12K this month."

### 2.2 P&L Tracking (Unrealized)
- ⚪ **Cost basis input** — User manually enters average buy price per asset (no exchange trade history required)
- ⚪ **Unrealized P&L per asset** — Current value minus cost basis, in USD and %
- ⚪ **Total unrealized P&L** — Portfolio-wide gain/loss since tracked
- ⚪ **P&L badge on asset rows** — Green/red "↑ +$4,230" on dashboard asset rows

> **Why:** "How much am I actually up?" is the #1 question after "what is my portfolio worth?" Cost basis is user-provided (no trade history parsing needed — avoids tax complexity).

### 2.3 Allocation Analysis
- ⚪ **Asset allocation donut chart** — Visual breakdown of portfolio % per asset
- ⚪ **Category allocation** — Layer 1s vs. stablecoins vs. altcoins vs. DeFi tokens
- ⚪ **Exchange concentration view** — What % of total is on each exchange (risk indicator)
- ⚪ **Allocation targets** — User sets target % per asset; app shows drift from target

> **Why:** Knowing *what you hold* and *how concentrated you are* is essential for risk-aware investing.

### 2.4 Stablecoin Visibility
- ⚪ **Separate stablecoin section** — USDT, USDC, BUSD, DAI grouped and totaled separately
- ⚪ **Stablecoin % of portfolio** — "28% in stablecoins (idle cash)"
- ⚪ **Earning potential hint** — "Your $23K in USDT could be earning 4.5% APY via staking"

> **Why:** Stablecoins are often the forgotten part of a portfolio. Visibility helps users decide whether idle cash is intentional.

---

## Phase 3 — Expanded Asset Coverage
*Cover more of where users actually hold crypto.*

### 3.1 More Centralized Exchanges
Priority order based on user base size:

| Exchange | CCXT ID | Priority | Notes |
|----------|---------|----------|-------|
| **OKX** | `okx` | High | 3rd largest by volume globally |
| **Bybit** | `bybit` | High | Fastest-growing derivatives exchange |
| **KuCoin** | `kucoin` | High | Popular for altcoins |
| **Binance.US** | `binanceus` | High | US users blocked from Binance global |
| **Gemini** | `gemini` | Medium | Strong US user base, regulated |
| **Bitget** | `bitget` | Medium | Growing in Asia |
| **MEXC** | `mexc` | Medium | Wide altcoin selection |
| **Gate.io** | `gateio` | Medium | Long tail altcoins |
| **Bitstamp** | `bitstamp` | Low | EU-focused, lower volume |
| **HTX (Huobi)** | `htx` | Low | Declining but still significant |

> **Technical note:** Adding each exchange requires only a new CCXT instance. No architecture changes needed.

### 3.2 On-Chain Wallet Tracking (Read-Only)
- ⚪ **Ethereum wallets** — Connect any ETH address (ENS supported). Read native ETH balance + all ERC-20 tokens via Alchemy/Infura API
- ⚪ **Solana wallets** — Connect any SOL address. Read SOL balance + SPL tokens via Helius/QuickNode RPC
- ⚪ **Bitcoin wallets** — Connect any BTC address. Read BTC balance via Blockstream or Mempool.space API
- ⚪ **Multi-address support** — Add multiple wallets per chain (e.g., "Hardware Wallet", "Hot Wallet")
- ⚪ **Unified CEX + wallet view** — On-chain balances merge into the same portfolio view as exchange balances

> **Why:** After FTX, many users moved assets to self-custody. Without wallet tracking, Nexus has a blind spot for often the largest portion of their portfolio.

> **Technical approach:** No private keys ever. Read-only via public blockchain APIs (address → balance). No wallet SDK needed. Just HTTP calls to Alchemy (ETH), Helius (SOL), Blockstream (BTC).

### 3.3 DeFi Position Tracking
*Read-only. Shows value locked, not the underlying protocols.*

- ⚪ **Liquidity pool positions** — Uniswap v2/v3, Curve, Balancer LP positions by wallet address
- ⚪ **Lending positions** — Aave, Compound: show deposited value and borrowed value (net position)
- ⚪ **Yield farming** — Active farming positions with estimated APY
- ⚪ **DeFi net value** — "You have $8,400 in DeFi protocols" as a dashboard section

> **Technical approach:** DeBank API or Zapper API provide a single endpoint that returns all DeFi positions for an Ethereum address. No need to query each protocol individually.

### 3.4 Staking & Yield Tracking
- ⚪ **Exchange staking** — Binance Earn, Coinbase staking, Kraken staking balances (separate CCXT endpoints)
- ⚪ **On-chain staking** — ETH validator balance (Beacon Chain API), SOL stake accounts
- ⚪ **Yield summary** — Total staking rewards earned (estimate based on APY × time)
- ⚪ **Staked vs. liquid** — Dashboard shows "X% staked / Y% liquid" split

---

## Phase 4 — Alerts & Monitoring
*Nexus works for the user even when the app is closed.*

### 4.1 Price Alerts
- ⚪ **Price threshold alerts** — "Alert me when BTC reaches $50,000"
- ⚪ **Percentage move alerts** — "Alert me if BTC moves ±10% in 24h"
- ⚪ **Above/below alerts** — Simple "above $X" or "below $X" triggers
- ⚪ **Alert history** — Log of all triggered alerts with timestamp and price

### 4.2 Portfolio Alerts
- ⚪ **Portfolio value milestone** — "Alert me when my portfolio hits $100K"
- ⚪ **Daily summary notification** — Optional daily push: portfolio value + 24h change
- ⚪ **Big move alert** — "Your portfolio changed by more than 10% today"

### 4.3 Connection Health Alerts
- ⚪ **Sync failure notification** — "Binance connection failed. Tap to reconnect."
- ⚪ **API key expiry warning** — Some exchanges allow key expiry dates; warn before it happens
- ⚪ **New asset detected** — "A new asset (ARB) appeared in your Binance wallet"

### 4.4 Push Notification Infrastructure
- ⚪ **Expo Push Notifications** — Cross-platform (iOS + Android) via Expo's notification service
- ⚪ **Notification preferences** — Per-alert-type on/off toggles in Settings
- ⚪ **Quiet hours** — User-defined hours when no notifications are sent

---

## Phase 5 — Analytics & Insights
*From data to understanding. Help users make sense of what they hold.*

### 5.1 Benchmark Comparison
- ⚪ **vs. Bitcoin** — "Your portfolio returned +18% vs BTC's +24% this month"
- ⚪ **vs. Ethereum** — Same comparison vs. ETH
- ⚪ **vs. Total Market** — Compare against total crypto market cap change (CoinGecko market data)
- ⚪ **vs. S&P 500** — Optional: show crypto performance against traditional market (via free finance API)
- ⚪ **Benchmark selector** — User picks their preferred benchmark

> **Why:** Without context, +15% means nothing. Against BTC, it means you underperformed. Against S&P 500, you crushed it. Context is everything.

### 5.2 Risk Metrics
- ⚪ **Volatility score** — 30-day rolling volatility of the portfolio vs. benchmark
- ⚪ **Largest single-asset concentration** — "62% of your portfolio is in BTC" (risk flag if too high)
- ⚪ **Exchange concentration risk** — "74% of assets on one exchange" warning
- ⚪ **Stablecoin ratio** — Idle cash % as a safety metric

### 5.3 Portfolio Insights Feed
- ⚪ **Auto-generated insights** — Plain-language observations about the portfolio:
  - "Your BTC allocation has grown from 45% to 61% this month"
  - "ETH is your best performer this week (+18.3%)"
  - "USDT has been idle for 30 days"
- ⚪ **Weekly digest** — In-app summary card: top performer, biggest position, portfolio change

### 5.4 Asset Research Cards
- ⚪ **Basic fundamentals** — Market cap, rank, circulating supply, all-time high (via CoinGecko)
- ⚪ **Your position context** — "You own 0.0003% of all BTC in circulation"
- ⚪ **Price vs. ATH** — "BTC is currently 38% below its all-time high of $69,000"

---

## Phase 6 — Platform Expansion
*Meet users where they are.*

### 6.1 iOS & Android Widgets
- ⚪ **Small widget** — Total portfolio value + 24h change %
- ⚪ **Medium widget** — Value + top 3 assets by value
- ⚪ **Lock screen widget (iOS 16+)** — Portfolio value, always visible
- ⚪ **Interactive widget (iOS 17+)** — Tap to trigger manual refresh

> **Technical note:** Requires React Native bare workflow or Expo Widgets (new in Expo SDK 52+). One of the few features requiring native code.

### 6.2 Apple Watch Companion
- ⚪ **Glance complication** — Total portfolio value on watch face
- ⚪ **Watch app** — Simple portfolio overview: total value, 24h change, top 3 assets
- ⚪ **Haptic alerts** — Vibrate on price alert triggers

### 6.3 Web App
- ⚪ **Responsive web dashboard** — Same data as mobile, optimized for desktop
- ⚪ **Larger charts** — More data visible on desktop: 30-day default, more detail
- ⚪ **Keyboard shortcuts** — Power users appreciate navigation without mouse
- ⚪ **Shared codebase** — React Native Web enables code sharing with mobile app

### 6.4 Desktop App (macOS / Windows)
- ⚪ **Menu bar app (macOS)** — Live portfolio value in menu bar, dropdown for quick view
- ⚪ **System tray (Windows)** — Same concept for Windows users

---

## Phase 7 — Collaboration & Export
*Share and understand your portfolio beyond the app.*

### 7.1 Portfolio Sharing
- ⚪ **Read-only share link** — Generate a shareable URL showing portfolio (with values, without exchange details)
- ⚪ **Privacy options** — Share with values hidden (%, allocation only) or full values
- ⚪ **Link expiry** — Share links expire after 24h / 7d / custom

### 7.2 Export
- ⚪ **CSV export** — All holdings with current values and dates
- ⚪ **PDF portfolio report** — Styled PDF: portfolio overview, allocation chart, per-asset breakdown
- ⚪ **Transaction history export** — Raw trade history from connected exchanges (for accountants)

### 7.3 Multi-Portfolio Support
- ⚪ **Named portfolios** — "Personal", "Business", "Trading"
- ⚪ **Portfolio isolation** — Each portfolio has its own exchanges and wallets
- ⚪ **Combined view** — Toggle between individual portfolios or "All Combined"

> **Use case:** User has personal crypto + a business entity holding crypto. Currently impossible to track separately.

---

## Feature Dependency Map

```
Phase 1 (Backend) ──→ Everything else depends on this

Phase 2 (Portfolio Intelligence)
  ├── 2.1 History Charts → requires Phase 1 + snapshot storage
  ├── 2.2 P&L → requires Phase 1 + cost basis input
  └── 2.3 Allocation Analysis → requires Phase 1

Phase 3 (Expanded Coverage)
  ├── 3.1 More CEXs → requires Phase 1 only (each is independent)
  ├── 3.2 On-Chain Wallets → independent of Phase 1 (different data source)
  └── 3.3 DeFi Positions → requires 3.2 (needs wallet address)

Phase 4 (Alerts) → requires Phase 1 + Expo push notifications setup

Phase 5 (Analytics) → requires Phase 2 (needs history data)

Phase 6 (Platform) → requires Phase 1 (needs real data)

Phase 7 (Export) → requires Phase 2 + 3 (richer data = better exports)
```

---

## What's Deliberately Excluded

These features were considered and rejected because they change the product's fundamental nature:

| Feature | Why Excluded |
|---------|-------------|
| **Trade execution** | Transforms Nexus from viewer to broker. Different regulatory category, different liability, different trust model. |
| **Tax reporting (cost basis, FIFO/LIFO)** | This is a standalone product (Koinly, CoinTracker). Adding it requires full transaction history, complex accounting logic, and jurisdiction-specific rules. A separate integration with Koinly is better than rebuilding it. |
| **Price prediction / signals** | Speculative. Damages trust if wrong. Not our expertise. |
| **Social trading / copy trading** | Requires user identity, social graph, trust network. Completely different product. |
| **Crypto earning / yield products** | Requires money transmission license. Out of scope permanently. |
| **Fiat accounts (bank integration)** | Different data sources (Plaid/Open Banking), different regulations. Would dilute the crypto focus. |
| **NFT portfolio valuation** | Illiquid assets with unreliable floor prices. Misleading more than helpful. Reconsider if NFT market matures. |

---

## Prioritization Framework

When deciding what to build next, score each feature on:

| Criterion | Weight | Question |
|-----------|--------|----------|
| **User value** | 40% | Does this give the user meaningfully better investment visibility? |
| **Technical complexity** | 25% | How long to build and how much maintenance? |
| **User demand** | 20% | Have multiple users asked for this? |
| **Strategic fit** | 15% | Does this reinforce "complete picture of your investments"? |

**Score 1–5 on each. Weighted total → build order.**

---

## Metrics to Track Per Phase

| Phase | Key Metric | Target |
|-------|-----------|--------|
| Phase 1 (MVP) | Exchange connection rate | > 80% of signups connect at least 1 exchange |
| Phase 2 (Intelligence) | Session length | +40% vs. Phase 1 (users spending more time with richer data) |
| Phase 3 (Coverage) | Assets tracked per user | Average > 5 assets (up from 3 in Phase 1) |
| Phase 4 (Alerts) | 30-day retention | > 55% (alerts bring users back) |
| Phase 5 (Analytics) | Weekly active users | +25% (insights create habit) |
| Phase 6 (Platform) | Widget installs | > 30% of active users install widget |

---

*Document version: 1.0 | Created: March 2026 | Review: Quarterly or after each phase ships*
