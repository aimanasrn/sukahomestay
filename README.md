# SukaHomestay

Next.js booking platform starter for Full Homestay, Roomstay and Whole House reservations.

## Run locally

1. Copy `.env.example` to `.env.local` and populate only the public Supabase values in browser-visible variables.
2. Install dependencies with `npm install`.
3. Run `npm run dev`.

## Supabase

Apply `supabase/migrations/20260720000000_initial_booking_platform.sql` to a new Supabase project. The local Supabase CLI was unavailable when this scaffold was created, so the migration filename was set manually. Create a private `payment-receipts` Storage bucket and add policies that allow only the booking owner and administrators to access receipt objects.

The schema enables RLS. Never add `SUPABASE_SERVICE_ROLE_KEY` to a `NEXT_PUBLIC_` value.

## Cloudflare

Set the environment variables through the Cloudflare dashboard or Wrangler secrets, then run `npm run preview` or `npm run deploy`. The OpenNext worker config is in `wrangler.jsonc`.

## Production work still requiring connected services

Authentication, persistence, signed receipt uploads, e-mail delivery and the scheduled 30-minute hold-expiry cleanup require a linked Supabase/Cloudflare project and their production secrets. The user interface intentionally shows empty operational states until authorized real data exists.
