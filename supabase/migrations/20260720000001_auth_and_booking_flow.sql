-- Migration: Auth triggers, Booking functions, Storage policies & Seed Data
-- Enables automatic user profile creation on signup, booking request RPCs, and initial data.

-- 1. Automatic User Profile Trigger on Auth Signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      updated_at = now();
  return new;
end;
$$;

-- Trigger attached to auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Stored Procedure: Create Booking Request with 30-minute hold window
create or replace function public.create_booking_request(
  p_unit_slug text,
  p_check_in date,
  p_check_out date,
  p_guests integer,
  p_special_request text default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_unit_id uuid;
  v_base_price numeric(12,2);
  v_cleaning_fee numeric(12,2);
  v_deposit_amount numeric(12,2);
  v_max_guests integer;
  v_nights integer;
  v_subtotal numeric(12,2);
  v_total numeric(12,2);
  v_booking_number text;
  v_booking_id uuid;
  v_expires_at timestamptz;
  v_available boolean;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'User must be authenticated to create a booking request.';
  end if;

  if p_check_out <= p_check_in then
    raise exception 'Check-out date must be after check-in date.';
  end if;

  -- Resolve unit details
  select id, base_price, cleaning_fee, deposit_amount, maximum_guests
  into v_unit_id, v_base_price, v_cleaning_fee, v_deposit_amount, v_max_guests
  from public.units
  where slug = p_unit_slug and status = 'active';

  if v_unit_id is null then
    raise exception 'Unit with slug "%" was not found or is inactive.', p_unit_slug;
  end if;

  if p_guests > v_max_guests then
    raise exception 'Guest count exceeds maximum allowed capacity (%) for this unit.', v_max_guests;
  end if;

  -- Check date availability
  v_available := public.is_unit_available(v_unit_id, p_check_in, p_check_out);
  if not v_available then
    raise exception 'Selected dates are not available for this unit.';
  end if;

  v_nights := (p_check_out - p_check_in);
  v_subtotal := v_base_price * v_nights;
  v_total := v_subtotal + v_cleaning_fee;
  v_booking_number := 'SHS-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 6));
  v_expires_at := now() + interval '30 minutes';

  insert into public.bookings (
    booking_number,
    customer_id,
    unit_id,
    check_in_date,
    check_out_date,
    adult_count,
    subtotal,
    cleaning_fee,
    deposit_amount,
    total_amount,
    booking_status,
    payment_status,
    special_request,
    expires_at
  ) values (
    v_booking_number,
    v_user_id,
    v_unit_id,
    p_check_in,
    p_check_out,
    p_guests,
    v_subtotal,
    v_cleaning_fee,
    v_deposit_amount,
    v_total,
    'pending',
    'unpaid',
    p_special_request,
    v_expires_at
  ) returning id into v_booking_id;

  return json_build_object(
    'id', v_booking_id,
    'booking_number', v_booking_number,
    'subtotal', v_subtotal,
    'total_amount', v_total,
    'expires_at', v_expires_at
  );
end;
$$;

revoke all on function public.create_booking_request(text,date,date,integer,text) from public;
grant execute on function public.create_booking_request(text,date,date,integer,text) to authenticated;

-- 3. Stored Procedure: Get Locked Dates for Main Calendar (Whole House or Admin Blocked)
create or replace function public.get_locked_dates(
  p_start date,
  p_end date
)
returns table (locked_date text)
language sql
stable
security definer
set search_path = public
as $$
  with date_series as (
    select generate_series(p_start::timestamp, (p_end - interval '1 day')::timestamp, interval '1 day')::date as d
  )
  select to_char(ds.d, 'YYYY-MM-DD') as locked_date
  from date_series ds
  where exists (
    select 1 from public.bookings b
    join public.units u on u.id = b.unit_id
    where b.check_in_date <= ds.d
      and b.check_out_date > ds.d
      and u.slug = 'whole-house'
      and (
        b.booking_status in ('confirmed', 'checked_in', 'completed', 'payment_review')
        or (b.booking_status in ('pending', 'awaiting_payment') and b.expires_at > now())
      )
  )
  or exists (
    select 1 from public.blocked_dates bd
    where bd.start_date <= ds.d
      and bd.end_date >= ds.d
  );
$$;

revoke all on function public.get_locked_dates(date,date) from public;
grant execute on function public.get_locked_dates(date,date) to anon, authenticated;

-- 4. Security Definer Procedure: Get Booked Unit Slugs for Date Range (Cross-Customer)
create or replace function public.get_booked_units_for_dates(
  p_check_in date,
  p_check_out date
)
returns table (unit_slug text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct u.slug as unit_slug
  from public.bookings b
  join public.units u on u.id = b.unit_id
  where b.check_in_date < p_check_out
    and b.check_out_date > p_check_in
    and (
      b.booking_status in ('confirmed', 'checked_in', 'completed', 'payment_review')
      or (b.booking_status in ('pending', 'awaiting_payment') and b.expires_at > now())
    );
$$;

revoke all on function public.get_booked_units_for_dates(date,date) from public;
grant execute on function public.get_booked_units_for_dates(date,date) to anon, authenticated;

-- 5. Storage Bucket & RLS Policies for payment-receipts
insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', false)
on conflict (id) do nothing;

create policy "Users can upload their own payment receipt"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'payment-receipts'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users and Admins can read payment receipts"
on storage.objects for select to authenticated
using (
  bucket_id = 'payment-receipts'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

-- 6. Default Seed Data for SukaHomestay
insert into public.properties (id, name, slug, description, address)
values (
  '11111111-1111-1111-1111-111111111111',
  'SukaHomestay Main Villa',
  'sukahomestay-main',
  'Spacious family-friendly homestay featuring private rooms and whole-house booking options with full amenities.',
  'Kampung Melayu, Selangor, Malaysia'
) on conflict (id) do nothing;

insert into public.units (id, property_id, name, slug, unit_type, short_description, description, bedrooms, bathrooms, maximum_guests, base_price, cleaning_fee, deposit_amount)
values
(
  '22222222-2222-2222-2222-222222222221',
  '11111111-1111-1111-1111-111111111111',
  'Full Homestay (4 Bedrooms)',
  'full-homestay',
  'homestay',
  'Complete 4-bedroom house with spacious living area, air conditioning, and full kitchen.',
  'Ideal for large families or groups looking for privacy and comfort.',
  4, 3, 10, 350.00, 50.00, 100.00
),
(
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Roomstay 1 (Master Bedroom)',
  'roomstay-1',
  'roomstay',
  'Private master bedroom with attached bathroom, king bed, and private balcony.',
  'Perfect for couples or small families needing a cozy private retreat.',
  1, 1, 3, 120.00, 20.00, 50.00
),
(
  '22222222-2222-2222-2222-222222222223',
  '11111111-1111-1111-1111-111111111111',
  'Roomstay 2 (Deluxe Queen)',
  'roomstay-2',
  'roomstay',
  'Comfortable queen bedroom with air conditioning and shared living spaces.',
  'Great value room stay for short business trips or weekend getaways.',
  1, 1, 2, 95.00, 20.00, 30.00
),
(
  '22222222-2222-2222-2222-222222222224',
  '11111111-1111-1111-1111-111111111111',
  'Whole House (Grand Package)',
  'whole-house',
  'whole_house',
  'Exclusive reservation of the entire estate, private parking, and outdoor bbq facility.',
  'Unmatched space for events, extended family gatherings, and celebrations.',
  5, 4, 14, 550.00, 80.00, 200.00
)
on conflict (id) do nothing;
