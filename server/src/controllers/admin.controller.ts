import type { Request, Response } from "express";
import { subMonths } from "date-fns";
import { z } from "zod";
import { sql } from "../config/database.js";
import { ok } from "../utils/response.js";
import { ApiError } from "../utils/api-error.js";
import * as workflow from "../services/admin-booking.service.js";
import { loadBooking } from "../services/booking.service.js";
import { createReceiptSignedUrl } from "../services/storage.service.js";
import { DEFAULT_TEMPLATES, getReservationSettings, saveReservationSettings } from "../services/settings.service.js";

const propertySchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(20),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  maxGuests: z.number().int().positive(),
  bedrooms: z.number().int().positive(),
  bathrooms: z.number().int().positive(),
  basePriceSen: z.number().int().nonnegative(),
  cleaningFeeSen: z.number().int().nonnegative().default(0),
  securityDepositSen: z.number().int().nonnegative().default(0),
  houseRules: z.string().min(3),
  cancellationPolicy: z.string().min(3),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});
const blockSchema = z
  .object({
    propertyId: z.uuid(),
    roomId: z.uuid().optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    type: z.enum(["OWNER_BLOCK", "MAINTENANCE"]),
    note: z.string().max(500).optional(),
  })
  .refine((value) => value.endDate > value.startDate, {
    path: ["endDate"],
    message: "End date must be after start date",
  });
const roomSchema = z.object({ name:z.string().min(2), roomType:z.string().min(2), capacity:z.coerce.number().int().positive(), bedConfig:z.string().min(2), priceSen:z.coerce.number().int().nonnegative(), availableUnits:z.coerce.number().int().positive().default(1), active:z.boolean().default(true) });
const ratePlanSchema = z.object({ name:z.string().min(2), weekdayPriceSen:z.coerce.number().int().nonnegative(), weekendPriceSen:z.coerce.number().int().nonnegative(), publicHolidayPriceSen:z.coerce.number().int().nonnegative().optional(), extraGuestFeeSen:z.coerce.number().int().nonnegative().default(0), includedGuests:z.coerce.number().int().positive().default(2), minimumStay:z.coerce.number().int().positive().default(1), maximumStay:z.coerce.number().int().positive().default(30), active:z.boolean().default(true) }).refine(v=>v.maximumStay>=v.minimumStay,{path:["maximumStay"],message:"Maximum stay must not be shorter than minimum stay"});
const reasonSchema = z.object({ reason: z.string().trim().min(3).max(1000) });
const stayStatusSchema = z.object({ status: z.enum(["CHECKED_IN", "COMPLETED"]) });
const expirySchema = z.object({ hours: z.coerce.number().int().positive().max(720).default(24), autoExpiryDisabled: z.boolean().default(false) });
const datesSchema = z.object({ checkIn: z.coerce.date(), checkOut: z.coerce.date() }).refine((value) => value.checkOut > value.checkIn, { path: ["checkOut"], message: "Check-out must be after check-in" });
const paymentSchema = z.object({
  paymentMethod: z.string().trim().max(50).optional(),
  bankName: z.string().trim().max(100).optional(),
  transactionReference: z.string().trim().max(100).optional(),
  amountSen: z.coerce.number().int().positive().optional(),
  paymentDate: z.coerce.date().optional(),
  receiptPath: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|jpeg|png|webp|pdf)$/i).optional(),
  internalNotes: z.string().trim().max(1000).optional(),
});
const settingsSchema = z.object({
  whatsappNumber: z.string().regex(/^60\d{8,11}$/),
  bankName: z.string().max(100),
  bankAccountName: z.string().max(120),
  bankAccountNumber: z.string().max(50),
  duitNowId: z.string().max(100),
  pendingApprovalHours: z.coerce.number().int().positive().max(168),
  paymentDeadlineHours: z.coerce.number().int().positive().max(720),
  depositPercentage: z.coerce.number().min(0).max(100),
  fullPaymentRequired: z.boolean(),
  checkInTime: z.string().regex(/^\d{2}:\d{2}$/),
  checkOutTime: z.string().regex(/^\d{2}:\d{2}$/),
  cancellationPolicy: z.string().max(4000),
  templates: z.object({ approved: z.string().min(20), confirmed: z.string().min(20), rejected: z.string().min(20) }).default(DEFAULT_TEMPLATES),
});

export async function dashboard(_req: Request, res: Response) {
  const [stats, recent] = await Promise.all([
    sql<any[]>`select
      (select coalesce(sum(amount_sen),0) from public.manual_payments where verification_status='VERIFIED' and verified_at >= date_trunc('month',now()))::int as revenue,
      (select count(*) from public.bookings)::int as bookings,
      (select count(*) from public.bookings where status in ('PENDING_APPROVAL','AWAITING_PAYMENT','PAYMENT_SUBMITTED'))::int as pending,
      (select count(*) from public.bookings where status='CONFIRMED')::int as confirmed,
      (select count(*) from public.properties where status='PUBLISHED')::int as properties`,
    sql<any[]>`select b.id,b.booking_reference as reference,b.status,b.created_at as "createdAt",b.guest_name,b.guest_phone,p.name as property_name from public.bookings b join public.properties p on p.id=b.property_id order by b.created_at desc limit 6`,
  ]);
  const { revenue, bookings, pending, confirmed, properties } = stats[0];
  return ok(res, {
    revenueThisMonthSen: revenue,
    bookings,
    pending,
    confirmed,
    properties,
    occupancyRate: properties
      ? Math.min(100, Math.round((confirmed / (properties * 30)) * 100))
      : 0,
    recent: recent.map((b)=>({...b,property:{name:b.property_name},guests:[{fullName:b.guest_name,phone:b.guest_phone}]})),
    rangeStart: subMonths(new Date(), 5),
  });
}
export async function createProperty(req: Request, res: Response) {
  const p=propertySchema.parse(req.body);
  const rows=await sql<any[]>`insert into public.properties(name,slug,description,address,city,state,max_guests,bedrooms,bathrooms,base_price_sen,cleaning_fee_sen,security_deposit_sen,house_rules,cancellation_policy,status) values(${p.name},${p.slug},${p.description},${p.address},${p.city},${p.state},${p.maxGuests},${p.bedrooms},${p.bathrooms},${p.basePriceSen},${p.cleaningFeeSen},${p.securityDepositSen},${p.houseRules},${p.cancellationPolicy},${p.status}) returning *`;
  await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id) values(${req.auth!.userId},'PROPERTY_CREATED','Property',${rows[0].id})`;
  return ok(res,rows[0],"Property created",201);
}
export async function updateProperty(req:Request,res:Response){const p=propertySchema.parse(req.body);const rows=await sql<any[]>`update public.properties set name=${p.name},slug=${p.slug},description=${p.description},address=${p.address},city=${p.city},state=${p.state},max_guests=${p.maxGuests},bedrooms=${p.bedrooms},bathrooms=${p.bathrooms},base_price_sen=${p.basePriceSen},cleaning_fee_sen=${p.cleaningFeeSen},security_deposit_sen=${p.securityDepositSen},house_rules=${p.houseRules},cancellation_policy=${p.cancellationPolicy},status=${p.status} where id=${String(req.params.id)} returning *`;if(!rows[0])throw new ApiError(404,"Property not found");await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id) values(${req.auth!.userId},'PROPERTY_UPDATED','Property',${String(req.params.id)})`;return ok(res,rows[0],"Property updated");}
export async function createRoom(req:Request,res:Response){const room=roomSchema.parse(req.body);const propertyId=String(req.params.propertyId);const rows=await sql<any[]>`insert into public.rooms(property_id,name,room_type,capacity,bed_config,price_sen,available_units,active) values(${propertyId},${room.name},${room.roomType},${room.capacity},${room.bedConfig},${room.priceSen},${room.availableUnits},${room.active}) returning *`;await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id,metadata) values(${req.auth!.userId},'ROOM_CREATED','Room',${rows[0].id},jsonb_build_object('propertyId',${propertyId}))`;return ok(res,rows[0],"Room created",201);}
export async function updateRoom(req:Request,res:Response){const room=roomSchema.parse(req.body);const id=String(req.params.id);const rows=await sql<any[]>`update public.rooms set name=${room.name},room_type=${room.roomType},capacity=${room.capacity},bed_config=${room.bedConfig},price_sen=${room.priceSen},available_units=${room.availableUnits},active=${room.active} where id=${id} returning *`;if(!rows[0])throw new ApiError(404,"Room not found");await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id) values(${req.auth!.userId},'ROOM_UPDATED','Room',${id})`;return ok(res,rows[0],"Room updated");}
export async function updateRatePlan(req:Request,res:Response){const plan=ratePlanSchema.parse(req.body);const id=String(req.params.id);const rows=await sql<any[]>`update public.rate_plans set name=${plan.name},weekday_price_sen=${plan.weekdayPriceSen},weekend_price_sen=${plan.weekendPriceSen},public_holiday_price_sen=${plan.publicHolidayPriceSen??null},extra_guest_fee_sen=${plan.extraGuestFeeSen},included_guests=${plan.includedGuests},minimum_stay=${plan.minimumStay},maximum_stay=${plan.maximumStay},active=${plan.active} where id=${id} returning *`;if(!rows[0])throw new ApiError(404,"Rate plan not found");await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id) values(${req.auth!.userId},'RATE_PLAN_UPDATED','RatePlan',${id})`;return ok(res,rows[0],"Pricing updated");}
export async function blockDates(req: Request, res: Response) {
  const input = blockSchema.parse(req.body);
  const rows=await sql<any[]>`insert into public.availability_blocks(property_id,room_id,start_date,end_date,type,note,created_by) values(${input.propertyId},${input.roomId??null}::uuid,${input.startDate}::date,${input.endDate}::date,${input.type},${input.note??null},${req.auth!.userId}) returning *`;
  await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id) values(${req.auth!.userId},'AVAILABILITY_BLOCK_CREATED','AvailabilityBlock',${rows[0].id})`;
  return ok(res,rows[0],"Dates blocked",201);
}
export async function bookings(_req: Request, res: Response) {
  return ok(
    res,
    await sql<any[]>`select b.*,b.booking_reference as reference,b.check_in as "checkIn",b.check_out as "checkOut",b.total_amount as "totalSen",p.name as property_name from public.bookings b join public.properties p on p.id=b.property_id order by b.created_at desc limit 100`,
  );
}

export async function booking(req: Request, res: Response) {
  const record = await loadBooking(sql, String(req.params.id));
  return ok(res, record);
}

export async function approveBooking(req: Request, res: Response) {
  return ok(res, await workflow.approve(String(req.params.id), req.auth!.userId, req.ip), "Reservation approved");
}
export async function contactCustomer(req: Request, res: Response) {
  return ok(res, await workflow.contactCustomer(String(req.params.id)));
}
export async function rejectBooking(req: Request, res: Response) {
  const { reason } = reasonSchema.parse(req.body);
  return ok(res, await workflow.reject(String(req.params.id), req.auth!.userId, reason, req.ip), "Reservation rejected");
}
export async function extendExpiry(req: Request, res: Response) {
  const input = expirySchema.parse(req.body);
  return ok(res, await workflow.extendExpiry(String(req.params.id), req.auth!.userId, input.hours, input.autoExpiryDisabled, req.ip), "Reservation expiry updated");
}
export async function editDates(req: Request, res: Response) {
  const input = datesSchema.parse(req.body);
  return ok(res, await workflow.editDates(String(req.params.id), req.auth!.userId, input.checkIn, input.checkOut, req.ip), "Reservation dates updated");
}
export async function submitPayment(req: Request, res: Response) {
  return ok(res, await workflow.submitPayment(String(req.params.id), req.auth!.userId, paymentSchema.parse(req.body), req.ip), "Payment recorded for verification");
}
export async function verifyPayment(req: Request, res: Response) {
  return ok(res, await workflow.verifyPayment(String(req.params.id), req.auth!.userId, req.ip), "Payment verified and booking confirmed");
}
export async function rejectPayment(req: Request, res: Response) {
  const { reason } = reasonSchema.parse(req.body);
  return ok(res, await workflow.rejectPayment(String(req.params.id), req.auth!.userId, reason, req.ip), "Payment rejected");
}
export async function cancelBooking(req: Request, res: Response) {
  const reason = z.object({ reason: z.string().trim().max(1000).optional() }).parse(req.body).reason;
  return ok(res, await workflow.cancelByAdmin(String(req.params.id), req.auth!.userId, reason, req.ip), "Booking cancelled");
}
export async function updateStayStatus(req: Request, res: Response) {
  const { status } = stayStatusSchema.parse(req.body);
  return ok(res, await workflow.updateStayStatus(String(req.params.id), req.auth!.userId, status, req.ip), "Booking status updated");
}
export async function settings(_req: Request, res: Response) {
  return ok(res, await getReservationSettings());
}
export async function updateSettings(req: Request, res: Response) {
  const value = settingsSchema.parse(req.body);
  const saved = await saveReservationSettings(value);
  await sql`insert into public.audit_logs(actor_id,action,entity_type,entity_id,ip_address,metadata) values(${req.auth!.userId},'RESERVATION_SETTINGS_CHANGED','AppSetting',${saved.id},${req.ip??null}::inet,${sql.json({changedKeys:Object.keys(value)})})`;
  return ok(res, value, "Settings updated");
}

export async function calendar(_req: Request, res: Response) {
  const [bookings, blocks] = await Promise.all([
    sql<any[]>`select b.id,b.booking_reference as reference,b.status,b.check_in as "checkIn",b.check_out as "checkOut",b.property_id as "propertyId",coalesce(jsonb_agg(jsonb_build_object('roomId',bi.room_id)) filter(where bi.id is not null),'[]') as items from public.bookings b left join public.booking_items bi on bi.booking_id=b.id group by b.id`,
    sql<any[]>`select * from public.availability_blocks`,
  ]);
  return ok(res, { bookings, blocks });
}
export async function receiptUrl(req: Request, res: Response) {
  return ok(res, await createReceiptSignedUrl(String(req.params.id)));
}
