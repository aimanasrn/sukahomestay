import { sql } from "../config/database.js";
import { env } from "../config/env.js";

export const DEFAULT_TEMPLATES = {
  approved: `Assalamualaikum {customerName},\n\nTempahan anda telah diluluskan.\n\nRujukan: {bookingReference}\nHomestay: {propertyName}\nCheck-in: {checkIn}\nCheck-out: {checkOut}\nJumlah: RM{totalAmount}\n\nSila buat pembayaran sebelum {paymentDeadline}.\n\nMaklumat pembayaran:\nBank: {bankName}\nNama akaun: {accountName}\nNo. akaun: {accountNumber}\n\nSelepas membuat pembayaran, sila hantar resit melalui WhatsApp ini. Tempahan hanya akan disahkan selepas pembayaran disemak oleh admin.`,
  confirmed: `Assalamualaikum {customerName},\n\nPembayaran anda telah diterima dan tempahan SUKA HOMESTAY telah disahkan.\n\nRujukan: {bookingReference}\nHomestay: {propertyName}\nCheck-in: {checkIn}\nCheck-out: {checkOut}\nJumlah dibayar: RM{paidAmount}\nStatus: DISAHKAN\n\nMaklumat check-in akan diberikan sebelum tarikh ketibaan. Terima kasih kerana memilih SUKA HOMESTAY.`,
  rejected: `Assalamualaikum {customerName},\n\nDukacita dimaklumkan bahawa permohonan tempahan berikut tidak dapat diluluskan:\n\nRujukan: {bookingReference}\nHomestay: {propertyName}\nCheck-in: {checkIn}\nCheck-out: {checkOut}\n\nSebab: {rejectionReason}\n\nTarikh tersebut telah dilepaskan semula. Sila hubungi kami jika anda ingin memilih tarikh lain.`,
};

export type ReservationSettings = {
  whatsappNumber: string;
  bankName: string;
  bankAccountName: string;
  bankAccountNumber: string;
  duitNowId: string;
  pendingApprovalHours: number;
  paymentDeadlineHours: number;
  depositPercentage: number;
  fullPaymentRequired: boolean;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  templates: typeof DEFAULT_TEMPLATES;
};

export const DEFAULT_SETTINGS: ReservationSettings = {
  whatsappNumber: env.ADMIN_WHATSAPP_NUMBER,
  bankName: "",
  bankAccountName: "SUKA HOMESTAY",
  bankAccountNumber: "",
  duitNowId: "",
  pendingApprovalHours: env.PENDING_APPROVAL_EXPIRY_HOURS,
  paymentDeadlineHours: env.AWAITING_PAYMENT_EXPIRY_HOURS,
  depositPercentage: 100,
  fullPaymentRequired: true,
  checkInTime: "15:00",
  checkOutTime: "11:00",
  cancellationPolicy: "Rujuk polisi pembatalan pada halaman penginapan.",
  templates: DEFAULT_TEMPLATES,
};

export async function getReservationSettings(): Promise<ReservationSettings> {
  const rows = await sql<{ value: Partial<ReservationSettings> }[]>`select value from public.app_settings where key = 'reservation' limit 1`;
  const saved = rows[0]?.value ?? {};
  return { ...DEFAULT_SETTINGS, ...saved, templates: { ...DEFAULT_TEMPLATES, ...saved.templates } };
}

export async function saveReservationSettings(value: ReservationSettings) {
  const rows = await sql<any[]>`insert into public.app_settings (key, value) values ('reservation', ${sql.json(value as any)}) on conflict (key) do update set value = excluded.value, updated_at = now() returning *`;
  return rows[0];
}
