import { addHours } from "date-fns";
import { sql } from "../config/database.js";
import { ApiError } from "../utils/api-error.js";
import { canTransition } from "../modules/bookings/reservation-rules.js";
import type { BookingStatus } from "../types/domain.js";
import { getReservationSettings } from "./settings.service.js";
import { adminTemplateValues, makeWhatsAppUrl, renderTemplate } from "./whatsapp.service.js";
import { hasConflict } from "./availability.service.js";
import { loadBooking } from "./booking.service.js";

async function current(id: string) { return loadBooking(sql, id); }
function assertTransition(from: BookingStatus, to: BookingStatus) {
  if (!canTransition(from, to)) throw new ApiError(409, `Cannot change booking from ${from} to ${to}`, "INVALID_STATUS_TRANSITION");
}
async function audit(tx: any, actorId: string, action: string, entityId: string, ip: string | undefined, metadata: object = {}) {
  await tx`insert into public.audit_logs(actor_id, action, entity_type, entity_id, ip_address, metadata) values (${actorId}, ${action}, 'Booking', ${entityId}, ${ip ?? null}::inet, ${tx.json(metadata)})`;
}

export async function contactCustomer(id: string) {
  const b = await current(id);
  return { whatsappUrl: makeWhatsAppUrl(b.guests[0].phone, `Assalamualaikum ${b.guests[0].fullName}, kami menghubungi anda berkenaan tempahan SUKA HOMESTAY ${b.reference}.`) };
}

export async function approve(id: string, actorId: string, ip?: string) {
  const settings = await getReservationSettings(); const before = await current(id);
  assertTransition(before.status, "AWAITING_PAYMENT"); const deadline = addHours(new Date(), settings.paymentDeadlineHours);
  await sql.begin(async (tx) => { await tx`update public.bookings set status='AWAITING_PAYMENT', approved_by=${actorId}, approved_at=now(), pending_expires_at=null, payment_expires_at=${deadline} where id=${id}`; await audit(tx, actorId, "RESERVATION_APPROVED", id, ip, { paymentDeadline: deadline.toISOString() }); });
  const booking = await current(id); const message = renderTemplate(settings.templates.approved, adminTemplateValues(booking, settings));
  return { booking, whatsappUrl: makeWhatsAppUrl(booking.guests[0].phone, message) };
}

export async function reject(id: string, actorId: string, reason: string, ip?: string) {
  const settings = await getReservationSettings(); const before = await current(id); assertTransition(before.status, "REJECTED");
  await sql.begin(async (tx) => { await tx`update public.bookings set status='REJECTED', rejected_by=${actorId}, rejected_at=now(), rejection_reason=${reason}, pending_expires_at=null, payment_expires_at=null where id=${id}`; await audit(tx, actorId, "RESERVATION_REJECTED", id, ip, { reason }); });
  const booking = await current(id); const message = renderTemplate(settings.templates.rejected, adminTemplateValues(booking, settings, undefined, reason));
  return { booking, whatsappUrl: makeWhatsAppUrl(booking.guests[0].phone, message) };
}

export async function extendExpiry(id: string, actorId: string, hours: number, disabled: boolean, ip?: string) {
  const b = await current(id); const expiry = disabled ? null : addHours(new Date(), hours);
  const column = b.status === "AWAITING_PAYMENT" ? sql`payment_expires_at` : sql`pending_expires_at`;
  const rows = await sql.begin(async (tx) => { const updated = await tx<any[]>`update public.bookings set ${column}=${expiry}, auto_expiry_disabled=${disabled} where id=${id} returning *`; await audit(tx, actorId, "RESERVATION_EXPIRY_EXTENDED", id, ip, { hours, disabled }); return updated; });
  return rows[0];
}

export async function editDates(id: string, actorId: string, checkIn: Date, checkOut: Date, ip?: string) {
  return sql.begin(async (tx) => {
    const b = await loadBooking(tx, id); await tx`select pg_advisory_xact_lock(hashtextextended(${b.propertyId}, 0))`;
    if (await hasConflict(tx, { propertyId: b.propertyId, roomId: b.items[0]?.room_id ?? undefined, inventoryType: b.inventoryType, checkIn, checkOut, excludeBookingId: id })) throw new ApiError(409, "The revised dates conflict with another reservation", "BOOKING_CONFLICT");
    const rows = await tx<any[]>`update public.bookings set check_in=${checkIn}::date, check_out=${checkOut}::date where id=${id} returning *`; await audit(tx, actorId, "RESERVATION_DATES_CHANGED", id, ip, { checkIn, checkOut }); return rows[0];
  });
}

type PaymentInput = { paymentMethod?: string | undefined; bankName?: string | undefined; transactionReference?: string | undefined; amountSen?: number | undefined; paymentDate?: Date | undefined; receiptPath?: string | undefined; internalNotes?: string | undefined };
export async function submitPayment(id: string, actorId: string, input: PaymentInput, ip?: string) {
  const before = await current(id); assertTransition(before.status, "PAYMENT_SUBMITTED");
  return sql.begin(async (tx) => {
    const existing = await tx<{id:string}[]>`select id from public.manual_payments where booking_id=${id} order by created_at desc limit 1`;
    const payments = existing[0] ? await tx<any[]>`update public.manual_payments set payment_method=${input.paymentMethod??null}, bank_name=${input.bankName??null}, transaction_reference=${input.transactionReference??null}, amount_sen=${input.amountSen??null}, payment_date=${input.paymentDate??null}, receipt_path=${input.receiptPath??null}, internal_notes=${input.internalNotes??null}, verification_status='PENDING_VERIFICATION', rejection_reason=null where id=${existing[0].id} returning *` : await tx<any[]>`insert into public.manual_payments(booking_id,payment_method,bank_name,transaction_reference,amount_sen,payment_date,receipt_path,internal_notes,verification_status) values(${id},${input.paymentMethod??null},${input.bankName??null},${input.transactionReference??null},${input.amountSen??null},${input.paymentDate??null},${input.receiptPath??null},${input.internalNotes??null},'PENDING_VERIFICATION') returning *`;
    const bookings = await tx<any[]>`update public.bookings set status='PAYMENT_SUBMITTED', payment_expires_at=null where id=${id} returning *`; await audit(tx, actorId, "PAYMENT_RECORDED", id, ip, { paymentId: payments[0].id }); return { booking: bookings[0], payment: payments[0] };
  });
}

export async function verifyPayment(id: string, actorId: string, ip?: string) {
  const settings = await getReservationSettings(); const before = await current(id); assertTransition(before.status, "CONFIRMED");
  const payment = before.payments.find((p:any) => p.verificationStatus === "PENDING_VERIFICATION"); if (!payment) throw new ApiError(409, "No submitted payment is waiting for verification", "PAYMENT_NOT_SUBMITTED");
  await sql.begin(async (tx) => { await tx`update public.manual_payments set verification_status='VERIFIED', verified_by=${actorId}, verified_at=now(), rejection_reason=null where id=${payment.id}`; await tx`update public.bookings set status='CONFIRMED', confirmed_by=${actorId}, confirmed_at=now(), payment_expires_at=null where id=${id}`; await audit(tx, actorId, "PAYMENT_VERIFIED", id, ip, { paymentId: payment.id }); });
  const booking = await current(id); const message = renderTemplate(settings.templates.confirmed, adminTemplateValues(booking, settings, payment.amountSen ?? booking.totalSen)); return { booking, payment, whatsappUrl: makeWhatsAppUrl(booking.guests[0].phone, message) };
}

export async function rejectPayment(id: string, actorId: string, reason: string, ip?: string) {
  const settings = await getReservationSettings(); const b = await current(id); const payment = b.payments[0]; if (!payment) throw new ApiError(409, "Payment record not found"); const deadline=addHours(new Date(),settings.paymentDeadlineHours);
  return sql.begin(async(tx)=>{ const p=await tx<any[]>`update public.manual_payments set verification_status='REJECTED', rejection_reason=${reason} where id=${payment.id} returning *`; const booking=await tx<any[]>`update public.bookings set status='AWAITING_PAYMENT', payment_expires_at=${deadline} where id=${id} returning *`; await audit(tx,actorId,"PAYMENT_REJECTED",id,ip,{reason}); return {booking:booking[0],payment:p[0]}; });
}

export async function cancelByAdmin(id:string,actorId:string,reason?:string,ip?:string){ const b=await current(id);assertTransition(b.status,"CANCELLED");return sql.begin(async(tx)=>{const rows=await tx<any[]>`update public.bookings set status='CANCELLED', cancelled_by=${actorId}, cancelled_at=now(), cancellation_reason=${reason??null}, pending_expires_at=null,payment_expires_at=null where id=${id} returning *`;await audit(tx,actorId,"BOOKING_CANCELLED",id,ip,{reason});return rows[0];}); }
export async function updateStayStatus(id:string,actorId:string,status:"CHECKED_IN"|"COMPLETED",ip?:string){const b=await current(id);assertTransition(b.status,status);return sql.begin(async(tx)=>{const rows=await tx<any[]>`update public.bookings set status=${status} where id=${id} returning *`;await audit(tx,actorId,status==='CHECKED_IN'?'BOOKING_CHECKED_IN':'BOOKING_COMPLETED',id,ip,{previousStatus:b.status});return rows[0];});}
