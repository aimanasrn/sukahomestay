import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  House,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  Settings as SettingsIcon,
  Users,
} from "lucide-react";
import { useLanguage, type TranslationKey } from "../i18n";
import { useApp } from "../state";
import { clearDemoBookings } from "../api";
import {
  adminAction,
  adminAllocations,
  isDemo,
  listBookings,
  saveAccommodation,
  saveSettings,
  supabase,
  updatePhoto,
  updateRate,
} from "../api";
import {
  ErrorNotice,
  Field,
  LanguageSwitch,
  Logo,
  Modal,
  Notice,
  Photo,
} from "../components";
import {
  dateAfter,
  formatDate,
  money,
  names,
  overlaps,
  resources,
  type Accommodation,
  type Allocation,
  type Booking,
  type PackageId,
  type Settings,
} from "../domain";
import { useAvailability } from "../useAvailability";
import ManualBooking from "../ManualBooking";
import PaymentInvoices from "../PaymentInvoices";

type Tab = "overview" | "bookings" | "calendar" | "stays" | "settings";
export default function Admin() {
  const { t } = useLanguage();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(!isDemo);
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const check = async () => {
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      setAuthorized(!!data && !error);
    } else setAuthorized(false);
    setChecking(false);
  };
  useEffect(() => {
    void check();
    const listener = supabase?.auth.onAuthStateChange(() => {
      setTimeout(() => void check(), 0);
    });
    return () => listener?.data.subscription.unsubscribe();
  }, []);
  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await supabase!.auth.signInWithPassword({
        email,
        password,
      });
      if (result.error) throw result.error;
      const { data } = await supabase!
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", result.data.user.id)
        .maybeSingle();
      if (!data) {
        await supabase!.auth.signOut();
        throw new Error("FORBIDDEN");
      }
      setAuthorized(true);
    } catch {
      setError("AUTH_FAILED");
    } finally {
      setBusy(false);
    }
  };
  if (checking) return <div className="page-loading">{t("loading")}</div>;
  if (!authorized)
    return (
      <div className="admin-login">
        <div className="login-visual">
          <img src="/images/courtyard.webp" alt={t("photo")} />
          <div>
            <Logo />
            <h1>{t("footer")}</h1>
            <small>{t("photo")}</small>
          </div>
        </div>
        <div className="login-form-wrap">
          <div className="row">
            <Link className="text-link" to="/">
              <ArrowLeft size={17} />
              {t("home")}
            </Link>
            <LanguageSwitch />
          </div>
          <div>
            <span className="eyebrow">SUKA HOMESTAY</span>
            <h1>{t("login")}</h1>
            <p>{t("adminLoginDesc")}</p>
            <ErrorNotice code={error} />
            {isDemo ? (
              <>
                <Notice>{t("demoAdminNote")}</Notice>
                <button
                  className="button full"
                  onClick={() => setAuthorized(true)}
                >
                  {t("demoAdmin")}
                </button>
              </>
            ) : (
              <form onSubmit={signIn}>
                <Field label={t("email")}>
                  <input
                    required
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
                <Field label={t("password")}>
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <button className="button full" disabled={busy}>
                  {busy ? t("loading") : t("signIn")}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  const tabs = [
    { id: "overview", icon: LayoutDashboard },
    { id: "bookings", icon: CalendarDays },
    { id: "calendar", icon: CalendarDays },
    { id: "stays", icon: House },
    { id: "settings", icon: SettingsIcon },
  ] as const;
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Logo />
        <nav>
          {tabs.map(({ id, icon: Icon }) => (
            <button
              key={id}
              className={tab === id ? "active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={19} />
              {t(id)}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {isDemo && <span className="demo-label">{t("demo")}</span>}
          <Link to="/">{t("home")}</Link>
          <button
            onClick={async () => {
              await supabase?.auth.signOut();
              setAuthorized(false);
            }}
          >
            <LogOut size={17} />
            {t("signOut")}
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-top">
          <span>SUKA HOMESTAY / {t(tab)}</span>
          <LanguageSwitch />
        </header>
        <div className="admin-content">
          {isDemo && (
            <Notice>
              {t("demoNotice")} {t("demoPrivacy")}{" "}
              <button
                className="text-link"
                onClick={() => {
                  clearDemoBookings();
                  setAuthorized(false);
                  setTab("overview");
                }}
              >
                {t("clearDemo")}
              </button>
            </Notice>
          )}
          {tab === "overview" || tab === "bookings" ? (
            <BookingsPanel overview={tab === "overview"} />
          ) : tab === "calendar" ? (
            <ResourceCalendar />
          ) : tab === "stays" ? (
            <AccommodationEditor />
          ) : (
            <SettingsEditor />
          )}
        </div>
      </div>
    </div>
  );
}
function BookingsPanel({ overview }: { overview: boolean }) {
  const { t, lang } = useLanguage();
  const [list, setList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const revision = useAvailability(dateAfter(), dateAfter(1));
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [manual, setManual] = useState(false);
  const reload = async () => {
    try {
      const latest = await listBookings();
      setList(latest);
      setSelected((previous) =>
        previous ? latest.find((b) => b.id === previous.id) || null : null,
      );
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, [revision.rows]);
  const filtered = list.filter(
    (b) =>
      (!status || b.status === status) &&
      (!from || b.check_in >= from) &&
      (!to || b.check_in <= to) &&
      `${b.reference} ${b.name} ${b.phone}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      {manual && (
        <ManualBooking
          onClose={() => setManual(false)}
          onSaved={() => void reload()}
        />
      )}
      <div className="admin-heading">
        <h1>{t(overview ? "welcome" : "bookings")}</h1>
        <p>{t("adminSub")}</p>
        <button className="button" onClick={() => setManual(true)}>
          <Plus size={17} />
          {t("manualBooking")}
        </button>
      </div>
      <ErrorNotice code={error} />
      {overview && (
        <div className="stats">
          {(
            [
              {
                key: "pendingRequests",
                icon: Clock,
                value: list.filter((b) => b.status === "pending").length,
              },
              {
                key: "confirmedBookings",
                icon: CheckCircle2,
                value: list.filter((b) => b.status === "confirmed").length,
              },
              {
                key: "arrivals",
                icon: Users,
                value: list.filter(
                  (b) =>
                    b.status === "confirmed" &&
                    b.check_in >= dateAfter() &&
                    b.check_in <= dateAfter(7),
                ).length,
              },
              {
                key: "payments",
                icon: CreditCard,
                value: money(
                  list.reduce((s, b) => s + b.paid_sen, 0),
                  lang,
                ),
              },
            ] as const
          ).map(({ key, icon: Icon, value }) => (
            <div key={key}>
              <span className="stat-icon">
                <Icon size={22} />
              </span>
              <span>{t(key)}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="admin-panel">
        <div className="table-filters">
          <label className="search-input">
            <Search size={18} />
            <input
              aria-label={t("search")}
              placeholder={t("search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label={t("status")}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">{t("allStatuses")}</option>
            {["pending", "confirmed", "cancelled", "rejected", "expired"].map(
              (s) => (
                <option key={s} value={s}>
                  {t(s as TranslationKey)}
                </option>
              ),
            )}
          </select>
          <Field label={t("startDate")}>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </Field>
          <Field label={t("endDate")}>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </Field>
        </div>
        <div className="table-scroll">
          <table className="booking-table">
            <thead>
              <tr>
                {[
                  "reference",
                  "customer",
                  "dates",
                  "stays",
                  "amount",
                  "status",
                ].map((k) => (
                  <th key={k}>{t(k as TranslationKey)}</th>
                ))}
                <th>{t("details")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id}>
                  <td>
                    <strong>{b.reference}</strong>
                  </td>
                  <td>
                    {b.name}
                    <small>{b.phone}</small>
                  </td>
                  <td>
                    {formatDate(b.check_in, lang)}
                    <small>{formatDate(b.check_out, lang)}</small>
                  </td>
                  <td>
                    {names[b.quote.package_id][lang]}
                    <small>
                      {b.resources.map((r) => names[r][lang]).join(" + ")}
                    </small>
                  </td>
                  <td>
                    {money(b.quote.total_sen, lang)}
                    <small>{t(b.payment_status)}</small>
                  </td>
                  <td>
                    <span className={`status ${b.status}`}>{t(b.status)}</span>
                  </td>
                  <td>
                    <button
                      className="text-link"
                      onClick={() => setSelected(b)}
                    >
                      {t("details")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? (
          <div className="empty-state">{t("loading")}</div>
        ) : (
          !filtered.length && (
            <div className="empty-state">
              <CalendarDays size={34} strokeWidth={1} />
              <h3>
                {t(
                  query || status || from || to ? "noResults" : "emptyBookings",
                )}
              </h3>
              <p>{t("emptyDesc")}</p>
            </div>
          )
        )}
      </div>
      {overview && <ResourceCalendar compact />}
      {selected && (
        <BookingDetail
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdate={async () => {
            await reload();
          }}
        />
      )}
    </>
  );
}
function BookingDetail({
  booking: b,
  onClose,
  onUpdate,
}: {
  booking: Booking;
  onClose: () => void;
  onUpdate: () => Promise<void>;
}) {
  const { t, lang } = useLanguage();
  const [notes, setNotes] = useState(b.notes);
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [paymentKey, setPaymentKey] = useState(crypto.randomUUID());
  const [invoiceRevision, setInvoiceRevision] = useState(0);
  const action = async (name: string) => {
    setBusy(true);
    setError("");
    try {
      await adminAction({
        id: b.id,
        action: name,
        notes,
        amount_sen: Math.round(Number(amount) * 100),
        reference,
        idempotency_key: paymentKey,
      });
      await onUpdate();
      if (name === "payment" || name === "refund") {
        setPaymentKey(crypto.randomUUID());
        setAmount("");
        setReference("");
        setInvoiceRevision((n) => n + 1);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal label={b.reference} onClose={onClose}>
      <span className="eyebrow">{b.reference}</span>
      <h2>{b.name}</h2>
      <p>
        {b.phone} {b.email && `· ${b.email}`}
      </p>
      <span className={`status ${b.status}`}>{t(b.status)}</span>{" "}
      <span className="status">{t(b.payment_status)}</span>
      <p>
        {formatDate(b.check_in, lang)} — {formatDate(b.check_out, lang)}
      </p>
      <p>{b.resources.map((r) => names[r][lang]).join(" + ")}</p>
      <p>
        {b.adults} {t("adults")} · {b.children} {t("children")}
      </p>
      <div className="price-total">
        <span>{t("total")}</span>
        <strong>{money(b.quote.total_sen, lang)}</strong>
      </div>
      <p>
        {t("payments")}: {money(b.paid_sen, lang)} · {t("deposit")}:{" "}
        {money(b.quote.deposit_sen, lang)}
      </p>
      {b.special_requests && <p>{b.special_requests}</p>}
      <ErrorNotice code={error} />
      <Field label={t("internalNotes")}>
        <textarea
          rows={3}
          maxLength={5000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      <button
        className="button outline"
        disabled={busy}
        onClick={() => void action("notes")}
      >
        {t("save")}
      </button>
      <hr />
      <PaymentInvoices bookingId={b.id} revision={invoiceRevision} />
      <hr />
      <h3>{t("recordPayment")}</h3>
      <p className="small">{t("paymentNote")}</p>
      <div className="form-grid">
        <Field label={t("paymentAmount")}>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Field>
        <Field label={t("paymentReference")}>
          <input
            maxLength={200}
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </Field>
      </div>
      <div className="action-row">
        <button
          className="button outline"
          disabled={busy || !amount || !reference}
          onClick={() => void action("payment")}
        >
          {t("recordPayment")}
        </button>
        <button
          className="button outline"
          disabled={busy || !amount || !reference}
          onClick={() => void action("refund")}
        >
          {t("refund")}
        </button>
      </div>
      <hr />
      <div className="action-row">
        <button
          className="button"
          disabled={busy || !["pending", "expired"].includes(b.status)}
          onClick={() => void action("confirm")}
        >
          {t("confirm")}
        </button>
        <button
          className="button outline"
          disabled={busy || !["pending", "expired"].includes(b.status)}
          onClick={() => void action("reject")}
        >
          {t("reject")}
        </button>
        <button
          className="button danger"
          disabled={
            busy || !["pending", "confirmed", "expired"].includes(b.status)
          }
          onClick={() => void action("cancel")}
        >
          {t("cancel")}
        </button>
      </div>
    </Modal>
  );
}
function ResourceCalendar({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useLanguage();
  const [alloc, setAlloc] = useState<Allocation[]>([]);
  const revision = useAvailability(dateAfter(), dateAfter(1));
  const [start, setStart] = useState(dateAfter());
  const [error, setError] = useState("");
  const [block, setBlock] = useState(false);
  const [resource, setResource] = useState("MAIN");
  const [end, setEnd] = useState(dateAfter(1));
  const [kind, setKind] = useState("maintenance");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const reload = async () => {
    try {
      setAlloc(await adminAllocations());
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void reload();
  }, [revision.rows]);
  const days = Array.from({ length: 14 }, (_, n) => {
    const d = new Date(`${start}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  });
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminAction({
        action: "block",
        resource_id: resource,
        check_in: start,
        check_out: end,
        kind,
        label,
      });
      await reload();
      setBlock(false);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className={`admin-panel resource-calendar ${compact ? "compact-calendar" : ""}`}
    >
      <div className="row">
        <h2>{t("calendar")}</h2>
        <div className="action-row">
          <input
            aria-label={t("startDate")}
            type="date"
            required
            value={start}
            onChange={(e) => {
              if (e.target.value) setStart(e.target.value);
            }}
          />
          <button className="button outline" onClick={() => setBlock(true)}>
            <Plus size={16} />
            {t("addBlock")}
          </button>
        </div>
      </div>
      <ErrorNotice code={error} />
      <div className="table-scroll">
        <table className="resource-table">
          <thead>
            <tr>
              <th>{t("resource")}</th>
              {days.map((d) => (
                <th key={d}>
                  {new Date(`${d}T12:00:00`).getDate()}
                  <small>
                    {new Intl.DateTimeFormat(
                      lang === "ms" ? "ms-MY" : "en-MY",
                      { weekday: "short" },
                    ).format(new Date(`${d}T12:00:00`))}
                  </small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resources.map((r) => (
              <tr key={r}>
                <th>{names[r][lang]}</th>
                {days.map((d) => {
                  const a = alloc.find(
                    (a) =>
                      a.resource_id === r && a.check_in <= d && a.check_out > d,
                  );
                  return (
                    <td
                      key={d}
                      className={a ? `allocated ${a.kind}` : ""}
                      title={a?.label || a?.kind || t("available")}
                    >
                      {a ? <span aria-label={t("unavailable")}>•</span> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="calendar-legend">
        <span>
          <i className="legend-booking" />
          {t("bookings")}
        </span>
        <span>
          <i className="legend-maintenance" />
          {t("maintenance")}
        </span>
        <span>
          <i className="legend-owner" />
          {t("owner")}
        </span>
      </div>
      {!compact &&
        alloc
          .filter((a) => a.kind !== "booking")
          .map((a) => (
            <div className="block-row" key={a.id}>
              <span>
                {a.resource_id} · {a.check_in} → {a.check_out} · {a.label}
              </span>
              <button
                className="text-link"
                onClick={async () => {
                  try {
                    await adminAction({ action: "unblock", id: a.id });
                    await reload();
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                {t("removeBlock")}
              </button>
            </div>
          ))}
      {block && (
        <Modal label={t("addBlock")} onClose={() => setBlock(false)}>
          <h2>{t("addBlock")}</h2>
          <ErrorNotice code={error} />
          <form onSubmit={save}>
            <Field label={t("resource")}>
              <select
                value={resource}
                onChange={(e) => setResource(e.target.value)}
              >
                {resources.map((r) => (
                  <option key={r} value={r}>
                    {names[r][lang]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="form-grid">
              <Field label={t("checkIn")}>
                <input
                  required
                  type="date"
                  min={dateAfter()}
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </Field>
              <Field label={t("checkOut")}>
                <input
                  required
                  type="date"
                  min={start}
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </Field>
            </div>
            <Field label={t("type")}>
              <select value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="maintenance">{t("maintenance")}</option>
                <option value="owner">{t("owner")}</option>
              </select>
            </Field>
            <Field label={t("blockLabel")}>
              <input
                maxLength={200}
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </Field>
            <button className="button" disabled={busy || end <= start}>
              {t("save")}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
function SettingsEditor() {
  const { t } = useLanguage();
  const { catalog, reload } = useApp();
  const [s, setS] = useState<Settings>(catalog.settings);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      if (
        s.booking_enabled &&
        (!/^\d{8,15}$/.test(s.whatsapp) ||
          s.policies.ms.length < 10 ||
          s.policies.en.length < 10 ||
          catalog.accommodations.some((a) => !a.capacity))
      )
        throw new Error("BOOKING_NOT_CONFIGURED");
      await saveSettings(s);
      await reload();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const field = (key: keyof Settings, label: TranslationKey, type = "text") => (
    <Field key={key} label={t(label)}>
      <input
        type={type}
        value={String(s[key])}
        onChange={(e) => setS({ ...s, [key]: e.target.value })}
      />
    </Field>
  );
  return (
    <>
      <h1>{t("settings")}</h1>
      <Notice>{t("configurationNote")}</Notice>
      <form className="admin-panel settings-form" onSubmit={save}>
        <h2>{t("contact")}</h2>
        <div className="form-grid">
          {field("whatsapp", "whatsappNumber")}
          {field("contact_email", "contactEmail", "email")}
          {field("address", "address")}
          {field("map_url", "mapUrl", "url")}
          {field("check_in", "checkInTime", "time")}
          {field("check_out", "checkOutTime", "time")}
        </div>
        <h2>{t("rates")}</h2>
        <div className="form-grid">
          <Field label={t("cleaningFee")}>
            <input
              type="number"
              min="0"
              step="0.01"
              value={s.cleaning_fee / 100}
              onChange={(e) =>
                setS({
                  ...s,
                  cleaning_fee: Math.round(Number(e.target.value) * 100),
                })
              }
            />
          </Field>
          <Field label={t("depositPercent")}>
            <input
              type="number"
              min="0"
              max="100"
              value={s.deposit_percent}
              onChange={(e) =>
                setS({ ...s, deposit_percent: Number(e.target.value) })
              }
            />
          </Field>
          <Field label={t("holdMinutes")}>
            <input
              type="number"
              min="5"
              max="10080"
              value={s.hold_minutes}
              onChange={(e) =>
                setS({ ...s, hold_minutes: Number(e.target.value) })
              }
            />
          </Field>
          {field("policy_version", "policyVersion")}
        </div>
        <h2>{t("policies")}</h2>
        <div className="form-grid">
          {(["ms", "en"] as const).map((l) => (
            <Field key={l} label={t(l === "ms" ? "policiesBM" : "policiesEN")}>
              <textarea
                rows={6}
                value={s.policies[l]}
                onChange={(e) =>
                  setS({
                    ...s,
                    policies: { ...s.policies, [l]: e.target.value },
                  })
                }
              />
            </Field>
          ))}
          {(["ms", "en"] as const).map((l) => (
            <Field key={l} label={t(l === "ms" ? "rulesBM" : "rulesEN")}>
              <textarea
                rows={5}
                value={s.rules[l]}
                onChange={(e) =>
                  setS({ ...s, rules: { ...s.rules, [l]: e.target.value } })
                }
              />
            </Field>
          ))}
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={s.demo_rates}
            onChange={(e) => setS({ ...s, demo_rates: e.target.checked })}
          />
          {t("sampleRates")}
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={s.booking_enabled}
            onChange={(e) => setS({ ...s, booking_enabled: e.target.checked })}
          />
          {t("enableBookings")}
        </label>
        <ErrorNotice code={error} />
        {saved && <Notice type="success">{t("saved")}</Notice>}
        <button className="button" disabled={busy}>
          {busy ? t("loading") : t("save")}
        </button>
      </form>
    </>
  );
}
function AccommodationEditor() {
  const { t, lang } = useLanguage();
  const { catalog, reload } = useApp();
  const [selected, setSelected] = useState<PackageId>("MAIN");
  const [a, setA] = useState<Accommodation>(catalog.accommodations[0]);
  const [photo, setPhoto] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [rateStart, setRateStart] = useState(dateAfter());
  const [rateEnd, setRateEnd] = useState(dateAfter(1));
  const [rate, setRate] = useState(0);
  useEffect(() => {
    setA(catalog.accommodations.find((a) => a.id === selected)!);
  }, [selected, catalog]);
  const perform = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await fn();
      await reload();
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <h1>{t("stays")}</h1>
      <div className="accommodation-tabs">
        {catalog.accommodations.map((a) => (
          <button
            key={a.id}
            className={`button ${selected === a.id ? "" : "outline"}`}
            onClick={() => setSelected(a.id)}
          >
            {names[a.id][lang]}
          </button>
        ))}
      </div>
      <div className="admin-panel settings-form">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void perform(() => saveAccommodation(a));
          }}
        >
          <h2>{names[a.id][lang]}</h2>
          <div className="form-grid">
            <Field label={t("capacity")}>
              <input
                type="number"
                min="1"
                max="200"
                placeholder={t("missing")}
                value={a.capacity ?? ""}
                onChange={(e) =>
                  setA({
                    ...a,
                    capacity: e.target.value ? Number(e.target.value) : null,
                  })
                }
              />
            </Field>
            {(["rate", "weekend_rate", "addon_rate"] as const).map((key) => (
              <Field
                key={key}
                label={t(
                  key === "rate"
                    ? "nightlyRate"
                    : key === "weekend_rate"
                      ? "weekendRate"
                      : "addonRate",
                )}
              >
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required={key === "rate"}
                  value={a[key] === null ? "" : a[key]! / 100}
                  onChange={(e) =>
                    setA({
                      ...a,
                      [key]: e.target.value
                        ? Math.round(Number(e.target.value) * 100)
                        : key === "rate"
                          ? 0
                          : null,
                    })
                  }
                />
              </Field>
            ))}
          </div>
          <div className="form-grid">
            {(["ms", "en"] as const).map((l) => (
              <Field
                key={l}
                label={t(l === "ms" ? "descriptionBM" : "descriptionEN")}
              >
                <textarea
                  rows={4}
                  value={a.description[l]}
                  onChange={(e) =>
                    setA({
                      ...a,
                      description: { ...a.description, [l]: e.target.value },
                    })
                  }
                />
              </Field>
            ))}
          </div>
          <h3>{t("amenities")}</h3>
          <div className="action-row">
            {(["living", "dining", "kitchen"] as const).map((k) => (
              <label className="checkbox-label" key={k}>
                <input
                  type="checkbox"
                  checked={a.amenities.includes(k)}
                  onChange={(e) =>
                    setA({
                      ...a,
                      amenities: e.target.checked
                        ? [...a.amenities, k]
                        : a.amenities.filter((am) => am !== k),
                    })
                  }
                />
                {t(k)}
              </label>
            ))}
          </div>
          <Field label={t("customAmenities")}>
            <textarea
              rows={3}
              value={a.amenities
                .filter((am) => !["living", "dining", "kitchen"].includes(am))
                .join("\n")}
              onChange={(e) =>
                setA({
                  ...a,
                  amenities: [
                    ...a.amenities.filter((am) =>
                      ["living", "dining", "kitchen"].includes(am),
                    ),
                    ...e.target.value.split("\n").filter(Boolean),
                  ],
                })
              }
            />
          </Field>
          <button className="button" disabled={busy}>
            {t("save")}
          </button>
        </form>
        <ErrorNotice code={error} />
        {saved && <Notice type="success">{t("saved")}</Notice>}
        <hr />
        <h2>{t("photos")}</h2>
        <div className="admin-photos">
          {a.photos.map((url) => (
            <div key={url}>
              <Photo src={url} />
              <button
                className="text-link"
                disabled={busy}
                onClick={() => void perform(() => updatePhoto(a.id, url, true))}
              >
                {t("deletePhoto")}
              </button>
            </div>
          ))}
        </div>
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            void perform(async () => {
              await updatePhoto(a.id, photo);
              setPhoto("");
            });
          }}
        >
          <Field label={t("photoUrl")}>
            <input
              type="url"
              pattern="https://.*"
              required
              value={photo}
              onChange={(e) => setPhoto(e.target.value)}
            />
          </Field>
          <button className="button outline" disabled={busy}>
            {t("addPhoto")}
          </button>
        </form>
        <hr />
        <h2>{t("dateRates")}</h2>
        {catalog.rate_rules
          .filter((r) => r.package_id === a.id)
          .map((r) => (
            <div className="block-row" key={r.id}>
              <span>
                {r.start_date} → {r.end_date} · {money(r.nightly_sen, lang)}
              </span>
              <button
                className="text-link"
                disabled={busy}
                onClick={() => void perform(() => updateRate(r, true))}
              >
                {t("deleteRate")}
              </button>
            </div>
          ))}
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            void perform(() =>
              updateRate({
                id: crypto.randomUUID(),
                package_id: a.id,
                start_date: rateStart,
                end_date: rateEnd,
                nightly_sen: Math.round(rate * 100),
              }),
            );
          }}
        >
          <Field label={t("startDate")}>
            <input
              type="date"
              required
              value={rateStart}
              onChange={(e) => setRateStart(e.target.value)}
            />
          </Field>
          <Field label={t("endDate")}>
            <input
              type="date"
              required
              min={rateStart}
              value={rateEnd}
              onChange={(e) => setRateEnd(e.target.value)}
            />
          </Field>
          <Field label={t("nightlyRate")}>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
            />
          </Field>
          <button
            className="button outline"
            disabled={busy || rateEnd <= rateStart}
          >
            {t("addRate")}
          </button>
        </form>
      </div>
    </>
  );
}
