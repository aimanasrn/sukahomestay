# SUKA HOMESTAY

Production-oriented homestay reservations using React/Vite, Express, and managed Supabase Database, Auth, and Storage. The manual reservation → WhatsApp → admin approval → bank transfer → manual payment verification flow is preserved; there is no automatic payment gateway.

## Architecture

- `client/`: React, TypeScript, Tailwind, shadcn-style components, TanStack Query, Supabase browser client.
- `server/`: Express/Zod, verified Supabase Bearer tokens, elevated server client, and parameterized PostgreSQL transactions.
- `supabase/`: CLI config, SQL migrations, seed, and pgTAP RLS/storage tests.
- `nginx/` and `ecosystem.config.cjs`: Ubuntu web/API process configuration.

The browser uses only a publishable key. It handles Auth, RLS-protected reads, and restricted Storage uploads. Booking and all administrative mutations go through Express. Money is integer sen. Reservation creation commits under a transaction-scoped property advisory lock before the WhatsApp URL is returned.

## Start locally

Requires Node 20+, npm 10+, Docker Desktop, and the checked-in Supabase CLI 2.116.0.

```bash
npm ci
npm run supabase:start
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

Copy local URL/keys/database URL from `npx supabase status`. On Windows use `Copy-Item`. See [local development](docs/local-development.md).

## Verify

```bash
npm run typecheck
npm test
npm run build
npm run supabase:test
npm run supabase:lint
npm run test:e2e --workspace client
```

Database tests require the local Supabase stack. Realtime is intentionally not enabled for application tables yet; polling/query invalidation remains the reliable path and avoids adding publication surface before production load warrants it.

Documentation: [architecture](docs/architecture.md), [authentication](docs/authentication.md), [database](docs/database.md), [RLS](docs/rls.md), [storage](docs/storage.md), [migration](docs/database-migration.md), [backup/recovery](docs/backup-recovery.md), [environment](docs/environment.md), and [Ubuntu deployment](docs/ubuntu-deployment.md).
