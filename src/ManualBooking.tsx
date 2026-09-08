import { useEffect, useState, type FormEvent } from "react";
import { adminAction, defaultBooking, getQuote } from "./api";
import { useApp } from "./state";
import { useLanguage } from "./i18n";
import { Counts, ErrorNotice, Field, Modal, Notice } from "./components";
import {
  canonicalPackage,
  dateAfter,
  money,
  names,
  resources,
  selectedResources,
  type PackageId,
  type Quote,
  type Status,
} from "./domain";

export default function ManualBooking({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const { catalog } = useApp();
  const { lang, t } = useLanguage();
  const [input, setInput] = useState(() => ({
    ...defaultBooking(),
    check_in: dateAfter(),
    check_out: dateAfter(1),
  }));
  const [status, setStatus] = useState<Status>("pending");
  const [payment, setPayment] = useState("unpaid");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pricing, setPricing] = useState(true);
  useEffect(() => {
    let active = true;
    setPricing(true);
    setQuote(null);
    getQuote(input, catalog)
      .then((q) => {
        if (active) {
          setQuote(q);
          setError("");
        }
      })
      .catch(() => {
        if (active) setError("INVALID_DATES");
      })
      .finally(() => {
        if (active) setPricing(false);
      });
    return () => {
      active = false;
    };
  }, [input.check_in, input.check_out, input.resources.join(","), catalog]);
  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (busy || pricing || !quote) return;
    setBusy(true);
    setError("");
    const paid =
      payment === "paid"
        ? quote.total_sen
        : payment === "unpaid"
          ? 0
          : Math.round(Number(amount) * 100);
    try {
      if (payment === "partially_paid" && (!paid || paid >= quote.total_sen))
        throw new Error("INVALID_PAYMENT");
      await adminAction({
        action: "create_manual",
        booking: {
          ...input,
          language: lang,
          policy_version: catalog.settings.policy_version,
          status,
          paid_sen: paid,
          payment_reference: reference,
        },
      });
      onSaved();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal label={t("manualBooking")} onClose={onClose}>
      <h2>{t("manualBooking")}</h2>
      <p>{t("manualSource")}</p>
      <ErrorNotice code={error} />
      <form onSubmit={save}>
        <Field label={t("stays")}>
          <select
            value={canonicalPackage(input.resources)}
            onChange={(e) =>
              setInput({
                ...input,
                resources: selectedResources(e.target.value as PackageId),
              })
            }
          >
            {catalog.accommodations.map((a) => (
              <option key={a.id} value={a.id}>
                {names[a.id][lang]}
              </option>
            ))}
          </select>
        </Field>
        {input.resources.includes("MAIN") && (
          <fieldset className="manual-resources">
            <legend>{t("stepAdd")}</legend>
            {resources
              .filter((r) => r !== "MAIN")
              .map((r) => (
                <label className="checkbox-label" key={r}>
                  <input
                    type="checkbox"
                    checked={input.resources.includes(r)}
                    onChange={(e) =>
                      setInput({
                        ...input,
                        resources: e.target.checked
                          ? [...input.resources, r]
                          : input.resources.filter((id) => id !== r),
                      })
                    }
                  />
                  {names[r][lang]}
                </label>
              ))}
          </fieldset>
        )}
        <div className="form-grid">
          <Field label={t("checkIn")}>
            <input
              type="date"
              required
              min={dateAfter()}
              value={input.check_in}
              onChange={(e) => setInput({ ...input, check_in: e.target.value })}
            />
          </Field>
          <Field label={t("checkOut")}>
            <input
              type="date"
              required
              min={input.check_in}
              value={input.check_out}
              onChange={(e) =>
                setInput({ ...input, check_out: e.target.value })
              }
            />
          </Field>
          <Field label={t("fullName")}>
            <input
              required
              minLength={2}
              maxLength={120}
              value={input.name}
              onChange={(e) => setInput({ ...input, name: e.target.value })}
            />
          </Field>
          <Field label={t("phone")}>
            <input
              required
              type="tel"
              minLength={7}
              maxLength={25}
              value={input.phone}
              onChange={(e) => setInput({ ...input, phone: e.target.value })}
            />
          </Field>
          <Field label={t("email")}>
            <input
              type="email"
              value={input.email}
              onChange={(e) => setInput({ ...input, email: e.target.value })}
            />
          </Field>
          <Field label={t("initialStatus")}>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
            >
              {(["pending", "confirmed", "cancelled", "rejected"] as const).map(
                (s) => (
                  <option value={s} key={s}>
                    {t(s)}
                  </option>
                ),
              )}
            </select>
          </Field>
          <Field label={t("adults")}>
            <input
              type="number"
              required
              min={1}
              max={100}
              value={input.adults}
              onChange={(e) =>
                setInput({ ...input, adults: Number(e.target.value) })
              }
            />
          </Field>
          <Field label={t("children")}>
            <input
              type="number"
              required
              min={0}
              max={100}
              value={input.children}
              onChange={(e) =>
                setInput({ ...input, children: Number(e.target.value) })
              }
            />
          </Field>
          <Field label={t("initialPayment")}>
            <select
              value={payment}
              onChange={(e) => setPayment(e.target.value)}
            >
              {(["unpaid", "partially_paid", "paid"] as const).map((s) => (
                <option key={s} value={s}>
                  {t(s)}
                </option>
              ))}
            </select>
          </Field>
          {payment === "partially_paid" && (
            <Field label={t("manualAmount")}>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </Field>
          )}
          {payment !== "unpaid" && (
            <Field label={t("manualReference")}>
              <input
                required
                maxLength={200}
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </Field>
          )}
          <Field label={t("requests")} className="full-field">
            <textarea
              rows={2}
              maxLength={2000}
              value={input.special_requests}
              onChange={(e) =>
                setInput({ ...input, special_requests: e.target.value })
              }
            />
          </Field>
        </div>
        {quote && (
          <Notice>
            <Counts bedrooms={quote.bedrooms} bathrooms={quote.bathrooms} />
            {quote.nights} {t("nights")} · {money(quote.total_sen, lang)} ·{" "}
            {t("deposit")}: {money(quote.deposit_sen, lang)}
          </Notice>
        )}
        <label className="checkbox-label">
          <input
            type="checkbox"
            required
            checked={input.accepted}
            onChange={(e) => setInput({ ...input, accepted: e.target.checked })}
          />
          {t("manualAccepted")}
        </label>
        <button className="button" disabled={busy || pricing || !quote}>
          {busy ? t("submitting") : t("save")}
        </button>
      </form>
    </Modal>
  );
}
