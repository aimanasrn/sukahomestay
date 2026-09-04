# Authentication

Supabase Auth owns passwords, email verification, recovery links, refresh tokens, and browser session persistence. No application password/session table exists.

Configure Email Auth in the Dashboard, enable email confirmations, set the Site URL, and allow exact local/production `/account` and `/reset-password` redirects. Configure production SMTP because the default mail service is rate-limited.

The `on_auth_user_created` trigger inserts `public.profiles`. It copies only `full_name` and `phone`; role is always `CUSTOMER`, so editable user metadata cannot create an admin. Promote an administrator only with a trusted SQL/admin process:

```sql
update public.profiles set role = 'ADMIN' where id = '<auth-user-uuid>';
```

Protected React routes improve UX but are not authorization boundaries. RLS protects direct reads and Express verifies `profiles.role` before privileged work.
