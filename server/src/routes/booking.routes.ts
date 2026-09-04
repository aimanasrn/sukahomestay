import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as controller from "../controllers/booking.controller.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../utils/async-handler.js";
export const bookingRouter = Router();
bookingRouter.post("/quote", asyncHandler(controller.quote));
bookingRouter.post("/reserve", optionalAuth, asyncHandler(controller.create));
bookingRouter.post(
  "/lookup",
  rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }),
  asyncHandler(controller.lookup),
);
bookingRouter.get("/mine", requireAuth, asyncHandler(controller.mine));
bookingRouter.post("/:id/cancel", requireAuth, asyncHandler(controller.cancel));
