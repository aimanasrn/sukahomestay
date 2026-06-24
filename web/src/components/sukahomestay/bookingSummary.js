import { contactInfo } from "@/components/sukahomestay/publicSiteContent";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function formatCurrency(value, locale = "en-MY") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function getBookingTypeLabel(type, language = "en") {
  const labels = {
    ms: {
      homestay: "Homestay",
      roomstay: "Roomstay",
      whole_house: "Satu Rumah",
    },
    en: {
      homestay: "Homestay",
      roomstay: "Roomstay",
      whole_house: "Whole House",
    },
  };

  return labels[language]?.[type] || labels.en[type] || type;
}

export function formatDisplayDate(value, locale = "en-MY") {
  if (!value) return "-";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getNightsBetween(checkInDate, checkOutDate) {
  if (!checkInDate || !checkOutDate) {
    return 0;
  }

  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0;
  }

  return Math.max(0, Math.round((end - start) / DAY_IN_MS));
}

export function getBookingPricing({
  bookingType,
  roomId = "",
  checkInDate,
  checkOutDate,
  properties = [],
  roomOptions = [],
}) {
  const property = properties.find((item) => item.type === bookingType);
  const room =
    bookingType === "roomstay"
      ? roomOptions.find((item) => item.id === roomId) || null
      : null;
  const nightlyRate = Number(
    bookingType === "roomstay"
      ? room?.pricePerNight || 0
      : property?.pricePerNight || 0
  );
  const nights = getNightsBetween(checkInDate, checkOutDate);
  const totalAmount = nightlyRate * nights;

  return {
    bookingTypeLabel: getBookingTypeLabel(bookingType),
    nightlyRate,
    nights,
    totalAmount,
    roomName: room?.name || "",
  };
}

export function buildWhatsAppBookingHref({
  bookingId = "",
  fullName = "",
  phone = "",
  guestCount = "",
  bookingType = "homestay",
  roomId = "",
  roomName = "",
  checkInDate = "",
  checkOutDate = "",
  nights = 0,
  totalAmount = 0,
  language = "en",
  dateLocale = "en-MY",
}) {
  const labels =
    language === "ms"
      ? {
          greeting: "Hello Admin, saya mahu sahkan bayaran tempahan secara manual.",
          bookingId: "ID Tempahan",
          name: "Nama",
          phone: "Telefon",
          bookingType: "Jenis tempahan",
          room: "Bilik",
          roomId: "ID bilik",
          checkIn: "Daftar masuk",
          checkOut: "Daftar keluar",
          guests: "Tetamu",
          nights: "Jumlah malam",
          total: "Jumlah perlu dibayar",
        }
      : {
          greeting: "Hello Admin, I want to confirm my booking payment manually.",
          bookingId: "Booking ID",
          name: "Name",
          phone: "Phone",
          bookingType: "Booking type",
          room: "Room",
          roomId: "Room ID",
          checkIn: "Check-in",
          checkOut: "Check-out",
          guests: "Guests",
          nights: "Nights",
          total: "Total to pay",
        };

  const lines = [
    labels.greeting,
    bookingId ? `${labels.bookingId}: ${bookingId}` : null,
    `${labels.name}: ${fullName || "-"}`,
    `${labels.phone}: ${phone || "-"}`,
    `${labels.bookingType}: ${getBookingTypeLabel(bookingType, language)}`,
    roomName ? `${labels.room}: ${roomName}` : roomId ? `${labels.roomId}: ${roomId}` : null,
    `${labels.checkIn}: ${checkInDate ? formatDisplayDate(checkInDate, dateLocale) : "-"}`,
    `${labels.checkOut}: ${checkOutDate ? formatDisplayDate(checkOutDate, dateLocale) : "-"}`,
    `${labels.guests}: ${guestCount || "-"}`,
    `${labels.nights}: ${nights || 0}`,
    `${labels.total}: ${formatCurrency(totalAmount, dateLocale)}`,
  ].filter(Boolean);

  return `${contactInfo.whatsappHref}?text=${encodeURIComponent(
    lines.join("\n")
  )}`;
}
