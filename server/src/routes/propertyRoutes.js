import { Router } from "express";
import {
  getHomestay,
  getProperties,
  getRoomstay,
} from "../controllers/propertyController.js";

const router = Router();

router.get("/", getProperties);
router.get("/homestay", getHomestay);
router.get("/roomstay", getRoomstay);

export default router;
