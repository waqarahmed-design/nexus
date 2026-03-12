# Nexus — Research Documentation

> Background study, market analysis, technical feasibility, and architectural research for the Nexus crypto portfolio aggregator.

---

## Table of Contents

1. [Problem Space](#1-problem-space)
2. [Target Users](#2-target-users)
3. [Competitive Landscape](#3-competitive-landscape)
4. [Exchange API Research](#4-exchange-api-research)
5. [CCXT Library](#5-ccxt-library)
6. [Real-Time Price Data](#6-real-time-price-data)
7. [Security Architecture](#7-security-architecture)
8. [Technical Architecture](#8-technical-architecture)
9. [Data Model](#9-data-model)
10. [Regulatory & Compliance](#10-regulatory--compliance)
11. [Feasibility Assessment](#11-feasibility-assessment)
12. [Open Questions](#12-open-questions)

---

## 1. Problem Space

### The Core Problem

Crypto investors increasingly hold assets across multiple exchanges. This fragmentation creates a fundamental visibility problem: **there is no single source of truth for what you own**.

### Why Multiple Exchanges?

Users spread across exchanges for several rational reasons:

| Reason | Example |
|--------|---------|
| **Asset availability** | SOL only listed on some exchanges, specific altcoins exclusive to others |
| **Regional restrictions** | Kraken not available in all US states; Binance.US vs. Binance global |
| **Fee optimization** | Different maker/taker fees per exchange |
| **Risk distribution** | Exchange collapses (FTX 2022) taught users not to concentrate |
| **Liquidity** | Better spreads on different pairs on different platforms |
| **Yield/staking products** | Coinbase staking ETH, Binance Earn products |

### The Daily Pain Points

1. **Manual reconciliation** — Opening 3+ apps, noting values, adding them mentally. Error-prone and time-consuming.
2. **No unified P&L** — Calculating true portfolio performance across exchanges requires spreadsheets.
3. **Tax complexity** — Cross-exchange cost basis tracking is nearly impossible manually.
4. **Delayed awareness** — A market move requires checking each exchange separately.
5. **No unified history** — Transaction history lives in silos; impossible to see the full picture.
6. **Rebalancing blindness** — Knowing your overall allocation (% BTC vs ETH vs stablecoins) requires manual math.

### Market Size Signal

- Estimated 420M+ crypto users globally (2023, TripleA research)
- ~40% of active crypto investors use 3+ exchanges (Statista, 2023)
- The portfolio tracker app segment generates ~$200M+ ARR collectively
- CoinStats alone reported 1.2M+ active users as of 2023

---

## 2. Target Users

### Primary: The Active Multi-Exchange Investor

- Holds assets on 2–5 exchanges simultaneously
- Trades or rebalances at least monthly
- Technically comfortable enough to generate API keys
- Values data accuracy over manual entry
- **Net worth in crypto**: $10K–$500K

### Secondary: The Long-Term Holder (HODLer)

- Assets spread across exchanges for safety after FTX
- Checks portfolio weekly, not daily
- Primary need: "what is my total worth right now?"
- Less likely to need granular analytics

### Tertiary: The Diversified Retail Investor (Phase 8 Target)

- Holds crypto + stocks + mutual funds simultaneously
- Crypto is one slice of a broader portfolio (20–40% of total wealth)
- Frustrated that no single app shows the full picture
- Primary need: "what is my total net worth across everything?"
- Likely already uses Empower, Kubera, or a spreadsheet for the non-crypto portion
- **Net worth:** $100K–$500K (larger wealth base than pure crypto users)
- **Why they matter for Nexus:** Lower churn risk (less sensitive to crypto market cycles), larger addressable market, higher willingness to pay for a comprehensive solution

### Not the Target (v1)

- DeFi-native users (wallets, DEX positions) — different technical stack required
- Institutional traders — needs compliance, audit trails, multi-sig
- Complete beginners — API key setup is a significant barrier
- Pure traditional investors (no crypto) — v1 has nothing for them; target from Phase 8 onwards

---

## 3. Competitive Landscape

### Direct Competitors

| Product | Model | Key Strength | Key Weakness |
|---------|-------|-------------|--------------|
| **CoinStats** | Freemium ($14.99/mo Pro) | Broad exchange support (300+), DeFi wallets | UI feels cluttered; slower performance |
| **Delta** | Freemium ($9.99/mo Pro) | Clean UI, portfolio analytics | Manual entry fallback when API breaks |
| **CoinTracker** | Freemium ($59+/yr) | Tax reporting (TurboTax integration) | Expensive; heavy; slow sync |
| **Koinly** | Paid ($49+/yr) | Best-in-class tax reports | Overkill for portfolio tracking; not real-time |
| **Zerion** | Free (DeFi focused) | On-chain portfolio (Ethereum, L2s) | No CEX support — opposite problem |
| **Blockfolio (now FTX)** | Shut down 2023 | Was the market leader | Gone — left a gap |

### Gaps Nexus Can Exploit

| Opportunity | Current Gap | How Nexus Wins |
|-------------|-------------|----------------|
| **Speed** | Competitors feel sluggish, slow to sync | Optimized mobile + smart caching; fast feel is itself a feature |
| **Simplicity** | CoinStats and Delta try to do everything | Nexus focuses on what matters: value, allocation, performance |
| **Trust transparency** | Competitors underexplain what data they access | Read-only API keys + explicit disclosure at every sensitive touchpoint |
| **Editorial design** | Entire category uses generic fintech UI | Strong visual identity (dark, editorial, precise) is a real differentiator |
| **Post-FTX positioning** | "Your keys, your crypto" sentiment is high | Explicit "never moves funds" messaging has a narrative advantage right now |

---

### Broader Wealth Aggregators (Phase 8 Competitive Landscape)

As Nexus expands beyond crypto, it enters a second competitive category: total wealth / net worth tracking. Key players:

| Product | Model | Key Strength | Key Weakness |
|---------|-------|-------------|--------------|
| **Kubera** | $150/yr | Best-in-class multi-asset (crypto + stocks + real estate + custom assets) | Web-only; no mobile app; expensive; no live crypto exchange sync |
| **Empower (Personal Capital)** | Free + wealth management upsell | Best investment analytics (401k, stocks, net worth) | Almost no crypto support; aggressively pushes financial advisors |
| **Sharesight** | Freemium ($20/mo) | Best for stocks + ETFs, excellent dividend tracking, performance vs. benchmark | No crypto support; complex UI; primarily ANZ/UK market |
| **Monarch Money** | $14.99/mo | Modern Mint replacement; budgeting + net worth in one | Budgeting-first (spending focus), not investment-first; weak crypto |
| **Mint (RIP)** | Shut down 2024 | Was the dominant personal finance app | Gone — left 22M users looking for alternatives |
| **Wealthica** | Freemium | Canadian-focused; good multi-asset aggregation | Limited global exchange support |

**Key insight:** No product does both crypto (with live exchange sync) and traditional investments (stocks, funds, real estate) well. Kubera is the closest — it supports custom assets and some crypto — but lacks live exchange connections and has no mobile app. **This is Nexus's long-term whitespace.**

**The opportunity:** A mobile-first, live-syncing total wealth dashboard that starts from crypto (where the product-market fit is clearest) and expands outward. The design quality and data freshness Nexus is built on are absent from every player in the broader category.

---

## 4. Exchange API Research

### 4.1 Binance REST API

**Base URL:** `https://api.binance.com`
**Auth method:** HMAC-SHA256 signed requests. API Key passed as `X-MBX-APIKEY` header. Secret key used to sign query string.

**Key read-only endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /api/v3/account` | Signed | Full account balances (all assets, free + locked) |
| `GET /api/v3/myTrades` | Signed | Trade history for a symbol |
| `GET /api/v3/ticker/price` | Public | Current price for a symbol |
| `GET /api/v3/ticker/24hr` | Public | 24h price change stats |
| `GET /api/v3/klines` | Public | OHLCV candlestick data |
| `GET /sapi/v1/asset/assetDetail` | Signed | Asset details including withdrawal info |

**Rate limits:**
- 1,200 requests/minute (weight-based system)
- Each endpoint has a "weight" (e.g., `/api/v3/account` = weight 20)
- IP ban if exceeded; use exponential backoff

**Read-only permission:** Binance calls this "Enable Reading" — grants access to account info, trade history, order history. No withdrawal or trading ability.

**IP Whitelisting:** Supported — restrict API key to specific server IPs. Strongly recommended for production.

---

### 4.2 Coinbase Advanced Trade API

**Base URL:** `https://api.coinbase.com/api/v3`
**Auth method:** Cloud API Key (JWT-based since 2023 migration from legacy HMAC). API Key Name + Private Key (EC P-256).

**Key read-only endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /brokerage/accounts` | Auth | List all accounts with balances |
| `GET /brokerage/accounts/{account_uuid}` | Auth | Single account details |
| `GET /brokerage/portfolios` | Auth | Portfolio groupings |
| `GET /brokerage/products/{product_id}/ticker` | Auth | Product price data |
| `GET /brokerage/orders/historical/batch` | Auth | Order history |
| `GET /brokerage/products` | Public | All available trading pairs |

**Rate limits:**
- 10 requests/second per API key (private endpoints)
- 10,000 requests/hour
- Headers: `CB-RATELIMIT-LIMIT`, `CB-RATELIMIT-REMAINING`, `CB-RATELIMIT-RESET`

**Read-only permission:** Coinbase scopes are `wallet:accounts:read`, `wallet:transactions:read`. No trading or withdrawal scopes.

**Note:** Coinbase has two APIs — the legacy v2 API and the new Advanced Trade API. The Advanced Trade API is the current standard and uses different auth (JWT vs. OAuth2).

---

### 4.3 Kraken REST API

**Base URL:** `https://api.kraken.com`
**Auth method:** HMAC-SHA512. API Key in `API-Key` header. Nonce + POST body signed with secret.

**Key read-only endpoints:**

| Endpoint | Method | Description |
|----------|--------|-------------|
| `POST /0/private/Balance` | Signed | Account balance (all assets) |
| `POST /0/private/TradesHistory` | Signed | Trade history |
| `POST /0/private/OpenOrders` | Signed | Currently open orders |
| `GET /0/public/Ticker` | Public | Current price for pairs |
| `GET /0/public/OHLC` | Public | Candlestick data |
| `GET /0/public/Assets` | Public | All supported assets |

**Rate limits:**
- Tier-based: Starter (15 calls), Intermediate (20), Pro (20) — counter-based not per-minute
- Counter replenishes at ~0.33/second (Starter) to 1/second (Pro)
- Private endpoints cost 1–2 counter points each

**Read-only permission:** Kraken calls this "Query Funds" — read access to balances only. "Query Open Orders & Trades" for history. No modify/cancel/withdraw permissions.

---

### 4.4 Data Available in Read-Only Mode (All Exchanges)

| Data Type | Available? | Notes |
|-----------|-----------|-------|
| Current balances | ✅ Yes | All three exchanges |
| Current asset prices | ✅ Yes | Public endpoints, no key needed |
| 24h price change % | ✅ Yes | Public endpoints |
| Historical OHLCV | ✅ Yes | Public endpoints |
| Trade history | ✅ Yes | Requires read permission |
| Open orders | ✅ Yes | Requires read permission |
| Deposit/withdrawal history | ⚠️ Partial | Depends on exchange + permission |
| Staking balances | ⚠️ Partial | May need separate endpoint/permission |
| Margin positions | ⚠️ Partial | Additional permissions may be required |
| Personal info (name, email) | ❌ No | Not needed, avoid requesting |

---

## 5. CCXT Library

### What is CCXT?

**CryptoCurrency eXchange Trading Library** — an open-source JavaScript/Python/PHP library that provides a unified API interface for 100+ cryptocurrency exchanges.

- GitHub: `ccxt/ccxt` — 31k+ stars
- Abstracts away exchange-specific authentication, request signing, endpoint differences
- Maintained actively; exchanges update their APIs, CCXT keeps up

### Why Use CCXT for Nexus

Without CCXT, connecting to Binance, Coinbase, and Kraken means writing three separate authentication systems, three sets of endpoint handlers, and three response parsers. CCXT handles all of that.

### Installation

```bash
npm install ccxt
# or
yarn add ccxt
```

### Core Methods for Portfolio Reading

```typescript
import ccxt from 'ccxt';

// Initialize exchange
const binance = new ccxt.binance({
  apiKey: 'YOUR_API_KEY',
  secret: 'YOUR_SECRET',
  options: { defaultType: 'spot' }
});

// Fetch all balances
const balance = await binance.fetchBalance();
// Returns: { BTC: { free: 0.5, used: 0.0, total: 0.5 }, ETH: { ... }, ... }

// Fetch ticker (current price)
const ticker = await binance.fetchTicker('BTC/USDT');
// Returns: { symbol, bid, ask, last, change, percentage, high, low, volume, ... }

// Fetch multiple tickers at once
const tickers = await binance.fetchTickers(['BTC/USDT', 'ETH/USDT', 'SOL/USDT']);

// Fetch OHLCV (candlestick) data for sparklines
const ohlcv = await binance.fetchOHLCV('BTC/USDT', '1d', undefined, 7);
// Returns: [[timestamp, open, high, low, close, volume], ...]

// Fetch trade history
const trades = await binance.fetchMyTrades('BTC/USDT');
```

### CCXT Unified Response Structure

CCXT normalizes responses across exchanges into a consistent shape:

```typescript
// Balance response (always the same regardless of exchange)
{
  info: { /* raw exchange response */ },
  timestamp: 1698765432000,
  datetime: '2023-10-31T12:30:32.000Z',
  free: { BTC: 0.5, ETH: 2.3, USDT: 1000 },
  used: { BTC: 0.0, ETH: 0.0, USDT: 0.0 },
  total: { BTC: 0.5, ETH: 2.3, USDT: 1000 }
}
```

### Supported Exchanges (Relevant)

| Exchange | CCXT ID | Status |
|----------|---------|--------|
| Binance | `binance` | ✅ Full support |
| Binance US | `binanceus` | ✅ Full support |
| Coinbase Advanced | `coinbase` | ✅ Full support |
| Kraken | `kraken` | ✅ Full support |
| OKX | `okx` | ✅ Full support |
| Bybit | `bybit` | ✅ Full support |
| KuCoin | `kucoin` | ✅ Full support |

Future exchange additions only require adding a new CCXT instance — no architecture changes.

### Rate Limiting in CCXT

CCXT has built-in rate limiting:
```typescript
const binance = new ccxt.binance({
  apiKey: '...',
  secret: '...',
  enableRateLimit: true,  // Built-in throttling
});
```

---

## 6. Real-Time Price Data

### Option A: Exchange WebSocket APIs (Per-Exchange)

All three exchanges support WebSocket streams for live prices:

**Binance WebSocket:**
```
wss://stream.binance.com:9443/ws/btcusdt@ticker
```
- Streams: `@ticker` (24h stats), `@miniTicker`, `@kline_1m`
- No authentication needed for public price streams
- Can subscribe to multiple symbols in one connection

**Coinbase WebSocket:**
```
wss://advanced-trade-ws.coinbase.com
```
- Subscribe to `ticker` channel with product IDs
- Requires authentication for private channels

**Kraken WebSocket:**
```
wss://ws.kraken.com
```
- Public feeds: `ticker`, `ohlc`, `trade`
- No auth for public price data

**Verdict for Nexus:** Managing 3 WebSocket connections adds complexity. Better to use a single price data source.

---

### Option B: CoinGecko API (Recommended for MVP)

**Base URL:** `https://api.coingecko.com/api/v3`

| Plan | Rate Limit | Cost |
|------|-----------|------|
| Free | 30 calls/minute | $0 |
| Demo (API key) | 30 calls/minute | $0 |
| Analyst | 500 calls/minute | $129/mo |

**Key endpoints:**

```
GET /simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true
→ { bitcoin: { usd: 43250, usd_24h_change: 2.3 }, ... }

GET /coins/{id}/market_chart?vs_currency=usd&days=7
→ { prices: [[timestamp, price], ...] }  ← Perfect for sparkline charts
```

**CoinGecko coin IDs for Nexus assets:**
- BTC → `bitcoin`
- ETH → `ethereum`
- SOL → `solana`
- BNB → `binancecoin`
- USDT → `tether`
- XRP → `ripple`

**Redis Caching Strategy:**
```
Price data TTL: 60 seconds (acceptable staleness for portfolio view)
Sparkline data TTL: 300 seconds (5 min — doesn't need to be real-time)
Market cap/rank: 600 seconds (10 min)
```

---

### Option C: CoinMarketCap API

- More accurate for volume/market cap data
- Free tier: 333 calls/day (very limited)
- Basic plan: $29/mo for 10k calls/day
- Less suitable for MVP due to free tier constraints

---

## 7. Security Architecture

### 7.1 The API Key Risk Model

Exchange API keys are high-value secrets. Even read-only keys represent a privacy risk — someone with your read-only key knows exactly what you hold. With trading permissions enabled (not Nexus's model), keys can drain accounts.

**Risk matrix:**

| Threat | Read-Only Key Risk | Mitigation |
|--------|-------------------|------------|
| Database breach | Attacker sees portfolio composition | Encrypt keys at rest |
| Man-in-the-middle | Keys intercepted in transit | TLS everywhere |
| Insider threat | Employee accesses keys | Key encryption, audit logs |
| Key reuse | Key works on original exchange | Cannot mitigate — user responsibility |
| API abuse | Attacker uses key to hammer exchange | IP whitelisting |

---

### 7.2 AES-256-GCM Encryption for API Keys

**Why AES-256-GCM?**
- AES-256: NIST-approved, used by governments and financial institutions
- GCM mode: Provides both encryption AND authentication (detects tampering)
- Alternative to AES-CBC which is vulnerable to padding oracle attacks

**Implementation pattern (Node.js):**

```typescript
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;      // 96-bit IV for GCM
const TAG_LENGTH = 16;     // 128-bit auth tag
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'); // 32 bytes = 256 bits

// Encrypt API key before storing
function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  const authTag = cipher.getAuthTag();

  // Store: iv + authTag + encrypted (all base64)
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}

// Decrypt when making exchange API call
function decrypt(ciphertext: string): string {
  const data = Buffer.from(ciphertext, 'base64');
  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = data.slice(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  return decipher.update(encrypted) + decipher.final('utf8');
}
```

**Key management best practice:**
- `ENCRYPTION_KEY` stored as environment variable, never in code
- Use separate keys per environment (dev/staging/prod)
- Consider AWS KMS or HashiCorp Vault for production key management
- Rotate encryption keys periodically (re-encrypt all stored keys)

---

### 7.3 API Key Permissions Per Exchange

**Binance read-only setup:**
- Enable: "Read Info" only
- Disable: Enable Spot & Margin Trading, Enable Withdrawals, Enable Futures
- Optional: Restrict to specific IP addresses (server IP)

**Coinbase read-only setup:**
- Scopes: `wallet:accounts:read`, `wallet:transactions:read`
- Do NOT request: `wallet:sends:create`, `wallet:buys:create`
- Portfolio access: `wallet:user:read`

**Kraken read-only setup:**
- Enable: "Query Funds", "Query Open Orders & Trades"
- Disable: "Create & Modify Orders", "Cancel & Close Orders", "Withdraw Funds"
- Nonce window: Set conservative nonce window

---

### 7.4 Transport Security

- All API calls from backend to exchanges over HTTPS/TLS 1.3
- Backend uses certificate pinning for exchange connections (advanced)
- Mobile app communicates with Nexus backend over HTTPS only
- JWT tokens for mobile auth — short expiry (15 min access token, 7-day refresh token)
- API keys NEVER sent to mobile client — decrypted only on server, used server-side

---

## 8. Technical Architecture

### 8.1 Why a Backend is Required

The mobile app cannot call exchange APIs directly because:
1. **API key exposure** — Keys in the mobile app bundle can be extracted
2. **CORS restrictions** — Exchange APIs don't allow browser/mobile direct calls
3. **Rate limit pooling** — Backend can pool and cache responses, avoiding per-user rate limits
4. **Business logic** — Portfolio calculations, currency conversion, aggregation happen server-side

### 8.2 System Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (React Native)                  │
│  Dashboard → Exchanges → Settings → Asset Detail → Exchange Detail│
└─────────────────────────────┬────────────────────────────────────┘
                              │ HTTPS + JWT
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                    NEXUS BACKEND (Node.js + Fastify)              │
│                                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────────┐│
│  │  Auth Routes│  │Portfolio APIs│  │   Exchange Sync Service  ││
│  │  POST /login│  │GET /portfolio│  │   (CCXT + cron jobs)     ││
│  │  POST /token│  │GET /assets   │  │   Runs every 60s         ││
│  └─────────────┘  └──────────────┘  └──────────────────────────┘│
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      PostgreSQL                              │ │
│  │  users | exchange_connections | portfolio_snapshots          │ │
│  │  assets | price_history | api_keys (encrypted)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                        Redis Cache                           │ │
│  │  prices:{symbol} TTL:60s | portfolio:{userId} TTL:30s       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└──────────────┬─────────────────────────────────────┬─────────────┘
               │                                     │
    ┌──────────┼──────────────┐                      │
    ▼          ▼              ▼                       ▼
┌────────┐ ┌────────┐ ┌────────────┐         ┌──────────────┐
│Binance │ │Coinbase│ │  Kraken    │         │  CoinGecko   │
│ REST   │ │Advanced│ │  REST API  │         │  Price API   │
│  API   │ │  Trade │ │            │         │              │
└────────┘ └────────┘ └────────────┘         └──────────────┘
```

### 8.3 Recommended Tech Stack (Backend)

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Runtime | Node.js 20 LTS | Same ecosystem as mobile (TypeScript), huge CCXT/crypto library support |
| Framework | Fastify | 3x faster than Express, schema-first, TypeScript native |
| Database | PostgreSQL 15 | ACID compliance critical for financial data |
| ORM | Drizzle ORM | Type-safe, lightweight, excellent PostgreSQL support |
| Cache | Redis 7 | Industry standard for price caching, session storage |
| Exchange Library | CCXT | Unified API for 100+ exchanges |
| Scheduling | node-cron | Portfolio sync jobs every 60 seconds |
| Auth | jsonwebtoken | JWT for mobile auth |
| Deployment | Railway | Simple deployment, managed PostgreSQL + Redis |

### 8.4 Data Flow: Portfolio Sync

```
1. User adds exchange (Binance) with API key + secret
2. Backend encrypts API key with AES-256-GCM → stores in DB
3. Sync job runs every 60 seconds:
   a. Load all active exchange_connections from DB
   b. Decrypt API keys in memory (never log, never expose)
   c. Call ccxt.binance.fetchBalance() → get all asset balances
   d. Filter out zero balances
   e. For each asset, fetch USD price from Redis (or CoinGecko if stale)
   f. Calculate total value per asset, per exchange, portfolio total
   g. Store snapshot in portfolio_snapshots table
   h. Invalidate portfolio cache in Redis
4. Mobile app polls GET /portfolio every 30 seconds
5. Backend serves from Redis cache (fast) or DB if cache miss
```

### 8.5 Mobile ↔ Backend API Contract

```typescript
// GET /api/v1/portfolio
{
  totalValueUSD: 84473.34,
  change24hUSD: 2831.45,
  change24hPercent: 3.48,
  lastSyncedAt: "2024-01-15T10:30:00Z",
  exchanges: [
    {
      id: "binance",
      name: "Binance",
      totalValueUSD: 58505.12,
      change24hPercent: 2.41,
      assetsCount: 5,
      status: "connected" | "error" | "syncing"
    }
  ],
  assets: [
    {
      symbol: "BTC",
      name: "Bitcoin",
      totalAmount: 0.8432,
      totalValueUSD: 36421.18,
      priceUSD: 43212.50,
      change24hPercent: 1.82,
      holdings: [
        { exchangeId: "binance", amount: 0.5, valueUSD: 21606 },
        { exchangeId: "coinbase", amount: 0.3432, valueUSD: 14815 }
      ]
    }
  ]
}

// GET /api/v1/assets/:symbol/chart?period=7d
{
  symbol: "BTC",
  period: "7d",
  data: [
    { timestamp: 1698192000000, price: 42100 },
    { timestamp: 1698278400000, price: 43250 },
    // ...7 data points
  ]
}
```

---

## 9. Data Model

### PostgreSQL Schema

```sql
-- Users
CREATE TABLE users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,          -- bcrypt, cost factor 12
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Exchange connections
CREATE TABLE exchange_connections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exchange_id     TEXT NOT NULL,         -- 'binance', 'coinbase', 'kraken'
  display_name    TEXT,                  -- User's custom label
  api_key_enc     TEXT NOT NULL,         -- AES-256-GCM encrypted
  api_secret_enc  TEXT NOT NULL,         -- AES-256-GCM encrypted
  api_passphrase_enc TEXT,               -- For exchanges that require it (Coinbase)
  status          TEXT DEFAULT 'active', -- 'active' | 'error' | 'disabled'
  last_synced_at  TIMESTAMPTZ,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Portfolio snapshots (time-series)
CREATE TABLE portfolio_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_value_usd DECIMAL(20, 8) NOT NULL,
  snapshot_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Asset holdings (per exchange, per snapshot)
CREATE TABLE holdings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  exchange_id         TEXT NOT NULL,
  symbol              TEXT NOT NULL,       -- 'BTC', 'ETH'
  amount              DECIMAL(30, 18) NOT NULL,
  value_usd           DECIMAL(20, 8) NOT NULL,
  price_usd           DECIMAL(20, 8) NOT NULL,
  synced_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Price history (for sparklines)
CREATE TABLE price_history (
  id          BIGSERIAL PRIMARY KEY,
  symbol      TEXT NOT NULL,
  price_usd   DECIMAL(20, 8) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_price_history_symbol_time ON price_history(symbol, recorded_at DESC);
CREATE INDEX idx_holdings_user ON holdings(user_id, synced_at DESC);
```

### Drizzle ORM Schema (TypeScript)

```typescript
import { pgTable, uuid, text, decimal, timestamp, bigserial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const exchangeConnections = pgTable('exchange_connections', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exchangeId: text('exchange_id').notNull(),
  apiKeyEnc: text('api_key_enc').notNull(),
  apiSecretEnc: text('api_secret_enc').notNull(),
  status: text('status').default('active'),
  lastSyncedAt: timestamp('last_synced_at'),
  errorMessage: text('error_message'),
});
```

---

## 10. Regulatory & Compliance

### 10.1 Is Nexus a Money Service Business (MSB)?

**Verdict: No — Nexus is a financial data aggregator, not an MSB.**

| Characteristic | Nexus | Why it matters |
|----------------|-------|----------------|
| Holds funds | ❌ No | Funds stay on exchanges at all times |
| Transmits funds | ❌ No | No movement of assets, ever |
| Executes trades | ❌ No | Read-only API keys cannot trade |
| Custodies assets | ❌ No | No wallets, no keys to user funds |

**Regulatory position:** Outside MSB/money transmitter definitions under US FinCEN, EU MiCA, and UK FCA. Closest analogy is Plaid (banking data aggregator) — but read-only for crypto.

### 10.2 KYC / AML

Not required for a read-only aggregator. Nexus never touches funds, so anti-money-laundering regulations targeting fund movement do not apply. A simple email+password account is legally sufficient.

### 10.3 GDPR (EU Users)

If serving EU users, the following applies:

| Obligation | Nexus Requirement |
|-----------|-------------------|
| Lawful basis | Contract performance (user signed up for the service) |
| Data minimization | Only collect email, hashed password, encrypted API keys. No KYC. |
| Right to erasure | DELETE /account endpoint must remove all user data including encrypted keys |
| Data breach notification | Must notify within 72 hours if encrypted keys are exposed |
| Data Processing Agreement | If using third-party hosting (Railway, AWS), need DPA with provider |
| Privacy policy | Must document what data is collected and why |

**API Keys under GDPR:** Encrypted API keys are personal data. They must be treated with care. On account deletion, all encrypted keys must be irreversibly deleted.

### 10.4 Exchange API Terms of Service

| Exchange | Key ToS Restrictions |
|----------|---------------------|
| **Binance** | API must not be used for unauthorized data scraping; rate limits must be respected; prohibited in some jurisdictions (US users must use Binance.US) |
| **Coinbase** | Cannot store Coinbase user credentials; API keys are user-generated and user-owned; comply with rate limits |
| **Kraken** | API access for personal use; commercial use of market data may require separate licensing |

**Key risk:** If Nexus were to cache and resell market data, that would likely violate exchange ToS. Internal caching for performance is generally acceptable.

### 10.5 App Store Considerations

Both Apple App Store and Google Play have specific rules for financial apps:
- **Apple:** Financial services apps must provide clear disclosure about data usage; apps that handle financial accounts require relevant authorization or disclaimers
- **Google:** Financial services apps must declare the "Finance" app category and may require additional verification for certain markets
- Nexus should include a clear disclaimer: "Nexus does not hold, move, or trade your cryptocurrency. It is a read-only portfolio viewer."

---

## 11. Feasibility Assessment

### Technical Feasibility: HIGH ✅

| Component | Complexity | Risk |
|-----------|-----------|------|
| Exchange API integration (CCXT) | Low | Low — well-documented, proven library |
| API key encryption | Medium | Low — standard cryptographic primitives |
| Real-time price data | Low | Low — CoinGecko free tier is sufficient for MVP |
| Portfolio aggregation math | Low | Low — straightforward arithmetic |
| Mobile app | Medium | Low — Expo/React Native is mature |
| Backend (Fastify + Drizzle) | Medium | Medium — requires ops knowledge for production |
| PostgreSQL schema | Low | Low — straightforward relational data |
| Redis caching | Low | Low — simple key-value TTL pattern |

### Timeline Estimate (Solo Developer)

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Phase 1: Backend MVP** | 3–4 weeks | Auth, exchange connection, Binance + Coinbase sync, portfolio endpoint |
| **Phase 2: Mobile integration** | 2–3 weeks | Replace mock data with real API, auth flow, error states |
| **Phase 3: Kraken + polish** | 1–2 weeks | Add Kraken, loading states, error handling, offline support |
| **Phase 4: Reliability** | 2 weeks | Monitoring, error recovery, rate limit handling, background sync |
| **Total MVP** | **8–11 weeks** | Functional app with 3 exchanges |

### Key Technical Risks

1. **Exchange API changes** — Exchanges update APIs without warning. CCXT mitigates but doesn't eliminate this.
2. **Rate limit exhaustion** — With many users syncing simultaneously, backend must pool requests carefully.
3. **Price data accuracy** — CoinGecko prices may differ slightly from exchange spot prices. Negligible for portfolio tracking but worth documenting.
4. **Exchange downtime** — If Binance API is down, portfolio shows stale data. Need graceful degradation with clear "last synced" timestamps.
5. **API key revocation** — Users may revoke keys from the exchange side without notifying Nexus. Need clear error messaging when sync fails.

---

## 12. Open Questions

These questions need answers before or during development:

### Product Questions
- [ ] Will Nexus be free, freemium, or paid from day one?
- [ ] What is the monetization model? (Subscription, premium features, affiliate?)
- [ ] Should Nexus support DeFi wallets (MetaMask, Phantom) in v2?
- [ ] Is tax reporting a target feature? (Would significantly change data model)
- [ ] Should Nexus support price alerts / notifications?
- [ ] Which non-crypto asset class should Nexus expand to first after crypto — stocks, mutual funds, or commodities? (User research needed)
- [ ] Is Plaid the right aggregation layer for brokerages, or are direct OAuth integrations (Alpaca, Schwab) preferred? Plaid is faster to market; direct integrations are more reliable and provide richer data.
- [ ] Should the app rebrand or update its positioning when Phase 8 ships, or position the expansion as a natural evolution of Nexus?
- [ ] What data provider for mutual fund NAV? Morningstar API is most comprehensive but expensive; Open FIGI is free but requires more assembly work.

### Technical Questions
- [ ] What cloud provider? (Railway is simplest; AWS/GCP if scaling matters)
- [ ] Self-hosted Redis or managed (Railway Redis, Upstash)?
- [ ] Should portfolio sync be real-time (WebSockets) or polling?
- [ ] What is the acceptable staleness for portfolio data? (30s? 60s? 5min?)
- [ ] Do we need exchange-specific price (from that exchange) or global market price?
- [ ] For stock prices, which provider? Polygon.io (real-time, generous free tier), Alpha Vantage (widely used, limited free tier), or Yahoo Finance (unofficial, no API key required but unstable)?
- [ ] For real estate valuation, Zillow Zestimate API is US-only. What's the equivalent for UK/EU/AU? (Rightmove, Domain.com.au, Immobiliare.it — none have public APIs)
- [ ] Should mutual fund NAV sync daily (acceptable for funds) or attempt intraday for ETFs? ETFs trade like stocks and need live prices; NAV funds update once per day.

### Compliance Questions
- [ ] Will the app target EU users? (GDPR obligations)
- [ ] Will the app be published on App Store + Play Store?
- [ ] Is there a legal entity behind Nexus? (Affects privacy policy requirements)

---

*Document version: 1.1 | Created: March 2026 | Updated: March 2026 (added broader wealth aggregator competitive landscape, diversified investor persona, multi-asset open questions) | Status: Living document — update as decisions are made*
