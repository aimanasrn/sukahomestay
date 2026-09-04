import { sql } from "../config/database.js";

export async function expireReservations(now = new Date()) {
  const rows = await sql<{ count: number }[]>`select private.expire_reservations(${now}) as count`;
  return { count: rows[0]?.count ?? 0 };
}

export function startReservationExpiryJob() {
  const run = () => void expireReservations().catch((error) => console.error("Reservation expiry job failed", error));
  run();
  const timer = setInterval(run, 5 * 60_000);
  timer.unref();
  return timer;
}
