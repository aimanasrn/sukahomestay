import type { BookingStatus } from "../../types/domain.js";
import { format } from "date-fns";

export const BLOCKING_STATUSES: BookingStatus[] = [
  "PENDING_APPROVAL",
  "AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "CHECKED_IN",
];

export const RELEASING_STATUSES: BookingStatus[] = [
  "REJECTED",
  "CANCELLED",
  "EXPIRED",
  "COMPLETED",
];

const transitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING_APPROVAL: ["AWAITING_PAYMENT", "REJECTED", "CANCELLED", "EXPIRED"],
  AWAITING_PAYMENT: ["PAYMENT_SUBMITTED", "CANCELLED", "EXPIRED"],
  PAYMENT_SUBMITTED: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CHECKED_IN", "CANCELLED"],
  CHECKED_IN: ["COMPLETED"],
  COMPLETED: [],
  REJECTED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export const canTransition = (from: BookingStatus, to: BookingStatus) =>
  transitions[from].includes(to);

export function normalizeMalaysianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  const normalized = digits.startsWith("60")
    ? digits
    : digits.startsWith("0")
      ? `6${digits}`
      : `60${digits}`;
  if (!/^601\d{8,9}$/.test(normalized)) {
    throw new Error("Enter a valid Malaysian mobile number");
  }
  return normalized;
}

export const formatMalaysiaDate = (date: Date) => format(date, "dd/MM/yyyy");
export const formatRinggit = (sen: number) => (sen / 100).toFixed(2);

export function inventoryConflicts(
  requested: { inventoryType: "ENTIRE_PROPERTY" | "ROOM"; roomId?: string },
  existing: { inventoryType: "ENTIRE_PROPERTY" | "ROOM"; roomId?: string },
) {
  if (requested.inventoryType === "ENTIRE_PROPERTY" || existing.inventoryType === "ENTIRE_PROPERTY") return true;
  return Boolean(requested.roomId && requested.roomId === existing.roomId);
}

export function reservationBlocksAvailability(input: {
  status: BookingStatus;
  expiresAt: Date | null;
  autoExpiryDisabled?: boolean;
}, now = new Date()) {
  if (!BLOCKING_STATUSES.includes(input.status)) return false;
  if (["PAYMENT_SUBMITTED", "CONFIRMED", "CHECKED_IN"].includes(input.status)) return true;
  return Boolean(input.autoExpiryDisabled || (input.expiresAt && input.expiresAt > now));
}
