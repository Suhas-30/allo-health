# Allo Inventory — Reservation System

A full-stack inventory and order-fulfillment platform built for multi-warehouse retail and D2C brands. Solves the race condition problem during checkout by implementing a temporary reservation system.

## Live Demo

**https://allo-health-vpgr.vercel.app**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma v7 |
| Distributed Locking | Redis (Upstash) |
| Validation | Zod |
| UI | Tailwind CSS + shadcn/ui |
| Hosting | Vercel |

---

## Architecture

Feature-based modular structure following SOLID principles:

```
Next.js (App Router)
├── app/api/          → REST API Route Handlers
├── src/
│   ├── product/      → Controller, Service, Repository
│   ├── warehouse/    → Controller, Service, Repository
│   └── reservation/  → Controller, Service, Repository
├── components/       → React UI Components
└── lib/              → Prisma + Redis clients
```

Each layer has a single responsibility:
- **Route Handler** — receives HTTP request, calls controller
- **Controller** — validates input, handles response
- **Service** — business logic and concurrency handling
- **Repository** — database queries via Prisma

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/products` | List products with available stock per warehouse |
| GET | `/api/warehouses` | List all warehouses |
| POST | `/api/reservations` | Reserve units — returns 409 if insufficient stock |
| GET | `/api/reservations/:id` | Get reservation by ID |
| POST | `/api/reservations/:id/confirm` | Confirm reservation — returns 410 if expired |
| POST | `/api/reservations/:id/release` | Release reservation early |
| GET | `/api/cron/expire` | Cleanup expired reservations (triggered by cron) |

---

## Data Model

```
Product ----------< Stock >---------- Warehouse
                     |
                Reservation

Stock
├── totalUnits      → physical units in warehouse
├── reservedUnits   → currently held by pending reservations
└── availableUnits  → totalUnits - reservedUnits (computed)

Reservation
├── status    → PENDING | CONFIRMED | RELEASED
└── expiresAt → 10 minutes from creation
```

---

## Concurrency — How Race Conditions Are Prevented

This is the core of the system. When two requests come in simultaneously for the last unit:

```
Request A ──→ Acquire Redis lock ──→ Check stock ──→ Reserve ──→ Release lock → 201
Request B ──→ Lock already held ──→ 409 (conflict)
```

Implementation using Upstash Redis distributed lock:

```typescript
const lock = await redis.set(lockKey, "locked", {
  nx: true,   // only set if key doesn't exist
  ex: 10,     // expire in 10 seconds
})

if (!lock) {
  throw { code: "CONFLICT", message: "Try again in a moment" }
}

try {
  // check stock + create reservation inside lock
} finally {
  await redis.del(lockKey) // always release lock
}
```

The `nx: true` flag ensures only one request can acquire the lock at a time — guaranteeing exactly one winner when multiple requests race for the last unit.

---

## Reservation Expiry

Two mechanisms handle expiry — a daily Vercel cron job that runs at midnight to bulk-release expired reservations, and lazy cleanup on read where `GET /api/reservations/:id` immediately releases an expired reservation when fetched, ensuring users always see accurate status without waiting for the cron.

---

## How to Run Locally

### Prerequisites
- Node.js 18+
- Neon account (free) — neon.tech
- Upstash account (free) — upstash.com

### 1. Clone the repository
```bash
git clone https://github.com/your-username/allo-inventory.git
cd allo-inventory
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root:
```env
DATABASE_URL="your_neon_direct_connection_string"
UPSTASH_REDIS_REST_URL="your_upstash_redis_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_redis_token"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 4. Push schema to database
```bash
npx prisma db push
```

### 5. Generate Prisma client
```bash
npx prisma generate
```

### 6. Seed the database
```bash
npx prisma db seed
```

### 7. Run the development server
```bash
npm run dev
```

Open http://localhost:3000

---

## Deployment

Hosted on Vercel with Neon (PostgreSQL) and Upstash (Redis).

Environment variables required in Vercel dashboard:
```
DATABASE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_BASE_URL
```

Build command: `prisma generate && next build`

---

## Trade-offs and What I'd Do Differently

**Trade-offs made:**

- **Prisma v7 + Neon adapter** — requires explicit adapter config in `prisma.config.ts` instead of `schema.prisma`, adding setup complexity but correct for serverless.
- **Daily cron instead of per-minute** — Vercel free tier limitation; compensated with lazy cleanup on read so stock is returned immediately when reservation is fetched.
- **`prisma db push` instead of migrations** — port 5432 was blocked locally so used `db push`; proper migrations would be preferred in production for schema version control.
- **Quantity fixed at 1** — frontend reserves 1 unit at a time for simplicity; backend supports any quantity and can be extended easily.


