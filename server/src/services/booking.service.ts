import { addHours, format } from "date-fns";
import { randomBytes } from "node:crypto";
import type { Sql, TransactionSql } from "postgres";
import { sql } from "../config/database.js";
import { ApiError } from "../utils/api-error.js";
import { calculatePrice, canCancel } from "../modules/bookings/booking-rules.js";
import { normalizeMalaysianPhone } from "../modules/bookings/reservation-rules.js";
import { hasConflict } from "./availability.service.js";
import { getReservationSettings } from "./settings.service.js";
import { buildReservationMessage, makeWhatsAppUrl } from "./whatsapp.service.js";
import type { z } from "zod";
import type { createBookingSchema, guestLookupSchema, quoteSchema } from "../schemas/booking.schema.js";

type QuoteInput = z.infer<typeof quoteSchema>;
type ReservationInput = z.infer<typeof createBookingSchema>;

async function calculateQuote(db: Sql | TransactionSql, input: QuoteInput) {
  const properties = await db<any[]>`
    select p.*, rp.weekday_price_sen, rp.weekend_price_sen, rp.extra_guest_fee_sen, rp.included_guests,
      r.id as room_id, r.name as room_name, r.capacity as room_capacity, r.price_sen as room_price_sen
    from public.properties p
    left join lateral (select * from public.rate_plans where property_id = p.id and active order by created_at limit 1) rp on true
    left join public.rooms r on r.id = ${input.roomId ?? null}::uuid and r.property_id = p.id and r.active
    where p.id = ${input.propertyId} and p.status = 'PUBLISHED' limit 1
  `;
  const property = properties[0];
  if (!property) throw new ApiError(404, "Property not found");
  if (input.inventoryType === "ROOM" && !property.room_id) throw new ApiError(404, "Room not found");
  if (input.guests > (property.room_capacity ?? property.max_guests))
    throw new ApiError(422, "Guest count exceeds the selected accommodation capacity", "CAPACITY_EXCEEDED");
  const seasonal = await db<any[]>`select start_date, end_date, nightly_price_sen from public.seasonal_rates where property_id = ${input.propertyId}`;
  return {
    property,
    room: property.room_id ? { id: property.room_id, name: property.room_name } : undefined,
    price: calculatePrice({
      checkIn: input.checkIn, checkOut: input.checkOut, guests: input.guests,
      includedGuests: property.included_guests ?? 2,
      weekdayPriceSen: property.room_price_sen ?? property.weekday_price_sen ?? property.base_price_sen,
      weekendPriceSen: property.room_price_sen ?? property.weekend_price_sen ?? property.base_price_sen,
      cleaningFeeSen: property.cleaning_fee_sen,
      extraGuestFeeSen: property.extra_guest_fee_sen ?? 0,
      seasonalRates: seasonal.map((r) => ({ startDate: new Date(r.start_date), endDate: new Date(r.end_date), nightlyPriceSen: r.nightly_price_sen })),
    }),
  };
}

export async function quote(input: QuoteInput) { return (await calculateQuote(sql, input)).price; }

function makeReference(now = new Date()) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const suffix = Array.from(randomBytes(4), (byte) => alphabet[byte % alphabet.length]).join("");
  return `SUKA-${format(now, "yyyyMMdd")}-${suffix}`;
}

function mapBooking(row: any) {
  return {
    ...row,
    reference: row.booking_reference, userId: row.customer_id, propertyId: row.property_id,
    inventoryType: row.inventory_type, checkIn: new Date(row.check_in), checkOut: new Date(row.check_out),
    guestCount: row.adult_count + row.child_count, adultCount: row.adult_count, childCount: row.child_count,
    specialRequests: row.special_request, subtotalSen: row.subtotal_amount, cleaningFeeSen: row.cleaning_fee,
    extraGuestFeeSen: row.additional_fee, totalSen: row.total_amount,
    expiresAt: row.status === "PENDING_APPROVAL" ? row.pending_expires_at : row.payment_expires_at,
    paymentDeadline: row.payment_expires_at,
    property: { id: row.property_id, name: row.property_name, slug: row.property_slug },
    guests: [{ fullName: row.guest_name, email: row.guest_email, phone: row.guest_phone, isPrimary: true }],
  };
}

export async function loadBooking(db: Sql | TransactionSql, id: string) {
  const rows = await db<any[]>`select b.*, p.name as property_name, p.slug as property_slug from public.bookings b join public.properties p on p.id = b.property_id where b.id = ${id} limit 1`;
  if (!rows[0]) throw new ApiError(404, "Booking not found");
  const items = await db<any[]>`select bi.*, r.name as room_name from public.booking_items bi left join public.rooms r on r.id = bi.room_id where bi.booking_id = ${id}`;
  const payments = await db<any[]>`select * from public.manual_payments where booking_id = ${id} order by created_at desc`;
  return { ...mapBooking(rows[0]), items: items.map((i) => ({ ...i, room: i.room_id ? { id: i.room_id, name: i.room_name } : null })), payments: payments.map((p) => ({ ...p, verificationStatus: p.verification_status, amountSen: p.amount_sen })) };
}

export async function createReservation(userId: string | undefined, input: ReservationInput) {
  const settings = await getReservationSettings();
  const bookingId = await sql.begin(async (tx) => {
    await tx`select pg_advisory_xact_lock(hashtextextended(${input.propertyId}, 0))`;
    const duplicate = await tx<{ id: string }[]>`select id from public.bookings where idempotency_key = ${input.idempotencyKey}::uuid limit 1`;
    if (duplicate[0]) return duplicate[0].id;
    const guests = input.adultCount + input.childCount;
    const { price } = await calculateQuote(tx, { propertyId: input.propertyId, inventoryType: input.inventoryType, ...(input.roomId ? { roomId: input.roomId } : {}), checkIn: input.checkIn, checkOut: input.checkOut, guests });
    if (await hasConflict(tx, { propertyId: input.propertyId, ...(input.roomId ? { roomId: input.roomId } : {}), inventoryType: input.inventoryType, checkIn: input.checkIn, checkOut: input.checkOut }))
      throw new ApiError(409, "Tarikh pilihan tidak lagi tersedia. Sila pilih tarikh lain.", "BOOKING_CONFLICT");
    const acceptedAt = new Date();
    const phone = normalizeMalaysianPhone(input.guest.phone);
    const inserted = await tx<{ id: string }[]>`
      insert into public.bookings (
        booking_reference, idempotency_key, customer_id, guest_name, guest_phone, guest_email,
        property_id, inventory_type, check_in, check_out, adult_count, child_count, special_request,
        subtotal_amount, cleaning_fee, additional_fee, total_amount, pending_expires_at,
        terms_accepted_at, house_rules_accepted_at, cancellation_policy_accepted_at, privacy_policy_accepted_at
      ) values (
        ${makeReference()}, ${input.idempotencyKey}::uuid, ${userId ?? null}::uuid, ${input.guest.fullName}, ${phone}, ${input.guest.email.toLowerCase()},
        ${input.propertyId}::uuid, ${input.inventoryType}, ${input.checkIn}::date, ${input.checkOut}::date, ${input.adultCount}, ${input.childCount}, ${input.specialRequests ?? null},
        ${price.subtotalSen}, ${price.cleaningFeeSen}, ${price.extraGuestFeeSen}, ${price.totalSen}, ${addHours(acceptedAt, settings.pendingApprovalHours)},
        ${acceptedAt}, ${acceptedAt}, ${acceptedAt}, ${acceptedAt}
      ) returning id
    `;
    const id = inserted[0]!.id;
    await tx`insert into public.booking_items (booking_id, property_id, room_id, inventory_type, nightly_rate_sen, total_sen) values (${id}, ${input.propertyId}, ${input.roomId ?? null}::uuid, ${input.inventoryType}, ${Math.round(price.subtotalSen / price.nights)}, ${price.totalSen})`;
    await tx`insert into public.booking_guests (booking_id, full_name, email, phone, is_primary) values (${id}, ${input.guest.fullName}, ${input.guest.email.toLowerCase()}, ${phone}, true)`;
    await tx`insert into public.audit_logs (actor_id, action, entity_type, entity_id, metadata) values (${userId ?? null}::uuid, 'RESERVATION_CREATED', 'Booking', ${id}, jsonb_build_object('source','WHATSAPP'))`;
    return id;
  });
  const booking = await loadBooking(sql, bookingId);
  const whatsappMessage = buildReservationMessage({
    reference: booking.reference, propertyName: booking.property.name,
    selectionName: booking.inventoryType === "ENTIRE_PROPERTY" ? "Seluruh homestay" : booking.items[0]?.room?.name ?? "Bilik",
    checkIn: booking.checkIn, checkOut: booking.checkOut, adultCount: booking.adultCount, childCount: booking.childCount,
    customerName: booking.guests[0].fullName, customerPhone: booking.guests[0].phone,
    customerEmail: booking.guests[0].email, subtotalSen: booking.subtotalSen,
    cleaningFeeSen: booking.cleaningFeeSen, extraGuestFeeSen: booking.extraGuestFeeSen,
    totalSen: booking.totalSen, specialRequests: booking.specialRequests,
  });
  return { booking, whatsappUrl: makeWhatsAppUrl(settings.whatsappNumber, whatsappMessage) };
}

export async function mine(userId: string) {
  const ids = await sql<{ id: string }[]>`select id from public.bookings where customer_id = ${userId} order by created_at desc`;
  return Promise.all(ids.map((r) => loadBooking(sql, r.id)));
}

export async function lookup(input: z.infer<typeof guestLookupSchema>) {
  let phone: string | null = null;
  try { phone = normalizeMalaysianPhone(input.contact); } catch { /* email lookup */ }
  const rows = await sql<any[]>`
    select b.booking_reference as reference, b.status, b.check_in as "checkIn", b.check_out as "checkOut",
      b.adult_count as "adultCount", b.child_count as "childCount", b.total_amount as "totalSen",
      coalesce(b.pending_expires_at, b.payment_expires_at) as "expiresAt", p.name as "propertyName", p.slug as "propertySlug"
    from public.bookings b join public.properties p on p.id = b.property_id
    where upper(b.booking_reference) = upper(${input.reference})
      and (lower(b.guest_email) = lower(${input.contact}) or b.guest_phone = ${phone}) limit 1
  `;
  if (!rows[0]) throw new ApiError(404, "Reservation not found or contact details do not match", "RESERVATION_NOT_FOUND");
  return { ...rows[0], property: { name: rows[0].propertyName, slug: rows[0].propertySlug }, items: [] };
}

export async function cancel(userId: string, bookingId: string, reason?: string) {
  return sql.begin(async (tx) => {
    const rows = await tx<any[]>`select * from public.bookings where id = ${bookingId} and customer_id = ${userId} for update`;
    const booking = rows[0];
    if (!booking) throw new ApiError(404, "Booking not found");
    if (!canCancel(booking.status, new Date(booking.check_in))) throw new ApiError(409, "This booking is no longer eligible for cancellation", "CANCELLATION_NOT_ALLOWED");
    const updated = await tx<any[]>`update public.bookings set status = 'CANCELLED', pending_expires_at = null, payment_expires_at = null, cancelled_by = ${userId}, cancelled_at = now(), cancellation_reason = ${reason ?? null} where id = ${bookingId} returning *`;
    await tx`insert into public.audit_logs(actor_id, action, entity_type, entity_id, metadata) values (${userId}, 'BOOKING_CANCELLED', 'Booking', ${bookingId}, jsonb_build_object('reason', ${reason ?? null}::text))`;
    return mapBooking({ ...updated[0], property_name: "", property_slug: "" });
  });
}
