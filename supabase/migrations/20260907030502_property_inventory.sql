-- Four physical resources. WHOLE is a package, never an independent resource.
create extension if not exists btree_gist;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.accommodation_resources (
 id text primary key check(id in ('MAIN','ROOM_A','ROOM_B','ROOM_C')),
 bedrooms smallint not null check(bedrooms>0), bathrooms smallint not null check(bathrooms>0)
);
create table public.accommodation_packages (
 id text primary key, capacity integer check(capacity>0), rate integer not null check(rate>=0),
 weekend_rate integer check(weekend_rate>=0), addon_rate integer check(addon_rate>=0), amenities text[] not null default '{}'
);
create table public.package_resources (
 package_id text references public.accommodation_packages on delete cascade,
 resource_id text references public.accommodation_resources, primary key(package_id,resource_id)
);
create table public.property_settings (
 id boolean primary key default true check(id), whatsapp text not null default '', address text not null default '',
 map_url text not null default '', contact_email text not null default '', check_in text not null default '', check_out text not null default '',
 policies jsonb not null default '{"ms":"","en":""}', rules jsonb not null default '{"ms":"","en":""}',
 cleaning_fee integer not null default 0 check(cleaning_fee>=0), deposit_percent integer not null default 0 check(deposit_percent between 0 and 100),
 hold_minutes integer not null default 120 check(hold_minutes between 5 and 10080),
 booking_enabled boolean not null default false, demo_rates boolean not null default true, policy_version text not null default '1'
);
create table public.accommodation_translations (
 package_id text references public.accommodation_packages on delete cascade, language text check(language in ('ms','en')),
 description text not null default '', primary key(package_id,language)
);
create table public.accommodation_photos (
 id uuid primary key default gen_random_uuid(), package_id text not null references public.accommodation_packages on delete cascade,
 url text not null check(url ~ '^https://'), sort_order integer not null default 0, is_placeholder boolean not null default true
);
create table public.rate_rules (
 id uuid primary key default gen_random_uuid(), package_id text not null references public.accommodation_packages,
 start_date date not null, end_date date not null check(end_date>start_date), nightly_sen integer not null check(nightly_sen>=0),
 exclude using gist(package_id with =, daterange(start_date,end_date,'[)') with &&)
);
create table public.admin_profiles ( user_id uuid primary key references auth.users on delete cascade );
create table public.bookings (
 id uuid primary key default gen_random_uuid(), reference text unique not null default ('SK-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,12))),
 idempotency_key uuid unique not null, request_fingerprint text not null,
 check_in date not null, check_out date not null check(check_out>check_in and check_out<=check_in+60),
 resources text[] not null, adults integer not null check(adults between 1 and 100), children integer not null default 0 check(children between 0 and 100),
 name text not null check(length(name) between 2 and 120), phone text not null check(phone ~ '^\+?[0-9 ()-]{7,25}$'),
 email text not null default '' check(length(email)<=254), special_requests text not null default '' check(length(special_requests)<=2000),
 accepted boolean not null check(accepted), policy_version text not null, policy_snapshot jsonb not null,
 language text not null check(language in ('ms','en')),
 status text not null default 'pending' check(status in ('pending','confirmed','cancelled','rejected','expired')),
 payment_status text not null default 'unpaid' check(payment_status in ('unpaid','partially_paid','paid','refunded')),
 quote jsonb not null, total_sen integer not null check(total_sen>=0), deposit_sen integer not null check(deposit_sen>=0),
 paid_sen integer not null default 0 check(paid_sen>=0), notes text not null default '', whatsapp text not null,
 created_at timestamptz not null default now(), expires_at timestamptz not null
);
create index bookings_status_dates on public.bookings(status,check_in,check_out);
create index bookings_expiry on public.bookings(expires_at) where status='pending';
create table public.booking_allocations (
 id uuid primary key default gen_random_uuid(), resource_id text not null references public.accommodation_resources,
 booking_id uuid references public.bookings on delete cascade, check_in date not null, check_out date not null check(check_out>check_in),
 kind text not null check(kind in ('booking','maintenance','owner')), label text not null default '', active boolean not null default true,
 check((kind='booking' and booking_id is not null) or (kind<>'booking' and booking_id is null)),
 exclude using gist(resource_id with =, daterange(check_in,check_out,'[)') with &&) where (active)
);
create index allocations_booking on public.booking_allocations(booking_id);
create table public.booking_price_items (
 id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings on delete cascade,
 label text not null, quantity integer not null check(quantity>0), unit_sen integer not null check(unit_sen>=0), total_sen integer not null check(total_sen>=0)
);
create index price_items_booking on public.booking_price_items(booking_id);
create table public.payments (
 id uuid primary key default gen_random_uuid(), booking_id uuid not null references public.bookings,
 amount_sen integer not null check(amount_sen>0), kind text not null check(kind in ('payment','refund')),
 reference text not null, idempotency_key uuid unique not null, recorded_by uuid not null references auth.users, created_at timestamptz not null default now()
);
create index payments_booking on public.payments(booking_id);
create table private.submission_limits ( ip_hash text primary key, window_start timestamptz not null, hits integer not null );

-- Minimal public content reads; private guest records are never public.
create function private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from public.admin_profiles where user_id=auth.uid());
$$;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;
do $$ declare t text; begin
 foreach t in array array['accommodation_resources','accommodation_packages','package_resources','property_settings','accommodation_translations','accommodation_photos','rate_rules','admin_profiles','bookings','booking_allocations','booking_price_items','payments'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('revoke all on public.%I from anon, authenticated',t);
 execute format('grant all on public.%I to service_role',t);
 execute format('grant select on public.%I to authenticated',t);
 execute format('create policy admin_read on public.%I for select to authenticated using ((select private.is_admin()))',t);
 end loop;
 foreach t in array array['accommodation_resources','accommodation_packages','package_resources','property_settings','accommodation_translations','accommodation_photos','rate_rules'] loop
 execute format('grant select on public.%I to anon, authenticated',t);
 execute format('create policy public_content on public.%I for select to anon, authenticated using (true)',t);
 end loop;
 -- Inventory relationships are immutable from the app; admins edit descriptive/rate content only.
 foreach t in array array['accommodation_packages','property_settings','accommodation_translations','accommodation_photos','rate_rules'] loop
 execute format('grant insert,update,delete on public.%I to authenticated',t);
 execute format('create policy admin_write on public.%I for all to authenticated using ((select private.is_admin())) with check ((select private.is_admin()))',t);
 end loop;
end $$;

create function private.expire_holds() returns integer language plpgsql set search_path='' as $$
declare n integer; begin
 -- Same lock order for all writers and cleanup, including scheduled cleanup.
 perform pg_advisory_xact_lock(73421901);
 with expired as (update public.bookings set status='expired' where status='pending' and expires_at<=now() returning id)
 update public.booking_allocations set active=false where booking_id in (select id from expired);
 get diagnostics n=row_count; return n;
end $$;

create function private.quote_request(p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare ci date; co date; ids text[]; pid text; targets text[]; a public.accommodation_packages; s public.property_settings;
 d date; price integer; items jsonb='[]'; total integer=0; beds integer=0; baths integer=0; count_ids integer; cap integer;
begin
 ci=(p->>'check_in')::date; co=(p->>'check_out')::date;
 if ci is null or co is null or ci<(now() at time zone 'Asia/Kuala_Lumpur')::date or co<=ci or co-ci>60 then raise exception 'INVALID_DATES'; end if;
 select array_agg(distinct v order by v),count(*) into ids,count_ids from jsonb_array_elements_text(p->'resources') v;
 if ids is null or cardinality(ids)<>count_ids or not (ids <@ array['MAIN','ROOM_A','ROOM_B','ROOM_C']) or (not ('MAIN'=any(ids)) and cardinality(ids)<>1) then raise exception 'INVALID_RESOURCES'; end if;
 select * into s from public.property_settings where id;
 pid=case when cardinality(ids)=4 then 'WHOLE' when 'MAIN'=any(ids) then 'MAIN' else ids[1] end;
 targets=case when pid='WHOLE' then array['WHOLE'] else ids end;
 foreach pid in array targets loop
 select * into strict a from public.accommodation_packages where id=pid;
 for d in select generate_series(ci,co-1,interval '1 day')::date loop
 select nightly_sen into price from public.rate_rules where package_id=pid and start_date<=d and end_date>d;
 price=coalesce(price,case when extract(dow from d) in (0,6) then a.weekend_rate end,case when pid<>'MAIN' and pid<>'WHOLE' and 'MAIN'=any(ids) then a.addon_rate end,a.rate);
 total=total+price; items=items||jsonb_build_object('label',pid||'|'||d,'quantity',1,'unit_sen',price,'total_sen',price);
 end loop;
 end loop;
 if s.cleaning_fee>0 then total=total+s.cleaning_fee; items=items||jsonb_build_object('label','cleaning','quantity',1,'unit_sen',s.cleaning_fee,'total_sen',s.cleaning_fee); end if;
 select sum(bedrooms),sum(bathrooms) into beds,baths from public.accommodation_resources where id=any(ids);
 pid=case when cardinality(ids)=4 then 'WHOLE' when 'MAIN'=any(ids) then 'MAIN' else ids[1] end;
 return jsonb_build_object('items',items,'total_sen',total,'deposit_sen',round(total*s.deposit_percent/100.0),'nights',co-ci,'bedrooms',beds,'bathrooms',baths,'package_id',pid);
end $$;

create function public.get_quote(p jsonb) returns jsonb language sql security definer set search_path='' as $$ select private.quote_request(p); $$;
revoke all on function public.get_quote(jsonb) from public;
grant execute on function public.get_quote(jsonb) to anon,authenticated,service_role;
create function public.get_availability(ci date,co date) returns jsonb language plpgsql security definer set search_path='' as $$
begin
 if ci is null or co is null or co<=ci or co-ci>366 then raise exception 'INVALID_DATES'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object('resource_id',a.resource_id,'check_in',a.check_in,'check_out',a.check_out)) from public.booking_allocations a left join public.bookings b on b.id=a.booking_id where a.active and a.check_in<co and a.check_out>ci and (a.booking_id is null or b.status='confirmed' or (b.status='pending' and b.expires_at>now()))),'[]'::jsonb);
end $$;
revoke all on function public.get_availability(date,date) from public;
grant execute on function public.get_availability(date,date) to anon,authenticated,service_role;

create function public.create_booking(p jsonb, ip_hash text) returns jsonb language plpgsql set search_path='' as $$
declare b public.bookings; q jsonb; s public.property_settings; ids text[]; fingerprint text; hits integer; cap integer; pkg text;
begin
 perform pg_advisory_xact_lock(73421901);
 perform private.expire_holds();
 fingerprint=md5((p-'idempotency_key'-'turnstile_token')::text);
 select * into b from public.bookings where idempotency_key=(p->>'idempotency_key')::uuid;
 if found then if b.request_fingerprint<>fingerprint then raise exception 'IDEMPOTENCY_MISMATCH'; end if; return to_jsonb(b)-array['request_fingerprint','notes','policy_snapshot']; end if;
 select * into strict s from public.property_settings where id;
 if not s.booking_enabled or s.whatsapp !~ '^[0-9]{8,15}$' or length(s.policies->>'ms')<10 or length(s.policies->>'en')<10 then raise exception 'BOOKING_NOT_CONFIGURED'; end if;
 if coalesce(p->>'policy_version','')<>s.policy_version or coalesce((p->>'accepted')::boolean,false)=false then raise exception 'POLICY_REQUIRED'; end if;
 if length(trim(coalesce(p->>'name','')))<2 or length(p->>'name')>120 or coalesce(p->>'phone','') !~ '^\+?[0-9 ()-]{7,25}$' or coalesce((p->>'adults')::integer,0) not between 1 and 100 or coalesce((p->>'children')::integer,-1) not between 0 and 100 or length(coalesce(p->>'special_requests',''))>2000 or coalesce(p->>'language','') not in ('ms','en') or (coalesce(p->>'email','')<>'' and (p->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(p->>'email')>254)) then raise exception 'INVALID_CUSTOMER'; end if;
 q=private.quote_request(p);
 select array_agg(v order by v) into ids from jsonb_array_elements_text(p->'resources') v;
 if q->>'package_id'='WHOLE' then select capacity into cap from public.accommodation_packages where id='WHOLE';
 else select case when count(capacity)=count(*) then sum(capacity) else null end into cap from public.accommodation_packages where id=any(ids); end if;
 if cap is null then raise exception 'CAPACITY_NOT_CONFIGURED'; end if;
 if (p->>'adults')::integer+(p->>'children')::integer>cap then raise exception 'CAPACITY_EXCEEDED'; end if;
 insert into private.submission_limits values(ip_hash,now(),1) on conflict on constraint submission_limits_pkey do update set hits=case when submission_limits.window_start<now()-interval '1 hour' then 1 else submission_limits.hits+1 end,window_start=case when submission_limits.window_start<now()-interval '1 hour' then now() else submission_limits.window_start end returning submission_limits.hits into hits;
 if hits>5 then raise exception 'RATE_LIMITED'; end if;
 insert into public.bookings(idempotency_key,request_fingerprint,check_in,check_out,resources,adults,children,name,phone,email,special_requests,accepted,policy_version,policy_snapshot,language,quote,total_sen,deposit_sen,whatsapp,expires_at)
 values((p->>'idempotency_key')::uuid,fingerprint,(p->>'check_in')::date,(p->>'check_out')::date,ids,(p->>'adults')::integer,(p->>'children')::integer,trim(p->>'name'),p->>'phone',coalesce(p->>'email',''),coalesce(p->>'special_requests',''),true,s.policy_version,s.policies,p->>'language',q,(q->>'total_sen')::integer,(q->>'deposit_sen')::integer,s.whatsapp,now()+make_interval(mins=>s.hold_minutes)) returning * into b;
 insert into public.booking_allocations(resource_id,booking_id,check_in,check_out,kind) select unnest(ids),b.id,b.check_in,b.check_out,'booking';
 insert into public.booking_price_items(booking_id,label,quantity,unit_sen,total_sen) select b.id,i->>'label',(i->>'quantity')::integer,(i->>'unit_sen')::integer,(i->>'total_sen')::integer from jsonb_array_elements(q->'items') i;
 return to_jsonb(b)-array['request_fingerprint','notes','policy_snapshot'];
end $$;
revoke all on function public.create_booking(jsonb,text) from public,anon,authenticated;
grant execute on function public.create_booking(jsonb,text) to service_role;

create function public.admin_action(actor uuid,p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare b public.bookings; action text=p->>'action'; amount integer; paid integer; previous public.payments;
begin
 if actor is null or not exists(select 1 from public.admin_profiles where user_id=actor) then raise exception 'FORBIDDEN'; end if;
 perform pg_advisory_xact_lock(73421901); perform private.expire_holds();
 if action='block' then
 if (p->>'check_in')::date<(now() at time zone 'Asia/Kuala_Lumpur')::date or p->>'kind' not in ('maintenance','owner') or length(p->>'label')>200 then raise exception 'INVALID_BLOCK'; end if;
 insert into public.booking_allocations(resource_id,check_in,check_out,kind,label) values(p->>'resource_id',(p->>'check_in')::date,(p->>'check_out')::date,p->>'kind',coalesce(p->>'label','')); return '{"ok":true}';
 elsif action='unblock' then update public.booking_allocations set active=false where id=(p->>'id')::uuid and kind<>'booking'; return '{"ok":true}'; end if;
 select * into strict b from public.bookings where id=(p->>'id')::uuid for update;
 if action='confirm' then
 if b.status not in ('pending','expired','confirmed') or b.check_in<(now() at time zone 'Asia/Kuala_Lumpur')::date then raise exception 'INVALID_STATUS'; end if;
 if b.paid_sen<(case when b.deposit_sen>0 then b.deposit_sen else b.total_sen end) then raise exception 'PAYMENT_REQUIRED'; end if;
 -- Reactivating an expired allocation rechecks the PostgreSQL exclusion constraint.
 update public.booking_allocations set active=true where booking_id=b.id;
 update public.bookings set status='confirmed' where id=b.id;
 elsif action in ('cancel','reject') then
 if b.status not in ('pending','expired','confirmed') then raise exception 'INVALID_STATUS'; end if;
 update public.bookings set status=case when action='cancel' then 'cancelled' else 'rejected' end where id=b.id;
 update public.booking_allocations set active=false where booking_id=b.id;
 elsif action='notes' then
 if length(coalesce(p->>'notes',''))>5000 then raise exception 'INVALID_INPUT'; end if;
 update public.bookings set notes=coalesce(p->>'notes','') where id=b.id;
 elsif action in ('payment','refund') then
 amount=(p->>'amount_sen')::integer;
 select * into previous from public.payments where idempotency_key=(p->>'idempotency_key')::uuid;
 if found then if previous.booking_id<>b.id or previous.amount_sen<>amount or previous.kind<>action then raise exception 'IDEMPOTENCY_MISMATCH'; end if; return to_jsonb(b); end if;
 if amount is null or amount<=0 or length(trim(coalesce(p->>'reference','')))<1 then raise exception 'INVALID_PAYMENT'; end if;
 if action='payment' and b.status not in ('pending','expired','confirmed') then raise exception 'INVALID_STATUS'; end if;
 paid=b.paid_sen+case when action='refund' then -amount else amount end;
 if paid<0 or paid>b.total_sen then raise exception 'INVALID_PAYMENT'; end if;
 insert into public.payments(booking_id,amount_sen,kind,reference,idempotency_key,recorded_by) values(b.id,amount,action,p->>'reference',(p->>'idempotency_key')::uuid,actor);
 update public.bookings set paid_sen=paid,payment_status=case when paid=0 and action='refund' then 'refunded' when paid=0 then 'unpaid' when paid>=total_sen then 'paid' else 'partially_paid' end where id=b.id;
 else raise exception 'INVALID_ACTION'; end if;
 select * into b from public.bookings where id=b.id; return to_jsonb(b)-'request_fingerprint';
end $$;
revoke all on function public.admin_action(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.admin_action(uuid,jsonb) to service_role;
grant usage on schema private to service_role;
grant all on private.submission_limits to service_role;
revoke all on all functions in schema private from public,anon;
grant execute on all functions in schema private to service_role;

-- A dedicated scheduler calls the exact same expiry operation used by reservations.
create function public.expire_booking_holds() returns integer language sql set search_path='' as $$ select private.expire_holds(); $$;
revoke all on function public.expire_booking_holds() from public,anon,authenticated;
grant execute on function public.expire_booking_holds() to service_role;

-- Fixed inventory + deliberately incomplete property configuration. No fabricated facts.
insert into public.accommodation_resources values ('MAIN',4,3),('ROOM_A',1,1),('ROOM_B',1,1),('ROOM_C',1,1);
insert into public.accommodation_packages(id,rate,addon_rate,amenities) values
 ('MAIN',45000,null,array['living','dining','kitchen']),('ROOM_A',15000,12000,'{}'),('ROOM_B',15000,12000,'{}'),('ROOM_C',15000,12000,'{}'),('WHOLE',80000,null,array['living','dining','kitchen']);
insert into public.package_resources values ('MAIN','MAIN'),('ROOM_A','ROOM_A'),('ROOM_B','ROOM_B'),('ROOM_C','ROOM_C'),('WHOLE','MAIN'),('WHOLE','ROOM_A'),('WHOLE','ROOM_B'),('WHOLE','ROOM_C');
insert into public.property_settings(id) values(true);
insert into public.accommodation_translations(package_id,language,description) select id,language,'' from public.accommodation_packages cross join (values('ms'),('en')) l(language);
