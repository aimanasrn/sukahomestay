import { Router } from "express";
import {
  getAvailability,
  getAvailabilityCalendar,
} from "../controllers/availabilityController.js";

const router = Router();

router.get("/calendar", getAvailabilityCalendar);
router.get("/", getAvailability);

export default router;
