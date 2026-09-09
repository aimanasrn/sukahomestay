export type Lang = "ms" | "en";
export type Resource = "MAIN" | "ROOM_A" | "ROOM_B" | "ROOM_C";
export type PackageId = Resource | "WHOLE";
export const resources: Resource[] = ["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"];
export type Status =
  "pending" | "confirmed" | "cancelled" | "rejected" | "expired";
export type PaymentStatus = "unpaid" | "partially_paid" | "paid" | "refunded";
export interface Accommodation {
  id: PackageId;
  bedrooms: number;
  bathrooms: number;
  capacity: number | null;
  rate: number;
  weekend_rate: number | null;
  addon_rate: number | null;
  amenities: string[];
  description: Record<Lang, string>;
  photos: string[];
}
export interface Settings {
  whatsapp: string;
  address: string;
  map_url: string;
  contact_email: string;
  check_in: string;
  check_out: string;
  policies: Record<Lang, string>;
  rules: Record<Lang, string>;
  cleaning_fee: number;
  deposit_percent: number;
  hold_minutes: number;
  booking_enabled: boolean;
  demo_rates: boolean;
  policy_version: string;
}
export interface RateRule {
  id: string;
  package_id: PackageId;
  start_date: string;
  end_date: string;
  nightly_sen: number;
}
export interface Catalog {
  accommodations: Accommodation[];
  settings: Settings;
  rate_rules: RateRule[];
}
export interface BookingInput {
  check_in: string;
  check_out: string;
  resources: Resource[];
  adults: number;
  children: number;
  name: string;
  phone: string;
  email: string;
  special_requests: string;
  accepted: boolean;
  policy_version: string;
  language: Lang;
  idempotency_key: string;
}
export interface PriceItem {
  label: string;
  quantity: number;
  unit_sen: number;
  total_sen: number;
}
export interface Quote {
  items: PriceItem[];
  total_sen: number;
  deposit_sen: number;
  nights: number;
  bedrooms: number;
  bathrooms: number;
  package_id: PackageId;
}
export interface Booking extends BookingInput {
  id: string;
  reference: string;
  status: Status;
  payment_status: PaymentStatus;
  created_at: string;
  expires_at: string;
  quote: Quote;
  notes: string;
  paid_sen: number;
  whatsapp: string;
}
export interface Allocation {
  id: string;
  resource_id: Resource;
  check_in: string;
  check_out: string;
  kind: "booking" | "maintenance" | "owner";
  booking_id?: string;
  label?: string;
  state?: "pending" | "unavailable";
  expires_at?: string | null;
}
export const names: Record<PackageId, Record<Lang, string>> = {
  MAIN: { ms: "Homestay Utama", en: "Homestay Utama" },
  ROOM_A: { ms: "Roomstay 1", en: "Roomstay 1" },
  ROOM_B: { ms: "Roomstay 2", en: "Roomstay 2" },
  ROOM_C: { ms: "Roomstay 3", en: "Roomstay 3" },
  WHOLE: { ms: "Seluruh Rumah", en: "Whole House" },
};
export function selectedResources(id: PackageId): Resource[] {
  return id === "WHOLE" ? [...resources] : [id];
}
export function canonicalPackage(ids: Resource[]): PackageId {
  return resources.every((r) => ids.includes(r))
    ? "WHOLE"
    : ids.includes("MAIN")
      ? "MAIN"
      : ids[0];
}
export function overlaps(a: string, b: string, c: string, d: string) {
  return a < d && c < b;
}
export function nightsBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}
export function malaysiaDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function addDays(day: string, days: number) {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function dateAfter(days = 0) {
  return addDays(malaysiaDate(), days);
}
export function money(sen: number, lang: Lang = "ms") {
  return new Intl.NumberFormat(lang === "ms" ? "ms-MY" : "en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: sen % 100 === 0 ? 0 : 2,
  }).format(sen / 100);
}
export function formatDate(value: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value.length === 10 ? `${value}T12:00:00` : value));
}
export function calculateQuote(
  input: Pick<BookingInput, "check_in" | "check_out" | "resources">,
  catalog: Catalog,
): Quote {
  const nights = nightsBetween(input.check_in, input.check_out);
  if (
    !input.check_in ||
    !input.check_out ||
    !Number.isFinite(nights) ||
    nights < 1 ||
    nights > 60
  )
    throw new Error("INVALID_DATES");
  const ids = [...new Set(input.resources)];
  if (
    !ids.length ||
    ids.some((r) => !resources.includes(r)) ||
    ids.length !== input.resources.length
  )
    throw new Error("INVALID_RESOURCES");
  const package_id = canonicalPackage(ids);
  const targets: PackageId[] = package_id === "WHOLE" ? ["WHOLE"] : ids;
  const items: PriceItem[] = [];
  for (const id of targets) {
    const a = catalog.accommodations.find((a) => a.id === id)!;
    for (let n = 0; n < nights; n++) {
      const dt = new Date(`${input.check_in}T12:00:00Z`);
      dt.setUTCDate(dt.getUTCDate() + n);
      const day = dt.toISOString().slice(0, 10);
      const override = catalog.rate_rules.find(
        (r) => r.package_id === id && r.start_date <= day && r.end_date > day,
      );
      const weekend = [0, 6].includes(dt.getUTCDay());
      const unit =
        override?.nightly_sen ??
        (weekend ? a.weekend_rate : null) ??
        (id !== "MAIN" && id !== "WHOLE" && ids.includes("MAIN")
          ? a.addon_rate
          : null) ??
        a.rate;
      items.push({
        label: `${id}|${day}`,
        quantity: 1,
        unit_sen: unit,
        total_sen: unit,
      });
    }
  }
  if (catalog.settings.cleaning_fee)
    items.push({
      label: "cleaning",
      quantity: 1,
      unit_sen: catalog.settings.cleaning_fee,
      total_sen: catalog.settings.cleaning_fee,
    });
  const total_sen = items.reduce((s, i) => s + i.total_sen, 0);
  return {
    items,
    total_sen,
    deposit_sen: Math.round(
      (total_sen * catalog.settings.deposit_percent) / 100,
    ),
    nights,
    bedrooms: ids.reduce((s, r) => s + (r === "MAIN" ? 4 : 1), 0),
    bathrooms: ids.reduce((s, r) => s + (r === "MAIN" ? 3 : 1), 0),
    package_id,
  };
}
export function whatsappMessage(b: Booking, lang: Lang) {
  const selected = b.resources.map((r) => names[r][lang]).join(" + ");
  const q = b.quote;
  return lang === "ms"
    ? `Salam Suka Room&Homestay!\nRujukan: ${b.reference}\nNama: ${b.name}\nTelefon: ${b.phone}\nTarikh: ${formatDate(b.check_in, lang)} – ${formatDate(b.check_out, lang)}\n${q.nights} malam · ${b.adults} dewasa, ${b.children} kanak-kanak\nPenginapan: ${selected}\n${q.bedrooms} bilik tidur · ${q.bathrooms} bilik air\nAnggaran jumlah: ${money(q.total_sen, lang)}\nDeposit: ${money(q.deposit_sen, lang)}\nPermintaan khas: ${b.special_requests || "—"}\nMenunggu semakan pembayaran dan pengesahan admin.`
    : `Hello Suka Room&Homestay!\nReference: ${b.reference}\nName: ${b.name}\nPhone: ${b.phone}\nDates: ${formatDate(b.check_in, lang)} – ${formatDate(b.check_out, lang)}\n${q.nights} nights · ${b.adults} adults, ${b.children} children\nAccommodation: ${selected}\n${q.bedrooms} bedrooms · ${q.bathrooms} bathrooms\nEstimated total: ${money(q.total_sen, lang)}\nDeposit: ${money(q.deposit_sen, lang)}\nSpecial requests: ${b.special_requests || "—"}\nAwaiting payment review and admin confirmation.`;
}

export function whatsappEnquiry(b: BookingInput, lang: Lang) {
  const ms = lang === "ms";
  return [
    ms
      ? "Salam admin Suka Room&Homestay! Saya ingin bertanya tentang tempahan penginapan."
      : "Hello Suka Room&Homestay admin! I would like to enquire about a stay booking.",
    `${ms ? "Penginapan" : "Accommodation"}: ${b.resources.map((r) => names[r][lang]).join(" + ")}`,
    b.check_in &&
      `${ms ? "Tarikh masuk" : "Check-in"}: ${formatDate(b.check_in, lang)}`,
    b.check_out &&
      `${ms ? "Tarikh keluar" : "Check-out"}: ${formatDate(b.check_out, lang)}`,
    `${b.adults} ${ms ? "dewasa" : "adults"}, ${b.children} ${ms ? "kanak-kanak" : "children"}`,
    b.name && `${ms ? "Nama" : "Name"}: ${b.name}`,
    b.phone && `${ms ? "Telefon" : "Phone"}: ${b.phone}`,
    b.special_requests &&
      `${ms ? "Permintaan khas" : "Special requests"}: ${b.special_requests}`,
    ms
      ? "Ini pertanyaan tempahan; belum disahkan."
      : "This is a booking enquiry; not yet confirmed.",
  ]
    .filter(Boolean)
    .join("\n");
}
