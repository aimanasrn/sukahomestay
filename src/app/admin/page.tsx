"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { ShieldAlert, ArrowRight, CheckCircle2, Clock, XCircle, Calendar, DollarSign, Users } from "lucide-react";

type Booking = {
  id: string;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  profiles: { full_name: string; phone: string; email: string }[] | { full_name: string; phone: string; email: string };
  units: { name: string }[] | { name: string };
};

export default function AdminOverview() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("Loading reservations queue...");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in with an administrator account.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      setMessage("This account does not have administrator privileges.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_number, check_in_date, check_out_date, booking_status, payment_status, total_amount, profiles!bookings_customer_id_fkey(full_name, phone, email), units!bookings_unit_id_fkey(name)")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setBookings((data || []) as unknown as Booking[]);
      setMessage("");
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.booking_status === "confirmed")
    .reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  return (
    <main className="main">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <ShieldAlert size={26} color="var(--primary)" />
            <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Admin Dashboard Overview</h1>
          </div>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            Executive summary of guest reservations, current occupancy, and revenue.
          </p>
        </div>

        <Link href="/admin/bookings" className="button" style={{ height: 40, padding: "0 16px", fontSize: "0.875rem" }}>
          <span>Manage Bookings</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 32 }}>
        <div className="stat">
          <span>Total Requests</span>
          <strong>{bookings.length}</strong>
        </div>
        <div className="stat">
          <span>Confirmed Stays</span>
          <strong style={{ color: "var(--emerald)" }}>
            {bookings.filter((b) => b.booking_status === "confirmed").length}
          </strong>
        </div>
        <div className="stat">
          <span>Pending Review</span>
          <strong style={{ color: "var(--amber)" }}>
            {bookings.filter((b) => b.booking_status === "payment_review" || b.booking_status === "pending").length}
          </strong>
        </div>
        <div className="stat">
          <span>Total Revenue</span>
          <strong style={{ color: "var(--navy)" }}>
            RM {totalRevenue.toFixed(2)}
          </strong>
        </div>
      </div>

      <div className="table-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0 }}>Recent Reservation Queue</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0 }}>Read-only view of recent guest reservations.</p>
          </div>
          <Link href="/admin/bookings" className="button secondary" style={{ height: 34, padding: "0 12px", fontSize: "0.8rem" }}>
            Open Bookings Management →
          </Link>
        </div>

        {message ? (
          <p style={{ padding: 20, color: "var(--muted)" }}>{message}</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Ref Number</th>
                  <th>Guest Information</th>
                  <th>Accommodation & Stay</th>
                  <th>Total Amount</th>
                  <th>Reservation Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const guest = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
                  const unit = Array.isArray(b.units) ? b.units[0] : b.units;

                  return (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.booking_number}</strong>
                      </td>
                      <td>
                        <strong>{guest?.full_name || "Guest User"}</strong>
                        <br />
                        <small style={{ color: "var(--muted)" }}>{guest?.phone || guest?.email || "No contact"}</small>
                      </td>
                      <td>
                        <strong>{unit?.name || "Stay Unit"}</strong>
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          {b.check_in_date} → {b.check_out_date}
                        </small>
                      </td>
                      <td>
                        <strong>RM {Number(b.total_amount).toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`status ${b.booking_status}`}>
                          {b.booking_status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
