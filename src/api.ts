import { createClient } from "@supabase/supabase-js";
import {
  calculateQuote,
  canonicalPackage,
  dateAfter,
  overlaps,
  type Allocation,
  type Booking,
  type BookingInput,
  type Catalog,
  type Resource,
  type Settings,
} from "./domain";
import { demoCatalog } from "./data";
import { withPropertyPhotos } from "./propertyPhotos";
import { demoInvoice, type PaymentInvoice } from "./invoice";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const isDemo = !url && !key;
export function clearDemoBookings() {
  if (!isDemo) return;
  for (const key of ["bookings", "blocks", "payment-keys", "invoices"])
    localStorage.removeItem(`suka.${key}`);
}
const read = <T>(key: string, fallback: T): T => {
  try {
    return (
      JSON.parse(localStorage.getItem(`suka.${key}`) || "null") ?? fallback
    );
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  localStorage.setItem(`suka.${key}`, JSON.stringify(value));
  window.dispatchEvent(new Event("suka:availability"));
};
function demoBookings() {
  const list = read<Booking[]>("bookings", []);
  const clean = list.map((b) =>
    b.status === "pending" && Date.parse(b.expires_at) <= Date.now()
      ? { ...b, status: "expired" as const }
      : b,
  );
  if (clean.some((b, i) => b.status !== list[i].status))
    write("bookings", clean);
  return clean;
}
const fail = (error: unknown) => {
  if (error)
    throw new Error(
      typeof error === "object" && error && "message" in error
        ? String(error.message)
        : "REQUEST_FAILED",
    );
};
export async function getCatalog(): Promise<Catalog> {
  if (Boolean(url) !== Boolean(key)) throw new Error("BOOKING_NOT_CONFIGURED");
  if (!supabase)
    return withPropertyPhotos(structuredClone(read("catalog", demoCatalog)));
  const result = await Promise.all([
    supabase.from("accommodation_packages").select("*"),
    supabase.from("property_settings").select("*").single(),
    supabase.from("accommodation_translations").select("*"),
    supabase.from("accommodation_photos").select("*").order("sort_order"),
    supabase.from("rate_rules").select("*"),
  ]);
  result.forEach((r) => fail(r.error));
  return withPropertyPhotos({
    settings: result[1].data as unknown as Settings,
    rate_rules: result[4].data as unknown as Catalog["rate_rules"],
    accommodations: (result[0].data as unknown as { id: string }[]).map(
      (a) => ({
        ...demoCatalog.accommodations.find((d) => d.id === a.id)!,
        ...a,
        description: Object.fromEntries(
          (
            result[2].data as unknown as {
              package_id: string;
              language: string;
              description: string;
            }[]
          )
            .filter((t) => t.package_id === a.id)
            .map((t) => [t.language, t.description]),
        ),
        photos: (
          result[3].data as unknown as { package_id: string; url: string }[]
        )
          .filter((p) => p.package_id === a.id)
          .map((p) => p.url),
      }),
    ) as Catalog["accommodations"],
  });
}
export async function availability(
  ci: string,
  co: string,
): Promise<Allocation[]> {
  if (!isDemo && !supabase) throw new Error("BOOKING_NOT_CONFIGURED");
  if (!supabase) {
    const blocked = read<Allocation[]>("blocks", []).map((a) => ({
      ...a,
      state: "unavailable" as const,
    }));
    const alloc = demoBookings()
      .filter((b) => ["pending", "confirmed"].includes(b.status))
      .flatMap((b) =>
        b.resources.map((r) => ({
          id: `${b.id}-${r}`,
          booking_id: b.id,
          resource_id: r,
          check_in: b.check_in,
          check_out: b.check_out,
          kind: "booking" as const,
          state:
            b.status === "pending"
              ? ("pending" as const)
              : ("unavailable" as const),
          expires_at: b.status === "pending" ? b.expires_at : null,
        })),
      );
    return [...blocked, ...alloc]
      .filter((a) => overlaps(ci, co, a.check_in, a.check_out))
      .map((a) => ({
        resource_id: a.resource_id,
        check_in: a.check_in < ci ? ci : a.check_in,
        check_out: a.check_out > co ? co : a.check_out,
        state: a.state,
        expires_at: "expires_at" in a ? a.expires_at : null,
      })) as Allocation[];
  }
  const { data, error } = await supabase.rpc("get_availability", { ci, co });
  fail(error);
  return data;
}
export async function getQuote(input: BookingInput, catalog: Catalog) {
  if (!supabase) return calculateQuote(input, catalog);
  const { data, error } = await supabase.rpc("get_quote", { p: input });
  fail(error);
  return data;
}
async function edge(body: Record<string, unknown>) {
  const { data, error } = await supabase!.functions.invoke("booking-api", {
    body,
  });
  if (error) {
    let code = "REQUEST_FAILED";
    try {
      code = (await error.context.json()).error || code;
    } catch {
      /* no detailed database errors */
    }
    throw new Error(code);
  }
  if (data.error) throw new Error(data.error);
  return data.data;
}
export function validateCustomer(p: BookingInput) {
  if (
    !p.name.trim() ||
    p.name.trim().length < 2 ||
    p.name.length > 120 ||
    !/^\+?[0-9 ()-]{7,25}$/.test(p.phone) ||
    (p.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email)) ||
    !Number.isInteger(p.adults) ||
    p.adults < 1 ||
    p.adults > 100 ||
    !Number.isInteger(p.children) ||
    p.children < 0 ||
    p.children > 100
  )
    throw new Error("INVALID_CUSTOMER");
  if (!p.accepted) throw new Error("POLICY_REQUIRED");
}
export async function submitBooking(
  p: BookingInput,
  token: string,
): Promise<Booking> {
  if (supabase)
    return edge({ action: "submit", booking: p, turnstile_token: token });
  const run = async () => {
    validateCustomer(p);
    const list = demoBookings();
    const existing = list.find((b) => b.idempotency_key === p.idempotency_key);
    if (existing) return existing;
    const busy = await availability(p.check_in, p.check_out);
    if (busy.some((a) => p.resources.includes(a.resource_id)))
      throw new Error("UNAVAILABLE");
    const catalog = await getCatalog();
    const q = calculateQuote(p, catalog);
    const id = crypto.randomUUID();
    const b: Booking = {
      ...p,
      id,
      reference: `DEMO-${id.slice(0, 8).toUpperCase()}`,
      status: "pending",
      payment_status: "unpaid",
      quote: q,
      created_at: new Date().toISOString(),
      expires_at: new Date(
        Date.now() + catalog.settings.hold_minutes * 60000,
      ).toISOString(),
      notes: "",
      paid_sen: 0,
      whatsapp: catalog.settings.whatsapp,
    };
    write("bookings", [b, ...list]);
    return b;
  };
  return navigator.locks
    ? navigator.locks.request("suka.demo-booking", run)
    : run();
}
export async function listBookings(): Promise<Booking[]> {
  if (!supabase) return demoBookings();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });
  fail(error);
  return data ?? [];
}
export async function adminAction(payload: Record<string, unknown>) {
  if (supabase) return edge({ action: "admin", payload });
  const run = async () => {
    const action = String(payload.action);
    if (action === "create_manual") {
      const p = payload.booking as BookingInput & {
        status: Booking["status"];
        paid_sen: number;
        payment_reference: string;
      };
      validateCustomer(p);
      if (!["pending", "confirmed", "cancelled", "rejected"].includes(p.status))
        throw new Error("INVALID_STATUS");
      const list = demoBookings();
      const existing = list.find(
        (b) => b.idempotency_key === p.idempotency_key,
      );
      if (existing) return existing;
      const c = await getCatalog();
      if (p.check_in < dateAfter() || !p.check_in || !p.check_out)
        throw new Error("INVALID_DATES");
      const q = calculateQuote(p, c);
      if (!canFit(p.resources, p.adults + p.children, c))
        throw new Error("CAPACITY_EXCEEDED");
      if (
        !Number.isInteger(p.paid_sen) ||
        p.paid_sen < 0 ||
        p.paid_sen > q.total_sen ||
        (p.paid_sen > 0 && !p.payment_reference.trim())
      )
        throw new Error("INVALID_PAYMENT");
      if (
        p.status === "confirmed" &&
        p.paid_sen < (q.deposit_sen || q.total_sen)
      )
        throw new Error("PAYMENT_REQUIRED");
      if (
        ["pending", "confirmed"].includes(p.status) &&
        (await availability(p.check_in, p.check_out)).some((a) =>
          p.resources.includes(a.resource_id),
        )
      )
        throw new Error("UNAVAILABLE");
      const id = crypto.randomUUID();
      const b: Booking = {
        ...p,
        id,
        reference: `DEMO-${id.slice(0, 8).toUpperCase()}`,
        quote: q,
        payment_status:
          p.paid_sen === 0
            ? "unpaid"
            : p.paid_sen === q.total_sen
              ? "paid"
              : "partially_paid",
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + c.settings.hold_minutes * 60000,
        ).toISOString(),
        notes: "",
        whatsapp: c.settings.whatsapp,
      };
      write("bookings", [b, ...list]);
      if (p.paid_sen > 0)
        write("invoices", [
          demoInvoice(
            b,
            c.settings,
            p.paid_sen,
            p.payment_reference,
            "payment",
            p.idempotency_key,
          ),
          ...read<PaymentInvoice[]>("invoices", []),
        ]);
      return b;
    }
    const blocks = read<Allocation[]>("blocks", []);
    if (action === "block") {
      if (
        (
          await availability(
            String(payload.check_in),
            String(payload.check_out),
          )
        ).some((a) => a.resource_id === payload.resource_id)
      )
        throw new Error("UNAVAILABLE");
      write("blocks", [...blocks, { ...payload, id: crypto.randomUUID() }]);
      return;
    }
    if (action === "unblock") {
      write(
        "blocks",
        blocks.filter((b) => b.id !== payload.id),
      );
      return;
    }
    const list = demoBookings();
    const b = list.find((b) => b.id === payload.id);
    if (!b) throw new Error("REQUEST_FAILED");
    if (action === "confirm") {
      if (!["pending", "expired", "confirmed"].includes(b.status))
        throw new Error("INVALID_STATUS");
      if (b.paid_sen < (b.quote.deposit_sen || b.quote.total_sen))
        throw new Error("PAYMENT_REQUIRED");
      const otherBookingBusy = list.some(
        (other) =>
          other.id !== b.id &&
          ["pending", "confirmed"].includes(other.status) &&
          overlaps(b.check_in, b.check_out, other.check_in, other.check_out) &&
          other.resources.some((resource) => b.resources.includes(resource)),
      );
      const blockBusy = blocks.some(
        (block) =>
          b.resources.includes(block.resource_id) &&
          overlaps(b.check_in, b.check_out, block.check_in, block.check_out),
      );
      if (otherBookingBusy || blockBusy) throw new Error("UNAVAILABLE");
      b.status = "confirmed";
    }
    if (action === "cancel" || action === "reject")
      b.status = action === "cancel" ? "cancelled" : "rejected";
    if (action === "notes") b.notes = String(payload.notes);
    if (action === "payment" || action === "refund") {
      const seen = read<string[]>("payment-keys", []);
      if (seen.includes(String(payload.idempotency_key))) return;
      const amount = Number(payload.amount_sen);
      const next = b.paid_sen + (action === "refund" ? -amount : amount);
      if (
        !amount ||
        amount < 0 ||
        next < 0 ||
        next > b.quote.total_sen ||
        !payload.reference
      )
        throw new Error("INVALID_PAYMENT");
      b.paid_sen = next;
      b.payment_status =
        next === 0
          ? "refunded"
          : next === b.quote.total_sen
            ? "paid"
            : "partially_paid";
      write("payment-keys", [...seen, String(payload.idempotency_key)]);
      const catalog = await getCatalog();
      write("invoices", [
        demoInvoice(
          b,
          catalog.settings,
          amount,
          String(payload.reference),
          action,
          String(payload.idempotency_key),
        ),
        ...read<PaymentInvoice[]>("invoices", []),
      ]);
    }
    write("bookings", list);
  };
  return navigator.locks
    ? navigator.locks.request("suka.demo-booking", run)
    : run();
}
export async function adminAllocations() {
  if (!supabase)
    return [
      ...read<Allocation[]>("blocks", []),
      ...demoBookings()
        .filter((b) => ["pending", "confirmed"].includes(b.status))
        .flatMap((b) =>
          b.resources.map((r) => ({
            id: `${b.id}-${r}`,
            booking_id: b.id,
            resource_id: r,
            check_in: b.check_in,
            check_out: b.check_out,
            kind: "booking" as const,
            label: b.reference,
          })),
        ),
    ];
  const { data, error } = await supabase
    .from("booking_allocations")
    .select("*, bookings(status,expires_at)")
    .eq("active", true);
  fail(error);
  return (data ?? []).filter(
    (a) =>
      !a.booking_id ||
      a.bookings?.status === "confirmed" ||
      (a.bookings?.status === "pending" &&
        Date.parse(a.bookings.expires_at) > Date.now()),
  ) as Allocation[];
}
export async function saveSettings(settings: Settings) {
  if (settings.whatsapp && !/^\d{8,15}$/.test(settings.whatsapp))
    throw new Error("INVALID_INPUT");
  if (settings.map_url && !/^https:\/\//.test(settings.map_url))
    throw new Error("INVALID_INPUT");
  if (!supabase) {
    const c = await getCatalog();
    c.settings = settings;
    write("catalog", c);
    return;
  }
  const { error } = await supabase
    .from("property_settings")
    .update(settings)
    .eq("id", true);
  fail(error);
}
export async function saveAccommodation(a: Catalog["accommodations"][number]) {
  if (!supabase) {
    const c = await getCatalog();
    c.accommodations = c.accommodations.map((x) => (x.id === a.id ? a : x));
    write("catalog", c);
    return;
  }
  const { error } = await supabase
    .from("accommodation_packages")
    .update({
      capacity: a.capacity,
      rate: a.rate,
      weekend_rate: a.weekend_rate,
      addon_rate: a.addon_rate,
      amenities: a.amenities,
    })
    .eq("id", a.id);
  fail(error);
  for (const language of ["ms", "en"] as const) {
    const { error } = await supabase.from("accommodation_translations").upsert({
      package_id: a.id,
      language,
      description: a.description[language],
    });
    fail(error);
  }
}
export async function updatePhoto(id: string, url: string, remove = false) {
  if (!/^https:\/\//.test(url)) throw new Error("INVALID_INPUT");
  if (!supabase) {
    const c = await getCatalog();
    const a = c.accommodations.find((a) => a.id === id)!;
    a.photos = remove ? a.photos.filter((p) => p !== url) : [...a.photos, url];
    write("catalog", c);
    return;
  }
  const result = remove
    ? await supabase
        .from("accommodation_photos")
        .delete()
        .eq("package_id", id)
        .eq("url", url)
    : await supabase
        .from("accommodation_photos")
        .insert({ package_id: id, url, is_placeholder: false });
  fail(result.error);
}
export async function updateRate(
  rule: Catalog["rate_rules"][number],
  remove = false,
) {
  if (!supabase) {
    const c = await getCatalog();
    if (
      !remove &&
      c.rate_rules.some(
        (r) =>
          r.package_id === rule.package_id &&
          overlaps(r.start_date, r.end_date, rule.start_date, rule.end_date),
      )
    )
      throw new Error("INVALID_DATES");
    c.rate_rules = remove
      ? c.rate_rules.filter((r) => r.id !== rule.id)
      : [...c.rate_rules, rule];
    write("catalog", c);
    return;
  }
  const result = remove
    ? await supabase.from("rate_rules").delete().eq("id", rule.id)
    : await supabase.from("rate_rules").insert(rule);
  fail(result.error);
}
export const defaultBooking = (): BookingInput => ({
  check_in: "",
  check_out: "",
  resources: ["MAIN"],
  adults: 2,
  children: 0,
  name: "",
  phone: "",
  email: "",
  special_requests: "",
  accepted: false,
  policy_version: "1",
  language: "ms",
  idempotency_key: crypto.randomUUID(),
});
export const canFit = (ids: Resource[], guests: number, c: Catalog) => {
  const targets =
    canonicalPackage(ids) === "WHOLE"
      ? c.accommodations.filter((a) => a.id === "WHOLE")
      : c.accommodations.filter((a) => ids.includes(a.id as Resource));
  return (
    targets.some((a) => a.capacity === null) ||
    targets.reduce((s, a) => s + (a.capacity || 0), 0) >= guests
  );
};

export async function listInvoices(
  bookingId: string,
): Promise<PaymentInvoice[]> {
  if (isDemo)
    return read<PaymentInvoice[]>("invoices", []).filter(
      (i) => i.booking_id === bookingId,
    );
  if (!supabase) throw new Error("REQUEST_FAILED");
  const { data, error } = await supabase
    .from("payment_invoices")
    .select("*")
    .eq("booking_id", bookingId)
    .order("issued_at", { ascending: false });
  fail(error);
  return data as PaymentInvoice[];
}
