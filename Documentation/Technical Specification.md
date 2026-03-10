# Nexus — Technical Specification

> The implementation blueprint for the Nexus backend and mobile app. Read this before writing any production code.

**Version:** 1.0
**Status:** Draft
**Audience:** Developers building the Nexus backend and integrating real data into the mobile app

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Backend Service](#2-backend-service)
3. [Database Schema](#3-database-schema)
4. [Exchange Integration](#4-exchange-integration)
5. [Price Data Pipeline](#5-price-data-pipeline)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Reference](#7-api-reference)
8. [Mobile App Integration](#8-mobile-app-integration)
9. [Error Handling](#9-error-handling)
10. [Deployment](#10-deployment)
11. [Environment Variables](#11-environment-variables)
12. [Development Setup](#12-development-setup)

---

## 1. System Overview

### Architecture Summary

```
Mobile App (React Native/Expo)
    │
    │  HTTPS + JWT Bearer token
    ▼
Nexus API (Fastify / Node.js)
    │
    ├── PostgreSQL (persistent data)
    ├── Redis (price cache, session cache)
    └── CCXT (exchange API abstraction)
            │
            ├── Binance REST API
            ├── Coinbase Advanced Trade API
            └── Kraken REST API
```

### Request Flows

**Portfolio fetch (happy path):**
```
App → GET /api/v1/portfolio
    → Auth middleware validates JWT
    → Controller checks Redis cache (key: portfolio:{userId})
    → Cache HIT → return cached portfolio (< 30ms)
    → Cache MISS → query DB for latest holdings
        → for each holding, get price from Redis (key: price:{symbol})
        → calculate USD values, aggregations
        → store result in Redis TTL:30s
    → return portfolio JSON
```

**Exchange sync (background job):**
```
node-cron (every 60s)
    → load all active exchange_connections from DB
    → for each connection:
        → decrypt API key in memory
        → ccxt.fetchBalance() → get raw balances
        → filter zero balances
        → get prices for each asset symbol
        → calculate USD values
        → upsert holdings table
        → update last_synced_at
        → invalidate portfolio:{userId} Redis key
    → done
```

---

## 2. Backend Service

### Technology Stack

| Layer | Library | Version | Why |
|-------|---------|---------|-----|
| Runtime | Node.js | 20 LTS | TypeScript ecosystem, CCXT support |
| Framework | Fastify | 4.x | Fastest Node.js framework, schema validation, TypeScript native |
| ORM | Drizzle ORM | 0.29+ | Type-safe, minimal overhead, excellent PostgreSQL support |
| Database | PostgreSQL | 15 | ACID, JSONB, excellent for financial data |
| Cache | Redis | 7 | Price caching, session storage |
| Exchange lib | ccxt | 4.x | Unified API for 100+ exchanges |
| Scheduler | node-cron | 3.x | Portfolio sync jobs |
| Auth | jsonwebtoken | 9.x | JWT tokens |
| Password hashing | bcrypt | 5.x | Secure password storage |
| Validation | zod | 3.x | Runtime schema validation |
| Logging | pino | 8.x | Fastify's native logger, JSON structured |
| HTTP client | axios | 1.x | For price API calls |

### Project Structure

```
nexus-backend/
├── src/
│   ├── index.ts              # App entry point
│   ├── app.ts                # Fastify app factory
│   ├── config.ts             # Environment config with validation
│   │
│   ├── routes/
│   │   ├── auth.ts           # POST /login, POST /register, POST /refresh
│   │   ├── portfolio.ts      # GET /portfolio, GET /portfolio/chart
│   │   ├── exchanges.ts      # GET, POST, DELETE /exchanges
│   │   └── assets.ts         # GET /assets/:symbol
│   │
│   ├── services/
│   │   ├── exchange-sync.ts  # CCXT sync logic
│   │   ├── price.ts          # CoinGecko + Redis cache
│   │   ├── portfolio.ts      # Aggregation calculations
│   │   └── crypto.ts         # AES-256-GCM encrypt/decrypt
│   │
│   ├── jobs/
│   │   └── sync-job.ts       # node-cron portfolio sync
│   │
│   ├── db/
│   │   ├── client.ts         # Drizzle + PostgreSQL connection
│   │   └── schema.ts         # All table definitions
│   │
│   ├── middleware/
│   │   └── auth.ts           # JWT verification middleware
│   │
│   └── types/
│       └── index.ts          # Shared TypeScript types
│
├── drizzle/
│   └── migrations/           # Auto-generated SQL migrations
│
├── .env                      # Local environment (never commit)
├── .env.example              # Template (commit this)
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

### Fastify App Setup

```typescript
// src/app.ts
import Fastify from 'fastify';
import { authRoutes } from './routes/auth';
import { portfolioRoutes } from './routes/portfolio';
import { exchangeRoutes } from './routes/exchanges';
import { authMiddleware } from './middleware/auth';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      serializers: { req: (req) => ({ method: req.method, url: req.url }) }
    }
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    app.log.error(error);
    reply.status(error.statusCode ?? 500).send({
      error: error.message ?? 'Internal server error'
    });
  });

  // Routes
  app.register(authRoutes, { prefix: '/api/v1/auth' });
  app.register(portfolioRoutes, { prefix: '/api/v1' });
  app.register(exchangeRoutes, { prefix: '/api/v1' });

  return app;
}
```

---

## 3. Database Schema

### Full Drizzle Schema

```typescript
// src/db/schema.ts
import {
  pgTable, uuid, text, decimal, timestamp,
  boolean, bigserial, index, uniqueIndex
} from 'drizzle-orm/pg-core';

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable('users', {
  id:           uuid('id').primaryKey().defaultRandom(),
  email:        text('email').unique().notNull(),
  passwordHash: text('password_hash').notNull(),
  displayName:  text('display_name'),
  createdAt:    timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Exchange Connections ──────────────────────────────────────────────────────
export const exchangeConnections = pgTable('exchange_connections', {
  id:                uuid('id').primaryKey().defaultRandom(),
  userId:            uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exchangeId:        text('exchange_id').notNull(),         // 'binance' | 'coinbase' | 'kraken'
  displayName:       text('display_name'),                  // User's label, e.g. "My Main Binance"
  apiKeyEnc:         text('api_key_enc').notNull(),          // AES-256-GCM encrypted
  apiSecretEnc:      text('api_secret_enc').notNull(),       // AES-256-GCM encrypted
  apiPassphraseEnc:  text('api_passphrase_enc'),             // Coinbase only (encrypted)
  status:            text('status').default('active').notNull(), // 'active' | 'error' | 'disabled'
  lastSyncedAt:      timestamp('last_synced_at', { withTimezone: true }),
  errorMessage:      text('error_message'),
  createdAt:         timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userExchangeIdx: uniqueIndex('user_exchange_idx').on(t.userId, t.exchangeId),
}));

// ─── Holdings (latest state per user+exchange+symbol) ─────────────────────────
export const holdings = pgTable('holdings', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  exchangeId:  text('exchange_id').notNull(),
  symbol:      text('symbol').notNull(),                    // 'BTC', 'ETH', 'SOL'
  amount:      decimal('amount', { precision: 30, scale: 18 }).notNull(),
  valueUSD:    decimal('value_usd', { precision: 20, scale: 8 }).notNull(),
  priceUSD:    decimal('price_usd', { precision: 20, scale: 8 }).notNull(),
  syncedAt:    timestamp('synced_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userExchangeSymbolIdx: uniqueIndex('holding_ues_idx').on(t.userId, t.exchangeId, t.symbol),
  userSyncedIdx: index('holding_user_synced_idx').on(t.userId, t.syncedAt.desc()),
}));

// ─── Portfolio Snapshots (time-series for charts) ─────────────────────────────
export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id:            bigserial('id', { mode: 'number' }).primaryKey(),
  userId:        uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  totalValueUSD: decimal('total_value_usd', { precision: 20, scale: 8 }).notNull(),
  snapshotAt:    timestamp('snapshot_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userTimeIdx: index('snapshot_user_time_idx').on(t.userId, t.snapshotAt.desc()),
}));

// ─── Price Cache (backup to Redis, used for historical data) ──────────────────
export const priceHistory = pgTable('price_history', {
  id:         bigserial('id', { mode: 'number' }).primaryKey(),
  symbol:     text('symbol').notNull(),
  priceUSD:   decimal('price_usd', { precision: 20, scale: 8 }).notNull(),
  source:     text('source').default('coingecko'),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  symbolTimeIdx: index('price_symbol_time_idx').on(t.symbol, t.recordedAt.desc()),
}));
```

### SQL Migrations (Raw)

```sql
-- Run once: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Index for fast portfolio lookups
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  holdings_user_idx ON holdings(user_id, synced_at DESC);

-- Partial index for active connections only
CREATE INDEX CONCURRENTLY IF NOT EXISTS
  active_connections_idx ON exchange_connections(user_id)
  WHERE status = 'active';
```

---

## 4. Exchange Integration

### CCXT Service

```typescript
// src/services/exchange-sync.ts
import ccxt from 'ccxt';
import { decrypt } from './crypto';
import { db } from '../db/client';
import { holdings, exchangeConnections } from '../db/schema';
import { getPrice } from './price';
import { eq, and } from 'drizzle-orm';

// Minimum USD value to include in portfolio (filter dust)
const MIN_VALUE_USD = 1.0;

// Symbol mapping: exchange symbol → CoinGecko ID
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  BNB: 'binancecoin',
  USDT: 'tether',
  USDC: 'usd-coin',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  LTC: 'litecoin',
};

function createExchangeInstance(exchangeId: string, apiKey: string, apiSecret: string, passphrase?: string) {
  const config: any = {
    apiKey,
    secret: apiSecret,
    enableRateLimit: true,
    options: { defaultType: 'spot' },
  };

  if (passphrase) config.password = passphrase;

  switch (exchangeId) {
    case 'binance':    return new ccxt.binance(config);
    case 'coinbase':   return new ccxt.coinbase(config);
    case 'kraken':     return new ccxt.kraken(config);
    default:           throw new Error(`Unsupported exchange: ${exchangeId}`);
  }
}

export async function syncExchangeConnection(connectionId: string): Promise<void> {
  // 1. Load connection
  const [conn] = await db
    .select()
    .from(exchangeConnections)
    .where(eq(exchangeConnections.id, connectionId));

  if (!conn || conn.status !== 'active') return;

  try {
    // 2. Decrypt credentials (in memory only, never logged)
    const apiKey    = decrypt(conn.apiKeyEnc);
    const apiSecret = decrypt(conn.apiSecretEnc);
    const passphrase = conn.apiPassphraseEnc ? decrypt(conn.apiPassphraseEnc) : undefined;

    // 3. Create CCXT instance
    const exchange = createExchangeInstance(conn.exchangeId, apiKey, apiSecret, passphrase);

    // 4. Fetch balances
    const balance = await exchange.fetchBalance();

    // 5. Filter assets above minimum value
    const significantAssets = Object.entries(balance.total)
      .filter(([symbol, amount]) => amount > 0 && COINGECKO_IDS[symbol]);

    // 6. Get prices + calculate values
    const holdingRows = [];
    for (const [symbol, amount] of significantAssets) {
      const priceUSD = await getPrice(symbol);
      const valueUSD = (amount as number) * priceUSD;

      if (valueUSD < MIN_VALUE_USD) continue;

      holdingRows.push({
        userId: conn.userId,
        exchangeId: conn.exchangeId,
        symbol,
        amount: String(amount),
        valueUSD: String(valueUSD.toFixed(8)),
        priceUSD: String(priceUSD),
        syncedAt: new Date(),
      });
    }

    // 7. Upsert holdings (replace old state with new)
    if (holdingRows.length > 0) {
      await db
        .insert(holdings)
        .values(holdingRows)
        .onConflictDoUpdate({
          target: [holdings.userId, holdings.exchangeId, holdings.symbol],
          set: {
            amount: holdingRows[0].amount, // Will be set per row by DB
            valueUSD: holdingRows[0].valueUSD,
            priceUSD: holdingRows[0].priceUSD,
            syncedAt: new Date(),
          },
        });
    }

    // 8. Mark sync success
    await db
      .update(exchangeConnections)
      .set({ lastSyncedAt: new Date(), errorMessage: null })
      .where(eq(exchangeConnections.id, connectionId));

  } catch (error: any) {
    // 9. Record error, don't crash the job
    await db
      .update(exchangeConnections)
      .set({
        status: error.message?.includes('Invalid API') ? 'error' : 'active',
        errorMessage: error.message?.slice(0, 500),
      })
      .where(eq(exchangeConnections.id, connectionId));

    throw error;
  }
}
```

### Sync Job

```typescript
// src/jobs/sync-job.ts
import cron from 'node-cron';
import { db } from '../db/client';
import { exchangeConnections } from '../db/schema';
import { eq } from 'drizzle-orm';
import { syncExchangeConnection } from '../services/exchange-sync';
import { invalidatePortfolioCache } from '../services/portfolio';

export function startSyncJob() {
  // Run every 60 seconds
  cron.schedule('*/1 * * * *', async () => {
    const connections = await db
      .select({ id: exchangeConnections.id, userId: exchangeConnections.userId })
      .from(exchangeConnections)
      .where(eq(exchangeConnections.status, 'active'));

    // Sync all connections concurrently (with concurrency limit)
    const BATCH_SIZE = 10;
    for (let i = 0; i < connections.length; i += BATCH_SIZE) {
      const batch = connections.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (conn) => {
          await syncExchangeConnection(conn.id);
          await invalidatePortfolioCache(conn.userId);
        })
      );
    }
  });
}
```

---

## 5. Price Data Pipeline

### Price Service (CoinGecko + Redis)

```typescript
// src/services/price.ts
import axios from 'axios';
import { redis } from '../db/redis';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const PRICE_TTL = 60;       // seconds
const CHART_TTL = 300;      // seconds

const SYMBOL_TO_ID: Record<string, string> = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana',
  BNB: 'binancecoin', USDT: 'tether', USDC: 'usd-coin',
  XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin',
  MATIC: 'matic-network', AVAX: 'avalanche-2',
};

// Stablecoins — skip API call, return 1.0
const STABLECOINS = new Set(['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD']);

export async function getPrice(symbol: string): Promise<number> {
  if (STABLECOINS.has(symbol)) return 1.0;

  const cacheKey = `price:${symbol}`;
  const cached = await redis.get(cacheKey);
  if (cached) return parseFloat(cached);

  const coinId = SYMBOL_TO_ID[symbol];
  if (!coinId) return 0;

  const { data } = await axios.get(`${COINGECKO_BASE}/simple/price`, {
    params: { ids: coinId, vs_currencies: 'usd', include_24hr_change: 'true' },
    timeout: 5000,
  });

  const price = data[coinId]?.usd ?? 0;
  await redis.setex(cacheKey, PRICE_TTL, String(price));
  return price;
}

export async function getPrices(symbols: string[]): Promise<Record<string, number>> {
  const prices: Record<string, number> = {};
  const toFetch: string[] = [];

  // Check cache first
  for (const symbol of symbols) {
    if (STABLECOINS.has(symbol)) { prices[symbol] = 1.0; continue; }
    const cached = await redis.get(`price:${symbol}`);
    if (cached) { prices[symbol] = parseFloat(cached); }
    else { toFetch.push(symbol); }
  }

  if (toFetch.length === 0) return prices;

  // Batch fetch from CoinGecko
  const coinIds = toFetch.map(s => SYMBOL_TO_ID[s]).filter(Boolean).join(',');
  const { data } = await axios.get(`${COINGECKO_BASE}/simple/price`, {
    params: { ids: coinIds, vs_currencies: 'usd', include_24hr_change: 'true' },
    timeout: 5000,
  });

  // Store results in cache
  for (const symbol of toFetch) {
    const coinId = SYMBOL_TO_ID[symbol];
    const price = data[coinId]?.usd ?? 0;
    prices[symbol] = price;
    if (price > 0) await redis.setex(`price:${symbol}`, PRICE_TTL, String(price));
  }

  return prices;
}

export async function getChartData(symbol: string, days: number = 7) {
  const cacheKey = `chart:${symbol}:${days}d`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const coinId = SYMBOL_TO_ID[symbol];
  if (!coinId) return [];

  const { data } = await axios.get(
    `${COINGECKO_BASE}/coins/${coinId}/market_chart`,
    { params: { vs_currency: 'usd', days }, timeout: 8000 }
  );

  const result = data.prices.map(([ts, price]: [number, number]) => ({ timestamp: ts, price }));
  await redis.setex(cacheKey, CHART_TTL, JSON.stringify(result));
  return result;
}
```

---

## 6. Authentication & Authorization

### JWT Strategy

```typescript
// src/services/auth.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const ACCESS_TOKEN_EXPIRY  = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';
const BCRYPT_ROUNDS = 12;

export function generateTokens(userId: string) {
  const accessToken = jwt.sign(
    { sub: userId, type: 'access' },
    process.env.JWT_SECRET!,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { sub: userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): { sub: string } {
  return jwt.verify(token, process.env.JWT_SECRET!) as any;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

### Auth Middleware

```typescript
// src/middleware/auth.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../services/auth';

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Missing authorization header' });
  }

  try {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    (request as any).userId = payload.sub;
  } catch {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}
```

---

## 7. API Reference

### Authentication

#### `POST /api/v1/auth/register`
```json
// Request
{ "email": "alex@example.com", "password": "securepass123" }

// Response 201
{ "accessToken": "eyJ...", "refreshToken": "eyJ...", "user": { "id": "uuid", "email": "alex@example.com" } }

// Response 409
{ "error": "Email already registered" }
```

#### `POST /api/v1/auth/login`
```json
// Request
{ "email": "alex@example.com", "password": "securepass123" }

// Response 200
{ "accessToken": "eyJ...", "refreshToken": "eyJ...", "user": { "id": "uuid", "email": "alex@example.com" } }

// Response 401
{ "error": "Invalid credentials" }
```

#### `POST /api/v1/auth/refresh`
```json
// Request
{ "refreshToken": "eyJ..." }

// Response 200
{ "accessToken": "eyJ..." }
```

---

### Portfolio

#### `GET /api/v1/portfolio`
*Requires: `Authorization: Bearer {token}`*

```json
// Response 200
{
  "totalValueUSD": 84473.34,
  "change24hUSD": 2831.45,
  "change24hPercent": 3.48,
  "lastSyncedAt": "2024-01-15T10:30:00Z",
  "exchanges": [
    {
      "id": "binance",
      "name": "Binance",
      "totalValueUSD": 58505.12,
      "change24hPercent": 2.41,
      "assetsCount": 5,
      "status": "active",
      "lastSyncedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "assets": [
    {
      "symbol": "BTC",
      "name": "Bitcoin",
      "totalAmount": "0.84320000",
      "totalValueUSD": 36421.18,
      "priceUSD": 43212.50,
      "change24hPercent": 1.82,
      "holdings": [
        { "exchangeId": "binance", "amount": "0.50000000", "valueUSD": 21606.25 },
        { "exchangeId": "coinbase", "amount": "0.34320000", "valueUSD": 14814.93 }
      ]
    }
  ]
}
```

#### `GET /api/v1/portfolio/chart?period=7d`
```json
// Response 200
{
  "period": "7d",
  "data": [
    { "timestamp": 1698192000000, "valueUSD": 79230.15 },
    { "timestamp": 1698278400000, "valueUSD": 81450.32 }
  ]
}
```

---

### Exchanges

#### `GET /api/v1/exchanges`
```json
// Response 200
[
  {
    "id": "conn-uuid",
    "exchangeId": "binance",
    "displayName": "My Binance",
    "status": "active",
    "lastSyncedAt": "2024-01-15T10:30:00Z",
    "errorMessage": null
  }
]
```

#### `POST /api/v1/exchanges`
```json
// Request
{
  "exchangeId": "binance",
  "apiKey": "your-api-key",
  "apiSecret": "your-api-secret",
  "displayName": "My Binance"
}

// Response 201
{
  "id": "conn-uuid",
  "exchangeId": "binance",
  "status": "active",
  "message": "Exchange connected. Syncing now..."
}

// Response 400
{ "error": "Invalid API key. Please check your credentials." }
```

#### `DELETE /api/v1/exchanges/:id`
```json
// Response 200
{ "message": "Exchange disconnected and credentials permanently deleted." }
```

---

### Assets

#### `GET /api/v1/assets/:symbol/chart?period=7d`
```json
// Response 200
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "period": "7d",
  "currentPrice": 43212.50,
  "change24hPercent": 1.82,
  "data": [
    { "timestamp": 1698192000000, "price": 41100.00 },
    { "timestamp": 1698278400000, "price": 42500.00 }
  ]
}
```

---

## 8. Mobile App Integration

### Replacing Mock Data

The current mobile app uses `mobile/data/mockData.ts`. When the backend is ready, replace with API calls:

```typescript
// mobile/services/api.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

async function getAuthHeader() {
  const token = await AsyncStorage.getItem('accessToken');
  return { Authorization: `Bearer ${token}` };
}

export async function fetchPortfolio() {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}/api/v1/portfolio`, { headers });
  if (!res.ok) throw new Error('Failed to fetch portfolio');
  return res.json();
}

export async function addExchange(data: {
  exchangeId: string;
  apiKey: string;
  apiSecret: string;
}) {
  const headers = await getAuthHeader();
  const res = await fetch(`${BASE_URL}/api/v1/exchanges`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? 'Failed to connect exchange');
  }
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  const data = await res.json();
  await AsyncStorage.setItem('accessToken', data.accessToken);
  await AsyncStorage.setItem('refreshToken', data.refreshToken);
  return data;
}
```

### Environment Config (Mobile)

```bash
# mobile/.env
EXPO_PUBLIC_API_URL=https://api.nexus.app   # Production
# EXPO_PUBLIC_API_URL=http://localhost:3000  # Development
```

### Auto-Refresh Strategy (Mobile)

```typescript
// In Dashboard screen
useEffect(() => {
  fetchPortfolio();

  // Poll every 60 seconds while app is foregrounded
  const interval = setInterval(fetchPortfolio, 60_000);

  // Also refresh on app foreground
  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') fetchPortfolio();
  });

  return () => {
    clearInterval(interval);
    subscription.remove();
  };
}, []);
```

---

## 9. Error Handling

### Exchange Error Classification

```typescript
function classifyExchangeError(error: any): {
  userMessage: string;
  shouldDisableConnection: boolean;
} {
  const msg = error.message?.toLowerCase() ?? '';

  if (msg.includes('invalid api') || msg.includes('unauthorized') || msg.includes('403')) {
    return {
      userMessage: 'API key is invalid or has been revoked. Please reconnect.',
      shouldDisableConnection: true,
    };
  }
  if (msg.includes('rate limit') || msg.includes('429')) {
    return {
      userMessage: 'Exchange is temporarily rate-limited. Will retry shortly.',
      shouldDisableConnection: false,
    };
  }
  if (msg.includes('network') || msg.includes('timeout') || msg.includes('econnreset')) {
    return {
      userMessage: 'Network error. Will retry on next sync.',
      shouldDisableConnection: false,
    };
  }
  if (msg.includes('permission') || msg.includes('read only')) {
    return {
      userMessage: 'API key lacks read permission. Please create a key with "read" access.',
      shouldDisableConnection: true,
    };
  }

  return {
    userMessage: 'Unexpected error. Will retry on next sync.',
    shouldDisableConnection: false,
  };
}
```

### HTTP Error Responses

All errors follow this shape:
```json
{ "error": "Human-readable message", "code": "MACHINE_CODE" }
```

| HTTP Status | Meaning | When |
|-------------|---------|------|
| 400 | Bad Request | Invalid request body, validation failure |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid JWT but no permission for resource |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate (e.g., exchange already connected) |
| 422 | Unprocessable | API key validation against exchange failed |
| 429 | Rate Limited | Client is calling API too fast |
| 500 | Server Error | Unexpected error; log and investigate |
| 503 | Service Unavailable | Exchange API is down |

---

## 10. Deployment

### Railway Setup

Railway is recommended for MVP: managed PostgreSQL, Redis, and Node.js deployment in one dashboard.

```
Railway Project: nexus-production
├── Service: nexus-api (Node.js)
├── Service: PostgreSQL (managed)
└── Service: Redis (managed)
```

**Railway environment variables to set:**
See Section 11 for the full list.

**Procfile (or Railway start command):**
```
node dist/index.js
```

**Build command:**
```bash
npm run build   # tsc --outDir dist
```

### Docker (Alternative)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

---

## 11. Environment Variables

### Backend `.env`

```bash
# Server
NODE_ENV=production
PORT=3000
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://user:password@host:5432/nexus

# Redis
REDIS_URL=redis://default:password@host:6379

# Auth
JWT_SECRET=<generate: openssl rand -hex 64>
JWT_REFRESH_SECRET=<generate: openssl rand -hex 64>

# Encryption (for API keys at rest)
ENCRYPTION_KEY=<generate: openssl rand -hex 32>   # Must be exactly 64 hex chars = 32 bytes

# Price API
COINGECKO_API_KEY=<optional: CoinGecko demo key for higher rate limits>

# App
SYNC_INTERVAL_SECONDS=60
MIN_HOLDING_VALUE_USD=1.0
```

### Generate Secrets

```bash
# JWT secrets (64 bytes = 512-bit security)
openssl rand -hex 64

# Encryption key (32 bytes = 256-bit AES key)
openssl rand -hex 32
```

---

## 12. Development Setup

### Prerequisites

```bash
node --version   # Must be 20+
docker --version # For local PostgreSQL + Redis
```

### Local Setup

```bash
# 1. Clone and install
git clone <repo>
cd nexus-backend
npm install

# 2. Start local PostgreSQL and Redis
docker compose up -d

# docker-compose.yml:
# services:
#   postgres:
#     image: postgres:15
#     environment: { POSTGRES_DB: nexus, POSTGRES_PASSWORD: nexus }
#     ports: ["5432:5432"]
#   redis:
#     image: redis:7-alpine
#     ports: ["6379:6379"]

# 3. Copy and fill env
cp .env.example .env
# Edit .env with local values

# 4. Run migrations
npx drizzle-kit push:pg

# 5. Start dev server
npm run dev   # ts-node-dev src/index.ts --watch

# 6. Test health endpoint
curl http://localhost:3000/health
```

### Useful Scripts

```bash
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm run start        # Run compiled JS
npm run db:push      # Push schema changes to DB (dev)
npm run db:migrate   # Generate + run migration (prod)
npm run db:studio    # Open Drizzle Studio (DB GUI)
```

---

*Document version: 1.0 | Created: March 2026 | Review: Before backend development begins*
