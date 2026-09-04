# Architecture

React talks directly to Supabase only for email/password Auth, session restoration, public catalog reads, ownership-protected customer reads, and RLS-restricted uploads. Every request to Express sends the Supabase access token as `Authorization: Bearer …`.

Express validates that token with `auth.getUser(token)`, then loads the role from `public.profiles`; it never accepts a frontend user ID or role. Critical booking/admin operations use the backend-only `SUPABASE_DATABASE_URL`. Elevated Storage access uses `SUPABASE_SECRET_KEY` only after the admin middleware succeeds.

Reservation creation is one PostgreSQL transaction: acquire `pg_advisory_xact_lock(hashtextextended(property_id,0))`, resolve price, recheck property/room overlaps and blocks, insert booking/item/guest/audit rows, commit, then create the WhatsApp URL. Stale pending holds are ignored by the overlap query even before the scheduler changes their status.

The five-minute Express job invokes non-exposed `private.expire_reservations`; the function updates only overdue `PENDING_APPROVAL`/`AWAITING_PAYMENT` records and writes audit rows atomically. It is idempotent and safe with multiple PM2 workers, although one worker is preferable at scale.
