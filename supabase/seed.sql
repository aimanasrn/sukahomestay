-- Catalog-only seed. Auth users are created through Supabase Auth, never by
-- inserting passwords or production identities in SQL.
insert into public.amenities (id, name, icon) values
  ('a0000000-0000-4000-8000-000000000001', 'High-speed Wi-Fi', 'wifi'),
  ('a0000000-0000-4000-8000-000000000002', 'Air conditioning', 'snowflake'),
  ('a0000000-0000-4000-8000-000000000003', 'Fully equipped kitchen', 'cooking-pot'),
  ('a0000000-0000-4000-8000-000000000004', 'Free parking', 'car'),
  ('a0000000-0000-4000-8000-000000000005', 'Washing machine', 'washing-machine'),
  ('a0000000-0000-4000-8000-000000000006', 'Smart TV', 'tv'),
  ('a0000000-0000-4000-8000-000000000007', 'Essentials provided', 'package')
on conflict (name) do nothing;

insert into public.properties (
  id, name, slug, description, address, city, state, max_guests, bedrooms,
  bathrooms, base_price_sen, cleaning_fee_sen, security_deposit_sen,
  house_rules, cancellation_policy, status
) values
  ('11111111-1111-4111-8111-111111111111', 'Alam Villa Langkawi', 'alam-villa-langkawi',
   'A serene timber villa wrapped in tropical gardens, made for unhurried family days near Pantai Cenang.',
   '18 Jalan Pantai Tengah', 'Langkawi', 'Kedah', 8, 3, 3, 62000, 9000, 30000,
   'No smoking indoors. Quiet hours begin at 10:00 PM. Registered guests only.',
   'Free cancellation until 3 days before check-in. Late cancellations are non-refundable.', 'PUBLISHED'),
  ('22222222-2222-4222-8222-222222222222', 'Damai Hillside Home', 'damai-hillside-home',
   'A breezy hillside retreat with generous gathering spaces and calm valley views outside Bentong.',
   '27 Jalan Bukit Damai', 'Bentong', 'Pahang', 10, 4, 3, 68000, 10000, 35000,
   'No smoking indoors. Quiet hours begin at 10:00 PM. Registered guests only.',
   'Free cancellation until 3 days before check-in. Late cancellations are non-refundable.', 'PUBLISHED'),
  ('33333333-3333-4333-8333-333333333333', 'Rimba Retreat Janda Baik', 'rimba-retreat-janda-baik',
   'A cool forest hideaway beside the river, designed for quiet weekends and small celebrations.',
   'Lot 12 Kampung Sum-Sum', 'Janda Baik', 'Pahang', 6, 2, 2, 52000, 8000, 25000,
   'No smoking indoors. Quiet hours begin at 10:00 PM. Registered guests only.',
   'Free cancellation until 3 days before check-in. Late cancellations are non-refundable.', 'PUBLISHED')
on conflict (slug) do nothing;

insert into public.property_images (property_id, storage_path, alt, sort_order) values
  ('11111111-1111-4111-8111-111111111111', '/assets/alam-villa-hero.png', 'Alam Villa Langkawi exterior', 0),
  ('22222222-2222-4222-8222-222222222222', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85', 'Damai Hillside Home exterior', 0),
  ('33333333-3333-4333-8333-333333333333', 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=85', 'Rimba Retreat Janda Baik exterior', 0);

insert into public.rate_plans (property_id, name, weekday_price_sen, weekend_price_sen, extra_guest_fee_sen, included_guests, minimum_stay, maximum_stay)
select id, 'Standard flexible', base_price_sen, base_price_sen + 8000, 3500, least(max_guests, 4), 1, 21
from public.properties p
where slug in ('alam-villa-langkawi','damai-hillside-home','rimba-retreat-janda-baik')
and not exists (select 1 from public.rate_plans rp where rp.property_id = p.id and rp.name = 'Standard flexible');

insert into public.app_settings (key, value) values ('reservation', jsonb_build_object(
  'bankName', '', 'bankAccountName', 'SUKA HOMESTAY', 'bankAccountNumber', '',
  'duitNowId', '', 'depositPercentage', 100, 'fullPaymentRequired', true,
  'checkInTime', '15:00', 'checkOutTime', '11:00'
)) on conflict (key) do nothing;
