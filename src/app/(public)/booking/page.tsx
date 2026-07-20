"use client";

import "./booking.css";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { units } from "@/data/units";
import { whatsappUrl } from "@/lib/demo-bookings";
import { createClient } from "@/lib/supabase/browser";

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
  const checkIn = query.get("checkin") || "";
  const checkOut = query.get("checkout") || "";
  const [unitName, setUnitName] = useState(units[0].name);
  const [paymentPlan, setPaymentPlan] = useState("deposit_20");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [successBooking, setSuccessBooking] = useState<SuccessBooking | null>(null);

  const selectedUnit = units.find((unit) => unit.name === unitName) ?? units[0];
  const nights = nightsBetween(checkIn, checkOut);
  const total = selectedUnit.basePrice * nights;
  const paymentRate = paymentPlan === "full" ? 1 : paymentPlan === "deposit_50" ? 0.5 : 0.2;
  const dueNow = total * paymentRate;

  const loginUrl = useMemo(
    () => `/login?next=${encodeURIComponent(`/booking?checkin=${checkIn}&checkout=${checkOut}`)}`,
    [checkIn, checkOut],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Capture values synchronously. React clears currentTarget after async work.
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const guests = Number(formData.get("guests") ?? 1);

    if (!checkIn || !checkOut || nights < 1) {
      setMessage("Please choose valid check-in and check-out dates first.");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const db = createClient();
      const { data: authData, error: authError } = await db.auth.getUser();
      const user = authData.user;

      if (authError || !user) {
        router.push(loginUrl);
        return;
      }

      const { error: profileError } = await db
        .from("profiles")
        .update({ full_name: name, phone })
        .eq("id", user.id);

      if (profileError) throw profileError;

      const { data, error } = await db.rpc("create_booking_request", {
        p_unit_slug: selectedUnit.slug,
        p_check_in: checkIn,
        p_check_out: checkOut,
        p_guests: guests,
        p_special_request: null,
      });

      if (error) throw error;

      const booking = data as BookingResponse;
      const paymentLabel = paymentPlan === "full" ? "Full payment" : paymentPlan === "deposit_50" ? "50% deposit" : "20% deposit";
      const whatsappMessage = [
        "New SukaHomestay booking request",
        `Reference: ${booking.booking_number}`,
        `Guest: ${name}`,
        `WhatsApp: ${phone}`,
        `Accommodation: ${selectedUnit.name}`,
        `Stay: ${checkIn} to ${checkOut} (${nights} night${nights === 1 ? "" : "s"})`,
        `Total stay: ${money.format(total)}`,
        `${paymentLabel} due now: ${money.format(dueNow)}`,
      ].join("\n");

      setSuccessBooking({ bookingNumber: booking.booking_number, whatsappMessage });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the booking. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function finishBooking() {
    if (!successBooking) return;
    window.open(whatsappUrl(successBooking.whatsappMessage), "_blank", "noopener,noreferrer");
    router.push(`/availability?request=${encodeURIComponent(successBooking.bookingNumber)}`);
  }

  return (
    <section className="section">
      <div className="shell">
        <p className="eyebrow">RESERVE YOUR STAY</p>
        <h1 className="title">Complete your booking details</h1>
        <p>After you submit, WhatsApp opens with your booking and payment details for the host.</p>

        <form className="form" onSubmit={submit}>
          <input name="name" required placeholder="Full name" />
          <input name="phone" required placeholder="WhatsApp number" inputMode="tel" />
          <select name="unit" value={unitName} onChange={(event) => setUnitName(event.target.value)}>
            {units.map((unit) => <option key={unit.id} value={unit.name}>{unit.name} — {money.format(unit.basePrice)}/night</option>)}
          </select>
          <input className="muted-field" aria-label="Check-in date" readOnly value={checkIn} />
          <input className="muted-field" aria-label="Check-out date" readOnly value={checkOut} />
          <input name="guests" type="number" min="1" max={selectedUnit.maximumGuests} defaultValue="2" required />
          <select name="payment-plan" value={paymentPlan} onChange={(event) => setPaymentPlan(event.target.value)}>
            <option value="deposit_20">Pay 20% deposit</option>
            <option value="deposit_50">Pay 50% deposit</option>
            <option value="full">Pay full amount</option>
          </select>

          <div className="price-summary" aria-live="polite">
            <span>{nights} night{nights === 1 ? "" : "s"} × {money.format(selectedUnit.basePrice)}</span>
            <strong>Total stay: {money.format(total)}</strong>
            <b>Pay admin now: {money.format(dueNow)}</b>
          </div>

          <button className="button" disabled={saving}>{saving ? "Creating booking…" : "Create booking & continue to WhatsApp"}</button>
        </form>
        {message && <p role="alert">{message}</p>}
        {successBooking && (
          <div className="booking-modal-backdrop" role="presentation">
            <section className="booking-modal" role="dialog" aria-modal="true" aria-labelledby="booking-success-title">
              <p className="eyebrow">BOOKING REQUEST RECEIVED</p>
              <h2 id="booking-success-title">Your booking was created successfully.</h2>
              <p>Reference: <strong>{successBooking.bookingNumber}</strong></p>
              <p>Please send your bank receipt to the admin in WhatsApp. Your requested dates remain pending until the admin confirms payment.</p>
              <button className="button" onClick={finishBooking}>Open WhatsApp & view calendar</button>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Booking() {
  return <Suspense fallback={<section className="section"><div className="shell">Loading booking form…</div></section>}><BookingForm /></Suspense>;
}
