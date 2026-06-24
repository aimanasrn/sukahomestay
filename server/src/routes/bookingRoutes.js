import { Router } from "express";
import { postBooking } from "../controllers/bookingController.js";

const router = Router();

router.post("/", postBooking);

export default router;
