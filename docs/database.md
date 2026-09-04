# Supabase database

The canonical schema is the ordered SQL in `supabase/migrations`. It covers profiles, catalog/inventory, rates, availability blocks, bookings/items/guests, manual payments, reviews, notifications, audit logs, and settings. UUIDs are generated in PostgreSQL and all amounts use integer sen. Identity-card/passport data is not collected.

Apply locally with `npm run supabase:reset`; apply linked migrations with `npm run supabase:push`. Never reset a hosted environment containing data. Generate fresh database types after applying the schema:

```bash
npx supabase gen types typescript --local > server/src/types/database.types.ts
# hosted:
npx supabase gen types typescript --project-id PROJECT_REF > server/src/types/database.types.ts
```

The backend direct/pooler URL is never a browser variable. `postgres.js` uses `prepare: false` for Supavisor transaction-pooler compatibility. Use a direct connection for migrations; use the transaction pooler for a long-running IPv4-only API when appropriate.
