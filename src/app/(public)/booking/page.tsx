"use client";

import "./booking.css";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, MessageSquare, AlertCircle, ArrowRight, Lock, User, LogIn } from "lucide-react";
import { units } from "@/data/units";
import { whatsappUrl, saveBooking } from "@/lib/demo-bookings";
import { createClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/context/language-context";

type BookingResponse = { booking_number: string };
type SuccessBooking = { bookingNumber: string; whatsappMessage: string };

const money = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
});

function nightsBetween(checkIn: string, checkOut: string) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
}

function BookingForm() {
  const query = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const checkIn = query.get("checkin") || "";
  const checkOut = query.get("checkout") || "";
  const initialUnitName = query.get("unit") || units[0].name;

  const [unitName, setUnitName] = useState(initialUnitName);
  const [paymentPlan, setPaymentPlan] = useState("deposit_20");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState(2);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [successBooking, setSuccessBooking] = useState<SuccessBooking | null>(null);

  const selectedUnit = units.find((unit) => unit.name === unitName || unit.slug === unitName) ?? units[0];
  const nights = nightsBetween(checkIn, checkOut);
  const total = selectedUnit.basePrice * nights;
  const paymentRate = paymentPlan === "full" ? 1 : paymentPlan === "deposit_50" ? 0.5 : 0.2;
  const dueNow = total * paymentRate;

  const loginUrl = useMemo(
    () => `/login?next=${encodeURIComponent(`/booking?checkin=${checkIn}&checkout=${checkOut}&unit=${encodeURIComponent(unitName)}`)}`,
    [checkIn, checkOut, unitName],
  );

  const signupUrl = useMemo(
    () => `/signup?next=${encodeURIComponent(`/booking?checkin=${checkIn}&checkout=${checkOut}&unit=${encodeURIComponent(unitName)}`)}`,
    [checkIn, checkOut, unitName],
  );

  // Check user authentication status on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setIsAuthenticated(false);
        return;
      }
      setIsAuthenticated(true);
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .single();
      if (profile) {
        if (profile.full_name) setName(profile.full_name);
        if (profile.phone) setPhone(profile.phone);
      }
    });
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const db = createClient();
    const { data: authData, error: authError } = await db.auth.getUser();
    const user = authData?.user;

    // Enforce login validation before processing
    if (authError || !user) {
      setMessage("Account login is required to reserve a stay. Redirecting to login...");
      setTimeout(() => {
        router.push(loginUrl);
      }, 1000);
      return;
    }

    if (!checkIn || !checkOut || nights < 1) {
      setMessage("Please select valid check-in and check-out dates on the availability calendar first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      // Update user profile with latest name & phone
      await db.from("profiles").update({ full_name: name, phone }).eq("id", user.id);

      let bookingNumber = "SHS-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Call database RPC procedure create_booking_request
      const { data, error } = await db.rpc("create_booking_request", {
        p_unit_slug: selectedUnit.slug,
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_guests: guests,
        p_special_request: null,
      });

      if (!error && data) {
        bookingNumber = (data as BookingResponse).booking_number;
      } else {
        // Fallback insert directly into public.bookings if RPC procedure not created yet
        const { data: inserted } = await db
          .from("bookings")
          .insert({
            booking_number: bookingNumber,
            customer_id: user.id,
            unit_id: "22222222-2222-2222-2222-222222222221",
            check_in_date: checkIn,
            check_out_date: checkOut,
            adult_count: guests,
            subtotal: total,
            cleaning_fee: 0,
            deposit_amount: dueNow,
            total_amount: total,
            booking_status: "pending",
            payment_status: "unpaid",
          })
          .select("booking_number")
          .single();

        if (inserted?.booking_number) {
          bookingNumber = inserted.booking_number;
        }
      }

      // Save to localStorage so availability is instantly shared across local sessions
      saveBooking({
        id: bookingNumber,
        name,
        phone,
        email: user.email || "",
        unit: selectedUnit.name,
        checkIn,
        checkOut,
        guests,
        payment: paymentPlan === "full" ? "full" : "deposit",
        status: "payment_review",
        createdAt: new Date().toISOString(),
      });

      const paymentLabel = paymentPlan === "full" ? "Full payment" : paymentPlan === "deposit_50" ? "50% deposit" : "20% deposit";
      const whatsappMessage = [
        "New SukaHomestay Booking Request",
        `Reference: ${bookingNumber}`,
        `Guest Name: ${name}`,
        `Phone/WhatsApp: ${phone}`,
        `Unit: ${selectedUnit.name}`,
        `Stay Dates: ${checkIn} to ${checkOut} (${nights} night${nights === 1 ? "" : "s"})`,
        `Total Amount: ${money.format(total)}`,
        `${paymentLabel} Due Now: ${money.format(dueNow)}`,
        "",
        "I would like to submit my bank transfer receipt for verification.",
      ].join("\n");

      setSuccessBooking({ bookingNumber, whatsappMessage });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create booking request. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function finishBooking() {
    if (!successBooking) return;
    window.open(whatsappUrl(successBooking.whatsappMessage), "_blank", "noopener,noreferrer");
    router.push(`/dashboard`);
  }

  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 720 }}>
        <span className="eyebrow">{t("book_eyebrow")}</span>
        <h1 className="title">{t("book_title")}</h1>
        <p className="lead" style={{ marginBottom: 32 }}>
          {t("book_lead")}
        </p>

        {/* Login Validation Banner when user is not authenticated */}
        {isAuthenticated === false && (
          <div style={{
            background: "var(--white)",
            border: "2px solid var(--primary-border)",
            borderRadius: "var(--radius-lg)",
            padding: "28px",
            marginBottom: "28px",
            boxShadow: "var(--shadow-md)",
            display: "flex",
            flexDirection: "column",
            gap: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--primary)" }}>
              <Lock size={24} />
              <strong style={{ fontSize: "1.15rem", color: "var(--navy)" }}>{t("book_login_req_title")}</strong>
            </div>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
              {t("book_login_req_desc")}
            </p>

            <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap" }}>
              <Link href={loginUrl} className="button" style={{ height: 42, padding: "0 20px" }}>
                <LogIn size={16} />
                <span>{t("book_login_btn")}</span>
              </Link>
              <Link href={signupUrl} className="button secondary" style={{ height: 42, padding: "0 20px" }}>
                <User size={16} />
                <span>{t("book_signup_btn")}</span>
              </Link>
            </div>
          </div>
        )}

        <form className="form-card form" onSubmit={submit}>
          <div className="field-group">
            <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("book_fullname")}</label>
            <input
              name="name"
              required
              placeholder="Your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isAuthenticated === false}
            />
          </div>

          <div className="field-group">
            <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("book_phone")}</label>
            <input
              name="phone"
              required
              placeholder="e.g. +60123456789"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isAuthenticated === false}
            />
          </div>

          <div className="field-group">
            <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("book_unit_select")}</label>
            <select
              name="unit"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              disabled={isAuthenticated === false}
            >
              {units.map((unit) => (
                <option key={unit.id} value={unit.name}>
                  {unit.name} — {money.format(unit.basePrice)} {t("unit_per_night")}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field-group">
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("avail_checkin")}</label>
              <input className="muted-field" aria-label="Check-in date" readOnly value={checkIn || "Select date on calendar"} />
            </div>

            <div className="field-group">
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("avail_checkout")}</label>
              <input className="muted-field" aria-label="Check-out date" readOnly value={checkOut || "Select date on calendar"} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="field-group">
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("book_guests")}</label>
              <input
                name="guests"
                type="number"
                min="1"
                max={selectedUnit.maximumGuests}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                required
                disabled={isAuthenticated === false}
              />
            </div>

            <div className="field-group">
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>{t("book_payment_plan")}</label>
              <select
                name="payment-plan"
                value={paymentPlan}
                onChange={(e) => setPaymentPlan(e.target.value)}
                disabled={isAuthenticated === false}
              >
                <option value="deposit_20">{t("book_plan_20")}</option>
                <option value="deposit_50">{t("book_plan_50")}</option>
                <option value="full">{t("book_plan_full")}</option>
              </select>
            </div>
          </div>

          {nights > 0 && (
            <div className="price-summary" aria-live="polite">
              <span>{nights} {nights === 1 ? t("avail_nights") : t("avail_nights_plural")} × {money.format(selectedUnit.basePrice)}</span>
              <strong>{t("book_total_amount")}: {money.format(total)}</strong>
              <b>{t("book_due_now")} ({paymentPlan === "full" ? "100%" : paymentPlan === "deposit_50" ? "50%" : "20%"}): {money.format(dueNow)}</b>
            </div>
          )}

          {isAuthenticated === false ? (
            <Link href={loginUrl} className="button" style={{ marginTop: 10, textDecoration: "none" }}>
              <Lock size={18} />
              <span>{t("book_login_first")}</span>
            </Link>
          ) : (
            <button className="button" disabled={saving || nights < 1} style={{ marginTop: 10 }}>
              {saving ? (
                t("book_submitting")
              ) : (
                <>
                  <span>{t("book_submit_btn")}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}

          {message && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--rose)", fontSize: "0.9rem", marginTop: 8 }}>
              <AlertCircle size={16} />
              <span>{message}</span>
            </div>
          )}
        </form>

        {successBooking && (
          <div className="booking-modal-backdrop" role="presentation">
            <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-success-title">
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--emerald)" }}>
                <CheckCircle2 size={28} />
                <span className="eyebrow" style={{ color: "var(--emerald)", margin: 0 }}>BOOKING REQUEST CREATED</span>
              </div>
              <h2 id="booking-success-title">Reservation Pending Payment</h2>
              <p>
                Booking Reference: <strong style={{ color: "var(--navy)" }}>{successBooking.bookingNumber}</strong>
              </p>
              <p>
                Your dates are currently held for 30 minutes. Please send your bank transfer receipt via WhatsApp or upload it in your customer dashboard to lock your dates.
              </p>
              <button className="button" onClick={finishBooking}>
                <MessageSquare size={18} />
                <span>Open WhatsApp & Go To Dashboard</span>
              </button>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={<section className="section"><div className="shell">Loading booking details...</div></section>}>
      <BookingForm />
    </Suspense>
  );
}
