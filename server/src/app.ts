import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env.js";
import { propertyRouter } from "./routes/property.routes.js";
import { bookingRouter } from "./routes/booking.routes.js";
import { adminRouter } from "./routes/admin.routes.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { ok } from "./utils/response.js";

export const app = express();
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL }));
app.use(
  rateLimit({
    windowMs: 15 * 60_000,
    limit: 250,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);
app.use(
  pinoHttp({
    redact: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.token",
    ],
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false }));
app.get("/api/v1/health", (_req, res) =>
  ok(res, { status: "healthy", timestamp: new Date().toISOString() }),
);
app.use("/api/v1/properties", propertyRouter);
app.use("/api/v1/bookings", bookingRouter);
app.use("/api/v1/admin", adminRouter);
app.use(notFound);
app.use(errorHandler);
