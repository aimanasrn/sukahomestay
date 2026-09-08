import {
  addDays,
  malaysiaDate,
  nightsBetween,
  overlaps,
  type Allocation,
  type Resource,
} from "./domain";

export function nightState(
  day: string,
  ids: Resource[],
  rows: Allocation[],
  now = Date.now(),
) {
  const matches = rows.filter(
    (a) =>
      ids.includes(a.resource_id) &&
      a.check_in <= day &&
      day < a.check_out &&
      !(
        a.state === "pending" &&
        a.expires_at &&
        Date.parse(a.expires_at) <= now
      ),
  );
  return matches.some((a) => a.state !== "pending")
    ? "unavailable"
    : matches.length
      ? "pending"
      : "available";
}
export function rangeError(
  ci: string,
  co: string,
  ids: Resource[],
  rows: Allocation[],
  today = malaysiaDate(),
) {
  const n = nightsBetween(ci, co);
  if (!ci || !co || !Number.isFinite(n) || n < 1 || n > 60 || ci < today)
    return "INVALID_DATES";
  return rows.some(
    (a) =>
      ids.includes(a.resource_id) &&
      overlaps(ci, co, a.check_in, a.check_out) &&
      !(
        a.state === "pending" &&
        a.expires_at &&
        Date.parse(a.expires_at) <= Date.now()
      ),
  )
    ? "RANGE_BLOCKED"
    : "";
}
export function monthStart(day: string, offset = 0) {
  const d = new Date(`${day.slice(0, 7)}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d.toISOString().slice(0, 10);
}
export function monthDays(month: string) {
  const count = nightsBetween(month, monthStart(month, 1));
  return Array.from({ length: count }, (_, i) => addDays(month, i));
}
