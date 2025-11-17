# 🚀 Broker Sync Backend

A production-ready TypeScript backend system for synchronizing trading data from multiple stock brokers into a unified format. Built with security, validation, logging, and testing best practices.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Node](https://img.shields.io/badge/Node-16+-green)
![Tests](https://img.shields.io/badge/tests-passing-brightgreen)
![License](https://img.shields.io/badge/license-ISC-blue)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture Diagram](#-architecture-diagram)
- [System Flow](#-system-flow)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [How It Works](#-how-it-works)
- [Adding New Brokers](#-adding-new-brokers)
- [Security](#-security)
- [Performance](#-performance)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🎯 Overview

**Broker Sync Backend** is a one-way synchronization system that connects to multiple stock brokers (Zerodha, etc.), fetches trade data, normalizes it into a standard format, and manages authentication tokens automatically.

### What Problem Does It Solve?

- **Multiple Broker Formats**: Each broker has different API response formats
- **Token Management**: Handles token expiry and automatic refresh
- **Data Normalization**: Converts all broker data into one consistent format
- **Extensibility**: Easy to add support for new brokers

### Key Capabilities

✅ Multi-broker support (Zerodha + Mock for testing)  
✅ Automatic token refresh when expired  
✅ Data normalization to standard format  
✅ Production-ready security (Helmet, CORS, Rate Limiting)  
✅ Input validation with Zod schemas  
✅ Structured logging with Pino  
✅ Comprehensive error handling  
✅ Unit tested with Jest  

---

## 🏗️ Architecture Diagram

### High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT APPLICATION                        │
│                   (Web App / Mobile / CLI)                       │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ HTTP Requests
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                      BROKER SYNC BACKEND                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   MIDDLEWARE LAYER                        │  │
│  │  ┌────────┐  ┌────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │Helmet  │  │ CORS   │  │  Rate    │  │  Pino    │     │  │
│  │  │Security│  │        │  │ Limiter  │  │  Logger  │     │  │
│  │  └────────┘  └────────┘  └──────────┘  └──────────┘     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         Zod Validation Middleware                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     ROUTES LAYER                          │  │
│  │  ┌──────────────┐           ┌──────────────┐            │  │
│  │  │   /zerodha   │           │    /mock     │            │  │
│  │  │  - login     │           │  - login     │            │  │
│  │  │  - callback  │           │  - sync      │            │  │
│  │  │  - sync      │           │  - status    │            │  │
│  │  └──────────────┘           └──────────────┘            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   SERVICES LAYER                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           syncService.ts                           │  │  │
│  │  │  - syncTrades()                                    │  │  │
│  │  │  - getBrokerAdapter()                              │  │  │
│  │  │  - Token expiry check                              │  │  │
│  │  │  - Auto refresh logic                              │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │           tokenService.ts                          │  │  │
│  │  │  - setToken()                                      │  │  │
│  │  │  - getToken()                                      │  │  │
│  │  │  - deleteToken()                                   │  │  │
│  │  │  In-Memory Storage: Map<userId:broker, TokenData> │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  ADAPTERS LAYER                           │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  IBrokerAdapter Interface                          │  │  │
│  │  │  - fetchTrades()                                   │  │  │
│  │  │  - refreshToken()                                  │  │  │
│  │  │  - isTokenExpired()                                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────┐         ┌─────────────────┐       │  │
│  │  │ ZerodhaReal     │         │ MockBroker      │       │  │
│  │  │ Adapter         │         │ Adapter         │       │  │
│  │  │ - KiteConnect   │         │ - Simulated     │       │  │
│  │  │ - Real API      │         │ - Test Data     │       │  │
│  │  └─────────────────┘         └─────────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                NORMALIZERS LAYER                          │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Trade Normalizers                                 │  │  │
│  │  │  - normalizeZerodhaTrade()                         │  │  │
│  │  │  - normalizeTrades()                               │  │  │
│  │  │  - getNormalizer() [Factory]                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   TYPES LAYER                             │  │
│  │  Trade, TokenData, BrokerSession, IBrokerAdapter        │  │
│  └──────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                           │
                           │ API Calls
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                    EXTERNAL BROKER APIs                          │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │   Zerodha API    │              │  Future Brokers  │         │
│  │  (KiteConnect)   │              │  (Upstox, etc.)  │         │
│  └──────────────────┘              └──────────────────┘         │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🔄 System Flow

### Complete Request Flow Diagram

```
USER REQUEST
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. MIDDLEWARE CHAIN                                         │
│    ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│    │ Helmet   │→ │   CORS   │→ │   Rate   │→ │  Pino    │ │
│    │ Headers  │  │  Check   │  │  Limit   │  │  Logger  │ │
│    └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                             │
│    ┌──────────────────────────────────────────────────┐   │
│    │  Zod Validation                                  │   │
│    │  - Validate req.body, req.params, req.query     │   │
│    │  - If invalid → 400 Bad Request                 │   │
│    └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ROUTE HANDLER                                            │
│    Example: GET /mock/sync/:userId                          │
│                                                             │
│    asyncHandler wraps the route:                           │
│    ✓ Automatically catches async errors                    │
│    ✓ Passes errors to error handler                        │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SYNC SERVICE (syncTrades)                                │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Step 1: Load Token from Storage                     │  │
│  │   tokenService.getToken(userId, broker)             │  │
│  │   - If not found → throw AppError 401               │  │
│  └──────────────────────────────────────────────────────┘  │
│                    │                                        │
│                    ▼                                        │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Step 2: Check Token Expiry                          │  │
│  │   adapter.isTokenExpired(tokenData.expiresAt)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                    │                                        │
│          ┌─────────┴─────────┐                             │
│          │                   │                             │
│     Token Expired?      Token Valid                        │
│          │                   │                             │
│          ▼                   ▼                             │
│  ┌──────────────────┐  ┌──────────────────┐              │
│  │ Step 3a: Refresh │  │ Step 4: Fetch    │              │
│  │                  │  │ Trades           │              │
│  │ - Call           │  │                  │              │
│  │   refreshToken() │  │ adapter.fetch    │              │
│  │ - Update token   │  │ Trades()         │              │
│  │   in storage     │  │                  │              │
│  │ - Get new        │  └──────────────────┘              │
│  │   adapter        │           │                         │
│  └──────────────────┘           │                         │
│          │                      │                         │
│          └──────────┬───────────┘                         │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Step 5: Normalize Trades                            │ │
│  │   normalizeTrades(rawTrades, brokerName)            │ │
│  │                                                      │ │
│  │   Broker Format → Standard Format                   │ │
│  │   {                    {                            │ │
│  │     trade_id,            id,                        │ │
│  │     tradingsymbol,  →    symbol,                    │ │
│  │     transaction_type,    side: "BUY"|"SELL",       │ │
│  │     quantity,            quantity,                  │ │
│  │     average_price,       price,                     │ │
│  │     order_timestamp      timestamp                  │ │
│  │   }                    }                            │ │
│  └──────────────────────────────────────────────────────┘ │
│                     │                                      │
│                     ▼                                      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Step 6: Return Normalized Trades                    │ │
│  └──────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. RESPONSE                                                 │
│                                                             │
│  Success Response (200):                                    │
│  {                                                          │
│    "success": true,                                         │
│    "userId": "testuser",                                    │
│    "broker": "mock",                                        │
│    "tradeCount": 3,                                         │
│    "trades": [                                              │
│      {                                                      │
│        "id": "T001",                                        │
│        "broker": "mock",                                    │
│        "symbol": "RELIANCE",                                │
│        "side": "BUY",                                       │
│        "quantity": 10,                                      │
│        "price": 2500.5,                                     │
│        "timestamp": "2025-01-10T10:30:00.000Z"             │
│      },                                                     │
│      ...                                                    │
│    ]                                                        │
│  }                                                          │
│                                                             │
│  OR Error Response (4xx/5xx):                              │
│  {                                                          │
│    "success": false,                                        │
│    "error": {                                               │
│      "message": "No token found...",                        │
│      "statusCode": 401                                      │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### Core Features

- **🔗 Multi-Broker Support**: Connect to multiple stock brokers
  - Zerodha (KiteConnect API)
  - Mock broker (for testing)
  - Easy to add more

- **🔄 Automatic Token Management**
  - In-memory token storage
  - Automatic expiry detection
  - Token refresh when supported
  - Error handling for expired tokens

- **📊 Data Normalization**
  - Converts all broker formats to one standard format
  - Factory pattern for extensibility
  - Type-safe transformations

- **🏗️ Clean Architecture**
  - Layered design (Routes → Services → Adapters)
  - SOLID principles
  - Design patterns (Adapter, Factory, Singleton)

### Production Features

- **🔒 Security**
  - Helmet.js security headers
  - CORS protection
  - Rate limiting (100 req/15min)
  - Input validation with Zod

- **📝 Logging**
  - Structured logging with Pino
  - Request/Response logging
  - Error logging
  - Performance metrics

- **✅ Validation**
  - Schema validation for all routes
  - Type-safe inputs
  - Clear error messages

- **🛡️ Error Handling**
  - Custom error classes
  - Centralized error handler
  - Proper HTTP status codes
  - Async error catching

- **🧪 Testing**
  - Unit tests with Jest
  - 7 tests passing
  - Test coverage reports
  - Easy to extend

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| **TypeScript** | 5.9.3 | Type-safe development |
| **Node.js** | 16+ | Runtime environment |
| **Express** | 5.1.0 | Web framework |
| **Zod** | Latest | Schema validation |
| **Pino** | Latest | Structured logging |

### Security & Middleware

| Package | Purpose |
|---------|---------|
| **helmet** | Security headers |
| **cors** | Cross-origin resource sharing |
| **express-rate-limit** | API rate limiting |
| **dotenv** | Environment variables |

### Broker Integration

| Package | Purpose |
|---------|---------|
| **kiteconnect** | Zerodha API SDK |

### Testing

| Package | Purpose |
|---------|---------|
| **jest** | Testing framework |
| **ts-jest** | TypeScript support |
| **supertest** | HTTP testing |

---

## 📁 Project Structure

```
broker-sync/
│
├── server.ts                      # Entry point
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript config
├── jest.config.js                 # Jest config
├── .env                          # Environment variables (git ignored)
├── .env.example                  # Environment template
├── .gitignore                    # Git ignore rules
│
├── src/
│   │
│   ├── adapters/                 # Broker connection adapters
│   │   ├── index.ts             # Exports IBrokerAdapter
│   │   ├── real/
│   │   │   └── zerodhaAdapter.ts # Zerodha integration
│   │   └── mock/
│   │       └── mockAdapter.ts    # Mock broker for testing
│   │
│   ├── normalizers/              # Data transformation
│   │   └── tradeNormalize.ts    # Trade format converters
│   │
│   ├── services/                 # Business logic
│   │   ├── tokenService.ts      # Token storage & management
│   │   └── syncService.ts       # Main sync orchestration
│   │
│   ├── routes/                   # API endpoints
│   │   ├── zerodhaRoutes.ts     # Zerodha endpoints
│   │   └── mockRoutes.ts        # Mock broker endpoints
│   │
│   ├── middleware/               # Express middleware
│   │   ├── errorHandler.ts      # Error handling
│   │   └── validator.ts         # Zod validation
│   │
│   ├── validators/               # Validation schemas
│   │   └── schemas.ts           # Zod schemas
│   │
│   ├── types/                    # TypeScript definitions
│   │   └── index.ts             # Core types & interfaces
│   │
│   └── utils/                    # Helper functions
│       ├── tokenUtils.ts        # Token utilities
│       └── logger.ts            # Pino logger config
│
├── __tests__/                    # Test files
│   ├── tokenService.test.ts     # Token service tests
│   └── normalizer.test.ts       # Normalizer tests
│
└── docs/                         # Documentation
    ├── ARCHITECTURE.md          # Detailed architecture
    ├── IMPROVEMENTS.md          # Recent improvements
    └── QUICKSTART.md            # Quick start guide
```

### File Responsibilities

**Core Files:**
- `server.ts` - Express app setup, middleware, routes
- `package.json` - Dependencies, scripts, metadata

**Adapters:**
- `IBrokerAdapter` - Interface all adapters implement
- `zerodhaAdapter.ts` - Real Zerodha API integration
- `mockAdapter.ts` - Simulated broker for testing

**Services:**
- `tokenService.ts` - CRUD operations for tokens
- `syncService.ts` - Main sync logic with token refresh

**Routes:**
- `zerodhaRoutes.ts` - `/zerodha/login`, `/zerodha/callback`, `/zerodha/sync/:userId`
- `mockRoutes.ts` - `/mock/login`, `/mock/sync/:userId`, `/mock/token-status/:userId`

**Middleware:**
- `errorHandler.ts` - Custom AppError class, error handler, async wrapper
- `validator.ts` - Zod schema validation middleware

**Types:**
- `Trade` - Normalized trade format
- `TokenData` - Token storage structure
- `BrokerSession` - Login session data
- `IBrokerAdapter` - Adapter interface

---

## 🚀 Installation

### Prerequisites

- **Node.js** >= 16.0.0
- **npm** >= 7.0.0
- **TypeScript** knowledge (helpful)

### Step-by-Step Installation

```bash
# 1. Clone or download the repository
git clone <repository-url>
cd broker-sync

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Edit .env file (optional for mock broker)
nano .env  # or use your preferred editor
```

### Verify Installation

```bash
# Run tests
npm test

# Build TypeScript
npm run build

# Start development server
npm run dev
```

You should see:
```
[INFO] 🚀 Broker Sync Server listening on port 3000
[INFO] 📊 Available endpoints:
[INFO]    - Health: http://localhost:3000/
[INFO]    - Mock Demo: POST http://localhost:3000/mock/login
[INFO]    - Zerodha: GET http://localhost:3000/zerodha/login
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Security
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080

# Logging
LOG_LEVEL=info

# Zerodha API Credentials (optional - only needed for real broker)
Z_API_KEY=your_zerodha_api_key_here
Z_API_SECRET=your_zerodha_api_secret_here
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port |
| `NODE_ENV` | development | Environment (development/production) |
| `ALLOWED_ORIGINS` | * | CORS allowed origins (comma-separated) |
| `LOG_LEVEL` | info | Log level (trace/debug/info/warn/error/fatal) |
| `Z_API_KEY` | - | Zerodha API key from kite.trade |
| `Z_API_SECRET` | - | Zerodha API secret |

### Getting Zerodha Credentials

1. Visit [https://kite.trade/](https://kite.trade/)
2. Sign up for Kite Connect API
3. Create a new app
4. Get API Key and API Secret
5. Set redirect URL to `http://localhost:3000/zerodha/callback`
6. Add credentials to `.env` file

---

## 💻 Usage

### Quick Start

```bash
# Start the server
npm run dev

# The server will start on http://localhost:3000
```

### Testing with Mock Broker

The mock broker doesn't require any API keys - perfect for testing!

#### 1. Login (Create Token)

```bash
curl -X POST http://localhost:3000/mock/login \
  -H "Content-Type: application/json" \
  -d '{"userId": "testuser123"}'
```

**Response:**
```json
{
  "success": true,
  "message": "Mock login successful!",
  "userId": "testuser123",
  "expiresAt": "2025-11-17T14:35:00.000Z",
  "note": "Token expires in 5 minutes for testing refresh logic"
}
```

#### 2. Sync Trades

```bash
curl http://localhost:3000/mock/sync/testuser123
```

**Response:**
```json
{
  "success": true,
  "userId": "testuser123",
  "broker": "mock",
  "tradeCount": 3,
  "trades": [
    {
      "id": "T001",
      "broker": "mock",
      "symbol": "RELIANCE",
      "side": "BUY",
      "quantity": 10,
      "price": 2500.5,
      "timestamp": "2025-01-10T10:30:00.000Z"
    },
    {
      "id": "T002",
      "broker": "mock",
      "symbol": "TCS",
      "side": "SELL",
      "quantity": 5,
      "price": 3800.75,
      "timestamp": "2025-01-10T14:15:00.000Z"
    },
    {
      "id": "T003",
      "broker": "mock",
      "symbol": "INFY",
      "side": "BUY",
      "quantity": 20,
      "price": 1450.25,
      "timestamp": "2025-01-11T09:45:00.000Z"
    }
  ]
}
```

#### 3. Check Token Status

```bash
curl http://localhost:3000/mock/token-status/testuser123
```

**Response:**
```json
{
  "success": true,
  "userId": "testuser123",
  "broker": "mock",
  "isExpired": false,
  "expiresAt": "2025-11-17T14:35:00.000Z"
}
```

### Using Zerodha (Real Broker)

#### 1. Login

Open in browser:
```
http://localhost:3000/zerodha/login
```

This redirects to Zerodha's login page. After successful login, you'll be redirected back with a token.

#### 2. Sync Real Trades

```bash
curl http://localhost:3000/zerodha/sync/YOUR_ZERODHA_USER_ID
```

This fetches your actual trade history from Zerodha!

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000
```

### Endpoints

#### Health Check

**GET** `/`

Returns service information and available endpoints.

**Response:**
```json
{
  "service": "Broker Sync Backend",
  "version": "1.0.0",
  "status": "running",
  "endpoints": { ... }
}
```

---

### Mock Broker Endpoints

#### Mock Login

**POST** `/mock/login`

Creates a mock token for testing.

**Request Body:**
```json
{
  "userId": "string" (required, 1-50 chars)
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Mock login successful!",
  "userId": "testuser",
  "expiresAt": "2025-11-17T14:35:00.000Z",
  "note": "Token expires in 5 minutes for testing refresh logic"
}
```

**Errors:**
- `400 Bad Request` - Invalid userId

---

#### Mock Sync

**GET** `/mock/sync/:userId`

Fetches and normalizes mock trade data.

**Parameters:**
- `userId` (path, required): User identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "userId": "testuser",
  "broker": "mock",
  "tradeCount": 3,
  "trades": [
    {
      "id": "T001",
      "broker": "mock",
      "symbol": "RELIANCE",
      "side": "BUY",
      "quantity": 10,
      "price": 2500.5,
      "timestamp": "2025-01-10T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- `400 Bad Request` - Invalid userId
- `401 Unauthorized` - No token found or token expired

---

#### Mock Token Status

**GET** `/mock/token-status/:userId`

Checks token expiry status.

**Parameters:**
- `userId` (path, required): User identifier

**Response:** `200 OK`
```json
{
  "success": true,
  "userId": "testuser",
  "broker": "mock",
  "isExpired": false,
  "expiresAt": "2025-11-17T14:35:00.000Z"
}
```

**Errors:**
- `400 Bad Request` - Invalid userId
- `404 Not Found` - Token not found

---

### Zerodha Endpoints

#### Zerodha Login

**GET** `/zerodha/login`

Redirects to Zerodha OAuth login page.

**Response:** `302 Redirect` to Zerodha login

---

#### Zerodha Callback

**GET** `/zerodha/callback?request_token=xxx`

Handles OAuth callback from Zerodha.

**Query Parameters:**
- `request_token` (required): OAuth request token

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Zerodha login successful! You can now sync trades.",
  "userId": "XYZ123"
}
```

**Errors:**
- `400 Bad Request` - Missing request_token
- `500 Internal Server Error` - Session generation failed

---

#### Zerodha Sync

**GET** `/zerodha/sync/:userId`

Fetches and normalizes real trade data from Zerodha.

**Parameters:**
- `userId` (path, required): Zerodha user ID

**Response:** `200 OK`
```json
{
  "success": true,
  "userId": "XYZ123",
  "broker": "zerodha-real",
  "tradeCount": 5,
  "trades": [...]
}
```

**Errors:**
- `400 Bad Request` - Invalid userId
- `401 Unauthorized` - No token or token expired (re-login required)

---

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400
  }
}
```

**Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/expired token)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Output

```
 PASS  __tests__/normalizer.test.ts
 PASS  __tests__/tokenService.test.ts

Test Suites: 2 passed, 2 total
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.414 s
```

### Test Coverage

Tests cover:
- ✅ Token storage and retrieval
- ✅ Token deletion
- ✅ Trade normalization
- ✅ Multiple trade normalization
- ✅ BUY/SELL trade handling

### Writing New Tests

Create test files in `__tests__/` directory:

```typescript
import { yourFunction } from "../src/path/to/module";

describe("Your Feature", () => {
  test("should do something", () => {
    const result = yourFunction("input");
    expect(result).toBe("expected");
  });
});
```

---

## 🔧 How It Works

### Complete Workflow

#### 1. User Authentication

```
User → /broker/login → Broker OAuth → Callback → Token Stored
```

**Flow:**
1. User visits `/zerodha/login`
2. Redirected to Zerodha login page
3. User logs in
4. Zerodha redirects to `/zerodha/callback?request_token=xxx`
5. Server exchanges request_token for access_token
6. Token stored in tokenService

#### 2. Trade Synchronization

```
User → /broker/sync/:userId → Token Check → Refresh (if needed) → Fetch → Normalize → Return
```

**Detailed Steps:**

**Step 1: Load Token**
```typescript
const tokenData = tokenService.getToken(userId, broker);
if (!tokenData) throw new AppError("No token found", 401);
```

**Step 2: Check Expiry**
```typescript
const isExpired = adapter.isTokenExpired(tokenData.expiresAt);
```

**Step 3a: Refresh Token (if expired)**
```typescript
if (isExpired && adapter.refreshToken) {
  const newSession = await adapter.refreshToken();
  tokenService.setToken({
    userId: newSession.userId,
    broker,
    accessToken: newSession.accessToken,
    refreshToken: newSession.refreshToken,
    expiresAt: newSession.expiresAt
  });
}
```

**Step 3b: Error if No Refresh**
```typescript
if (isExpired && !adapter.refreshToken) {
  throw new AppError("Token expired. Please re-login.", 401);
}
```

**Step 4: Fetch Trades**
```typescript
const rawTrades = await adapter.fetchTrades();
```

**Step 5: Normalize**
```typescript
const normalizedTrades = normalizeTrades(rawTrades, broker);
```

**Step 6: Return**
```typescript
return normalizedTrades;
```

### Data Normalization

All broker data is converted to this standard format:

```typescript
{
  id: string,           // Unique trade ID
  broker: string,       // Broker name
  symbol: string,       // Stock symbol (e.g., "RELIANCE")
  side: "BUY" | "SELL", // Trade direction
  quantity: number,     // Number of shares
  price: number,        // Execution price
  timestamp: Date       // Trade time
}
```

**Example Conversion:**

**Zerodha Format:**
```json
{
  "trade_id": "T001",
  "tradingsymbol": "RELIANCE",
  "transaction_type": "BUY",
  "quantity": 10,
  "average_price": 2500.5,
  "order_timestamp": "2025-01-10T10:30:00Z"
}
```

**Normalized Format:**
```json
{
  "id": "T001",
  "broker": "zerodha",
  "symbol": "RELIANCE",
  "side": "BUY",
  "quantity": 10,
  "price": 2500.5,
  "timestamp": "2025-01-10T10:30:00.000Z"
}
```

### Token Management

**Storage Format:**
```typescript
{
  userId: "user123",
  broker: "zerodha",
  accessToken: "long_token_string",
  refreshToken: "refresh_token_string" | null,
  expiresAt: "2025-11-17T23:59:59.999Z"
}
```

**Storage Key:**
```
userId:broker → "user123:zerodha"
```

**In-Memory Map:**
```
Map {
  "user123:zerodha" => TokenData,
  "user456:mock" => TokenData
}
```

---

## 🔌 Adding New Brokers

### Step-by-Step Guide

#### 1. Create Adapter

Create `src/adapters/newbroker/newbrokerAdapter.ts`:

```typescript
import type { IBrokerAdapter, BrokerSession } from "../../types";

export class NewBrokerAdapter implements IBrokerAdapter {
  private accessToken?: string;

  constructor(accessToken?: string) {
    this.accessToken = accessToken;
  }

  async fetchTrades(): Promise<any[]> {
    // Call broker API
    const response = await fetch('https://api.newbroker.com/trades', {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    return await response.json();
  }

  async refreshToken(): Promise<BrokerSession> {
    // Implement token refresh
    const response = await fetch('https://api.newbroker.com/refresh', {
      method: 'POST',
      body: JSON.stringify({
        refreshToken: this.refreshToken
      })
    });
    const data = await response.json();
    
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: data.user_id,
      expiresAt: data.expires_at
    };
  }

  isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
  }
}
```

#### 2. Create Normalizer

Add to `src/normalizers/tradeNormalize.ts`:

```typescript
export function normalizeNewBrokerTrade(rawTrade: any, broker: string): Trade {
  return {
    id: rawTrade.tradeId,
    broker,
    symbol: rawTrade.instrumentSymbol,
    side: rawTrade.orderType === 'BUY' ? 'BUY' : 'SELL',
    quantity: rawTrade.qty,
    price: rawTrade.executionPrice,
    timestamp: new Date(rawTrade.tradeTime),
  };
}

// Update getNormalizer()
export function getNormalizer(brokerName: string) {
  switch (brokerName.toLowerCase()) {
    case 'newbroker':
      return normalizeNewBrokerTrade;
    case 'zerodha':
    case 'zerodha-real':
      return normalizeZerodhaTrade;
    case 'mock':
      return normalizeZerodhaTrade;
    default:
      throw new AppError(`No normalizer found for broker: ${brokerName}`, 400);
  }
}
```

#### 3. Register in Sync Service

Update `src/services/syncService.ts`:

```typescript
import { NewBrokerAdapter } from "../adapters/newbroker/newbrokerAdapter";

function getBrokerAdapter(brokerName: string, accessToken?: string): IBrokerAdapter {
  switch (brokerName.toLowerCase()) {
    case "newbroker":
      return new NewBrokerAdapter(accessToken);
    case "zerodha":
    case "zerodha-real":
      return new ZerodhaRealAdapter(accessToken);
    case "mock":
      return new MockBrokerAdapter(accessToken);
    default:
      throw new AppError(`Unsupported broker: ${brokerName}`, 400);
  }
}
```

#### 4. Create Routes

Create `src/routes/newbrokerRoutes.ts`:

```typescript
import { Router, type Request, type Response } from "express";
import { tokenService } from "../services/tokenService";
import { syncTrades } from "../services/syncService";
import { asyncHandler, AppError } from "../middleware/errorHandler";

const router = Router();

router.get("/login", (req: Request, res: Response) => {
  // Implement OAuth or API key login
  const loginUrl = "https://newbroker.com/oauth/login";
  res.redirect(loginUrl);
});

router.get("/callback", asyncHandler(async (req: Request, res: Response) => {
  // Handle OAuth callback
  const code = req.query.code as string;
  // Exchange code for token
  // Save token
  res.json({ success: true });
}));

router.get("/sync/:userId", asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) throw new AppError("userId is required", 400);
  
  const trades = await syncTrades(userId, "newbroker");
  res.json({ success: true, trades });
}));

export default router;
```

#### 5. Register Routes in Server

Update `server.ts`:

```typescript
import newbrokerRoutes from "./src/routes/newbrokerRoutes";

app.use("/newbroker", newbrokerRoutes);
```

#### 6. Test

```bash
curl -X POST http://localhost:3000/newbroker/login
curl http://localhost:3000/newbroker/sync/testuser
```

---

## 🔒 Security

### Implemented Security Measures

#### 1. Helmet.js Security Headers

Automatically added headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security`
- `Content-Security-Policy`

#### 2. CORS Protection

```typescript
cors({
  origin: process.env.ALLOWED_ORIGINS?.split(",") || "*",
  credentials: true
})
```

Only allows requests from specified origins.

#### 3. Rate Limiting

```typescript
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests"
})
```

#### 4. Input Validation

All inputs validated with Zod schemas:
- Type checking
- Length validation
- Format validation
- Required field checks

#### 5. Error Handling

- Never exposes internal errors
- Proper status codes
- Sanitized error messages
- Logged for debugging

### Security Best Practices

✅ Use HTTPS in production  
✅ Set strong CORS policies  
✅ Keep dependencies updated  
✅ Use environment variables  
✅ Never commit `.env` files  
✅ Validate all inputs  
✅ Rate limit APIs  
✅ Use secure headers  

### Security Headers Example

```
Content-Security-Policy: default-src 'self'
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000
Access-Control-Allow-Origin: https://yourdomain.com
RateLimit-Limit: 100
RateLimit-Remaining: 95
```

---

## ⚡ Performance

### Optimizations

1. **Pino Logger**: 5x faster than Winston
2. **In-Memory Storage**: O(1) token lookups
3. **Async/Await**: Non-blocking operations
4. **Type Safety**: Compile-time optimization
5. **Minimal Dependencies**: Faster startup

### Performance Metrics

| Operation | Time |
|-----------|------|
| Token Lookup | < 1ms |
| Normalize Trade | < 1ms |
| API Request | 50-200ms |
| Token Refresh | 100-500ms |

### Scaling Considerations

**Current Design:**
- ✅ Stateless (except token storage)
- ✅ Easy to horizontally scale
- ⚠️ In-memory storage (single instance)

**For Production:**
1. Replace in-memory storage with Redis
2. Add database for persistence
3. Use load balancer
4. Add caching layer
5. Monitor with Prometheus/Grafana

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Server Won't Start

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=4000 npm run dev
```

#### 2. TypeScript Errors

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild TypeScript
npm run build
```

#### 3. Tests Failing

**Error:** Tests timeout or fail

**Solution:**
```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose
```

#### 4. CORS Errors

**Error:** `Access-Control-Allow-Origin` error

**Solution:**
Add your frontend URL to `.env`:
```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### 5. Rate Limit Errors

**Error:** `429 Too Many Requests`

**Solution:**
Wait 15 minutes or adjust rate limit in `server.ts`:
```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200, // Increase from 100
});
```

### Debug Mode

Enable verbose logging:

```env
LOG_LEVEL=debug
```

Or start with debug flag:
```bash
DEBUG=* npm run dev
```

---

## 👥 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style

- Use TypeScript strict mode
- Follow existing patterns
- Add tests for new features
- Update documentation
- Use meaningful commit messages

### Testing Requirements

All new code must include:
- Unit tests
- Integration tests (if applicable)
- All tests must pass

---

## 📄 License

ISC

---

## 🙏 Acknowledgments

- **KiteConnect** - Zerodha API SDK
- **Express** - Web framework
- **TypeScript** - Type safety
- **Pino** - Fast logging
- **Zod** - Schema validation
- **Jest** - Testing framework

---

## 📞 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

---

## 🗺️ Roadmap

### Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] Redis caching for tokens
- [ ] User authentication (JWT)
- [ ] Webhook support
- [ ] WebSocket for real-time updates
- [ ] More broker integrations
- [ ] API documentation (Swagger)
- [ ] Docker support
- [ ] CI/CD pipeline
- [ ] Monitoring dashboard

---

**Built with ❤️ using TypeScript & Express**

**Version:** 1.0.0  
**Last Updated:** November 17, 2025
