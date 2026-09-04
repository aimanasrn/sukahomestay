import { z } from "zod";
import { normalizeMalaysianPhone } from "../modules/bookings/reservation-rules.js";

const dateOnly = z.coerce.date();
export const searchSchema = z
  .object({
    checkIn: dateOnly,
    checkOut: dateOnly,
    guests: z.coerce.number().int().positive().max(30),
  })
  .refine((value) => value.checkOut > value.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  });
export const quoteSchema = searchSchema
  .and(
    z.object({
      propertyId: z.uuid(),
      inventoryType: z.enum(["ENTIRE_PROPERTY", "ROOM"]),
      roomId: z.uuid().optional(),
    }),
  )
  .refine((value) => value.inventoryType !== "ROOM" || Boolean(value.roomId), {
    message: "Room is required",
    path: ["roomId"],
  });
const malaysiaPhone = z.string().trim().refine((value) => {
  try {
    normalizeMalaysianPhone(value);
    return true;
  } catch {
    return false;
  }
}, "Enter a valid Malaysian mobile number");

export const createBookingSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    propertyId: z.uuid(),
    inventoryType: z.enum(["ENTIRE_PROPERTY", "ROOM"]),
    roomId: z.uuid().optional(),
    checkIn: dateOnly,
    checkOut: dateOnly,
    adultCount: z.coerce.number().int().positive().max(30),
    childCount: z.coerce.number().int().nonnegative().max(30),
    specialRequests: z.string().trim().max(1000).optional(),
    houseRulesAccepted: z.literal(true),
    cancellationPolicyAccepted: z.literal(true),
    privacyPolicyAccepted: z.literal(true),
    guest: z.object({
      fullName: z.string().trim().min(2).max(120),
      email: z.email(),
      phone: malaysiaPhone,
    }),
  })
  .refine((value) => value.checkOut > value.checkIn, {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })
  .refine((value) => value.inventoryType !== "ROOM" || Boolean(value.roomId), {
    message: "Room is required",
    path: ["roomId"],
  });

export const guestLookupSchema = z.object({
  reference: z.string().trim().regex(/^SUKA-\d{8}-[A-Z0-9]{4}$/i),
  contact: z.string().trim().min(5).max(150),
});
