import { Router } from "express";
import { getAdminMe, postAdminLogin } from "../controllers/authController.js";
import { requireAdminAuth } from "../middleware/requireAdminAuth.js";

const router = Router();

router.post("/login", postAdminLogin);
router.get("/me", requireAdminAuth, getAdminMe);

export default router;
