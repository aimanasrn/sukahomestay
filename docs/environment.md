# Environment variables

Frontend (publicly bundled): `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_API_URL`.

Backend only: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_DATABASE_URL`, `ADMIN_WHATSAPP_NUMBER`, `CLIENT_URL`, `PORT`, `PENDING_APPROVAL_EXPIRY_HOURS`, `AWAITING_PAYMENT_EXPIRY_HOURS`, and optional SMTP values.

Current `sb_publishable_…` and `sb_secret_…` keys are preferred. Legacy equivalents are the anon key for `SUPABASE_PUBLISHABLE_KEY` and service-role key for `SUPABASE_SECRET_KEY`. Never prefix a secret with `VITE_`, commit real credentials, or put the database password in `client/.env`. On Ubuntu keep `server/.env` mode `600`.
