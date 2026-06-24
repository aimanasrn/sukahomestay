import { Router } from "express";
import {
  deleteAvailabilityRuleAdmin,
  getAdminDashboard,
  getAvailabilityRulesAdmin,
  getBookingsAdmin,
  getPropertiesAdmin,
  patchBookingAdmin,
  postAvailabilityRuleAdmin,
} from "../controllers/adminController.js";

const router = Router();

router.get("/dashboard", getAdminDashboard);
router.get("/bookings", getBookingsAdmin);
router.patch("/bookings/:bookingId", patchBookingAdmin);
router.get("/availability-rules", getAvailabilityRulesAdmin);
router.post("/availability-rules", postAvailabilityRuleAdmin);
router.delete("/availability-rules/:ruleId", deleteAvailabilityRuleAdmin);
router.get("/properties", getPropertiesAdmin);

export default router;
