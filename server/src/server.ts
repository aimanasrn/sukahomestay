import { app } from "./app.js";
import { env } from "./config/env.js";
import { sql } from "./config/database.js";
import { startReservationExpiryJob } from "./jobs/reservation-expiry.job.js";

const server = app.listen(env.PORT, () =>
  console.log(`SUKA HOMESTAY API listening on http://localhost:${env.PORT}`),
);
startReservationExpiryJob();
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down`);
  server.close(() => void sql.end().finally(() => process.exit(0)));
};
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
