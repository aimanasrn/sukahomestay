# Local development

## Local Supabase (recommended for schema/RLS work)

1. Install Docker Desktop and start it.
2. `npm ci` installs Supabase CLI 2.116.0 locally.
3. `npm run supabase:start`; use values printed by `npx supabase status` in both `.env` files.
4. `npm run supabase:reset` applies migrations and `seed.sql`.
5. `npm run supabase:test && npm run supabase:lint`.
6. `npm run dev`; open `http://localhost:5173` and Mailpit at `http://localhost:54324`.

## Hosted development project

Create a separate non-production Supabase project in the closest region, then:

```bash
npx supabase login
npx supabase link --project-ref YOUR_DEV_PROJECT_REF
npm run supabase:push
npx supabase gen types typescript --project-id YOUR_DEV_PROJECT_REF > server/src/types/database.types.ts
```

Use its publishable key in the browser and secret/database credentials only in `server/.env`. Never use the production project for routine development or destructive resets.
