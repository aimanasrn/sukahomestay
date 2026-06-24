import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import router from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api", router);
app.use(errorHandler);

export default app;
