import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  LogOut,
  Minus,
  RotateCcw,
} from "lucide-react";
import { useApp } from "./state";
import { useLanguage } from "./i18n";
import { availability } from "./api";
import { useAvailability } from "./useAvailability";
import { monthDays, monthStart, nightState, rangeError } from "./calendar";
import {
  addDays,
  canonicalPackage,
  dateAfter,
  formatDate,
  money,
  names,
  nightsBetween,
  selectedResources,
  type Quote,
  type Resource,
} from "./domain";
import { Counts, ErrorNotice, Notice, PriceSummary } from "./components";

export default function BookingCalendar({
  quote,
  quoteLoading,
  onContinue,
  conflict,
}: {
  quote: Quote | null;
  quoteLoading: boolean;
  onContinue: () => Promise<void>;
  conflict: string;
}) {
  const { draft, setDraft, catalog } = useApp();
  const { lang, t } = useLanguage();
  const [month, setMonth] = useState(() =>
    monthStart(draft.check_in || dateAfter()),
  );
  const [mobile, setMobile] = useState(
    () => window.matchMedia("(max-width: 850px)").matches,
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const generation = useRef(0);
  const grid = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState(draft.check_in || dateAfter());
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 850px)");
    const change = () => setMobile(mq.matches);
    mq.addEventListener("change", change);
    return () => mq.removeEventListener("change", change);
  }, []);
  const selection = draft.resources.join(",");
  const shown = useAvailability(
    month,
    monthStart(month, mobile ? 1 : 2),
    selection,
  );
  const selected = useAvailability(draft.check_in, draft.check_out, selection);
  const complete = !!draft.check_in && !!draft.check_out;
  const invalid =
    complete && !selected.loading && !selected.error
      ? rangeError(
          draft.check_in,
          draft.check_out,
          draft.resources,
          selected.rows,
        )
      : "";
  const ready =
    complete &&
    !invalid &&
    !selected.loading &&
    !selected.error &&
    !shown.loading &&
    !shown.error &&
    !busy &&
    !!quote &&
    !quoteLoading;
  useEffect(() => {
    generation.current++;
    setBusy(false);
    setMessage("");
  }, [selection]);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const changeResources = (resources: Resource[]) => {
    generation.current++;
    setDraft({ resources });
    setMessage("");
  };
  const pick = async (day: string) => {
    if (shown.loading || shown.error || busy) return;
    setMessage("");
    if (!draft.check_in || draft.check_out || day <= draft.check_in) {
      if (nightState(day, draft.resources, shown.rows) !== "available") return;
      setDraft({ check_in: day, check_out: "" });
      return;
    }
    const seq = ++generation.current;
    setBusy(true);
    try {
      if (nightsBetween(draft.check_in, day) > 60)
        throw new Error("INVALID_DATES");
      const rows = await availability(draft.check_in, day);
      if (seq !== generation.current) return;
      const code = rangeError(draft.check_in, day, draft.resources, rows);
      if (code) {
        setMessage(code);
        void shown.refresh();
      } else setDraft({ check_out: day });
    } catch (error) {
      if (seq === generation.current)
        setMessage(
          error instanceof Error && error.message === "INVALID_DATES"
            ? "INVALID_DATES"
            : "AVAILABILITY_FAILED",
        );
    } finally {
      if (seq === generation.current) setBusy(false);
    }
  };
  const clear = () => {
    generation.current++;
    setBusy(false);
    setDraft({ check_in: "", check_out: "" });
    setMessage("");
  };
  const months = Array.from({ length: mobile ? 1 : 2 }, (_, i) =>
    monthStart(month, i),
  );
  const days = months.flatMap(monthDays);
  const noDates =
    !shown.loading &&
    !shown.error &&
    !days.some(
      (d) =>
        d >= dateAfter() &&
        nightState(d, draft.resources, shown.rows) === "available",
    );
  const moveFocus = (day: string, key: string) => {
    const offset: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    let target =
      key === "Home"
        ? addDays(day, -new Date(`${day}T12:00:00Z`).getUTCDay())
        : key === "End"
          ? addDays(day, 6 - new Date(`${day}T12:00:00Z`).getUTCDay())
          : addDays(day, offset[key] || 0);
    if (target < dateAfter()) target = dateAfter();
    setCursor(target);
    if (target < month || target >= monthStart(month, mobile ? 1 : 2))
      setMonth(monthStart(target));
    requestAnimationFrame(() =>
      grid.current
        ?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)
        ?.focus(),
    );
  };
  return (
    <section className="availability-booking">
      <h2>{t("stayStepTitle")}</h2>
      <div
        className="calendar-accommodations"
        role="group"
        aria-label={t("stays")}
      >
        {[...catalog.accommodations]
          .sort(
            (a, b) =>
              ["MAIN", "ROOM_A", "ROOM_B", "ROOM_C", "WHOLE"].indexOf(a.id) -
              ["MAIN", "ROOM_A", "ROOM_B", "ROOM_C", "WHOLE"].indexOf(b.id),
          )
          .map((a) => (
            <button
              type="button"
              key={a.id}
              aria-pressed={canonicalPackage(draft.resources) === a.id}
              className={
                canonicalPackage(draft.resources) === a.id ? "active" : ""
              }
              onClick={() => changeResources(selectedResources(a.id))}
            >
              <strong>{names[a.id][lang]}</strong>
              <Counts bedrooms={a.bedrooms} bathrooms={a.bathrooms} />
            </button>
          ))}
      </div>
      {draft.resources.includes("MAIN") && (
        <fieldset className="calendar-addons">
          <legend>{t("stepAdd")}</legend>
          <p>{t("addonDesc")}</p>
          <div>
            {(["ROOM_A", "ROOM_B", "ROOM_C"] as Resource[]).map((r) => {
              const checked = draft.resources.includes(r);
              const blocked =
                complete &&
                !selected.loading &&
                !selected.error &&
                !!rangeError(
                  draft.check_in,
                  draft.check_out,
                  [r],
                  selected.rows,
                );
              const disabled =
                !checked &&
                complete &&
                (selected.loading || !!selected.error || blocked);
              return (
                <label key={r} className={disabled ? "addon-disabled" : ""}>
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() =>
                      changeResources(
                        checked
                          ? draft.resources.filter((id) => id !== r)
                          : [...draft.resources, r],
                      )
                    }
                  />
                  <span>
                    {names[r][lang]}
                    <small>
                      {complete
                        ? selected.loading
                          ? t("checking")
                          : selected.error
                            ? t("AVAILABILITY_FAILED")
                            : blocked
                              ? t("addonUnavailable")
                              : t("available")
                        : t("chooseDatesFirst")}
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}
      <div className="calendar-booking-columns">
        <div>
          <div className="range-calendar" aria-busy={shown.loading || busy}>
            <div className="range-calendar-nav">
              <h2>{t("availability")}</h2>
              <div>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t("monthPrev")}
                  disabled={month <= monthStart(dateAfter()) || busy}
                  onClick={() => setMonth(monthStart(month, -1))}
                >
                  <ChevronLeft />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  aria-label={t("monthNext")}
                  disabled={busy}
                  onClick={() => setMonth(monthStart(month, 1))}
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
            <p id="calendar-help">{t("calendarHelp")}</p>
            {shown.error && (
              <Notice type="error">
                {t("AVAILABILITY_FAILED")}{" "}
                <button
                  type="button"
                  className="text-link"
                  onClick={() => void shown.refresh()}
                >
                  {t("retryAvailability")}
                </button>
              </Notice>
            )}
            {shown.loading && <p role="status">{t("checking")}</p>}
            <div className="range-months" ref={grid}>
              {months.map((m) => (
                <div className="range-month" key={m}>
                  <h3>
                    {new Intl.DateTimeFormat(
                      lang === "ms" ? "ms-MY" : "en-MY",
                      {
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Kuala_Lumpur",
                      },
                    ).format(new Date(`${m}T12:00:00Z`))}
                  </h3>
                  <div className="range-weekdays">
                    {Array.from({ length: 7 }, (_, i) => (
                      <span key={i}>
                        {new Intl.DateTimeFormat(
                          lang === "ms" ? "ms-MY" : "en-MY",
                          { weekday: "short", timeZone: "UTC" },
                        ).format(
                          new Date(
                            `2026-09-${String(6 + i).padStart(2, "0")}T12:00:00Z`,
                          ),
                        )}
                      </span>
                    ))}
                  </div>
                  <div
                    className="range-days"
                    role="group"
                    aria-describedby="calendar-help"
                  >
                    {Array.from(
                      { length: new Date(`${m}T12:00:00Z`).getUTCDay() },
                      (_, i) => (
                        <span key={`blank-${i}`} />
                      ),
                    )}
                    {monthDays(m).map((d) => {
                      const state = nightState(d, draft.resources, shown.rows);
                      const past = d < dateAfter();
                      const boundary =
                        !past &&
                        !!draft.check_in &&
                        !draft.check_out &&
                        d > draft.check_in &&
                        nightsBetween(draft.check_in, d) <= 60 &&
                        !rangeError(
                          draft.check_in,
                          d,
                          draft.resources,
                          shown.rows,
                        );
                      const unavailable =
                        past ||
                        shown.loading ||
                        !!shown.error ||
                        busy ||
                        (state !== "available" && !boundary);
                      const endpoint =
                        d === draft.check_in || d === draft.check_out;
                      const inside =
                        complete && d > draft.check_in && d < draft.check_out;
                      const label = past
                        ? t("pastDate")
                        : state === "pending"
                          ? t("calendarPending")
                          : state === "unavailable"
                            ? t("calendarUnavailable")
                            : t("available");
                      return (
                        <button
                          type="button"
                          key={d}
                          data-date={d}
                          aria-disabled={unavailable}
                          aria-pressed={endpoint}
                          tabIndex={
                            d ===
                            (days.includes(cursor)
                              ? cursor
                              : days.find((d) => d >= dateAfter()))
                              ? 0
                              : -1
                          }
                          className={`range-day ${past ? "past" : shown.loading || shown.error ? "unknown" : state} ${endpoint ? "endpoint" : ""} ${inside ? "in-range" : ""} ${boundary && state !== "available" ? "checkout-boundary" : ""}`}
                          aria-label={`${formatDate(d, lang)} · ${label}${boundary && state !== "available" ? ` · ${t("checkoutOnly")}` : ""}${endpoint ? ` · ${t("selectedDates")}` : ""}`}
                          title={
                            boundary && state !== "available"
                              ? t("checkoutOnly")
                              : label
                          }
                          onFocus={() => setCursor(d)}
                          onKeyDown={(e) => {
                            if (
                              [
                                "ArrowLeft",
                                "ArrowRight",
                                "ArrowUp",
                                "ArrowDown",
                                "Home",
                                "End",
                              ].includes(e.key)
                            ) {
                              e.preventDefault();
                              moveFocus(d, e.key);
                            }
                          }}
                          onClick={() => {
                            if (!unavailable) void pick(d);
                          }}
                        >
                          <span>{Number(d.slice(-2))}</span>
                          {endpoint ? (
                            <Check size={12} />
                          ) : boundary && state !== "available" ? (
                            <LogOut size={12} />
                          ) : state === "pending" ? (
                            <Clock size={11} />
                          ) : state === "unavailable" || past ? (
                            <Minus size={11} />
                          ) : (
                            <span className="day-indicator" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div className="range-legend">
              <span>
                <i />
                {t("available")}
              </span>
              <span>
                <Clock size={13} />
                {t("calendarPending")}
              </span>
              <span>
                <Minus size={13} />
                {t("calendarUnavailable")}
              </span>
              <span>
                <Check size={13} />
                {t("selectedDates")}
              </span>
              <span>
                <LogOut size={13} />
                {t("checkoutOnly")}
              </span>
            </div>
            {noDates && <Notice>{t("noDatesMonth")}</Notice>}
            <p className="calendar-instruction" role="status">
              {draft.check_in && !draft.check_out
                ? t("chooseCheckout")
                : !complete
                  ? t("calendarIntro")
                  : `${formatDate(draft.check_in, lang)} → ${formatDate(draft.check_out, lang)} · ${nightsBetween(draft.check_in, draft.check_out)} ${t("nights")}`}
            </p>
            <button
              type="button"
              className="text-link"
              onClick={clear}
              disabled={!draft.check_in && !draft.check_out}
            >
              <RotateCcw size={15} />
              {t("clearDates")}
            </button>
          </div>
          <ErrorNotice
            code={message || invalid || selected.error || conflict}
          />
          {selected.error && (
            <button
              type="button"
              className="button outline"
              onClick={() => void selected.refresh()}
            >
              {t("retryAvailability")}
            </button>
          )}
        </div>
        <aside className="calendar-summary">
          <h3>{t("summary")}</h3>
          <h4>{names[canonicalPackage(draft.resources)][lang]}</h4>
          {draft.resources.includes("MAIN") && draft.resources.length > 1 && (
            <p>
              {draft.resources
                .filter((r) => r !== "MAIN")
                .map((r) => names[r][lang])
                .join(" + ")}
            </p>
          )}
          <Counts
            bedrooms={draft.resources.reduce(
              (n, r) => n + (r === "MAIN" ? 4 : 1),
              0,
            )}
            bathrooms={draft.resources.reduce(
              (n, r) => n + (r === "MAIN" ? 3 : 1),
              0,
            )}
          />
          {!complete ? (
            <p>{t("calendarIntro")}</p>
          ) : (
            <>
              <p>
                {t("checkIn")}: {formatDate(draft.check_in, lang)}
                <br />
                {t("checkOut")}: {formatDate(draft.check_out, lang)}
              </p>
              <p>
                {nightsBetween(draft.check_in, draft.check_out)} {t("nights")}
              </p>
            </>
          )}
          {quote &&
          complete &&
          !invalid &&
          !selected.error &&
          !selected.loading &&
          !quoteLoading ? (
            <PriceSummary quote={quote} compact />
          ) : complete ? (
            <p>
              {quoteLoading || selected.loading
                ? t("checking")
                : t("priceNote")}
            </p>
          ) : null}
          <button
            type="button"
            className="button full"
            disabled={!ready}
            onClick={async () => {
              setBusy(true);
              try {
                await onContinue();
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? t("checking") : t("continueBooking")}
            <ArrowRight size={17} />
          </button>
          <small>{t("noHoldYet")}</small>
        </aside>
      </div>
    </section>
  );
}
