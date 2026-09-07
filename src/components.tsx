import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  House,
  Menu,
  MessageCircle,
  Users,
  X,
} from "lucide-react";
import { useLanguage, type TranslationKey } from "./i18n";
import { useApp } from "./state";
import { availability, isDemo } from "./api";
import {
  canonicalPackage,
  dateAfter,
  formatDate,
  money,
  names,
  overlaps,
  selectedResources,
  type Accommodation,
  type Allocation,
  type PackageId,
  type Quote,
  type Resource,
} from "./domain";
import { imageFor } from "./data";
export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="SUKA HOMESTAY">
      <svg viewBox="0 0 56 46" fill="none" aria-hidden="true">
        <path
          d="M5 39 28 25 51 39M15 36v8m26-8v8M19 30l9-6 9 6M28 2v10M12 8l6 8M44 8l-6 8M3 22l11 3M53 22l-11 3"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M22 23a7 7 0 0 1 12 0" stroke="#C97956" strokeWidth="1.5" />
      </svg>
      <span>
        SUKA <span>HOMESTAY</span>
      </span>
    </Link>
  );
}
export function LanguageSwitch() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="language" aria-label="Language">
      <button aria-pressed={lang === "ms"} onClick={() => setLang("ms")}>
        BM
      </button>
      <span>|</span>
      <button aria-pressed={lang === "en"} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );
}
export function Header() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [location]);
  return (
    <header className="header">
      <Logo />
      <nav
        className={open ? "navigation open" : "navigation"}
        aria-label={t("stays")}
      >
        <Link to="/#stays">{t("stays")}</Link>
        <Link to="/#spaces">{t("spaces")}</Link>
        <Link to="/#gallery">{t("gallery")}</Link>
        <Link to="/#location">{t("location")}</Link>
      </nav>
      <div className="header-actions">
        <LanguageSwitch />
        <Link className="button header-book" to="/book">
          {t("book")}
          <ArrowUpRight size={16} />
        </Link>
        <button
          className="icon-button menu"
          aria-label={open ? t("close") : "Menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
export function Photo({
  accommodation,
  className = "",
  alt,
  src,
}: {
  accommodation?: Accommodation;
  className?: string;
  alt?: string;
  src?: string;
}) {
  const { t } = useLanguage();
  const source =
    src || accommodation?.photos[0] || imageFor(accommodation?.id || "MAIN");
  const placeholder = source.startsWith("/images/");
  return (
    <div className={`photo ${className}`}>
      <img
        src={source}
        alt={alt || t("photo")}
        loading="lazy"
        onError={(e) => {
          const el = e.currentTarget;
          if (!el.src.endsWith(imageFor(accommodation?.id || "MAIN")))
            el.src = imageFor(accommodation?.id || "MAIN");
        }}
      />
      {placeholder && <span className="photo-caption">{t("photo")}</span>}
    </div>
  );
}
export function Counts({
  bedrooms,
  bathrooms,
}: {
  bedrooms: number;
  bathrooms: number;
}) {
  const { t } = useLanguage();
  return (
    <div className="counts">
      <span>
        <BedDouble />
        {bedrooms} {t(bedrooms === 1 ? "bedroom" : "bedrooms")}
      </span>
      <i />
      <span>
        <Bath />
        {bathrooms} {t(bathrooms === 1 ? "bathroom" : "bathrooms")}
      </span>
    </div>
  );
}
export function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
export function Notice({
  children,
  type = "info",
}: {
  children: ReactNode;
  type?: "info" | "error" | "success";
}) {
  return (
    <div
      className={`notice ${type}`}
      role={type === "error" ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function ErrorNotice({ code }: { code: string }) {
  const { t } = useLanguage();
  return code ? (
    <Notice type="error">
      {t(code as TranslationKey) || t("REQUEST_FAILED")}
    </Notice>
  ) : null;
}
export function SearchBar() {
  const { t, lang } = useLanguage();
  const { draft, setDraft } = useApp();
  const navigate = useNavigate();
  return (
    <form
      className="search-bar"
      onSubmit={(e) => {
        e.preventDefault();
        navigate("/book");
      }}
    >
      <div className="search-field">
        <CalendarDays />
        <Field label={t("checkIn")}>
          <input
            required
            aria-label={t("checkIn")}
            type="date"
            min={dateAfter()}
            value={draft.check_in}
            onChange={(e) => setDraft({ check_in: e.target.value })}
          />
        </Field>
      </div>
      <div className="search-field">
        <CalendarDays />
        <Field label={t("checkOut")}>
          <input
            required
            aria-label={t("checkOut")}
            type="date"
            min={draft.check_in}
            value={draft.check_out}
            onChange={(e) => setDraft({ check_out: e.target.value })}
          />
        </Field>
      </div>
      <div className="search-field">
        <Users />
        <Field label={t("guests")}>
          <input
            aria-label={t("guests")}
            required
            type="number"
            min="1"
            max="100"
            value={draft.adults}
            onChange={(e) => setDraft({ adults: Number(e.target.value) })}
          />
        </Field>
      </div>
      <div className="search-field">
        <BedDouble />
        <Field label={t("type")}>
          <select
            aria-label={t("type")}
            value={canonicalPackage(draft.resources)}
            onChange={(e) =>
              setDraft({
                resources: selectedResources(e.target.value as PackageId),
              })
            }
          >
            {Object.entries(names).map(([id, n]) => (
              <option key={id} value={id}>
                {n[lang]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <button className="button" type="submit">
        {t("check")}
        <ArrowRight size={18} />
      </button>
    </form>
  );
}
export function AccommodationCard({
  a,
  roomGroup = false,
}: {
  a: Accommodation;
  roomGroup?: boolean;
}) {
  const { t, lang } = useLanguage();
  const { catalog } = useApp();
  return (
    <article className="stay-card">
      <Link to={`/stay/${a.id}`} className="stay-image">
        <Photo accommodation={a} />
      </Link>
      <div className="stay-card-body">
        <div className="row">
          <h3>
            <Link to={`/stay/${a.id}`}>
              {roomGroup ? "Roomstay" : names[a.id][lang]}
            </Link>
          </h3>
          <Link
            className="circle-arrow"
            to={`/stay/${a.id}`}
            aria-label={`${t("view")} ${names[a.id][lang]}`}
          >
            <ArrowUpRight size={20} />
          </Link>
        </div>
        <Counts bedrooms={a.bedrooms} bathrooms={a.bathrooms} />
        <div className="stay-bottom">
          <span>
            {roomGroup
              ? "A · B · C"
              : t(a.id === "WHOLE" ? "wholeDesc" : "mainDesc").split(".")[0]}
          </span>
          <span>
            {catalog.settings.demo_rates && <small>{t("sample")}</small>}
            <strong>{money(a.rate, lang)}</strong>
            <small>/ {t("night")}</small>
          </span>
        </div>
      </div>
    </article>
  );
}
export function PriceSummary({
  quote,
  compact = false,
}: {
  quote: Quote | null;
  compact?: boolean;
}) {
  const { t, lang } = useLanguage();
  const { draft, catalog } = useApp();
  if (!quote)
    return (
      <div className="summary">
        <p>{t("priceNote")}</p>
      </div>
    );
  const grouped = new Map<string, number>();
  quote.items.forEach((i) => {
    const key = i.label.split("|")[0];
    grouped.set(key, (grouped.get(key) || 0) + i.total_sen);
  });
  return (
    <aside className={compact ? "summary compact" : "summary"}>
      <h3>{t("summary")}</h3>
      <Photo
        accommodation={catalog.accommodations.find(
          (a) => a.id === quote.package_id,
        )}
        className="summary-photo"
      />
      <h4>
        {names[quote.package_id][lang]}
        {quote.package_id === "MAIN" && draft.resources.length > 1
          ? ` + ${draft.resources.length - 1} Roomstay`
          : ""}
      </h4>
      <p className="summary-date">
        <CalendarDays size={16} />
        {formatDate(draft.check_in, lang)} — {formatDate(draft.check_out, lang)}
      </p>
      <p>
        {quote.nights} {t("nights")} · {draft.adults + draft.children}{" "}
        {t("guest")}
      </p>
      <Counts bedrooms={quote.bedrooms} bathrooms={quote.bathrooms} />
      <div className="price-lines">
        {[...grouped.entries()].map(([key, total]) => (
          <div key={key}>
            <span>
              {key === "cleaning"
                ? t("cleaning")
                : names[key as PackageId][lang]}
            </span>
            <span>{money(total, lang)}</span>
          </div>
        ))}
      </div>
      <div className="price-total">
        <span>{t("total")}</span>
        <strong>{money(quote.total_sen, lang)}</strong>
      </div>
      {quote.deposit_sen > 0 && (
        <div className="price-lines">
          <div>
            <span>{t("deposit")}</span>
            <span>{money(quote.deposit_sen, lang)}</span>
          </div>
          <div>
            <span>{t("balance")}</span>
            <span>{money(quote.total_sen - quote.deposit_sen, lang)}</span>
          </div>
        </div>
      )}
      <small>
        {catalog.settings.demo_rates && `${t("sample")} · `}
        {t("priceNote")}
      </small>
    </aside>
  );
}
export function AvailabilityCalendar({ ids }: { ids: Resource[] }) {
  const { t, lang } = useLanguage();
  const { setDraft } = useApp();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [alloc, setAlloc] = useState<Allocation[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState(false);
  const [start, setStart] = useState("");
  const year = month.getFullYear(),
    m = month.getMonth();
  const date = (n: number) =>
    `${year}-${String(m + 1).padStart(2, "0")}-${String(n).padStart(2, "0")}`;
  const last = new Date(year, m + 1, 0).getDate();
  useEffect(() => {
    let active = true;
    setBusy(true);
    setError(false);
    availability(
      date(1),
      new Date(Date.UTC(year, m + 1, 1)).toISOString().slice(0, 10),
    )
      .then((a) => {
        if (active) setAlloc(a);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [year, m]);
  return (
    <section className="calendar-box">
      <div className="row">
        <h3>{t("availability")}</h3>
        <div className="row">
          <button
            className="icon-button"
            aria-label={t("monthPrev")}
            onClick={() => setMonth(new Date(year, m - 1, 1))}
          >
            <ChevronLeft />
          </button>
          <strong>
            {new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
              month: "long",
              year: "numeric",
            }).format(month)}
          </strong>
          <button
            className="icon-button"
            aria-label={t("monthNext")}
            onClick={() => setMonth(new Date(year, m + 1, 1))}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
      {error ? (
        <Notice type="error">{t("REQUEST_FAILED")}</Notice>
      ) : busy ? (
        <p>{t("loading")}</p>
      ) : (
        <>
          <div className="calendar-grid">
            {Array.from({ length: 7 }, (_, n) => (
              <span key={`d${n}`}>
                {new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
                  weekday: "short",
                }).format(new Date(2026, 8, 6 + n))}
              </span>
            ))}
            {Array.from({ length: new Date(year, m, 1).getDay() }, (_, n) => (
              <span key={`blank${n}`} />
            ))}
            {Array.from({ length: last }, (_, n) => {
              const d = date(n + 1);
              const blocked = alloc.some(
                (a) =>
                  ids.includes(a.resource_id) &&
                  a.check_in <= d &&
                  a.check_out > d,
              );
              return (
                <button
                  key={d}
                  disabled={d < dateAfter() || blocked}
                  className={start === d ? "selected" : ""}
                  aria-label={`${formatDate(d, lang)} ${blocked ? t("unavailable") : t("available")}`}
                  onClick={() => {
                    if (!start || d <= start) {
                      setStart(d);
                      setDraft({ check_in: d });
                    } else {
                      setDraft({ check_in: start, check_out: d });
                      setStart("");
                    }
                  }}
                >
                  {n + 1}
                </button>
              );
            })}
          </div>
          <small>
            {t("checkIn")} → {t("checkOut")} · <span className="dot" />
            {t("available")}
          </small>
        </>
      )}
    </section>
  );
}
export function Modal({
  children,
  onClose,
  label,
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t } = useLanguage();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    ref.current?.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      className="modal"
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="icon-button modal-close"
        aria-label={t("close")}
        onClick={onClose}
      >
        <X />
      </button>
      {children}
    </dialog>
  );
}
export function WhatsApp() {
  const { t } = useLanguage();
  const { catalog } = useApp();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="whatsapp-float"
        aria-label={t("whatsapp")}
        onClick={() => setOpen(true)}
      >
        <MessageCircle size={25} />
      </button>
      {open && (
        <Modal label={t("whatsapp")} onClose={() => setOpen(false)}>
          <MessageCircle size={36} />
          <h2>{t("whatsapp")}</h2>
          <p>{catalog.settings.whatsapp ? t("finalDesc") : t("noWhatsapp")}</p>
          {catalog.settings.whatsapp && (
            <a
              className="button"
              href={`https://wa.me/${catalog.settings.whatsapp}`}
              target="_blank"
              rel="noreferrer"
            >
              {t("openWhatsapp")}
              <ArrowUpRight size={18} />
            </a>
          )}
        </Modal>
      )}
    </>
  );
}
export function Footer() {
  const { t } = useLanguage();
  return (
    <footer>
      <div className="footer-main">
        <div>
          <Logo />
          <p>{t("footer")}</p>
        </div>
        <div>
          <Link to="/#stays">{t("stays")}</Link>
          <Link to="/#gallery">{t("gallery")}</Link>
          <Link to="/#location">{t("location")}</Link>
          <Link to="/admin">{t("admin")}</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {t("copyright")}
        </span>
        <span>{isDemo ? t("demoNotice") : "MYR · Malaysia"}</span>
      </div>
    </footer>
  );
}
export function ScrollManager() {
  const location = useLocation();
  useEffect(() => {
    window.history.scrollRestoration = "manual";
    if (location.hash) {
      setTimeout(
        () =>
          document
            .getElementById(location.hash.slice(1))
            ?.scrollIntoView({ behavior: "smooth" }),
        100,
      );
    } else {
      document.getElementById("main-content")?.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [location.pathname, location.hash]);
  return null;
}
export { ArrowRight, ArrowUpRight, Check, House };
