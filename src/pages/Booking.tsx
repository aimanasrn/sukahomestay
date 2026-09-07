import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  MessageCircle,
  Plus,
} from "lucide-react";
import { useLanguage, type TranslationKey } from "../i18n";
import { useApp } from "../state";
import {
  availability,
  canFit,
  getQuote,
  isDemo,
  submitBooking,
  validateCustomer,
} from "../api";
import {
  Counts,
  ErrorNotice,
  Field,
  Notice,
  Photo,
  PriceSummary,
} from "../components";
import {
  canonicalPackage,
  dateAfter,
  formatDate,
  money,
  names,
  selectedResources,
  whatsappMessage,
  type Allocation,
  type Booking as SavedBooking,
  type PackageId,
  type Quote,
  type Resource,
} from "../domain";
declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      remove: (id: string) => void;
      reset: (id?: string) => void;
    };
  }
}
function Turnstile({ onToken }: { onToken: (s: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let id: string | undefined;
    let disposed = false;
    const render = () => {
      if (!disposed && ref.current && window.turnstile)
        id = window.turnstile.render(ref.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => onToken(""),
        });
    };
    const script = document.createElement("script");
    script.src =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    if (window.turnstile) render();
    else document.head.append(script);
    return () => {
      disposed = true;
      if (id) window.turnstile?.remove(id);
      script.remove();
    };
  }, []);
  return <div ref={ref} />;
}
export default function Booking() {
  const { t, lang } = useLanguage();
  const { draft, setDraft, catalog, reset } = useApp();
  const [step, setStep] = useState(0);
  const [alloc, setAlloc] = useState<Allocation[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState<SavedBooking | null>(null);
  const [copied, setCopied] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    if (saved) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      availability(draft.check_in, draft.check_out),
      getQuote(draft, catalog),
    ])
      .then(([a, q]) => {
        if (active) {
          setAlloc(a);
          setQuote(q);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setQuote(null);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [
    draft.check_in,
    draft.check_out,
    draft.resources.join(","),
    catalog,
    refresh,
  ]);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step, saved]);
  const unavailable = (ids: Resource[]) =>
    ids.some((r) => alloc.some((a) => a.resource_id === r));
  const next = () => {
    setError("");
    if (step === 0) {
      if (
        !quote ||
        draft.check_in < dateAfter() ||
        draft.adults < 1 ||
        draft.children < 0
      ) {
        setError("INVALID_DATES");
        return;
      }
      if (!form.current?.reportValidity()) return;
    }
    if (step === 1 || step === 2) {
      if (unavailable(draft.resources)) {
        setError("UNAVAILABLE");
        return;
      }
      if (!canFit(draft.resources, draft.adults + draft.children, catalog)) {
        setError("CAPACITY_EXCEEDED");
        return;
      }
    }
    if (step === 3) {
      if (!form.current?.reportValidity()) return;
      try {
        validateCustomer({ ...draft, accepted: true });
      } catch (e) {
        setError((e as Error).message);
        return;
      }
    }
    setStep(
      step === 1 && !draft.resources.includes("MAIN")
        ? 3
        : Math.min(4, step + 1),
    );
  };
  const submit = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      validateCustomer(draft);
      if (!isDemo && !token) throw new Error("CAPTCHA_REQUIRED");
      const result = await submitBooking(
        {
          ...draft,
          language: lang,
          policy_version: catalog.settings.policy_version,
        },
        token,
      );
      setSaved(result);
      setStep(5);
    } catch (e) {
      setError((e as Error).message);
      window.turnstile?.reset();
      setToken("");
    } finally {
      setSaving(false);
      submitting.current = false;
    }
  };
  const steps = [
    "stepDates",
    "stepStay",
    "stepAdd",
    "stepDetails",
    "stepReview",
    "stepDone",
  ] as const;
  if (saved) {
    const message = whatsappMessage(saved, lang);
    return (
      <div className="section success-page">
        <CheckCircle2 size={48} strokeWidth={1.2} />
        <span className="eyebrow">
          {t("reference")} · {saved.reference}
        </span>
        <h1 ref={heading} tabIndex={-1}>
          {t("successTitle")}
        </h1>
        <p>{isDemo ? t("demoSuccess") : t("success")}</p>
        <div className="success-details">
          <span className="status pending">{t(saved.status)}</span>
          <h3>
            {saved.quote.package_id === "WHOLE"
              ? names.WHOLE[lang]
              : saved.resources.map((r) => names[r][lang]).join(" + ")}
          </h3>
          <p>
            {formatDate(saved.check_in, lang)} —{" "}
            {formatDate(saved.check_out, lang)} · {saved.quote.nights}{" "}
            {t("nights")}
          </p>
          <Counts
            bedrooms={saved.quote.bedrooms}
            bathrooms={saved.quote.bathrooms}
          />
          <strong>{money(saved.quote.total_sen, lang)}</strong>
          <p>
            {t("expires")}:{" "}
            {new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(saved.expires_at))}
          </p>
        </div>
        <div className="success-actions">
          {saved.whatsapp ? (
            <a
              className="button"
              href={`https://wa.me/${saved.whatsapp}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={19} />
              {t("openWhatsapp")}
            </a>
          ) : (
            <Notice>{t("noWhatsapp")}</Notice>
          )}
          <button
            className="button outline"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(message);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            <Copy size={18} />
            {copied ? t("copied") : t("copy")}
          </button>
        </div>
        <details>
          <summary>{t("copy")}</summary>
          <textarea aria-label={t("copy")} readOnly value={message} rows={12} />
        </details>
        <small>{t("whatsappNote")}</small>
        <button
          className="text-link"
          onClick={() => {
            reset();
            setSaved(null);
            setStep(0);
            setCopied(false);
            setRefresh((n) => n + 1);
          }}
        >
          {t("newBooking")}
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }
  return (
    <div className="section booking-page">
      <Link className="text-link" to="/#stays">
        <ArrowLeft size={17} />
        {t("back")}
      </Link>
      <h1>{t("planTitle")}</h1>
      {isDemo && (
        <Notice>
          {t("demoNotice")} {t("demoPrivacy")}
        </Notice>
      )}
      <ol className="stepper">
        {steps.map((s, n) => (
          <li
            key={s}
            className={n === step ? "current" : n < step ? "done" : ""}
          >
            <span>{n < step ? <Check size={15} /> : n + 1}</span>
            <small>{t(s)}</small>
          </li>
        ))}
      </ol>
      <div className="booking-columns">
        <div className="booking-form">
          <h2 ref={heading} tabIndex={-1}>
            {t(
              (
                [
                  "datesTitle",
                  "stayStepTitle",
                  "addStepTitle",
                  "detailsTitle",
                  "reviewTitle",
                ] as const
              )[step],
            )}
          </h2>
          <ErrorNotice code={error} />
          {error === "UNAVAILABLE" && (
            <button
              className="text-link"
              onClick={() => {
                setStep(1);
                setRefresh((n) => n + 1);
              }}
            >
              {t("retry")}
              <ArrowRight size={17} />
            </button>
          )}
          <form
            ref={form}
            onSubmit={(e) => {
              e.preventDefault();
              void next();
            }}
          >
            {step === 0 && (
              <>
                <div className="form-grid">
                  <Field label={t("checkIn")}>
                    <input
                      type="date"
                      required
                      min={dateAfter()}
                      value={draft.check_in}
                      onChange={(e) => setDraft({ check_in: e.target.value })}
                    />
                  </Field>
                  <Field label={t("checkOut")}>
                    <input
                      type="date"
                      required
                      min={draft.check_in}
                      value={draft.check_out}
                      onChange={(e) => setDraft({ check_out: e.target.value })}
                    />
                  </Field>
                  <Field label={t("adults")}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={draft.adults}
                      onChange={(e) =>
                        setDraft({ adults: Number(e.target.value) })
                      }
                    />
                  </Field>
                  <Field label={t("children")}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={draft.children}
                      onChange={(e) =>
                        setDraft({ children: Number(e.target.value) })
                      }
                    />
                  </Field>
                </div>
                <p className="muted">{t("capacityMissing")}</p>
              </>
            )}
            {step === 1 && (
              <div className="selection-list">
                {catalog.accommodations.map((a) => {
                  const ids = selectedResources(a.id);
                  const disabled =
                    loading ||
                    unavailable(ids) ||
                    !canFit(ids, draft.adults + draft.children, catalog);
                  const selected = canonicalPackage(draft.resources) === a.id;
                  return (
                    <button
                      type="button"
                      disabled={disabled}
                      key={a.id}
                      aria-pressed={selected}
                      className={`selection-row ${selected ? "selected" : ""}`}
                      onClick={() => setDraft({ resources: ids })}
                    >
                      <span className="selection-check">
                        {selected && <Check size={16} />}
                      </span>
                      <Photo accommodation={a} />
                      <div>
                        <h3>{names[a.id][lang]}</h3>
                        <Counts bedrooms={a.bedrooms} bathrooms={a.bathrooms} />
                        <span
                          className={
                            disabled ? "availability-bad" : "availability-good"
                          }
                        >
                          {loading
                            ? t("checking")
                            : disabled
                              ? t("unavailable")
                              : t("available")}
                        </span>
                      </div>
                      <div className="select-price">
                        <strong>{money(a.rate, lang)}</strong>
                        <small>
                          {catalog.settings.demo_rates && `${t("sample")} · `}/{" "}
                          {t("night")}
                        </small>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {step === 2 && (
              <>
                <p>{t("addonDesc")}</p>
                <div className="selection-list">
                  {catalog.accommodations
                    .filter((a) => a.id.startsWith("ROOM"))
                    .map((a) => {
                      const selected = draft.resources.includes(
                        a.id as Resource,
                      );
                      const disabled =
                        loading || unavailable([a.id as Resource]);
                      return (
                        <button
                          type="button"
                          key={a.id}
                          disabled={disabled}
                          aria-pressed={selected}
                          className={`selection-row ${selected ? "selected" : ""}`}
                          onClick={() =>
                            setDraft({
                              resources: selected
                                ? draft.resources.filter((r) => r !== a.id)
                                : [...draft.resources, a.id as Resource],
                            })
                          }
                        >
                          <span className="selection-check">
                            {selected ? (
                              <Check size={16} />
                            ) : (
                              <Plus size={15} />
                            )}
                          </span>
                          <Photo accommodation={a} />
                          <div>
                            <h3>{names[a.id][lang]}</h3>
                            <Counts bedrooms={1} bathrooms={1} />
                            <span
                              className={
                                disabled
                                  ? "availability-bad"
                                  : "availability-good"
                              }
                            >
                              {disabled ? t("unavailable") : t("available")}
                            </span>
                          </div>
                          <div className="select-price">
                            <strong>
                              {money(a.addon_rate ?? a.rate, lang)}
                            </strong>
                            <small>
                              {t("sample")} / {t("night")}
                            </small>
                          </div>
                        </button>
                      );
                    })}
                </div>
                {draft.resources.length === 4 && (
                  <Notice type="success">
                    {names.WHOLE[lang]} · 7 {t("bedrooms")} · 6 {t("bathrooms")}
                  </Notice>
                )}
              </>
            )}
            {step === 3 && (
              <div className="form-grid">
                <Field label={t("fullName")} className="full-field">
                  <input
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={120}
                    value={draft.name}
                    onChange={(e) => setDraft({ name: e.target.value })}
                  />
                </Field>
                <Field label={t("phone")}>
                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={25}
                    value={draft.phone}
                    onChange={(e) => setDraft({ phone: e.target.value })}
                  />
                </Field>
                <Field label={t("email")}>
                  <input
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={draft.email}
                    onChange={(e) => setDraft({ email: e.target.value })}
                  />
                </Field>
                <Field label={t("adults")}>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={draft.adults}
                    onChange={(e) =>
                      setDraft({ adults: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label={t("children")}>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={draft.children}
                    onChange={(e) =>
                      setDraft({ children: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label={t("requests")} className="full-field">
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={draft.special_requests}
                    onChange={(e) =>
                      setDraft({ special_requests: e.target.value })
                    }
                  />
                </Field>
              </div>
            )}
            {step === 4 && (
              <>
                <dl className="review-details">
                  <div>
                    <dt>{t("fullName")}</dt>
                    <dd>{draft.name}</dd>
                  </div>
                  <div>
                    <dt>{t("phone")}</dt>
                    <dd>{draft.phone}</dd>
                  </div>
                  {draft.email && (
                    <div>
                      <dt>{t("email")}</dt>
                      <dd>{draft.email}</dd>
                    </div>
                  )}
                  <div>
                    <dt>{t("guests")}</dt>
                    <dd>
                      {draft.adults} {t("adults")} · {draft.children}{" "}
                      {t("children")}
                    </dd>
                  </div>
                  <div>
                    <dt>{t("stays")}</dt>
                    <dd>
                      {draft.resources.map((r) => names[r][lang]).join(" + ")}
                    </dd>
                  </div>
                  {draft.special_requests && (
                    <div>
                      <dt>{t("requests")}</dt>
                      <dd>{draft.special_requests}</dd>
                    </div>
                  )}
                </dl>
                <h3>{t("policies")}</h3>
                <p className="policy-text">
                  {isDemo
                    ? t("demoPolicy")
                    : catalog.settings.policies[lang] || t("policyMissing")}
                </p>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={draft.accepted}
                    onChange={(e) => setDraft({ accepted: e.target.checked })}
                  />
                  {t("accept")}
                </label>
                {!isDemo && (
                  <>
                    <Turnstile onToken={setToken} />
                    {!catalog.settings.booking_enabled && (
                      <Notice>{t("BOOKING_NOT_CONFIGURED")}</Notice>
                    )}
                  </>
                )}
                <p className="muted">{t("paymentNote")}</p>
              </>
            )}
            <div className="booking-navigation">
              {step > 0 && (
                <button
                  type="button"
                  className="button outline"
                  disabled={saving}
                  onClick={() => {
                    setError("");
                    setStep(
                      step === 3 && !draft.resources.includes("MAIN")
                        ? 1
                        : step - 1,
                    );
                  }}
                >
                  <ArrowLeft size={17} />
                  {t("back")}
                </button>
              )}
              {step < 4 ? (
                <button
                  className="button"
                  type="submit"
                  disabled={loading || !quote}
                >
                  {loading ? t("checking") : t("next")}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  className="button"
                  disabled={
                    saving ||
                    loading ||
                    !quote ||
                    !draft.accepted ||
                    (!isDemo && (!catalog.settings.booking_enabled || !token))
                  }
                  onClick={() => void submit()}
                >
                  {saving ? t("submitting") : t("submit")}
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </form>
        </div>
        <PriceSummary quote={quote} />
      </div>
      {quote && (
        <div className="mobile-total">
          <span>
            {quote.nights} {t("nights")} · {quote.bedrooms} {t("bedrooms")}
          </span>
          <strong>{money(quote.total_sen, lang)}</strong>
        </div>
      )}
    </div>
  );
}
