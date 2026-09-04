import { differenceInCalendarDays, format } from "date-fns";
import { formatMalaysiaDate, formatRinggit } from "../modules/bookings/reservation-rules.js";
import type { ReservationSettings } from "./settings.service.js";

type ReservationMessageInput = {
  reference: string;
  propertyName: string;
  selectionName: string;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  subtotalSen: number;
  cleaningFeeSen: number;
  extraGuestFeeSen: number;
  totalSen: number;
  specialRequests?: string | null;
};

export function makeWhatsAppUrl(number: string, message: string) {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function buildReservationMessage(input: ReservationMessageInput) {
  return `Assalamualaikum, saya ingin membuat tempahan SUKA HOMESTAY.

RUJUKAN TEMPAHAN
${input.reference}

MAKLUMAT TEMPAHAN
Homestay: ${input.propertyName}
Pilihan: ${input.selectionName}
Check-in: ${formatMalaysiaDate(input.checkIn)}
Check-out: ${formatMalaysiaDate(input.checkOut)}
Jumlah malam: ${differenceInCalendarDays(input.checkOut, input.checkIn)}
Tetamu: ${input.adultCount} dewasa, ${input.childCount} kanak-kanak

MAKLUMAT PELANGGAN
Nama: ${input.customerName}
No. telefon: ${input.customerPhone}
E-mel: ${input.customerEmail}

RINGKASAN BAYARAN
Harga penginapan: RM${formatRinggit(input.subtotalSen)}
Caj pembersihan: RM${formatRinggit(input.cleaningFeeSen)}
Caj tambahan: RM${formatRinggit(input.extraGuestFeeSen)}
Jumlah keseluruhan: RM${formatRinggit(input.totalSen)}

Permintaan khas:
${input.specialRequests?.trim() || "-"}

Status: Menunggu kelulusan admin

Saya telah menghantar permohonan tempahan melalui laman web SUKA HOMESTAY. Mohon pihak admin semak ketersediaan dan berikan arahan pembayaran. Terima kasih.`;
}

export function renderTemplate(template: string, values: Record<string, string | number | null | undefined>) {
  return template.replace(/\{([a-zA-Z]+)\}/g, (_match, key: string) => String(values[key] ?? "-"));
}

export function adminTemplateValues(booking: {
  reference: string;
  checkIn: Date;
  checkOut: Date;
  totalSen: number;
  property: { name: string };
  guests: Array<{ fullName: string }>;
  paymentDeadline?: Date | null;
}, settings: ReservationSettings, paidAmountSen?: number, rejectionReason?: string) {
  return {
    customerName: booking.guests[0]?.fullName ?? "Tetamu",
    bookingReference: booking.reference,
    propertyName: booking.property.name,
    checkIn: formatMalaysiaDate(booking.checkIn),
    checkOut: formatMalaysiaDate(booking.checkOut),
    totalAmount: formatRinggit(booking.totalSen),
    paymentDeadline: booking.paymentDeadline ? format(booking.paymentDeadline, "dd/MM/yyyy, h:mm a") : "-",
    bankName: settings.bankName,
    accountName: settings.bankAccountName,
    accountNumber: settings.bankAccountNumber,
    paidAmount: formatRinggit(paidAmountSen ?? booking.totalSen),
    rejectionReason,
  };
}
