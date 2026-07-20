"use client";

import "./availability.css";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";

const unavailable = new Set(["2026-07-24", "2026-07-25", "2026-07-26", "2026-07-31", "2026-08-01", "2026-08-08", "2026-08-09"]);
const blocked = new Set(["2026-07-29", "2026-08-16"]);
const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function AvailabilityCalendar() {
  const query = useSearchParams();
  const requestNumber = query.get("request");
  const [month, setMonth] = useState(new Date(2026, 6, 1));
  const [selected, setSelected] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [locked, setLocked] = useState(new Set<string>());
  const [pending, setPending] = useState<string[]>([]);

  useEffect(() => {
    if (!requestNumber) return;
    createClient().from("bookings")
      .select("check_in_date,check_out_date")
      .eq("booking_number", requestNumber)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const checkIn = String(data.check_in_date);
        const checkOut = String(data.check_out_date);
        setPending([checkIn, checkOut]);
        const start = new Date(`${checkIn}T00:00:00`);
        setMonth(new Date(start.getFullYear(), start.getMonth(), 1));
      });
  }, [requestNumber]);

  useEffect(() => {
    const start = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
    const end = `${month.getFullYear()}-${String(month.getMonth() + 2).padStart(2, "0")}-01`;
    createClient().rpc("get_locked_dates", { p_start: start, p_end: end }).then(({ data }) => {
      setLocked(new Set((data || []).map((row: { locked_date: string }) => row.locked_date)));
    });
  }, [month]);

  const days = useMemo(() => {
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start);
      day.setDate(start.getDate() + index);
      return day;
    });
  }, [month]);

  function select(day: Date) {
    const date = dateKey(day);
    if (day.getMonth() !== month.getMonth() || unavailable.has(date) || blocked.has(date) || locked.has(date)) return;
    setSelected((current) => current.length === 0 ? [date] : current.length === 1 ? (date < current[0] ? [date, current[0]] : [current[0], date]) : [date]);
    setHovered(null);
  }

  const label = new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(month);

  return <section className="section soft"><div className="shell">
    <span className="eyebrow">Availability</span><h1 className="title">See which dates are available</h1>
    <p className="lead">Confirmed booking dates come directly from SukaHomestay’s booking system.</p>
    {pending.length === 2 && <p className="pending-notice"><strong>Your request is pending payment confirmation:</strong> {pending[0]} to {pending[1]}. These dates lock only after admin confirmation.</p>}
    <div className="availability-layout"><section className="calendar-panel">
      <header className="calendar-head"><button aria-label="Previous month" onClick={() => setMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}><ChevronLeft /></button><strong>{label}</strong><button aria-label="Next month" onClick={() => setMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}><ChevronRight /></button></header>
      <div className="weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
      <div className="days">{days.map((day) => {
        const date = dateKey(day), outside = day.getMonth() !== month.getMonth(), isLocked = locked.has(date);
        const isPending = pending.length === 2 && date >= pending[0] && date <= pending[1];
        const state = blocked.has(date) ? "blocked" : unavailable.has(date) || isLocked ? "unavailable" : isPending ? "pending" : selected.includes(date) ? "selected" : "available";
        const preview = selected.length === 1 && hovered && date > selected[0] && date < hovered;
        return <button key={date} className={`day ${state} ${preview ? "range-preview" : ""} ${isLocked ? "locked" : ""} ${outside ? "outside" : ""}`} disabled={outside || state === "blocked" || state === "unavailable" || state === "pending"} onClick={() => select(day)} onMouseEnter={() => selected.length === 1 && setHovered(date)} onMouseLeave={() => setHovered(null)} aria-label={`${date}, ${state}`}>{day.getDate()}</button>;
      })}</div>
      <div className="legend"><span><i className="available" />Available</span><span><i className="unavailable" />Booked</span><span><i className="blocked" />Blocked</span><span><i className="pending" />Your pending request</span><span><i className="selected" />Selected</span></div>
    </section><aside className="selection-card"><CalendarDays color="#ff6900" size={28} /><h2>Your dates</h2>{selected.length ? <p><strong>Check-in:</strong> {selected[0]}<br />{selected[1] && <><strong>Check-out:</strong> {selected[1]}</>}</p> : <p>Choose a date from the calendar to begin.</p>}<Link className="button" href={selected.length === 2 ? `/booking?checkin=${selected[0]}&checkout=${selected[1]}` : "/booking"}>Continue booking</Link></aside></div>
  </div></section>;
}

export default function Availability() {
  return <Suspense fallback={<section className="section soft"><div className="shell">Loading calendar…</div></section>}><AvailabilityCalendar /></Suspense>;
}
