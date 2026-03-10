# Nexus — Product Requirements Document (PRD)

> Defines what Nexus is, who it's for, what it does, and how success is measured. This document governs feature decisions.

**Version:** 1.0
**Status:** Active
**Scope:** Mobile app MVP + backend infrastructure

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Goals & Success Metrics](#2-goals--success-metrics)
3. [User Personas](#3-user-personas)
4. [User Stories](#4-user-stories)
5. [Feature Specifications](#5-feature-specifications)
6. [MVP Scope](#6-mvp-scope)
7. [Out of Scope (v1)](#7-out-of-scope-v1)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Design Principles](#9-design-principles)
10. [Constraints & Assumptions](#10-constraints--assumptions)

---

## 1. Product Vision

### One-liner
**Nexus gives crypto investors a single, real-time view of everything they own across every exchange.**

### Problem Statement
Active crypto investors spread assets across multiple exchanges (Binance, Coinbase, Kraken) for safety, access, and fee optimization — but there is no unified view. They open multiple apps, manually add up values, and still lack confidence in their true net worth and allocation.

### Solution
A mobile-first portfolio aggregator that connects to exchanges via read-only API keys, pulls real balances automatically, and presents a clean, unified portfolio view with live prices and performance data.

### What Nexus Is NOT
- Not a trading platform — cannot buy, sell, or move assets
- Not a wallet — never holds or custodies funds
- Not a tax tool — does not calculate cost basis (v1)
- Not a DeFi app — does not read on-chain wallets (v1)

### Core Promise
> "Connect once. See everything. Always accurate."

---

## 2. Goals & Success Metrics

### Business Goals
| Goal | Metric | Target (6 months post-launch) |
|------|--------|-------------------------------|
| User acquisition | Registered users | 5,000 |
| Retention | Day-30 retention | > 40% |
| Engagement | DAU/MAU ratio | > 35% |
| Revenue | Paid subscribers (if freemium) | 500 |
| Trust | App Store rating | ≥ 4.5 stars |

### User Goals
| Goal | Metric |
|------|--------|
| "I know my total portfolio value at a glance" | Time to see total value < 2 seconds after app open |
| "I know my 24h performance" | Change % visible on dashboard without scrolling |
| "I know my allocation across exchanges" | Exchange breakdown visible within 1 scroll |
| "I can drill into any asset" | Asset detail accessible in 2 taps |
| "My data is accurate" | Sync within 60 seconds of last price change |

### Technical Goals
| Goal | Metric |
|------|--------|
| App performance | Dashboard load < 1.5s (cached) |
| Sync freshness | Portfolio data < 60s old |
| Reliability | Exchange sync success rate > 99% |
| Security | Zero incidents involving exposed API keys |
| Uptime | Backend uptime > 99.5% |

---

## 3. User Personas

### Persona 1: Alex — The Active Allocator
- **Age:** 28 | Software engineer | $95K salary
- **Crypto portfolio:** ~$85K across Binance, Coinbase, Kraken
- **Behavior:** Checks portfolio 2–3x daily. Rebalances monthly. Made manual Excel sheet before. Hates the friction.
- **Goal:** Instant portfolio snapshot without switching between 3 apps
- **Pain:** "I never know my exact total. I have to do math every time."
- **Tech comfort:** High — comfortable generating API keys

### Persona 2: Mia — The Cautious HODLer
- **Age:** 35 | Marketing manager | $75K salary
- **Crypto portfolio:** ~$30K across Coinbase and Kraken (moved from Binance after FTX scare)
- **Behavior:** Checks portfolio weekly. Never trades. Holds BTC and ETH.
- **Goal:** One view to confirm "everything is still there and growing"
- **Pain:** "After FTX I split everything up but now I can't see the whole picture."
- **Tech comfort:** Medium — needs step-by-step API key instructions

### Persona 3: Dev — The Data-Driven Trader
- **Age:** 24 | Day trader | Variable income
- **Crypto portfolio:** ~$200K across 4 exchanges
- **Behavior:** Checks portfolio constantly. Cares about exact numbers, not estimates.
- **Goal:** Accurate, real-time portfolio data. Not delayed, not approximate.
- **Pain:** "Other apps round numbers and show stale data. I need precision."
- **Tech comfort:** Very high — already uses exchange APIs himself

---

## 4. User Stories

### Authentication

| ID | Story | Priority |
|----|-------|----------|
| AUTH-01 | As a new user, I want to create an account with email and password so I can start using Nexus | Must |
| AUTH-02 | As a returning user, I want to sign in securely so my exchanges reconnect automatically | Must |
| AUTH-03 | As a user, I want to remain signed in between sessions so I don't re-authenticate daily | Must |
| AUTH-04 | As a user, I want to sign out and have my session terminated securely | Must |
| AUTH-05 | As a user, I want biometric authentication (Face ID / fingerprint) as an option | Should |

### Exchange Connection

| ID | Story | Priority |
|----|-------|----------|
| CONN-01 | As a user, I want to connect my Binance account via API key so my balances sync automatically | Must |
| CONN-02 | As a user, I want to connect my Coinbase account via API key | Must |
| CONN-03 | As a user, I want to connect my Kraken account via API key | Must |
| CONN-04 | As a user, I want clear step-by-step instructions for generating read-only API keys on each exchange | Must |
| CONN-05 | As a user, I want to see a "connected" confirmation after adding an exchange | Must |
| CONN-06 | As a user, I want to remove an exchange connection and have my keys permanently deleted | Must |
| CONN-07 | As a user, I want to see an error message if my API key is invalid or expired | Must |
| CONN-08 | As a user, I want to reconnect an exchange if the connection breaks | Should |

### Portfolio Dashboard

| ID | Story | Priority |
|----|-------|----------|
| PORT-01 | As a user, I want to see my total portfolio value in USD at a glance | Must |
| PORT-02 | As a user, I want to see my 24h change in both USD and percentage | Must |
| PORT-03 | As a user, I want to see a 7-day sparkline chart of my portfolio performance | Must |
| PORT-04 | As a user, I want to see how my portfolio is split across exchanges | Must |
| PORT-05 | As a user, I want to see all my assets ranked by value | Must |
| PORT-06 | As a user, I want to see the last sync time so I know how fresh my data is | Should |
| PORT-07 | As a user, I want to pull-to-refresh to force an immediate data sync | Should |
| PORT-08 | As a user, I want to see a loading state while data syncs for the first time | Must |

### Asset Detail

| ID | Story | Priority |
|----|-------|----------|
| ASSET-01 | As a user, I want to see total holdings, current price, and 24h change for any asset | Must |
| ASSET-02 | As a user, I want to see how much of an asset I hold on each exchange | Must |
| ASSET-03 | As a user, I want to see a visual breakdown of cross-exchange allocation for an asset | Should |
| ASSET-04 | As a user, I want to see my exact coin balance (not just USD value) | Must |

### Exchange Detail

| ID | Story | Priority |
|----|-------|----------|
| EXC-01 | As a user, I want to see all assets held on a specific exchange | Must |
| EXC-02 | As a user, I want to see the total value and 24h change for each exchange | Must |
| EXC-03 | As a user, I want to see the portfolio share (%) for each exchange | Should |
| EXC-04 | As a user, I want to tap an asset in an exchange view to navigate to that asset's detail | Should |

### Settings & Security

| ID | Story | Priority |
|----|-------|----------|
| SET-01 | As a user, I want to see my account information in settings | Must |
| SET-02 | As a user, I want to change my password | Should |
| SET-03 | As a user, I want to see all connected exchanges and their status | Must |
| SET-04 | As a user, I want to manage notification preferences | Could |
| SET-05 | As a user, I want to delete my account and all associated data | Must |
| SET-06 | As a user, I want to clearly understand what data Nexus stores and what it doesn't | Must |

---

## 5. Feature Specifications

### F-001: Onboarding Flow

**Trigger:** First app open (no existing session)

**Flow:**
```
Welcome Screen
  ↓ "Get Started"
Login Screen (tab: Sign Up)
  ↓ Enter email + password + confirm
Account created → Navigate to Add Exchange
  ↓ (or skip)
Dashboard (empty state)
```

**Welcome Screen requirements:**
- Display product name (NEXUS) with live badge
- 3-line headline: "Track. Everything. In one place."
- 3 social-proof stats: exchanges supported, example portfolio size, asset count
- "Get Started" primary CTA (leads to sign up)
- "I already have an account" secondary CTA (leads to sign in)
- Security note: read-only access disclosure

**Sign Up requirements:**
- Email validation (format check, uniqueness)
- Password minimum 8 characters
- Confirm password match
- Clear error messages on failure

---

### F-002: Add Exchange (3-Step Modal)

**Trigger:** "+" button on Exchanges tab or first-time onboarding

**Step 1 — Choose Exchange:**
- Grid or list of supported exchanges (Binance, Coinbase, Kraken)
- Exchange logo, name, country flag (optional)
- Clear "Read-only · Cannot trade or withdraw" label

**Step 2 — Enter Credentials:**
- Exchange name in header for context
- API Key input field (text, no autocomplete)
- API Secret input field (secure entry, hidden by default)
- "How to create a read-only API key" expandable instructions specific to exchange
- Platform-appropriate keyboard (no spellcheck)
- "Connect Exchange" CTA button

**Step 3 — Success:**
- Checkmark animation
- "Binance connected!" confirmation
- First sync initiated in background
- "Go to Dashboard" or "Add Another Exchange" options

**Error handling:**
- Invalid key → "This API key doesn't seem right. Check for typos."
- No read permission → "This key doesn't have read access. Please create a new key with 'read' permission enabled."
- Rate limit hit → "Exchange is temporarily unavailable. We'll retry in a few seconds."

---

### F-003: Dashboard

**Layout (top to bottom):**

1. **Header** — "Good morning, [name]" or "Portfolio" with date
2. **Hero value** — Total USD value as editorial typographic display ($84,473.34)
3. **24h change** — Green/red pill with ▲/▼ icon and percentage
4. **Sparkline chart** — 7-day portfolio value line, edge-to-edge
5. **Exchange allocation bar** — Proportional colored segments per exchange with labels
6. **Assets section** — All assets ranked by USD value, individual floating rows
7. **Exchanges section** — Exchange cards with value, change, asset preview

**Asset row spec:**
- Left color stripe (3px, coin brand color)
- Coin icon (32px circle) + symbol + name
- Holdings amount (e.g., "0.84 BTC")
- USD value (right-aligned, 16px/700)
- 24h change % (green/red pill)

**Refresh behavior:**
- Auto-refresh every 60 seconds when app is foregrounded
- Pull-to-refresh forces immediate backend sync
- Stale data indicator if last sync > 5 minutes ago

---

### F-004: Exchanges Tab

**Layout:**
- Header: "Exchanges" + connected count + total value
- "+" add button (top right) → opens Add Exchange modal
- List of connected exchange cards (full-width)
- "Connect Another Exchange" CTA at bottom

**Exchange card spec:**
- Color band header (exchange brand color, dim) with exchange name in UPPERCASE + LIVE badge
- Total value (large, 30px/900)
- 24h change pill
- Portfolio allocation bar (exchange's % of total)
- Coin icon row (all assets on that exchange)
- Portfolio % + asset count (footer)

---

### F-005: Asset Detail Screen

**Header:** Coin icon + name + symbol + back button

**Sections:**

1. **Value card** — Total holdings in USD (large), total coin amount, current price, 24h change, exchange count
2. **BREAKDOWN** — Segmented allocation bar + legend (which exchange holds what %)
3. **HOLDINGS** — Row per exchange showing: exchange badge, amount held, allocation bar, USD value

**Navigation:** Accessible from Dashboard asset rows and Exchange detail asset rows

---

### F-006: Exchange Detail Screen

**Header:** Exchange name (colored) + back button

**Sections:**

1. **Summary card** — LIVE badge, total value, 24h change, allocation bar (% of total portfolio), asset count
2. **ASSETS section** — List of all assets on this exchange: coin icon, name, amount held, allocation bar, USD value, 24h change pill

**Navigation:** Accessible from Exchanges tab cards and Dashboard exchange cards

---

### F-007: Settings Screen

**Sections:**

1. **Profile** — Avatar (initials), display name, email, PRO badge (if applicable)
2. **Security** — Biometric lock toggle, change password
3. **Preferences** — Currency (USD default), price display precision
4. **Data & Privacy** — What we store, delete all data
5. **Sign Out** — Red pill button, full session termination

---

## 6. MVP Scope

### In Scope for MVP

| Feature | Status |
|---------|--------|
| Email/password authentication | ✅ Include |
| Connect Binance via API key | ✅ Include |
| Connect Coinbase via API key | ✅ Include |
| Connect Kraken via API key | ✅ Include |
| Portfolio dashboard with live prices | ✅ Include |
| 7-day sparkline chart | ✅ Include |
| Asset detail screen | ✅ Include |
| Exchange detail screen | ✅ Include |
| Exchange allocation visualization | ✅ Include |
| Remove exchange connection | ✅ Include |
| Settings screen | ✅ Include |
| iOS + Android support | ✅ Include |
| Data refresh every 60 seconds | ✅ Include |

### Phase 2 (Post-MVP)

| Feature | Rationale for Deferral |
|---------|------------------------|
| Price alerts / push notifications | Requires notification infrastructure, adds complexity |
| Biometric authentication | Nice-to-have, not critical for launch |
| Portfolio history chart (30d, 1y) | Requires storing snapshots over time, adds DB cost |
| CSV export | Low demand in v1, easy to add later |
| More exchanges (OKX, Bybit, KuCoin) | CCXT makes this easy — add after validating core flow |
| Dark/light theme toggle | Dark-only in v1; validated with users first |
| Widget (iOS/Android home screen) | Requires platform-specific native code |

---

## 7. Out of Scope (v1)

These are explicitly excluded and will not be built:

| Feature | Reason |
|---------|--------|
| Trading / order placement | Core identity of Nexus is read-only; adding trading changes regulatory posture entirely |
| DeFi wallet tracking (MetaMask, Phantom) | Completely different technical stack (blockchain RPC calls, token ABIs) |
| NFT portfolio | Different asset class, different data sources |
| Tax reporting / cost basis | Requires full transaction history, complex accounting logic (FIFO/LIFO/HIFO) |
| Social features (sharing, leaderboards) | Privacy-sensitive; users don't want portfolio data shared |
| Fiat account tracking (bank accounts) | Different regulatory category; would require Open Banking/Plaid integration |
| Copy trading / signals | Out of scope for aggregator positioning |
| Desktop / web app | Mobile-first strategy; web requires different UX |

---

## 8. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| App cold start to dashboard visible | < 2 seconds |
| Dashboard load (cached data) | < 500ms |
| Portfolio sync latency | < 60 seconds from exchange balance change |
| Asset detail screen load | < 300ms |
| API response time (backend) | p95 < 500ms |

### Security

| Requirement | Implementation |
|-------------|---------------|
| API keys encrypted at rest | AES-256-GCM with server-side key |
| API keys never sent to mobile client | Server-side only; client sees exchange name + status |
| All traffic encrypted in transit | HTTPS/TLS 1.3 |
| Authentication tokens expire | 15 min access token, 7-day refresh token |
| Password storage | bcrypt, cost factor 12 |
| Account deletion | Hard delete all user data including encrypted keys |

### Reliability

| Requirement | Target |
|-------------|--------|
| Backend uptime | 99.5% monthly |
| Exchange sync success rate | > 99% (network errors excluded) |
| Graceful degradation | Show stale data with timestamp if sync fails |
| Error recovery | Automatic retry with exponential backoff |

### Scalability

The backend should handle:
- 10,000 registered users (MVP target)
- 3 exchange connections per user average
- Sync job: 30,000 API calls/minute at scale
- PostgreSQL: sufficient for 10M rows without partitioning

### Accessibility

- Minimum touch target: 44×44 points (Apple HIG / Material)
- Text contrast ratio: minimum 4.5:1 (WCAG AA)
- Dynamic Type support: scales with system font size
- VoiceOver / TalkBack compatible labels on all interactive elements

### Compatibility

| Platform | Minimum Version |
|----------|----------------|
| iOS | 16.0+ |
| Android | 12.0+ (API 31) |
| Expo SDK | 55+ |

---

## 9. Design Principles

These principles govern all UX decisions in Nexus:

| # | Principle | Rule |
|---|-----------|------|
| 1 | **Numbers First** | Portfolio value, 24h change, and amounts are the core product. Never bury them in cards or behind interactions — they must be immediately readable. |
| 2 | **Read-Only Transparency** | Every screen showing financial data must make clear Nexus only reads. Users should never wonder "can Nexus move my funds?" — answer it proactively on every trust-sensitive touchpoint. |
| 3 | **Accuracy Over Speed** | Never show a number that might be wrong without a freshness indicator. A loading skeleton is better than a stale value presented as current. |
| 4 | **One Tap to Any Asset** | From the dashboard, any asset or exchange must be reachable in one tap. No deep navigation chains for primary content. |
| 5 | **Minimal Surface Area** | Each element on screen must earn its place by serving a specific user need. Don't add features because they're technically possible. |
| 6 | **Dark & Precise** | The dark theme and editorial typography signal professionalism — a Bloomberg terminal for mobile, not a consumer finance app. |

---

## 10. Constraints & Assumptions

### Constraints

| Constraint | Impact |
|-----------|--------|
| CCXT library coverage | Can only connect exchanges CCXT supports. Adding an unsupported exchange requires writing a custom connector. |
| Exchange rate limits | Cannot sync faster than rate limits allow. At scale, may need to stagger syncs. |
| CoinGecko free tier | 30 calls/min. At scale, need paid plan or alternative. |
| Read-only API keys | Cannot verify actual trades or calculate cost basis. Cannot catch exchange-side errors that only show in trading history. |
| Expo managed workflow | Some native APIs require bare workflow. Must evaluate before adding notifications, widgets, etc. |
| App Store review | Apple and Google review processes add time to each release. Plan 2–4 weeks for initial approval. |

### Assumptions

| Assumption | If Wrong... |
|-----------|------------|
| Users are comfortable generating API keys | Need to provide much more detailed onboarding; potentially video walkthroughs |
| Binance/Coinbase/Kraken cover 80% of our target users' assets | Need to add more exchanges earlier than planned |
| CoinGecko prices are "good enough" vs. exchange-specific prices | May need to fetch prices from exchange's own ticker for precision |
| Users trust storing read-only keys in a third-party app | Need stronger trust signals; possibly open-source the backend |
| 60-second sync frequency is acceptable | May need near-real-time if user research shows active traders need faster updates |

---

*Document version: 1.0 | Created: March 2026 | Owner: Product | Review cycle: Before each major feature*
