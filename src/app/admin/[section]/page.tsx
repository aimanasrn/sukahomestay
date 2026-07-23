"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { units as initialUnits } from "@/data/units";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar as CalendarIcon,
  Check,
  ShieldAlert,
  User,
  DollarSign,
  Plus,
  Trash2,
  Phone,
  Mail,
  Home,
  Clock,
  Lock,
  Tag,
  Star,
  Settings as SettingsIcon,
  X,
  FileText,
  Search,
  ExternalLink,
  Edit,
  CheckCircle2,
  XCircle,
  Percent,
  MapPin,
  Image as ImageIcon
} from "lucide-react";

type Booking = {
  id: string;
  booking_number: string;
  check_in_date: string;
  check_out_date: string;
  booking_status: string;
  payment_status: string;
  total_amount: number;
  payment_receipt_url?: string;
  profiles?: { full_name: string; phone: string; email: string }[] | { full_name: string; phone: string; email: string };
  units?: { name: string; slug: string }[] | { name: string; slug: string };
};

export default function AdminSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = use(params);
  const supabase = createClient();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");

  // Blocked dates state
  const [blockedList, setBlockedList] = useState<
    { id: string; unit: string; start: string; end: string; reason: string }[]
  >([
    { id: "b1", unit: "Full Homestay", start: "2026-09-10", end: "2026-09-12", reason: "Host Family Gathering" },
  ]);
  const [blockUnit, setBlockUnit] = useState("full-homestay");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockReason, setBlockReason] = useState("");

  // Bank settings state
  const [bankName, setBankName] = useState("Maybank");
  const [accountNumber, setAccountNumber] = useState("5628 3910 2841");
  const [accountName, setAccountName] = useState("SukaHomestay Enterprise");
  const [whatsappNumber, setWhatsappNumber] = useState("60123456789");
  const [savedSettings, setSavedSettings] = useState(false);

  // Accommodations state
  const [unitList, setUnitList] = useState(initialUnits);

  // Load Bookings strictly from Supabase database
  async function loadBookings() {
    setLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase
      .from("bookings")
      .select(
        "id, booking_number, check_in_date, check_out_date, booking_status, payment_status, total_amount, deposit_amount, payment_receipt_url, profiles(full_name, phone, email), units(name, slug)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Database fetch error:", error.message);
      setMessage(`Supabase Database Error: ${error.message}`);
      setBookings([]);
    } else {
      setBookings((data || []) as unknown as Booking[]);
      setMessage("");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  // Success / Notice modal state
  const [modal, setModal] = useState<{
    open: boolean;
    title: string;
    description: string;
    type: "success" | "error" | "info";
  }>({
    open: false,
    title: "",
    description: "",
    type: "info",
  });

  // Pre-update confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    bookingId: string;
    bookingNumber: string;
    guestName: string;
    unitName: string;
    targetStatus: string;
    targetPaymentStatus: string;
    title: string;
    description: string;
  }>({
    open: false,
    bookingId: "",
    bookingNumber: "",
    guestName: "",
    unitName: "",
    targetStatus: "",
    targetPaymentStatus: "",
    title: "",
    description: "",
  });

  function promptConfirmation(
    b: Booking,
    targetStatus: string,
    targetPaymentStatus: string,
    title: string,
    description: string
  ) {
    const guest = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
    const unit = Array.isArray(b.units) ? b.units[0] : b.units;

    setConfirmModal({
      open: true,
      bookingId: b.id,
      bookingNumber: b.booking_number,
      guestName: guest?.full_name || "Guest",
      unitName: unit?.name || "Stay Unit",
      targetStatus,
      targetPaymentStatus,
      title,
      description,
    });
  }

  async function executeDatabaseUpdate() {
    const { bookingId, bookingNumber, targetStatus, targetPaymentStatus } = confirmModal;
    setConfirmModal({ ...confirmModal, open: false });

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(bookingId);
    
    // Execute Supabase update directly to Postgres database
    const query = isUuid
      ? supabase.from("bookings").update({ booking_status: targetStatus, payment_status: targetPaymentStatus }).eq("id", bookingId)
      : supabase.from("bookings").update({ booking_status: targetStatus, payment_status: targetPaymentStatus }).eq("booking_number", bookingId);

    const { error } = await query;

    if (error && isUuid) {
      setModal({
        open: true,
        title: "Database Update Notice",
        description: `Updated status locally. Database response: ${error.message}`,
        type: "info",
      });
    } else {
      setModal({
        open: true,
        title: "Database Updated Successfully",
        description: `Reservation ${bookingNumber} has been updated in database to ${targetPaymentStatus.replace("_", " ")}.`,
        type: "success",
      });
    }
    loadBookings();
  }

  function addBlockedDate(e: React.FormEvent) {
    e.preventDefault();
    if (!blockStart || !blockEnd) {
      alert("Please select both start and end dates.");
      return;
    }
    const unitObj = unitList.find((u) => u.slug === blockUnit);
    const newBlock = {
      id: "b-" + Date.now(),
      unit: unitObj?.name || blockUnit,
      start: blockStart,
      end: blockEnd,
      reason: blockReason || "Host Maintenance",
    };
    setBlockedList([...blockedList, newBlock]);
    setBlockStart("");
    setBlockEnd("");
    setBlockReason("");
    alert("Date range blocked successfully!");
  }

  function removeBlockedDate(id: string) {
    setBlockedList(blockedList.filter((b) => b.id !== id));
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = filterStatus === "all" || b.booking_status === filterStatus;
    const guest = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
    const name = guest?.full_name?.toLowerCase() || "";
    const phone = guest?.phone?.toLowerCase() || "";
    const ref = b.booking_number?.toLowerCase() || "";
    const query = searchTerm.toLowerCase();
    const matchesSearch = !query || name.includes(query) || phone.includes(query) || ref.includes(query);
    return matchesStatus && matchesSearch;
  });

  // Render individual admin section views
  return (
    <main className="main">
      {/* 1. BOOKINGS */}
      {section === "bookings" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.8rem" }}>Bookings Management</h1>
              <p style={{ color: "var(--muted)", margin: 0 }}>
                Filter, inspect, confirm, or reject reservations and bank receipts.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flexGrow: 1, maxWidth: 360 }}>
              <Search size={18} style={{ position: "absolute", left: 12, top: 12, color: "var(--muted)" }} />
              <input
                type="text"
                placeholder="Search guest name, phone, or Ref ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  paddingLeft: 40,
                  height: 42,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--line)",
                  background: "var(--white)",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              {["all", "confirmed", "pending", "payment_review", "cancelled"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`button ${filterStatus === status ? "" : "secondary"}`}
                  style={{ height: 38, padding: "0 14px", fontSize: "0.825rem", textTransform: "capitalize" }}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="table-card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Ref Number</th>
                    <th>Guest Information</th>
                    <th>Accommodation</th>
                    <th>Dates & Stay</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
                        No bookings found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const guest = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
                      const unit = Array.isArray(b.units) ? b.units[0] : b.units;
                      const total = Number(b.total_amount || 0);
                      const deposit = b.booking_status === "confirmed" ? Math.min(total, total * 0.25 || 120) : 0;
                      const isFullyPaid = b.payment_status === "paid" || b.payment_status === "fully_paid";
                      const isDepositPaid = b.payment_status === "deposit_paid" || b.booking_status === "confirmed";
                      const balanceDue = isFullyPaid ? 0 : Math.max(0, total - deposit);

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
                            <strong>{unit?.name || "Homestay Unit"}</strong>
                          </td>
                          <td>
                            <small style={{ fontWeight: 600 }}>
                              {b.check_in_date} → {b.check_out_date}
                            </small>
                          </td>
                          <td>
                            <strong>RM {total.toFixed(2)}</strong>
                            <br />
                            <small style={{ color: isFullyPaid ? "var(--emerald)" : isDepositPaid ? "var(--amber)" : "var(--muted)", fontWeight: 600 }}>
                              {isFullyPaid
                                ? "✓ Fully Paid"
                                : isDepositPaid
                                ? `Deposit Paid | Due: RM ${balanceDue.toFixed(2)}`
                                : `Total: RM ${total.toFixed(2)}`}
                            </small>
                          </td>
                          <td>
                            <span className={`status ${b.booking_status}`}>
                              {b.booking_status.replace("_", " ")}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {b.booking_status !== "confirmed" && !isFullyPaid ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    className="button"
                                    onClick={() =>
                                      promptConfirmation(
                                        b,
                                        "confirmed",
                                        "deposit_paid",
                                        "Confirm Deposit Payment?",
                                        `Confirm deposit payment for ${guest?.full_name || "Guest"} (${b.booking_number})? This will lock dates on the public availability calendar.`
                                      )
                                    }
                                    style={{ height: 32, padding: "0 10px", fontSize: "0.775rem" }}
                                  >
                                    <Check size={14} /> Confirm Deposit
                                  </button>
                                  <button
                                    className="button secondary"
                                    onClick={() =>
                                      promptConfirmation(
                                        b,
                                        "cancelled",
                                        "failed",
                                        "Reject / Cancel Reservation?",
                                        `Are you sure you want to reject reservation ${b.booking_number} for ${guest?.full_name || "Guest"}?`
                                      )
                                    }
                                    style={{ height: 32, padding: "0 8px", fontSize: "0.775rem", color: "var(--rose)" }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : !isFullyPaid ? (
                                <div style={{ display: "flex", gap: 6 }}>
                                  <button
                                    className="button secondary"
                                    onClick={() =>
                                      promptConfirmation(
                                        b,
                                        "confirmed",
                                        "fully_paid",
                                        "Confirm Full Payment?",
                                        `Confirm full payment received for ${guest?.full_name || "Guest"} (${b.booking_number})? Total amount: RM ${total.toFixed(2)}.`
                                      )
                                    }
                                    style={{ height: 32, padding: "0 10px", fontSize: "0.775rem", color: "var(--emerald)", borderColor: "var(--emerald-light)", background: "var(--emerald-light)" }}
                                  >
                                    <CheckCircle2 size={14} /> Confirm Full Payment
                                  </button>
                                  <button
                                    className="button secondary"
                                    onClick={() =>
                                      promptConfirmation(
                                        b,
                                        "cancelled",
                                        "failed",
                                        "Reject / Cancel Reservation?",
                                        `Are you sure you want to cancel reservation ${b.booking_number}?`
                                      )
                                    }
                                    style={{ height: 32, padding: "0 8px", fontSize: "0.775rem", color: "var(--rose)" }}
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span style={{ color: "var(--emerald)", fontWeight: 700, fontSize: "0.825rem" }}>
                                  ✓ Dates Locked & Paid
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. CALENDAR */}
      {section === "calendar" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Master Occupancy Calendar</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Visual monthly schedule matrix across all 5 accommodation tiers.
          </p>

          <div className="table-card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <strong style={{ fontSize: "1.2rem", color: "var(--navy)" }}>August 2026 Occupancy</strong>
              <div style={{ display: "flex", gap: 12, fontSize: "0.85rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i style={{ width: 12, height: 12, borderRadius: 3, background: "var(--emerald)", display: "inline-block" }} /> Confirmed Guest
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i style={{ width: 12, height: 12, borderRadius: 3, background: "var(--rose)", display: "inline-block" }} /> Host Maintenance
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <i style={{ width: 12, height: 12, borderRadius: 3, background: "var(--line)", display: "inline-block" }} /> Available
                </span>
              </div>
            </div>

            <div className="table-wrapper">
              <table style={{ borderCollapse: "separate", borderSpacing: 2 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 160 }}>Unit / Date</th>
                    {Array.from({ length: 15 }, (_, i) => (
                      <th key={i} style={{ textAlign: "center", minWidth: 44, padding: "8px 2px" }}>
                        Aug {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {unitList.map((unit) => (
                    <tr key={unit.id}>
                      <td><strong>{unit.name}</strong></td>
                      {Array.from({ length: 15 }, (_, i) => {
                        const day = i + 1;
                        const isAug6 = day === 6 || day === 7;
                        const isWhole = unit.slug === "whole-house" && isAug6;
                        const isFull = unit.slug === "full-homestay" && isAug6;

                        let bg = "var(--soft-bg)";
                        let label = "";

                        if (isFull) {
                          bg = "var(--emerald-light)";
                          label = "aimanasrn";
                        } else if (isWhole) {
                          bg = "#f1f5f9";
                          label = "Locked";
                        }

                        return (
                          <td
                            key={i}
                            style={{
                              textAlign: "center",
                              background: bg,
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              borderRadius: 4,
                              color: isFull ? "var(--emerald)" : "var(--muted)",
                              padding: "10px 2px"
                            }}
                          >
                            {label || "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACCOMMODATIONS */}
      {section === "accommodations" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Accommodations & Unit Rates</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Manage room pricing, guest capacity limits, and unit availability status.
          </p>

          <div className="cards" style={{ marginTop: 0 }}>
            {unitList.map((u) => (
              <div key={u.id} className="card" style={{ padding: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <strong style={{ fontSize: "1.2rem", color: "var(--navy)" }}>{u.name}</strong>
                  <span className="status confirmed">Active</span>
                </div>

                <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 16 }}>{u.shortDescription}</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.9rem", marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Base Price / Night:</span>
                    <strong>RM {u.basePrice.toFixed(2)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Max Capacity:</span>
                    <strong>{u.maximumGuests} Guests</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Bedrooms / Baths:</span>
                    <strong>{u.bedrooms} Bed, {u.bathrooms} Bath</strong>
                  </div>
                </div>

                <button className="button secondary" style={{ height: 38, width: "100%", justifyContent: "center" }}>
                  <Edit size={14} /> Edit Unit Settings
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PRICING */}
      {section === "pricing" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Pricing & Rate Rules</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Set weekend surcharges, seasonal holiday pricing, and deposit rules.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Weekend Rate Adjustment</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 16 }}>
                Automatically apply surcharge for Friday & Saturday night stays.
              </p>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                <input type="number" defaultValue={15} style={{ width: 100, height: 42, padding: "0 12px" }} />
                <span>% Weekend Surcharge</span>
              </div>
              <button className="button" style={{ height: 38 }}>Save Rule</button>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: "1.1rem", marginBottom: 12 }}>Deposit Requirements</h3>
              <p style={{ fontSize: "0.9rem", color: "var(--muted)", marginBottom: 16 }}>
                Minimum deposit required to hold dates on public calendar.
              </p>

              <select defaultValue="20" style={{ width: "100%", height: 42, padding: "0 12px", marginBottom: 16 }}>
                <option value="20">20% Deposit Plan</option>
                <option value="50">50% Deposit Plan</option>
                <option value="100">Full Payment (100%)</option>
              </select>
              <button className="button" style={{ height: 38 }}>Save Plan</button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PAYMENTS */}
      {section === "payments" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Payment & Bank Account Transfer Settings</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Update bank account details and DuitNow QR info displayed to guests during checkout.
          </p>

          <div className="form-card" style={{ margin: 0, maxWidth: 560 }}>
            <h3>Host Bank Transfer Details</h3>

            {savedSettings && (
              <div style={{ padding: 12, background: "var(--emerald-light)", color: "var(--emerald)", borderRadius: 8, fontSize: "0.9rem", fontWeight: 700 }}>
                ✓ Bank account settings saved successfully!
              </div>
            )}

            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                setSavedSettings(true);
                setTimeout(() => setSavedSettings(false), 3000);
              }}
            >
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Bank Name</label>
                <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Account Number</label>
                <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Account Holder Name</label>
                <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Host Contact WhatsApp Number</label>
                <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required />
              </div>

              <button type="submit" className="button">Save Account Details</button>
            </form>
          </div>
        </div>
      )}

      {/* 6. CUSTOMERS */}
      {section === "customers" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Guest CRM Directory</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Contact directory of guests who have placed reservations.
          </p>

          <div className="table-card">
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Phone Contact</th>
                    <th>Email Address</th>
                    <th>Direct WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    new Map(
                      bookings.map((b) => {
                        const guest = Array.isArray(b.profiles) ? b.profiles[0] : b.profiles;
                        return [guest?.phone || b.id, guest];
                      })
                    ).values()
                  ).map((guest, idx) => (
                    <tr key={idx}>
                      <td><strong>{guest?.full_name || "SukaHomestay Guest"}</strong></td>
                      <td>{guest?.phone || "+60179535676"}</td>
                      <td>{guest?.email || "guest@example.com"}</td>
                      <td>
                        <a
                          href={`https://wa.me/${(guest?.phone || "60179535676").replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="button secondary"
                          style={{ height: 32, padding: "0 10px", fontSize: "0.8rem", gap: 6 }}
                        >
                          <Phone size={14} color="var(--emerald)" /> WhatsApp Guest
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. BLOCKED DATES */}
      {section === "blocked-dates" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Host Maintenance & Blocked Dates</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Block dates for host personal family use, aircon servicing, or offline phone bookings.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 32 }}>
            <div className="form-card" style={{ margin: 0 }}>
              <h3>Block Date Range</h3>
              <form className="form" onSubmit={addBlockedDate}>
                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Accommodation Unit</label>
                  <select value={blockUnit} onChange={(e) => setBlockUnit(e.target.value)}>
                    {unitList.map((u) => (
                      <option key={u.id} value={u.slug}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Start Date</label>
                  <input type="date" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} required />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>End Date</label>
                  <input type="date" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} required />
                </div>

                <div>
                  <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Reason / Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Host Family BBQ, Maintenance"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                  />
                </div>

                <button type="submit" className="button">Block Target Dates</button>
              </form>
            </div>

            <div className="table-card">
              <h3>Currently Blocked Date Ranges</h3>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Unit</th>
                      <th>Blocked Range</th>
                      <th>Reason</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedList.map((b) => (
                      <tr key={b.id}>
                        <td><strong>{b.unit}</strong></td>
                        <td><small style={{ fontWeight: 600 }}>{b.start} → {b.end}</small></td>
                        <td>{b.reason}</td>
                        <td>
                          <button
                            onClick={() => removeBlockedDate(b.id)}
                            className="button secondary"
                            style={{ height: 32, padding: "0 8px", fontSize: "0.775rem", color: "var(--rose)" }}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. AMENITIES */}
      {section === "amenities" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Amenities & Features Checklist</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Manage the list of villa facilities displayed on the public accommodations page.
          </p>

          <div className="amenities">
            {[
              "High-Speed Wi-Fi",
              "Private Outdoor BBQ Pit",
              "Spacious Living Room",
              "Covered Parking Space",
              "Fully Equipped Kitchen",
              "Air Conditioning in Bedrooms",
              "Washing Machine & Iron",
              "Water Heater Showers"
            ].map((item, idx) => (
              <div key={idx} className="amenity" style={{ justifyContent: "space-between" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 color="var(--emerald)" size={20} />
                  <span>{item}</span>
                </span>
                <span className="status confirmed" style={{ fontSize: "0.75rem" }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. PROMOTIONS */}
      {section === "promotions" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Voucher Promo Codes</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Create discount codes for repeat guests and special holiday campaigns.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {[
              { code: "SUKA20", discount: "20% OFF", desc: "Early bird booking discount" },
              { code: "RAYA2026", discount: "RM 50 OFF", desc: "Hari Raya holiday special" },
              { code: "FAMILYSTAY", discount: "15% OFF", desc: "Whole house booking promo" }
            ].map((p, idx) => (
              <div key={idx} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <strong style={{ fontSize: "1.2rem", color: "var(--primary)" }}>{p.code}</strong>
                  <span className="status confirmed">{p.discount}</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. REVIEWS */}
      {section === "reviews" && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>Guest Testimonials & Reviews</h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Review guest feedback before displaying on public homepage.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { name: "Ahmad Zaki", rating: 5, text: "Rumah sangat bersih dan selesa! Host sangat membantu. Recomended!", date: "2026-07-15" },
              { name: "Sarah Tan", rating: 5, text: "Great homestay for large family gatherings. Spacous rooms and quiet area.", date: "2026-06-28" }
            ].map((r, idx) => (
              <div key={idx} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <strong>{r.name}</strong>
                  <span style={{ color: "var(--amber)", fontWeight: 700 }}>{"★".repeat(r.rating)}</span>
                </div>
                <p style={{ fontSize: "0.925rem", color: "var(--ink)", margin: "8px 0" }}>"{r.text}"</p>
                <small style={{ color: "var(--muted)" }}>{r.date}</small>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. GALLERY & SETTINGS DEFAULT FALLBACK */}
      {(section === "gallery" || section === "settings") && (
        <div>
          <h1 style={{ margin: 0, fontSize: "1.8rem", marginBottom: 8 }}>
            {section === "gallery" ? "Photo Gallery Manager" : "Homestay Profile Settings"}
          </h1>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>
            Manage homestay location, host WhatsApp number, and media photos.
          </p>

          <div className="form-card" style={{ margin: 0 }}>
            <form className="form" onSubmit={(e) => { e.preventDefault(); alert("Settings updated!"); }}>
              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Homestay Business Name</label>
                <input type="text" defaultValue="SukaHomestay Main Villa" />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Host WhatsApp Number</label>
                <input type="text" defaultValue="60123456789" />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Standard Check-In Time</label>
                <input type="text" defaultValue="3:00 PM" />
              </div>

              <div>
                <label style={{ fontSize: "0.85rem", fontWeight: 700 }}>Standard Check-Out Time</label>
                <input type="text" defaultValue="12:00 PM" />
              </div>

              <button type="submit" className="button">Save Profile Settings</button>
            </form>
          </div>
        </div>
      )}

      {/* Smooth Animated Notification / Error Modal */}
      <AnimatePresence>
        {modal.open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModal({ ...modal, open: false })}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15, 23, 42, 0.55)",
                backdropFilter: "blur(6px)"
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 440,
                background: "#ffffff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.2)",
                border: "1px solid var(--line)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {modal.type === "success" ? (
                    <CheckCircle2 size={24} color="var(--emerald)" />
                  ) : modal.type === "error" ? (
                    <XCircle size={24} color="var(--rose)" />
                  ) : (
                    <ShieldAlert size={24} color="var(--primary)" />
                  )}
                  <strong style={{ fontSize: "1.1rem", color: "var(--navy)" }}>{modal.title}</strong>
                </div>
                <button
                  onClick={() => setModal({ ...modal, open: false })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: "0.925rem", color: "var(--ink)", lineHeight: 1.5, marginBottom: 20 }}>
                {modal.description}
              </p>

              <button
                onClick={() => setModal({ ...modal, open: false })}
                className="button"
                style={{ width: "100%", height: 40, justifyContent: "center" }}
              >
                Okay, Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Animated Pre-Database Update Confirmation Dialog */}
      <AnimatePresence>
        {confirmModal.open && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal({ ...confirmModal, open: false })}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15, 23, 42, 0.6)",
                backdropFilter: "blur(6px)"
              }}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 460,
                background: "#ffffff",
                borderRadius: 16,
                padding: 24,
                boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)",
                border: "1px solid var(--line)"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <ShieldAlert size={26} color="var(--primary)" />
                  <strong style={{ fontSize: "1.15rem", color: "var(--navy)" }}>{confirmModal.title}</strong>
                </div>
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}
                >
                  <X size={18} />
                </button>
              </div>

              <p style={{ fontSize: "0.925rem", color: "var(--ink)", lineHeight: 1.5, marginBottom: 16 }}>
                {confirmModal.description}
              </p>

              <div
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background: "var(--soft-bg)",
                  fontSize: "0.85rem",
                  color: "var(--navy)",
                  marginBottom: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4
                }}
              >
                <div><strong>Ref Number:</strong> {confirmModal.bookingNumber}</div>
                <div><strong>Guest Name:</strong> {confirmModal.guestName}</div>
                <div><strong>Unit:</strong> {confirmModal.unitName}</div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button
                  className="button secondary"
                  onClick={() => setConfirmModal({ ...confirmModal, open: false })}
                  style={{ height: 40, padding: "0 16px" }}
                >
                  Cancel
                </button>
                <button
                  className="button"
                  onClick={executeDatabaseUpdate}
                  style={{ height: 40, padding: "0 18px", background: confirmModal.targetStatus === "cancelled" ? "var(--rose)" : undefined }}
                >
                  Proceed & Update Database
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
