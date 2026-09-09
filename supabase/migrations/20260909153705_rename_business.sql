-- Rename future invoices only; preserve all existing invoice snapshots.
create or replace function private.capture_invoice(pid uuid, historical boolean default false) returns void
language plpgsql set search_path='' as $$
declare p public.payments; b public.bookings; s public.property_settings; net integer;
begin
 select * into strict p from public.payments where id=pid;
 select * into strict b from public.bookings where id=p.booking_id;
 select * into strict s from public.property_settings where id;
 select coalesce(sum(case when kind='payment' then amount_sen else -amount_sen end),0) into net
 from public.payments where booking_id=b.id and (not historical or (created_at,id)<=(p.created_at,p.id));
 insert into public.payment_invoices(payment_id,booking_id,invoice_number,issued_at,kind,amount_sen,snapshot)
 values(p.id,b.id,'SH-'||case when p.kind='payment' then 'INV-' else 'RF-' end||lpad(nextval('private.invoice_number')::text,8,'0'),p.created_at,p.kind,p.amount_sen,
 jsonb_build_object('version',1,'booking_reference',b.reference,'name',b.name,'phone',b.phone,'email',b.email,
 'check_in',b.check_in,'check_out',b.check_out,'resources',b.resources,'quote',b.quote,'language',b.language,
 'payment_reference',p.reference,'net_paid_sen',net,'balance_sen',greatest(b.total_sen-net,0),
 'seller',jsonb_build_object('name','Suka Room&Homestay','address',s.address,'email',s.contact_email,'phone',s.whatsapp)))
 on conflict(payment_id) do nothing;
end $$;
