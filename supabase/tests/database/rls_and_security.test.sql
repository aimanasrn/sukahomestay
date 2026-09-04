begin;
create extension if not exists pgtap with schema extensions;
select plan(16);

select is(
  (select count(*)::integer from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity),
  20,
  'RLS is enabled on every exposed application table'
);

insert into auth.users(id,email,raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001','one@example.test','{"full_name":"One","role":"ADMIN"}'),
  ('10000000-0000-4000-8000-000000000002','two@example.test','{"full_name":"Two"}'),
  ('10000000-0000-4000-8000-000000000003','admin@example.test','{"full_name":"Admin"}');
update public.profiles set role='ADMIN' where id='10000000-0000-4000-8000-000000000003';

select is((select role::text from public.profiles where id='10000000-0000-4000-8000-000000000001'),'CUSTOMER','new user metadata cannot assign ADMIN');
select is((select count(*)::integer from public.profiles where id in ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002')),2,'new Auth users receive profiles');

insert into public.properties(id,name,slug,description,address,city,state,max_guests,bedrooms,bathrooms,base_price_sen,house_rules,cancellation_policy,status) values
 ('40000000-0000-4000-8000-000000000001','Published','published-test','Published property test record','Address','City','State',4,2,1,10000,'Rules','Policy','PUBLISHED'),
 ('40000000-0000-4000-8000-000000000002','Draft','draft-test','Draft property test record','Address','City','State',4,2,1,10000,'Rules','Policy','DRAFT');
insert into public.bookings(id,booking_reference,customer_id,guest_name,guest_phone,guest_email,property_id,inventory_type,check_in,check_out,adult_count,subtotal_amount,total_amount,terms_accepted_at,house_rules_accepted_at,cancellation_policy_accepted_at,privacy_policy_accepted_at) values
 ('50000000-0000-4000-8000-000000000001','SUKA-20990101-AAAA','10000000-0000-4000-8000-000000000001','One','60111111111','one@example.test','40000000-0000-4000-8000-000000000001','ENTIRE_PROPERTY','2099-01-01','2099-01-03',2,20000,20000,now(),now(),now(),now()),
 ('50000000-0000-4000-8000-000000000002','SUKA-20990101-BBBB','10000000-0000-4000-8000-000000000002','Two','60222222222','two@example.test','40000000-0000-4000-8000-000000000001','ENTIRE_PROPERTY','2099-02-01','2099-02-03',2,20000,20000,now(),now(),now(),now());
insert into public.manual_payments(booking_id,amount_sen,receipt_path) values('50000000-0000-4000-8000-000000000001',20000,'50000000-0000-4000-8000-000000000001/60000000-0000-4000-8000-000000000001.pdf');
insert into storage.objects(bucket_id,name,owner_id) values('payment-receipts','50000000-0000-4000-8000-000000000001/60000000-0000-4000-8000-000000000001.pdf','10000000-0000-4000-8000-000000000001');

set local role anon;
select results_eq('select count(*) from public.properties',array[1::bigint],'anonymous sees only published properties');
select throws_ok('select count(*) from public.bookings','42501',null,'anonymous cannot read bookings');
select results_eq($$select count(*) from storage.objects where bucket_id='payment-receipts'$$,array[0::bigint],'private receipts are invisible anonymously');
reset role;

set local role authenticated;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
select results_eq('select count(*) from public.bookings',array[1::bigint],'customer sees only own booking');
select results_eq('select count(*) from public.manual_payments',array[1::bigint],'customer sees own payment status');
select results_eq('select count(*) from storage.objects where bucket_id=''payment-receipts''',array[1::bigint],'customer sees own receipt object');
select throws_ok($$update public.bookings set status='CONFIRMED' where id='50000000-0000-4000-8000-000000000001'$$,'42501',null,'customer cannot change booking status');
select throws_ok($$update public.bookings set total_amount=1 where id='50000000-0000-4000-8000-000000000001'$$,'42501',null,'customer cannot change booking price');
select lives_ok($$update public.profiles set full_name='Updated' where id='10000000-0000-4000-8000-000000000001'$$,'customer can update a safe profile field');
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select results_eq($$select count(*) from public.bookings where id='50000000-0000-4000-8000-000000000001'$$,array[0::bigint],'RLS blocks cross-customer access');
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000003';
select results_eq('select count(*) from public.bookings',array[2::bigint],'administrator policy can read bookings');
reset role;

select ok(not has_function_privilege('anon','private.expire_reservations(timestamptz)','execute'),'expiry function is not anonymous executable');
select ok(not has_function_privilege('authenticated','private.expire_reservations(timestamptz)','execute'),'expiry function is not customer executable');

select * from finish();
rollback;
