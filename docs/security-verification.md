# Security verification record

Recorded 2026-09-04 against repository migration `20260904025147_initial_supabase_schema.sql`.

| Check | Result | Evidence |
|---|---|---|
| RLS on every exposed application table | PASS (static) | Migration enables RLS for all 20 `public` tables; pgTAP asserts the catalog count. |
| Broken object ownership | PASS (static) | Customer policies join through `customer_id`; booking/payment writes have no customer grants. |
| Update ownership validation | PASS | Profile and notification policies contain both `USING` and `WITH CHECK`; column grants limit mutable fields. |
| Views bypassing RLS | PASS | No application views are created. |
| Privileged functions publicly executable | PASS | `private.expire_reservations` and trigger functions are revoked from public API roles. |
| Receipt privacy | PASS (static) | Bucket is private; object policies bind the first path segment to the owning booking. |
| Frontend service secret | PASS | Production bundle scan found no application secret/service-role environment identifiers. |
| Application tests | PASS | 24 Vitest tests and 6 Playwright tests, including approval and manual-payment confirmation. |
| Production build | PASS | Server TypeScript and client Vite production builds completed. |
| Database role-context tests/lint | BLOCKED LOCALLY | CLI 2.116.0 is installed, but Docker/Podman is absent; `supabase test db` and `supabase db lint` cannot connect to port 54322. Tests are checked in under `supabase/tests/database`. |
| Hosted advisors | NOT APPLICABLE TO NEW MIGRATION | Connected `sukahomestay` project is inactive and the migration was not applied. Advisor API returned no existing lints, but that does not validate this unapplied schema. |

Before production, start local Docker or use a separate hosted development project, apply the migration, run `npm run supabase:test`, `npm run supabase:lint`, regenerate types, run both advisors, and repeat anon/customer/admin queries. Do not treat this static review as a substitute for those live checks.
