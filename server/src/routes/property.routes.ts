import { Router } from "express";
import * as controller from "../controllers/property.controller.js";
import { asyncHandler } from "../utils/async-handler.js";
export const propertyRouter = Router();
propertyRouter.get("/", asyncHandler(controller.list));
propertyRouter.get("/:slug", asyncHandler(controller.detail));
