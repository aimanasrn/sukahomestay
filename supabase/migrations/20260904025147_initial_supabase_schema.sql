-- SUKA HOMESTAY: Supabase PostgreSQL schema, RLS, Storage, and secure helpers.
-- Money is stored as integer sen. All public tables have RLS enabled below.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.user_role as enum ('CUSTOMER', 'ADMIN');
create type public.property_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');
create type public.booking_status as enum (
  'PENDING_APPROVAL', 'AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED',
  'CHECKED_IN', 'COMPLETED', 'REJECTED', 'CANCELLED', 'EXPIRED'
);
create type public.inventory_type as enum ('ENTIRE_PROPERTY', 'ROOM');
create type public.block_type as enum ('OWNER_BLOCK', 'MAINTENANCE');
create type public.payment_verification_status as enum (
  'NOT_SUBMITTED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED'
);
create type public.refund_status as enum ('PENDING', 'SUCCEEDED', 'FAILED');
create type public.notification_type as enum (
  'BOOKING_CREATED', 'PAYMENT_RECEIVED', 'BOOKING_CONFIRMED', 'PAYMENT_FAILED',
  'BOOKING_CANCELLED', 'CHECKIN_REMINDER', 'CHECKOUT_REMINDER', 'REFUND_PROCESSED'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  phone text,
  role public.user_role not null default 'CUSTOMER',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.properties (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text not null,
  address text not null,
  city text not null,
  state text not null,
  latitude numeric(9,6),
  longitude numeric(9,6),
  check_in_time time not null default '15:00',
  check_out_time time not null default '11:00',
  max_guests integer not null check (max_guests > 0),
  bedrooms integer not null check (bedrooms >= 0),
  bathrooms integer not null check (bathrooms >= 0),
  base_price_sen integer not null check (base_price_sen >= 0),
  cleaning_fee_sen integer not null default 0 check (cleaning_fee_sen >= 0),
  security_deposit_sen integer not null default 0 check (security_deposit_sen >= 0),
  house_rules text not null,
  cancellation_policy text not null,
  status public.property_status not null default 'DRAFT',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  room_type text not null,
  capacity integer not null check (capacity > 0),
  bed_config text not null,
  price_sen integer not null check (price_sen >= 0),
  available_units integer not null default 1 check (available_units > 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.room_images (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  storage_path text not null,
  alt text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.amenities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  icon text
);

create table public.property_amenities (
  property_id uuid not null references public.properties(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (property_id, amenity_id)
);

create table public.room_amenities (
  room_id uuid not null references public.rooms(id) on delete cascade,
  amenity_id uuid not null references public.amenities(id) on delete cascade,
  primary key (room_id, amenity_id)
);

create table public.rate_plans (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  weekday_price_sen integer not null check (weekday_price_sen >= 0),
  weekend_price_sen integer not null check (weekend_price_sen >= 0),
  public_holiday_price_sen integer check (public_holiday_price_sen >= 0),
  extra_guest_fee_sen integer not null default 0 check (extra_guest_fee_sen >= 0),
  included_guests integer not null default 2 check (included_guests > 0),
  minimum_stay integer not null default 1 check (minimum_stay > 0),
  maximum_stay integer not null default 30 check (maximum_stay >= minimum_stay),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seasonal_rates (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  name text not null,
  start_date date not null,
  end_date date not null,
  nightly_price_sen integer not null check (nightly_price_sen >= 0),
  check (end_date > start_date)
);

create table public.availability_blocks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  room_id uuid references public.rooms(id) on delete cascade,
  start_date date not null,
  end_date date not null,
  type public.block_type not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  booking_reference text not null unique,
  idempotency_key uuid unique,
  customer_id uuid references auth.users(id) on delete set null,
  guest_name text not null,
  guest_phone text not null,
  guest_email text not null,
  property_id uuid not null references public.properties(id),
  inventory_type public.inventory_type not null,
  check_in date not null,
  check_out date not null,
  adult_count integer not null check (adult_count > 0),
  child_count integer not null default 0 check (child_count >= 0),
  special_request text,
  status public.booking_status not null default 'PENDING_APPROVAL',
  subtotal_amount integer not null check (subtotal_amount >= 0),
  cleaning_fee integer not null default 0 check (cleaning_fee >= 0),
  additional_fee integer not null default 0 check (additional_fee >= 0),
  total_amount integer not null check (total_amount >= 0),
  pending_expires_at timestamptz,
  payment_expires_at timestamptz,
  auto_expiry_disabled boolean not null default false,
  terms_accepted_at timestamptz not null,
  house_rules_accepted_at timestamptz not null,
  cancellation_policy_accepted_at timestamptz not null,
  privacy_policy_accepted_at timestamptz not null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejected_by uuid references auth.users(id) on delete set null,
  rejected_at timestamptz,
  rejection_reason text,
  confirmed_by uuid references auth.users(id) on delete set null,
  confirmed_at timestamptz,
  cancelled_by uuid references auth.users(id) on delete set null,
  cancelled_at timestamptz,
  cancellation_reason text,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in),
  check (total_amount = subtotal_amount + cleaning_fee + additional_fee)
);

create table public.booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  property_id uuid not null references public.properties(id),
  room_id uuid references public.rooms(id),
  inventory_type public.inventory_type not null,
  quantity integer not null default 1 check (quantity > 0),
  nightly_rate_sen integer not null check (nightly_rate_sen >= 0),
  total_sen integer not null check (total_sen >= 0),
  created_at timestamptz not null default now(),
  check ((inventory_type = 'ROOM' and room_id is not null) or (inventory_type = 'ENTIRE_PROPERTY' and room_id is null))
);

create table public.booking_guests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.manual_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  payment_method text,
  bank_name text,
  transaction_reference text,
  amount_sen integer check (amount_sen > 0),
  payment_date timestamptz,
  receipt_path text,
  internal_notes text,
  verification_status public.payment_verification_status not null default 'NOT_SUBMITTED',
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.refunds (
  id uuid primary key default gen_random_uuid(),
  manual_payment_id uuid not null references public.manual_payments(id),
  amount_sen integer not null check (amount_sen > 0),
  status public.refund_status not null default 'PENDING',
  reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  property_id uuid not null references public.properties(id) on delete cascade,
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete cascade,
  booking_id uuid references public.bookings(id) on delete cascade,
  type public.notification_type not null,
  channel text not null,
  subject text not null,
  content text not null,
  read_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Query and overlap indexes.
create index properties_status_idx on public.properties(status);
create index properties_created_at_idx on public.properties(created_at desc);
create index rooms_property_id_idx on public.rooms(property_id);
create index rate_plans_property_id_idx on public.rate_plans(property_id) where active;
create index seasonal_rates_dates_idx on public.seasonal_rates(property_id, start_date, end_date);
create index availability_blocks_dates_idx on public.availability_blocks(property_id, start_date, end_date);
create index availability_blocks_room_id_idx on public.availability_blocks(room_id) where room_id is not null;
create index bookings_property_id_idx on public.bookings(property_id);
create index bookings_customer_id_idx on public.bookings(customer_id) where customer_id is not null;
create index bookings_status_idx on public.bookings(status);
create index bookings_dates_idx on public.bookings(check_in, check_out);
create index bookings_created_at_idx on public.bookings(created_at desc);
create index bookings_pending_expiry_idx on public.bookings(pending_expires_at)
  where status = 'PENDING_APPROVAL' and auto_expiry_disabled = false;
create index bookings_payment_expiry_idx on public.bookings(payment_expires_at)
  where status = 'AWAITING_PAYMENT' and auto_expiry_disabled = false;
create index bookings_active_overlap_idx on public.bookings(property_id, check_in, check_out)
  where status in ('PENDING_APPROVAL','AWAITING_PAYMENT','PAYMENT_SUBMITTED','CONFIRMED','CHECKED_IN');
create index booking_items_booking_id_idx on public.booking_items(booking_id);
create index booking_items_room_id_idx on public.booking_items(room_id) where room_id is not null;
create index manual_payments_booking_id_idx on public.manual_payments(booking_id);
create index refunds_manual_payment_id_idx on public.refunds(manual_payment_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at desc);

create or replace function private.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function private.set_updated_at() from public, anon, authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array['profiles','properties','rooms','rate_plans','bookings','manual_payments','refunds','reviews','app_settings']
  loop
    execute format('create trigger set_updated_at before update on public.%I for each row execute function private.set_updated_at()', table_name);
  end loop;
end $$;

-- Auth trigger deliberately ignores role/user-provided authorization metadata.
create or replace function private.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    'CUSTOMER'
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  raise log 'profile provisioning failed for auth user %: %', new.id, sqlerrm;
  raise;
end;
$$;
revoke all on function private.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

create or replace function private.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'ADMIN'
  );
$$;
revoke all on function private.is_admin() from public;
grant usage on schema private to anon, authenticated;
grant execute on function private.is_admin() to anon, authenticated;

-- Called only by the backend database connection. It is not exposed through the Data API.
create or replace function private.expire_reservations(p_now timestamptz default now())
returns integer language plpgsql security definer set search_path = '' as $$
declare changed integer;
begin
  with expired as (
    update public.bookings
    set status = 'EXPIRED', updated_at = p_now
    where auto_expiry_disabled = false
      and (
        (status = 'PENDING_APPROVAL' and pending_expires_at <= p_now) or
        (status = 'AWAITING_PAYMENT' and payment_expires_at <= p_now)
      )
    returning id
  ), audited as (
    insert into public.audit_logs(action, entity_type, entity_id, metadata)
    select 'BOOKING_EXPIRED', 'Booking', id, jsonb_build_object('expired_at', p_now)
    from expired
    returning 1
  ) select count(*)::integer into changed from audited;
  return changed;
end;
$$;
revoke all on function private.expire_reservations(timestamptz) from public, anon, authenticated;

-- RLS is enabled on every table in the exposed public schema.
do $$
declare table_name text;
begin
  foreach table_name in array array[
    'profiles','properties','rooms','property_images','room_images','amenities',
    'property_amenities','room_amenities','rate_plans','seasonal_rates',
    'availability_blocks','bookings','booking_items','booking_guests',
    'manual_payments','refunds','reviews','notifications','audit_logs','app_settings'
  ] loop execute format('alter table public.%I enable row level security', table_name); end loop;
end $$;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = id or (select private.is_admin()));
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy properties_public_read on public.properties for select to anon, authenticated
  using (status = 'PUBLISHED' or (select private.is_admin()));
create policy rooms_public_read on public.rooms for select to anon, authenticated
  using (active and exists (select 1 from public.properties p where p.id = property_id and p.status = 'PUBLISHED') or (select private.is_admin()));
create policy property_images_public_read on public.property_images for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.status = 'PUBLISHED') or (select private.is_admin()));
create policy room_images_public_read on public.room_images for select to anon, authenticated
  using (exists (select 1 from public.rooms r join public.properties p on p.id = r.property_id where r.id = room_id and r.active and p.status = 'PUBLISHED') or (select private.is_admin()));
create policy amenities_public_read on public.amenities for select to anon, authenticated using (true);
create policy property_amenities_public_read on public.property_amenities for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.status = 'PUBLISHED') or (select private.is_admin()));
create policy room_amenities_public_read on public.room_amenities for select to anon, authenticated
  using (exists (select 1 from public.rooms r join public.properties p on p.id = r.property_id where r.id = room_id and r.active and p.status = 'PUBLISHED') or (select private.is_admin()));
create policy rate_plans_public_read on public.rate_plans for select to anon, authenticated
  using (active and exists (select 1 from public.properties p where p.id = property_id and p.status = 'PUBLISHED') or (select private.is_admin()));
create policy seasonal_rates_public_read on public.seasonal_rates for select to anon, authenticated
  using (exists (select 1 from public.properties p where p.id = property_id and p.status = 'PUBLISHED') or (select private.is_admin()));

create policy bookings_select_own on public.bookings for select to authenticated
  using ((select auth.uid()) = customer_id or (select private.is_admin()));
create policy booking_items_select_own on public.booking_items for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.customer_id = (select auth.uid()) or (select private.is_admin()))));
create policy booking_guests_select_own on public.booking_guests for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.customer_id = (select auth.uid()) or (select private.is_admin()))));
create policy manual_payments_select_own on public.manual_payments for select to authenticated
  using (exists (select 1 from public.bookings b where b.id = booking_id and (b.customer_id = (select auth.uid()) or (select private.is_admin()))));
create policy refunds_select_own on public.refunds for select to authenticated
  using (exists (select 1 from public.manual_payments mp join public.bookings b on b.id = mp.booking_id where mp.id = manual_payment_id and (b.customer_id = (select auth.uid()) or (select private.is_admin()))));
create policy reviews_public_read on public.reviews for select to anon, authenticated
  using (approved or customer_id = (select auth.uid()) or (select private.is_admin()));
create policy reviews_customer_insert on public.reviews for insert to authenticated
  with check (
    customer_id = (select auth.uid()) and approved = false and
    exists (select 1 from public.bookings b where b.id = booking_id and b.customer_id = (select auth.uid()) and b.property_id = property_id and b.status = 'COMPLETED')
  );
create policy notifications_select_own on public.notifications for select to authenticated
  using (customer_id = (select auth.uid()) or (select private.is_admin()));
create policy notifications_update_own on public.notifications for update to authenticated
  using (customer_id = (select auth.uid())) with check (customer_id = (select auth.uid()));

-- Explicit Data API grants (new projects no longer implicitly grant table access).
revoke all on all tables in schema public from anon, authenticated;
grant select on public.properties, public.rooms, public.property_images, public.room_images,
  public.amenities, public.property_amenities, public.room_amenities, public.rate_plans,
  public.seasonal_rates, public.reviews to anon, authenticated;
grant select on public.profiles, public.bookings, public.booking_items, public.booking_guests,
  public.manual_payments, public.refunds, public.notifications to authenticated;
grant update (full_name, phone, avatar_path) on public.profiles to authenticated;
grant insert (customer_id, property_id, booking_id, rating, comment) on public.reviews to authenticated;
grant update (read_at) on public.notifications to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('property-images', 'property-images', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('room-images', 'room-images', true, 10485760, array['image/jpeg','image/png','image/webp']),
  ('payment-receipts', 'payment-receipts', false, 5242880, array['image/jpeg','image/png','image/webp','application/pdf']),
  ('avatars', 'avatars', false, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

create policy property_images_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'property-images' and (select private.is_admin()));
create policy property_images_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'property-images' and (select private.is_admin()))
  with check (bucket_id = 'property-images' and (select private.is_admin()));
create policy property_images_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'property-images' and (select private.is_admin()));
create policy room_images_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'room-images' and (select private.is_admin()));
create policy room_images_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'room-images' and (select private.is_admin()))
  with check (bucket_id = 'room-images' and (select private.is_admin()));
create policy room_images_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'room-images' and (select private.is_admin()));

create policy avatars_owner_select on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and ((storage.foldername(name))[1] = (select auth.uid())::text or (select private.is_admin())));
create policy avatars_owner_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatars_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and owner_id = (select auth.uid())::text);

create policy receipts_customer_select on storage.objects for select to authenticated
  using (
    bucket_id = 'payment-receipts' and (
      (select private.is_admin()) or exists (
        select 1 from public.bookings b
        where b.id::text = (storage.foldername(name))[1] and b.customer_id = (select auth.uid())
      )
    )
  );
create policy receipts_customer_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'payment-receipts' and exists (
      select 1 from public.bookings b
      where b.id::text = (storage.foldername(name))[1] and b.customer_id = (select auth.uid())
    )
  );
create policy receipts_owner_update on storage.objects for update to authenticated
  using (bucket_id = 'payment-receipts' and (owner_id = (select auth.uid())::text or (select private.is_admin())))
  with check (bucket_id = 'payment-receipts' and (owner_id = (select auth.uid())::text or (select private.is_admin())));
create policy receipts_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'payment-receipts' and (owner_id = (select auth.uid())::text or (select private.is_admin())));
