# Row Level Security

Every application table in `public` has RLS enabled. Explicit grants expose only the required operations:

- Anonymous: published properties, active rooms, public imagery/amenities/pricing, approved reviews.
- Customer: public data plus own profile, bookings, booking items/guests, payment status, notifications, and eligible completed-booking reviews.
- Admin: read policies use `private.is_admin`; mutations still go through the service client/backend.

Customers have column-level update grants only for `profiles.full_name`, `phone`, `avatar_path` and `notifications.read_at`. They have no booking/payment update grant, preventing status, ownership, inventory, price, verification, and internal-note changes. Guest lookup is an Express rate-limited endpoint and returns a minimum projection.

`private.is_admin` is in a non-exposed schema and derives identity from `auth.uid()`. `private.expire_reservations` is revoked from `PUBLIC`, `anon`, and `authenticated`. There are no views. Run role-context pgTAP tests with `npm run supabase:test`.
