"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Check, ShieldAlert, User, Calendar, DollarSign, ExternalLink } from "lucide-react";

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

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState("Loading bookings...");
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

  async function confirmBooking(id: string) {
    const { error } = await supabase
      .from("bookings")
      .update({ booking_status: "confirmed", payment_status: "paid" })
      .eq("id", id);

    if (error) {
      alert("Failed to confirm booking: " + error.message);
      return;
    }
    load();
  }

  async function cancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking request?")) return;
    const { error } = await supabase
      .from("bookings")
      .update({ booking_status: "cancelled", payment_status: "failed" })
      .eq("id", id);

    if (error) {
      alert("Failed to cancel booking: " + error.message);
      return;
    }
    load();
  }

  return (
    <main className="main">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <ShieldAlert size={28} color="var(--primary)" />
        <h1 style={{ margin: 0 }}>Admin Reservation Console</h1>
      </div>
      <p style={{ marginBottom: 32 }}>
        Review bank receipts submitted via WhatsApp or dashboard, confirm reservations, and automatically lock dates on the public availability calendar.
      </p>

      <div className="stats">
        <div className="stat">
          <span>Total Requests</span>
          <strong>{bookings.length}</strong>
        </div>
        <div className="stat">
          <span>Confirmed</span>
          <strong>{bookings.filter((b) => b.booking_status === "confirmed").length}</strong>
        </div>
        <div className="stat">
          <span>Payment Review</span>
          <strong>{bookings.filter((b) => b.booking_status === "payment_review" || b.booking_status === "pending").length}</strong>
        </div>
      </div>

      <div className="table-card">
        <h3>Reservation Queue</h3>

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
                  <th>Status</th>
                  <th>Actions</th>
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
                      <td>
                        {b.booking_status !== "confirmed" ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              className="button"
                              onClick={() => confirmBooking(b.id)}
                              style={{ height: 34, padding: "0 14px", fontSize: "0.825rem" }}
                            >
                              <Check size={14} />
                              <span>Confirm & Lock</span>
                            </button>
                            <button
                              className="button secondary"
                              onClick={() => cancelBooking(b.id)}
                              style={{ height: 34, padding: "0 10px", fontSize: "0.825rem", color: "var(--rose)" }}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "var(--emerald)", fontWeight: 700, fontSize: "0.85rem" }}>
                            ✓ Dates Locked
                          </span>
                        )}
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
