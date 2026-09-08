-- Public calendar projection: no identifiers or customer/private fields.
create or replace function public.get_availability(ci date,co date) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if ci is null or co is null or co<=ci or co-ci>366 then raise exception 'INVALID_DATES'; end if;
 return coalesce((select jsonb_agg(jsonb_build_object(
 'resource_id',a.resource_id,'check_in',greatest(a.check_in,ci),'check_out',least(a.check_out,co),
 'state',case when b.status='pending' then 'pending' else 'unavailable' end,
 'expires_at',case when b.status='pending' then b.expires_at else null end))
 from public.booking_allocations a left join public.bookings b on b.id=a.booking_id
 where a.active and a.check_in<co and a.check_out>ci and
 (a.booking_id is null or b.status='confirmed' or (b.status='pending' and b.expires_at>now()))),'[]'::jsonb);
end $$;
revoke all on function public.get_availability(date,date) from public;
grant execute on function public.get_availability(date,date) to anon,authenticated,service_role;

-- Realtime publishes only a singleton revision, never booking records.
create table public.availability_revision(id boolean primary key default true check(id), revision bigint not null default 0);
insert into public.availability_revision values(true,0);
alter table public.availability_revision enable row level security;
revoke all on public.availability_revision from anon,authenticated;
grant select on public.availability_revision to anon,authenticated;
grant all on public.availability_revision to service_role;
create policy public_revision on public.availability_revision for select to anon,authenticated using(true);
create function private.bump_availability_revision() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.availability_revision set revision=revision+1 where id; return null; end $$;
revoke all on function private.bump_availability_revision() from public,anon,authenticated;
create trigger allocations_changed after insert or update or delete on public.booking_allocations for each statement execute function private.bump_availability_revision();
create trigger booking_status_changed after insert or update or delete on public.bookings for each statement execute function private.bump_availability_revision();
do $$ begin
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
  alter publication supabase_realtime add table public.availability_revision;
 end if;
end $$;

-- Server-only offline reservation entry. Uses the same property lock, pricing,
-- allocations, exclusion constraint, payment ledger and confirmation checks.
create function public.admin_create_booking(actor uuid,p jsonb) returns jsonb language plpgsql set search_path='' as $$
declare b public.bookings; q jsonb; s public.property_settings; ids text[]; fingerprint text; hits integer; cap integer; pkg text;
begin
 perform pg_advisory_xact_lock(73421901);
 perform private.expire_holds();
 if actor is null or not exists(select 1 from public.admin_profiles where user_id=actor) then raise exception 'FORBIDDEN'; end if;
 fingerprint=md5(('admin:'||p::text));
 select * into b from public.bookings where idempotency_key=(p->>'idempotency_key')::uuid;
 if found then if b.request_fingerprint<>fingerprint then raise exception 'IDEMPOTENCY_MISMATCH'; end if; return to_jsonb(b)-array['request_fingerprint','notes','policy_snapshot']; end if;
 select * into strict s from public.property_settings where id;
 if coalesce(p->>'status','') not in ('pending','confirmed','cancelled','rejected') then raise exception 'INVALID_STATUS'; end if;
 if coalesce((p->>'accepted')::boolean,false)=false then raise exception 'POLICY_REQUIRED'; end if;
 if length(trim(coalesce(p->>'name','')))<2 or length(p->>'name')>120 or coalesce(p->>'phone','') !~ '^\+?[0-9 ()-]{7,25}$' or coalesce((p->>'adults')::integer,0) not between 1 and 100 or coalesce((p->>'children')::integer,-1) not between 0 and 100 or length(coalesce(p->>'special_requests',''))>2000 or coalesce(p->>'language','') not in ('ms','en') or (coalesce(p->>'email','')<>'' and (p->>'email' !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(p->>'email')>254)) then raise exception 'INVALID_CUSTOMER'; end if;
 q=private.quote_request(p);
 select array_agg(v order by v) into ids from jsonb_array_elements_text(p->'resources') v;
 if q->>'package_id'='WHOLE' then select capacity into cap from public.accommodation_packages where id='WHOLE';
 else select case when count(capacity)=count(*) then sum(capacity) else null end into cap from public.accommodation_packages where id=any(ids); end if;
 -- Admin can record an offline reservation before capacity is configured; known limits still apply.
 if (p->>'adults')::integer+(p->>'children')::integer>cap then raise exception 'CAPACITY_EXCEEDED'; end if;
 insert into public.bookings(idempotency_key,request_fingerprint,check_in,check_out,resources,adults,children,name,phone,email,special_requests,accepted,policy_version,policy_snapshot,language,quote,total_sen,deposit_sen,whatsapp,expires_at)
 values((p->>'idempotency_key')::uuid,fingerprint,(p->>'check_in')::date,(p->>'check_out')::date,ids,(p->>'adults')::integer,(p->>'children')::integer,trim(p->>'name'),p->>'phone',coalesce(p->>'email',''),coalesce(p->>'special_requests',''),true,s.policy_version,s.policies||jsonb_build_object('source','admin'),p->>'language',q,(q->>'total_sen')::integer,(q->>'deposit_sen')::integer,s.whatsapp,now()+make_interval(mins=>s.hold_minutes)) returning * into b;
 insert into public.booking_allocations(resource_id,booking_id,check_in,check_out,kind,active) select unnest(ids),b.id,b.check_in,b.check_out,'booking',p->>'status' in ('pending','confirmed');
 insert into public.booking_price_items(booking_id,label,quantity,unit_sen,total_sen) select b.id,i->>'label',(i->>'quantity')::integer,(i->>'unit_sen')::integer,(i->>'total_sen')::integer from jsonb_array_elements(q->'items') i;

 if coalesce((p->>'paid_sen')::integer,0)<0 or coalesce((p->>'paid_sen')::integer,0)>(q->>'total_sen')::integer then raise exception 'INVALID_PAYMENT'; end if;
 if coalesce((p->>'paid_sen')::integer,0)>0 then
   perform public.admin_action(actor,jsonb_build_object('action','payment','id',b.id,'amount_sen',(p->>'paid_sen')::integer,'reference',p->>'payment_reference','idempotency_key',gen_random_uuid()));
 end if;
 if p->>'status'='confirmed' then perform public.admin_action(actor,jsonb_build_object('action','confirm','id',b.id));
 elsif p->>'status' in ('cancelled','rejected') then perform public.admin_action(actor,jsonb_build_object('action',case when p->>'status'='cancelled' then 'cancel' else 'reject' end,'id',b.id)); end if;
 select * into b from public.bookings where id=b.id;
 return to_jsonb(b)-'request_fingerprint';
end $$;

revoke all on function public.admin_create_booking(uuid,jsonb) from public,anon,authenticated;
grant execute on function public.admin_create_booking(uuid,jsonb) to service_role;

-- Carry forward existing property rates/capacities and the already protected admin role.
-- This block is a no-op for clean installations.
do $$ begin
 if to_regclass('legacy_suka.bookings') is not null and to_regclass('public.units') is not null then
  update public.accommodation_packages a set rate=round(u.base_price*100)::integer,capacity=u.maximum_guests,addon_rate=null
  from public.units u where a.id=case u.name when 'Homestay' then 'MAIN' when 'Roomstay 1' then 'ROOM_A' when 'Roomstay 2' then 'ROOM_B' when 'Roomstay 3' then 'ROOM_C' when 'Whole House' then 'WHOLE' end;
  insert into public.admin_profiles(user_id) select p.id from public.profiles p join auth.users u on u.id=p.id where p.role::text='admin' on conflict do nothing;
 end if;
end $$;
