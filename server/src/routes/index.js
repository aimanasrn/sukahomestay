import { Router } from "express";
import adminRoutes from "./adminRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import authRoutes from "./authRoutes.js";
import bookingRoutes from "./bookingRoutes.js";
import propertyRoutes from "./propertyRoutes.js";
import { requireAdminAuth } from "../middleware/requireAdminAuth.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "Sukahomestay API" });
});

router.use("/properties", propertyRoutes);
router.use("/availability", availabilityRoutes);
router.use("/bookings", bookingRoutes);
router.use("/admin/auth", authRoutes);
router.use("/admin", requireAdminAuth, adminRoutes);

export default router;
