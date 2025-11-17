# Broker Sync Backend

A small TypeScript/Express service that fetches trades from brokers, normalizes them to a common shape, and provides simple endpoints for login, sync, and token checks. The code is organized so that new broker adapters can be added without touching the core logic.

## What this is
- Purpose: fetch trade data from brokers (e.g., Zerodha or a mock), normalize it, and return it via HTTP.
- Pattern: adapter + normalizer + service layers.
- Token storage: in-memory (intended for development; use Redis or a DB in production).

## Quick start

Requirements
- Node.js 16+
- npm

Install and run
```bash
git clone https://github.com/Nitindeep65/Journalyst.git
cd Journalyst
npm install
cp .env.example .env
# edit .env if needed
npm run dev
```

By default the server listens on http://localhost:3000.

## Essential configuration (.env)

Set at least:
- PORT (default 3000)
- NODE_ENV (development | production)
- ALLOWED_ORIGINS (comma separated)
- Z_API_KEY and Z_API_SECRET (only if you use Zerodha)

## Important endpoints

Base: http://localhost:3000

- GET `/` — health / basic info
- Mock (use for testing, no API keys needed)
  - POST `/mock/login` — create mock token (body: { "userId": "string" })
  - GET `/mock/sync/:userId` — return normalized mock trades
  - GET `/mock/token-status/:userId` — check mock token expiry
- Zerodha (real broker, requires API keys)
  - GET `/zerodha/login` — redirect to Zerodha OAuth
  - GET `/zerodha/callback?request_token=...` — OAuth callback
  - GET `/zerodha/sync/:userId` — fetch and normalize Zerodha trades

Errors are returned as JSON:
```json
{
  "success": false,
  "error": {
    "message": "description",
    "statusCode": 400
  }
}
```

Normalized trade shape
```json
{
  "id": "string",
  "broker": "string",
  "symbol": "string",
  "side": "BUY" | "SELL",
  "quantity": number,
  "price": number,
  "timestamp": "ISO8601 string"
}
```

## Project layout (high level)

src/
- adapters/       — broker adapters (zerodha, mock)
- normalizers/    — conversion to the normalized trade shape
- services/       — tokenService, syncService
- routes/         — route handlers for each broker
- middleware/     — validation, error handling
- types/          — common TypeScript types
server.ts         — app entry point

Tests live in `__tests__/` (Jest + supertest).

## Tests

Run:
```bash
npm test
npm run test:coverage
```

## Notes / next steps
- Replace in-memory token storage with Redis or a DB for production.
- Add rate limiting and stricter CORS for deployed environments.
- Add integration tests for real broker flows when you have API keys.

## License
ISC
