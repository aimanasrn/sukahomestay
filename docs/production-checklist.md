# Production checklist

- [ ] Hosted production project is active in the intended region; development uses another project.
- [ ] Migrations, generated types, pgTAP, lint, security advisor, and performance advisor pass.
- [ ] RLS is enabled on every public table; anon/customer/admin role queries were rerun.
- [ ] Auth Site URL, email verification, reset redirects, SMTP, and admin profile role are configured.
- [ ] Only publishable values are present in `client/dist`; secret/database values remain in `server/.env` mode 600.
- [ ] Receipt bucket is private; signed URL, cross-customer denial, MIME and size limits are verified.
- [ ] Concurrent whole-property/room reservation tests, expiry/audit, approval, payment verification, and guest lookup rate limiting pass.
- [ ] WhatsApp number and bank/DuitNow settings are verified; no payment gateway is enabled.
- [ ] Nginx, PM2, TLS, Cloudflare Full (strict), logging/alerts, managed backups, Storage recovery, and restore drill are complete.
