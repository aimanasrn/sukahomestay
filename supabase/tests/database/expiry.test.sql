begin;
select plan(4);
insert into public.properties(id,name,slug,description,address,city,state,max_guests,bedrooms,bathrooms,base_price_sen,house_rules,cancellation_policy,status)
values('41000000-0000-4000-8000-000000000001','Expiry','expiry-test','Expiry property test','Address','City','State',4,1,1,10000,'Rules','Policy','PUBLISHED');
insert into public.bookings(id,booking_reference,guest_name,guest_phone,guest_email,property_id,inventory_type,check_in,check_out,adult_count,status,subtotal_amount,total_amount,pending_expires_at,terms_accepted_at,house_rules_accepted_at,cancellation_policy_accepted_at,privacy_policy_accepted_at) values
 ('51000000-0000-4000-8000-000000000001','SUKA-20990101-EXPA','Expired','60111111111','expired@example.test','41000000-0000-4000-8000-000000000001','ENTIRE_PROPERTY','2099-03-01','2099-03-03',2,'PENDING_APPROVAL',20000,20000,now()-interval '1 minute',now(),now(),now(),now()),
 ('51000000-0000-4000-8000-000000000002','SUKA-20990101-CNFM','Confirmed','60111111111','confirmed@example.test','41000000-0000-4000-8000-000000000001','ENTIRE_PROPERTY','2099-04-01','2099-04-03',2,'CONFIRMED',20000,20000,now()-interval '1 minute',now(),now(),now(),now());
select is(private.expire_reservations(now()),1,'one overdue pending reservation expires');
select is((select status::text from public.bookings where id='51000000-0000-4000-8000-000000000001'),'EXPIRED','expired reservation status is updated');
select is((select status::text from public.bookings where id='51000000-0000-4000-8000-000000000002'),'CONFIRMED','confirmed reservation is untouched');
select is((select count(*)::integer from public.audit_logs where entity_id='51000000-0000-4000-8000-000000000001' and action='BOOKING_EXPIRED'),1,'expiry is audited');
select * from finish();
rollback;
