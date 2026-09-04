# Backup and recovery

Use Supabase-managed backups/PITR appropriate to the plan. Confirm the project backup schedule and retention in Dashboard before launch. For an additional logical export, use a protected operator machine/CI secret and the CLI `db dump` command shown by `npx supabase db dump --help`; never store database credentials or dumps in the repository or frontend server.

Quarterly, restore to an isolated development project, apply any later migrations, run pgTAP and application smoke tests, reconcile table counts/booking totals, and record recovery time and recovery point. Storage objects require a separate tested export/replication process because database backups do not substitute for object recovery.
