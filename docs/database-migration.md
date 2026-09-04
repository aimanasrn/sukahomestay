# Existing data migration

The removed Prisma model maps to the new snake_case Supabase schema, but existing production data must be migrated—not discarded.

1. Take and restore-test a source database backup; freeze writes or establish a maintenance window.
2. Create Supabase Auth users through the Admin API using verified email migration procedures. Record old-user → `auth.users.id` mappings; passwords cannot be copied from the custom hash table.
3. Transform catalog/rates/bookings/items/guests/payments/audits into staging tables, converting camelCase names and preserving UUIDs/references/timestamps/sen values. Do not copy password/session/reset-token tables or identity numbers.
4. Validate row counts, foreign keys, money totals, statuses, overlaps, and sampled bookings before inserting production tables.
5. Apply migrations, import in FK order, create profiles with mapped Auth IDs, run pgTAP/RLS/advisors, then cut over API environment variables.
6. Retain the encrypted legacy backup under the retention policy. Roll back application traffic—not schema history—if reconciliation fails; fix forward with a new migration.
