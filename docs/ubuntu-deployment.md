# Ubuntu deployment (managed Supabase)

Use Ubuntu 24.04 for Nginx/PM2/Express only. Do not install PostgreSQL or expose port 5432.

1. Create a hardened `deploy` account with SSH keys; disable password/root login. Allow only OpenSSH and Nginx Full in UFW.
2. Create a Supabase project in the closest region (typically Singapore for Malaysia). In Dashboard obtain project URL, publishable key, backend secret key, and a direct/pooler database URL. Store database passwords only in the backend environment.
3. Configure Auth Site URL/allowed redirects for `https://YOUR_DOMAIN/account` and `/reset-password`, email confirmations, production SMTP, and custom email templates.
4. Review and apply migrations from a trusted operator/CI machine: `npx supabase link --project-ref REF`, `npm run supabase:push`, generate types, run database tests on a branch/dev project, then run security/performance advisors.
5. Confirm four buckets and policies exist. Upload catalog images; keep receipts private.
6. Install Node 20+, Nginx, Git, Certbot, and PM2. Clone to `/var/www/suka-homestay`, run `npm ci`, copy both `.env.example` files, populate values, and `chmod 600 server/.env`.
7. `npm run typecheck && npm test && npm run build`; scan `client/dist` for secret/service-role strings.
8. `pm2 start ecosystem.config.cjs --env production && pm2 save && pm2 startup`. The API needs outbound HTTPS to Supabase and database connectivity to the chosen direct/pooler host.
9. Install `nginx/suka-homestay.conf`, update `server_name`, run `nginx -t`, enable the site, and proxy `/api` to `127.0.0.1:4000`.
10. Create proxied Cloudflare DNS records, issue Certbot TLS, then use Cloudflare Full (strict). Test renewals.
11. Enable Supabase managed backups/PITR as required and complete the restore drill in `backup-recovery.md`.

Deploy updates with a reviewed release, `npm ci`, validation/build, migration push from controlled CI, then `pm2 reload ecosystem.config.cjs --env production`. Keep the prior application build for rollback and use forward-fix SQL migrations.

Troubleshooting: for 502 inspect PM2 and Nginx; for 401 inspect Bearer tokens/Auth redirect configuration; for database errors verify SSL/pooler credentials and project state; for missing images inspect bucket paths/policies; for payments inspect manual-payment and audit rows.
