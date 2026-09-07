-- Run once in the hosted Supabase SQL editor after migrations.
create extension if not exists pg_cron;
select cron.schedule('suka-expire-holds', '* * * * *', 'select public.expire_booking_holds()');
select cron.schedule('suka-prune-submission-limits', '17 3 * * *', $$delete from private.submission_limits where window_start < now() - interval '2 days'$$);
