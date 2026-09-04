import type { Request, Response } from "express";
import * as repository from "../repositories/property.repository.js";
import { searchSchema } from "../schemas/booking.schema.js";
import { availableProperties } from "../services/availability.service.js";
import { ApiError } from "../utils/api-error.js";
import { ok } from "../utils/response.js";
export async function list(req: Request, res: Response) {
  if (req.query.checkIn)
    return ok(res, await availableProperties(searchSchema.parse(req.query)));
  return ok(res, await repository.listPublished());
}
export async function detail(req: Request, res: Response) {
  const property = await repository.bySlug(String(req.params.slug));
  if (!property) throw new ApiError(404, "Property not found");
  return ok(res, property);
}
