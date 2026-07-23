"use client";

import "./availability.css";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, CheckCircle2, ArrowRight, BedDouble, Bath, Users, XCircle, Home } from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import { units } from "@/data/units";
import { useLanguage } from "@/context/language-context";

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const money = new Intl.NumberFormat("en-MY", {
  style: "currency",
  currency: "MYR",
  minimumFractionDigits: 2,
});

function AvailabilityCalendar() {
  const query = useSearchParams();
  const requestNumber = query.get("request");
  const initialCheckIn = query.get("checkin");
  const initialCheckOut = query.get("checkout");
  const { t } = useLanguage();

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState<string[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [wholeHouseLockedDates, setWholeHouseLockedDates] = useState(new Set<string>());
  const [pending, setPending] = useState<string[]>([]);

  // Track booked unit slugs for the currently selected date range
  const [bookedUnitSlugs, setBookedUnitSlugs] = useState<Set<string>>(new Set());

  // Pre-fill selected dates if passed in URL
  useEffect(() => {
    if (initialCheckIn && initialCheckOut) {
      setSelected([initialCheckIn, initialCheckOut]);
    }
  }, [initialCheckIn, initialCheckOut]);

  // Fetch pending booking request if present
  useEffect(() => {
    if (!requestNumber) return;
    createClient()
      .from("bookings")
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

  // Fetch dates where Whole House is booked or explicitly blocked by admin
  useEffect(() => {
    const start = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-01`;
    const nextMonth = new Date(month.getFullYear(), month.getMonth() + 2, 1);
    const end = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}-01`;

    const supabase = createClient();

    supabase
      .from("bookings")
      .select("check_in_date, check_out_date, units!inner(slug)")
      .eq("units.slug", "whole-house")
      .in("booking_status", ["confirmed", "checked_in", "completed", "payment_review", "pending"])
      .then(({ data }) => {
        const locked = new Set<string>();
        if (data) {
          data.forEach((b: any) => {
            const current = new Date(`${b.check_in_date}T00:00:00`);
            const finish = new Date(`${b.check_out_date}T00:00:00`);
            while (current < finish) {
              locked.add(dateKey(current));
              current.setDate(current.getDate() + 1);
            }
          });
        }
        setWholeHouseLockedDates(locked);
      });
  }, [month]);

  // Query unit availability across Supabase RPC and bookings table
  useEffect(() => {
    if (selected.length < 2) {
      setBookedUnitSlugs(new Set());
      return;
    }

    const checkIn = selected[0];
    const checkOut = selected[1];
    const supabase = createClient();

    supabase
      .rpc("get_booked_units_for_dates", { p_check_in: checkIn, p_check_out: checkOut })
      .then(({ data, error }) => {
        const bookedSlugs = new Set<string>();
        if (!error && data) {
          (data || []).forEach((row: { unit_slug: string }) => bookedSlugs.add(row.unit_slug));
          setBookedUnitSlugs(bookedSlugs);
        } else {
          // Fallback: Query bookings table directly if RPC procedure is missing on Supabase
          supabase
            .from("bookings")
            .select("check_in_date, check_out_date, booking_status, expires_at, units!inner(slug)")
            .lt("check_in_date", checkOut)
            .gt("check_out_date", checkIn)
            .then(({ data: directData }) => {
              const fallbackMerged = new Set<string>();
              if (directData) {
                directData.forEach((b: any) => {
                  const status = b.booking_status;
                  const active =
                    ["confirmed", "checked_in", "completed", "payment_review"].includes(status) ||
                    (["pending", "awaiting_payment"].includes(status) && (!b.expires_at || new Date(b.expires_at) > new Date()));
                  if (active && b.units?.slug) {
                    fallbackMerged.add(b.units.slug);
                  }
                });
              }
              setBookedUnitSlugs(fallbackMerged);
            });
        }
      });
  }, [selected]);

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
    const isPast = day < today;
    const outside = day.getMonth() !== month.getMonth();

    if (outside || isPast || wholeHouseLockedDates.has(date)) return;

    setSelected((current) => {
      if (current.length === 0) return [date];
      if (current.length === 1) {
        return date < current[0] ? [date, current[0]] : [current[0], date];
      }
      return [date];
    });
    setHovered(null);
  }

  const monthLabel = new Intl.DateTimeFormat("en-MY", { month: "long", year: "numeric" }).format(month);

  const nights = useMemo(() => {
    if (selected.length < 2) return 0;
    const start = new Date(`${selected[0]}T00:00:00`);
    const end = new Date(`${selected[1]}T00:00:00`);
    return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000));
  }, [selected]);

  /**
   * Cross-customer unit availability evaluation:
   * - Whole House: Unavailable if Whole House, Full Homestay, or ANY Roomstay is booked.
   * - Full Homestay: Unavailable if Whole House, Full Homestay, or ANY Roomstay is booked.
   * - Roomstay 1, 2, 3: Unavailable ONLY if Whole House or that exact Roomstay is booked.
   *   (Booking Full Homestay leaves Roomstay 1, 2, 3 available for other guests!)
   */
  function isUnitBooked(slug: string): boolean {
    // 1. Whole House booked locks everything
    if (bookedUnitSlugs.has("whole-house")) {
      return true;
    }

    // 2. Whole House & Full Homestay are unavailable if Full Homestay OR ANY Roomstay is booked
    const isFullHomestayBooked = bookedUnitSlugs.has("full-homestay");
    const anyRoomstayBooked =
      bookedUnitSlugs.has("roomstay-1") ||
      bookedUnitSlugs.has("roomstay-2") ||
      bookedUnitSlugs.has("roomstay-3");

    if (slug === "whole-house" || slug === "full-homestay") {
      return isFullHomestayBooked || anyRoomstayBooked;
    }

    // 3. Individual roomstays (roomstay-1, roomstay-2, roomstay-3) remain AVAILABLE
    // when Full Homestay is booked. They are only unavailable if booked directly!
    return bookedUnitSlugs.has(slug);
  }

  return (
    <section className="section soft">
      <div className="shell">
        <span className="eyebrow">{t("avail_eyebrow")}</span>
        <h1 className="title">{t("avail_title")}</h1>
        <p className="lead">{t("avail_lead")}</p>

        {pending.length === 2 && (
          <div className="pending-notice">
            <strong>Your booking request is pending confirmation:</strong> {pending[0]} to {pending[1]}. Your dates will be locked automatically once payment proof is confirmed by host.
          </div>
        )}

        <div className="availability-layout">
          {/* Main Calendar Panel */}
          <section className="calendar-panel">
            <header className="calendar-head">
              <button
                aria-label="Previous month"
                onClick={() => setMonth((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1))}
              >
                <ChevronLeft size={20} />
              </button>
              <strong style={{ fontSize: "1.1rem" }}>{monthLabel}</strong>
              <button
                aria-label="Next month"
                onClick={() => setMonth((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1))}
              >
                <ChevronRight size={20} />
              </button>
            </header>

            <div className="weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>

            <div className="days">
              {days.map((day) => {
                const date = dateKey(day);
                const outside = day.getMonth() !== month.getMonth();
                const isPast = day < today;
                const isWholeHouseLocked = wholeHouseLockedDates.has(date);
                const isPending = pending.length === 2 && date >= pending[0] && date <= pending[1];
                const isSelected = selected.includes(date);
                const isBetweenSelected =
                  selected.length === 2 && date > selected[0] && date < selected[1];

                let state = "available";
                if (isPast || isWholeHouseLocked) state = "unavailable";
                else if (isPending) state = "pending";
                else if (isSelected || isBetweenSelected) state = "selected";

                const preview = selected.length === 1 && hovered && date > selected[0] && date < hovered;

                return (
                  <button
                    key={date}
                    className={`day ${state} ${preview ? "range-preview" : ""} ${outside ? "outside" : ""}`}
                    disabled={outside || isPast || isWholeHouseLocked || isPending}
                    onClick={() => select(day)}
                    onMouseEnter={() => selected.length === 1 && setHovered(date)}
                    onMouseLeave={() => setHovered(null)}
                    aria-label={`${date}, ${state}`}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="legend">
              <span><i className="available" /> {t("avail_legend_available")}</span>
              <span><i className="unavailable" style={{ opacity: 0.6 }} /> {t("avail_legend_locked")}</span>
              <span><i className="pending" /> {t("avail_legend_pending")}</span>
              <span><i className="selected" /> {t("avail_legend_selected")}</span>
            </div>
          </section>

          {/* Right Sidebar: Selected Dates + Unit Availability Cards */}
          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="selection-card">
              <CalendarDays color="var(--primary)" size={32} />
              <h2>{t("avail_selected_title")}</h2>
              {selected.length > 0 ? (
                <div style={{ margin: "16px 0", lineHeight: 1.8 }}>
                  <p><strong>{t("avail_checkin")}:</strong> {selected[0]}</p>
                  {selected[1] ? (
                    <p><strong>{t("avail_checkout")}:</strong> {selected[1]} ({nights} {nights === 1 ? t("avail_nights") : t("avail_nights_plural")})</p>
                  ) : (
                    <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{t("avail_prompt_select")}</p>
                  )}
                </div>
              ) : (
                <p style={{ margin: "16px 0", color: "var(--muted)" }}>{t("avail_prompt_select")}</p>
              )}

              <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--line)", fontSize: "0.85rem", color: "var(--muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <CheckCircle2 size={14} color="var(--emerald)" /> {t("avail_rule_roomstay")}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 size={14} color="var(--emerald)" /> {t("avail_rule_wholehouse")}
                </span>
              </div>
            </div>

            {/* Right Column Unit Cards */}
            {selected.length === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Home size={20} color="var(--primary)" />
                  <h3 style={{ fontSize: "1.1rem", color: "var(--navy)", fontWeight: 700, margin: 0 }}>
                    {t("avail_unit_breakdown")} ({nights} {nights === 1 ? t("avail_nights") : t("avail_nights_plural")})
                  </h3>
                </div>

                {units.map((unit) => {
                  const booked = isUnitBooked(unit.slug);
                  const stayTotal = unit.basePrice * nights;

                  return (
                    <div
                      key={unit.id}
                      style={{
                        background: "var(--white)",
                        border: booked ? "1px solid var(--line)" : "2px solid var(--primary-border)",
                        borderRadius: "var(--radius-lg)",
                        padding: "18px",
                        boxShadow: booked ? "none" : "var(--shadow-sm)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                        opacity: booked ? 0.75 : 1
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <strong style={{ fontSize: "1rem", color: "var(--navy)" }}>{unit.name}</strong>
                        {booked ? (
                          <span className="status cancelled" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
                            <XCircle size={12} /> {t("unit_booked")}
                          </span>
                        ) : (
                          <span className="status confirmed" style={{ fontSize: "0.75rem", padding: "3px 8px" }}>
                            <CheckCircle2 size={12} /> {t("unit_available")}
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: "0.85rem", color: "var(--muted)", display: "flex", gap: 12 }}>
                        <span><BedDouble size={14} /> {unit.bedrooms} {t("unit_bedrooms")}</span>
                        <span><Users size={14} /> {t("unit_max_guests")} {unit.maximumGuests}</span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 10 }}>
                        <div>
                          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{t("avail_total_stay")}</div>
                          <strong style={{ fontSize: "1.1rem", color: "var(--navy)" }}>{money.format(stayTotal)}</strong>
                        </div>

                        {booked ? (
                          <button className="button secondary" disabled style={{ height: 36, padding: "0 12px", fontSize: "0.8rem" }}>
                            {t("unit_unavailable")}
                          </button>
                        ) : (
                          <Link
                            className="button"
                            href={`/booking?unit=${encodeURIComponent(unit.name)}&checkin=${selected[0]}&checkout=${selected[1]}`}
                            style={{ height: 36, padding: "0 14px", fontSize: "0.8rem" }}
                          >
                            <span>{t("unit_book_btn")}</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

export default function Availability() {
  return (
    <Suspense fallback={<section className="section soft"><div className="shell">Loading availability calendar...</div></section>}>
      <AvailabilityCalendar />
    </Suspense>
  );
}
