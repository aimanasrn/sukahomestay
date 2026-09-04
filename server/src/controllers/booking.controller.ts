import type { Request, Response } from "express";
import { createBookingSchema, guestLookupSchema, quoteSchema } from "../schemas/booking.schema.js";
import * as service from "../services/booking.service.js";
import { ok } from "../utils/response.js";
export async function quote(req: Request, res: Response) {
  return ok(
    res,
    await service.quote(quoteSchema.parse(req.body)),
    "Price calculated",
  );
}
export async function create(req: Request, res: Response) {
  return ok(
    res,
    await service.createReservation(req.auth?.userId, createBookingSchema.parse(req.body)),
    "Reservation saved and pending admin approval",
    201,
  );
}
export async function lookup(req: Request, res: Response) {
  return ok(res, await service.lookup(guestLookupSchema.parse(req.body)));
}
export async function mine(req: Request, res: Response) {
  return ok(res, await service.mine(req.auth!.userId));
}
export async function cancel(req: Request, res: Response) {
  return ok(
    res,
    await service.cancel(
      req.auth!.userId,
      String(req.params.id),
      req.body?.reason as string | undefined,
    ),
    "Booking cancelled",
  );
}
