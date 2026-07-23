"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { createClient } from "@/lib/supabase/browser";
import { Upload, Calendar, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { whatsappUrl } from "@/lib/demo-bookings";
import { useLanguage } from "@/context/language-context";

type BookingItem = {
  id: string;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  units: { name: string } | { name: string }[];
};

export default function Dashboard() {
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingBookingId, setUploadingBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "warning" | "error"; text: string; linkWhatsApp?: string } | null>(null);
  const { t } = useLanguage();

  const supabase = createClient();

  async function loadBookings() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("bookings")
      .select("id, booking_number, check_in_date, check_out_date, booking_status, payment_status, total_amount, units(name)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBookings(data as unknown as BookingItem[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleFileUpload(event: ChangeEvent<HTMLInputElement>, booking: BookingItem) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingBookingId(booking.id);
    setFeedback(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please log in to upload payment proof.");

      const filePath = `${user.id}/${booking.id}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(filePath, file, { upsert: true });

      // Update payments table and booking status
      await supabase.from("payments").insert({
        booking_id: booking.id,
        payment_method: "bank_transfer",
        amount: 0,
        receipt_path: uploadError ? "whatsapp_submission" : filePath,
        payment_status: "under_review",
      });

      await supabase
        .from("bookings")
        .update({ payment_status: "under_review", booking_status: "payment_review" })
        .eq("id", booking.id);

      const waMsg = `Hi Host, I submitted my receipt for SukaHomestay Booking Reference: ${booking.booking_number} (${booking.check_in_date} to ${booking.check_out_date}).`;

      if (uploadError) {
        setFeedback({
          type: "warning",
          text: `Your reservation ${booking.booking_number} has been updated to 'Under Review'! To enable direct file storage, toggle 'Public Bucket' to ON under Supabase → Storage → payment-receipts → Settings.`,
          linkWhatsApp: whatsappUrl(waMsg),
        });
      } else {
        setFeedback({
          type: "success",
          text: `Payment receipt uploaded successfully for ${booking.booking_number}! Your status is now Under Review.`,
        });
      }

      loadBookings();
    } catch (err) {
      setFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to process receipt upload. Please try again.",
      });
    } finally {
      setUploadingBookingId(null);
    }
  }

  const upcomingCount = bookings.filter((b) => b.booking_status === "confirmed").length;
  const reviewCount = bookings.filter((b) => b.booking_status === "payment_review" || b.payment_status === "under_review").length;
  const pendingCount = bookings.filter((b) => b.booking_status === "pending").length;

  return (
    <main className="main">
      <h1>{t("dash_title")}</h1>
      <p>{t("dash_lead")}</p>

      {feedback && (
        <div
          style={{
            padding: "16px 20px",
            background: feedback.type === "success" ? "var(--emerald-light)" : feedback.type === "warning" ? "var(--amber-light)" : "var(--rose-light)",
            color: feedback.type === "success" ? "var(--emerald)" : feedback.type === "warning" ? "#78350f" : "var(--rose)",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            marginBottom: 24,
            border: `1px solid ${feedback.type === "success" ? "#a7f3d0" : feedback.type === "warning" ? "#fde68a" : "#fecaca"}`,
            display: "flex",
            flexDirection: "column",
            gap: 10
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {feedback.type === "success" ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{feedback.text}</span>
          </div>

          {feedback.linkWhatsApp && (
            <a
              href={feedback.linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="button secondary"
              style={{ width: "fit-content", height: 34, padding: "0 14px", fontSize: "0.85rem", color: "#78350f" }}
            >
              <MessageSquare size={14} />
              <span>Send Receipt Copy via WhatsApp</span>
            </a>
          )}
        </div>
      )}

      <div className="stats">
        <div className="stat">
          <span>{t("dash_stat_confirmed")}</span>
          <strong>{upcomingCount}</strong>
        </div>
        <div className="stat">
          <span>{t("dash_stat_review")}</span>
          <strong>{reviewCount}</strong>
        </div>
        <div className="stat">
          <span>{t("dash_stat_pending")}</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="stat">
          <span>{t("dash_stat_total")}</span>
          <strong>{bookings.length}</strong>
        </div>
      </div>

      <div className="table-card">
        <h3>{t("dash_history_title")}</h3>

        {loading ? (
          <p style={{ padding: 20, color: "var(--muted)" }}>Loading your bookings...</p>
        ) : bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <Calendar size={40} color="var(--muted)" style={{ marginBottom: 12 }} />
            <h4 style={{ color: "var(--navy)", marginBottom: 6 }}>No Bookings Found</h4>
            <p style={{ color: "var(--muted)", maxWidth: 420, margin: "0 auto 20px" }}>
              When you reserve a stay at SukaHomestay, your booking reference, dates, and payment proof actions will appear here.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t("dash_col_ref")}</th>
                  <th>{t("dash_col_unit")}</th>
                  <th>{t("dash_col_dates")}</th>
                  <th>{t("dash_col_total")}</th>
                  <th>{t("dash_col_status")}</th>
                  <th>{t("dash_col_action")}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const unitName = Array.isArray(booking.units) ? booking.units[0]?.name : booking.units?.name;
                  const waMsg = `Hi Host, submitting payment receipt for SukaHomestay Booking Reference: ${booking.booking_number}`;

                  return (
                    <tr key={booking.id}>
                      <td>
                        <strong>{booking.booking_number}</strong>
                      </td>
                      <td>{unitName || "SukaHomestay Stay"}</td>
                      <td>
                        {booking.check_in_date} → {booking.check_out_date}
                      </td>
                      <td>RM {Number(booking.total_amount).toFixed(2)}</td>
                      <td>
                        <span className={`status ${booking.booking_status}`}>
                          {booking.booking_status.replace("_", " ")}
                        </span>
                      </td>
                      <td>
                        {booking.booking_status === "confirmed" ? (
                          <span style={{ color: "var(--emerald)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                            <CheckCircle size={16} /> Confirmed
                          </span>
                        ) : (
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <label className="button secondary" style={{ height: 34, padding: "0 12px", fontSize: "0.825rem", cursor: "pointer" }}>
                              <Upload size={14} />
                              <span>{uploadingBookingId === booking.id ? t("dash_uploading") : t("dash_upload_btn")}</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                style={{ display: "none" }}
                                onChange={(e) => handleFileUpload(e, booking)}
                              />
                            </label>
                            <a
                              href={whatsappUrl(waMsg)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="button secondary"
                              style={{ height: 34, padding: "0 10px", fontSize: "0.825rem", color: "var(--emerald)" }}
                              title="Send receipt on WhatsApp"
                            >
                              <MessageSquare size={14} />
                            </a>
                          </div>
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
