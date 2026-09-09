-- One immutable invoice/receipt snapshot per ledger entry. Never expose publicly.
create sequence private.invoice_number;
create table public.payment_invoices (
 payment_id uuid primary key references public.payments(id),
 booking_id uuid not null references public.bookings(id),
 invoice_number text not null unique,
 issued_at timestamptz not null,
 kind text not null check(kind in ('payment','refund')),
 amount_sen integer not null check(amount_sen>0),
 snapshot jsonb not null
);
create index payment_invoices_booking on public.payment_invoices(booking_id);
alter table public.payment_invoices enable row level security;
revoke all on public.payment_invoices from public, anon, authenticated;
grant select on public.payment_invoices to authenticated;
grant select, insert on public.payment_invoices to service_role;
grant usage on sequence private.invoice_number to service_role;
create policy admin_read on public.payment_invoices for select to authenticated using ((select private.is_admin()));

create function private.capture_invoice(pid uuid, historical boolean default false) returns void
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
 'seller',jsonb_build_object('name','SUKA HOMESTAY','address',s.address,'email',s.contact_email,'phone',s.whatsapp)))
 on conflict(payment_id) do nothing;
end $$;
revoke all on function private.capture_invoice(uuid,boolean) from public,anon,authenticated;
grant execute on function private.capture_invoice(uuid,boolean) to service_role;
create function private.invoice_after_payment() returns trigger language plpgsql set search_path='' as $$
begin perform private.capture_invoice(new.id); return new; end $$;
revoke all on function private.invoice_after_payment() from public,anon,authenticated;
create trigger invoice_after_payment after insert on public.payments for each row execute function private.invoice_after_payment();

-- Include payments already recorded before this feature was installed.
do $$ declare p record; begin
 for p in select id from public.payments order by created_at,id loop
  perform private.capture_invoice(p.id,true);
 end loop;
end $$;
create function private.invoice_immutable() returns trigger language plpgsql set search_path='' as $$
begin raise exception 'INVOICE_IMMUTABLE'; end $$;
revoke all on function private.invoice_immutable() from public,anon,authenticated;
create trigger invoice_immutable before update or delete on public.payment_invoices for each row execute function private.invoice_immutable();
