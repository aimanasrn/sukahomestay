# SUKA HOMESTAY

A bilingual (Bahasa Melayu / English) React + Vite + TypeScript booking website for **one property with four underlying resources**. Tailwind CSS v4 and shared CSS design tokens provide the visual system. Supabase PostgreSQL, Auth, and an Edge Function provide the production backend.

## Run locally

Requirements: Node.js 22.12+ and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: use `Copy-Item .env.example .env.local` instead of `cp` if preferred.

Open **http://127.0.0.1:5173**. With blank Supabase environment variables, the app runs in an explicitly labelled **browser demo**. Demo requests, payment records, blocks, and configuration stay in browser localStorage. No real booking or payment is sent. Use fictional customer details. The demo dashboard at `/admin` has a clearly labelled entry button; that button is never available when Supabase is configured.

Routes: `/`, `/stay/MAIN`, `/stay/ROOM_A`, `/stay/ROOM_B`, `/stay/ROOM_C`, `/stay/WHOLE`, `/book`, `/admin`.

Use the demo dashboard's **Kosongkan tempahan demo / Clear demo bookings** button to remove fictional bookings, blocks and payment idempotency keys while preserving property settings and language. Design references and the visual verification ledger are in [docs/design/spec.md](docs/design/spec.md).

## What is included

- Responsive customer site, accommodation details and calendars, selectable property diagram, comparison table, facilities, gallery lightbox, configurable location, FAQs and WhatsApp contact.
- Six-stage booking journey with date/guest validation, availability checks, main-home add-ons, customer details, policies, itemized quote, success screen and bilingual WhatsApp/copy fallback.
- BM by default; language preference persists. Dates, selected spaces, customer information and the current step survive language switching. Customer form fields remain in memory, rather than browser storage, until a demo request is submitted.
- Admin authentication and allowlist; booking search/status/date filters, manual payment/refund records, confirmation/rejection/cancellation, internal notes, four-resource calendar, maintenance/owner blocks, bilingual accommodation editing, photo URL management, rates/overrides, fees, deposits, contact and policy settings.
- Database exclusion constraints, transactional resource allocation, hold expiry, idempotency, RLS, CAPTCHA and submission throttling. No public customer listing or public booking-status endpoint.

## Property facts that must be supplied

The main homestay has 4 bedrooms, 3 bathrooms, a living room, dining area and kitchen. Each roomstay has 1 bedroom and 1 bathroom. Whole House includes all four resources: 7 bedrooms and 6 bathrooms.

**Owner-supplied WhatsApp:** 013-949 8048 (`60139498048` for WhatsApp links). Included in the default demo settings; enter this number in the hosted admin settings when configuring production.

**Not supplied and intentionally blank:** verified photos, address/map link, email, all guest capacities, check-in/out times, house rules and booking policies. Roomstay amenities are empty by default; no kitchen or main-home access is assumed. Admin can enter additional facilities as one `BM | EN` pair per line.

**Sample rates only:** Main RM450/night, each roomstay RM150/night, main-home roomstay add-on RM120/night, Whole House RM800/night. Weekend/date rates are initially unset. Cleaning and deposit default to zero (disabled). The 120-minute hold is an editable implementation default, not a published property policy. Live booking requests start disabled. All generated imagery is identified as illustrative, not actual photography. Replace photos using the admin photo URL controls; upload verified images to a CDN or Supabase Storage, then paste their HTTPS URLs. No fake reviews are included.

## Supabase setup

The account's existing `sukahomestay` project was **paused** when inspected. No hosted project was resumed, migrated or changed. The new schema was tested in a separate local PostgreSQL database. Review and back up an existing hosted schema before applying these migrations; they are designed for a clean project/schema and do not convert the previous implementation.

1. Choose a clean development project, or inspect/migrate the existing project deliberately. Authenticate the CLI (`npx supabase login`) and link it (`npx supabase link --project-ref YOUR_PROJECT_REF`). Run `npx supabase <command> --help` for the installed CLI's current options.
2. Apply `supabase/migrations/20260907030502_property_inventory.sql` with `npx supabase db push`. `supabase/seed.sql` does not add fictional customers or property facts.
3. In the Supabase SQL editor run `supabase/schedule-expiry.sql` **once**. It enables pg_cron and schedules hold cleanup every minute and rate-limit housekeeping daily. Check `cron.job` and `cron.job_run_details`. The named jobs can be updated by running the schedule file again. Expired holds are also released synchronously before every booking/admin inventory action, and ignored by public availability immediately after expiry.
4. Create a Cloudflare Turnstile widget for your actual app hostname. Add `VITE_TURNSTILE_SITE_KEY` to the frontend environment. Store its secret only as an Edge Function secret.
5. Set Edge Function secrets `ALLOWED_ORIGIN` (exact app origin, no trailing slash, e.g. `https://stay.example.com`) and `TURNSTILE_SECRET_KEY` using the Supabase dashboard or `npx supabase secrets set`. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are supplied by the Supabase Edge runtime. **Never put a service-role key in a VITE_ variable or commit secrets.**
6. Deploy `booking-api`: `npx supabase functions deploy booking-api`. `verify_jwt = false` is intentional for guest submissions. The handler verifies Turnstile for public submission, validates the exact origin, and validates the JWT plus admin allowlist for every admin action. Privileged SQL functions are executable only by `service_role`.
7. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the project URL and public/publishable key. Restart Vite or rebuild the frontend. Partial configuration fails closed; both values must be supplied together.
8. In Supabase Auth, set the production Site URL and allowed redirects. Disable public signups. Create an admin as below, complete the property settings and capacities, then enable live bookings.

See [Supabase RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) and [Edge Function authentication documentation](https://supabase.com/docs/guides/functions/auth) for the provider's security model.

### Create an admin

Create the admin email/password account from the Supabase dashboard (Authentication → Users). Then, using its actual user UUID, run:

```sql
insert into public.admin_profiles (user_id)
values ('THE_AUTH_USER_UUID');
```

Do not use user-editable metadata to grant access. `/admin` requires a valid Supabase user and a matching `admin_profiles` row. Anonymous and ordinary authenticated users cannot create this row or write bookings/payments/allocations. Only the migration owner/operator provisions admins. Sign out/revoke sessions before removing or deleting an admin account.

### Inventory and pricing rules

`MAIN`, `ROOM_A`, `ROOM_B`, `ROOM_C` are the only resources. Whole House maps to all four. Reservations and maintenance/owner blocks share `booking_allocations`; its partial GiST exclusion constraint rejects overlapping active allocations per resource. Date ranges are **[check-in, check-out)**.

The booking transaction obtains one fixed property lock, expires holds, checks idempotency and inputs/policy/capacity, computes the quote, applies rate limiting, inserts the booking and price items, and allocates every selected resource. An allocation failure rolls back the entire transaction. The property lock serializes low-volume writes and avoids inter-resource deadlocks; the exclusion constraint remains the final protection even outside this operation. Read-only availability does not expose guest names, contact information or booking references.

Pricing uses integer **sen** throughout. First normalize all four selected spaces to **WHOLE**. For each night and priced package/resource, precedence is:

1. Date-specific override (nonoverlapping rules; end date exclusive).
2. Weekend rate, if set (Saturday and Sunday nights).
3. Add-on rate, if this roomstay accompanies MAIN and an add-on rate is set.
4. Base nightly rate.

Add the configured cleaning fee **once per booking**. Round the deposit percentage to the nearest sen. Save line items, totals, policy text/version, contact destination and selected resources in the booking snapshot. Client totals are never accepted by the server. Confirmation requires the configured deposit or the full amount when no deposit is configured. An expired request reactivates its allocations only if the exclusion constraint permits it. Cancelling/rejecting a paid booking does not automatically refund money; record the actual manual refund separately.

### Security and operational limits

- All public-schema tables have RLS. Guest/customer data has no anonymous table grants. Authenticated reads of booking/payment/allocation tables require the non-user-editable admin allowlist.
- Public RPCs expose only sanitized date/resource availability and prices. Create/confirm/payment/block operations require the Edge Function and service-role-only SQL functions. No admin writes can bypass inventory checks through the Data API.
- Public submission verifies Turnstile hostname and enforces at most five successful requests per hashed IP per hour. All writes are atomic. Duplicate submissions reuse a UUID idempotency key; the same key with different data is rejected. Payment records are idempotent separately.
- Error responses map database conflicts to `UNAVAILABLE`; raw constraint details never leave the Edge Function.
- Guest confirmation remains in memory for the current session. There is no public status lookup that could leak bookings. WhatsApp text comes from the saved snapshot. The user explicitly opens WhatsApp; opening it proves neither message delivery nor payment.
- A hosted end-to-end test of Supabase Auth, Edge Function, Turnstile and cron must be performed after configuration. These external services were not activated during this build.

## Verification

```sh
npm run build
npm test
npm run test:db
```

`test:db` requires a local **isolated test** PostgreSQL server and `TEST_DATABASE_URL` (default `postgresql://postgres@127.0.0.1:55432/postgres`). It creates a uniquely named temporary database, installs an Auth/RLS test harness and the real migration, runs 23 scenarios, then drops only that temporary database. The database user needs CREATEDB and role-creation privileges. Never target production.

Verified on PostgreSQL 18 locally: full migration, Whole/component conflicts in both directions, independent MAIN/roomstay coexistence, add-ons, same-day turnover, two concurrent requests, expiration, repeat submission, changed idempotent payload, required payment, expired confirmation conflict, cancellation release, maintenance blocks, date/weekend precedence, frontend/SQL pricing parity, anonymous and non-admin privacy, throttling, scheduled cleanup function. Six Vitest tests cover domain calculations and bilingual saved WhatsApp messages.

The in-app browser was used for desktop/mobile rendering and customer → language switch → add-on → details → request → copy-message → admin → payment → confirmation → filters verification. Browser tests use fictional local demo records only. A reusable Playwright suite is also supplied as `npm run test:e2e` (requires `npx playwright install chromium`); its automated runner is separate from the in-app browser verification.

## Build and deploy the frontend

Local booking testing is authorized at `http://127.0.0.1:5173` in `booking-api`, alongside the production `ALLOWED_ORIGIN`. CORS returns only the matched origin, and Turnstile's verified hostname must match that request origin. Remove the explicit local origin from `allowedOrigins` when local testing is finished. Hosted booking requests were enabled with bilingual general admin-confirmation policies (version 2).

```sh
npm run build
npm run preview
```

Deploy `dist/` on any HTTPS static host. Set the three VITE_ variables **at build time**. Configure SPA fallback to `/index.html` for `/stay/*`, `/book` and `/admin/*`. `_redirects` is supplied for compatible static hosts. Keep the frontend origin identical to the Edge Function's `ALLOWED_ORIGIN`. Do not deploy `.env*`, `.local/` or test database files. After deployment, check the five detail routes directly, a guest booking with CAPTCHA, an authenticated admin payment/confirmation, and a pg_cron expiry.

No deployment, outbound WhatsApp message, or actual payment was performed by this implementation.
