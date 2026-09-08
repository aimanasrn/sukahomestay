import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLanguage, type TranslationKey } from "../i18n";
import { useApp } from "../state";
import {
  AvailabilityCalendar,
  Counts,
  Photo,
  Notice,
  PriceSummary,
  ErrorNotice,
} from "../components";
import {
  money,
  names,
  selectedResources,
  type PackageId,
  type Quote,
} from "../domain";
import { getQuote } from "../api";
export default function Stay() {
  const { id } = useParams();
  const { t, lang } = useLanguage();
  const { catalog, setDraft, draft } = useApp();
  const a = catalog.accommodations.find((a) => a.id === id);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (a) setDraft({ resources: selectedResources(a.id) });
  }, [id]);
  useEffect(() => {
    if (!a) return;
    if (!draft.check_in || !draft.check_out) {
      setQuote(null);
      setError("");
      return;
    }
    let active = true;
    setError("");
    getQuote({ ...draft, resources: selectedResources(a.id) }, catalog)
      .then((q) => {
        if (active) setQuote(q);
      })
      .catch(() => {
        if (active) {
          setQuote(null);
          setError("INVALID_DATES");
        }
      });
    return () => {
      active = false;
    };
  }, [id, draft.check_in, draft.check_out, catalog]);
  if (!a)
    return (
      <div className="section">
        <h1>{t("notFound")}</h1>
        <Link to="/">{t("home")}</Link>
      </div>
    );
  return (
    <div className="section detail-page">
      <Link className="text-link" to="/#stays">
        <ArrowLeft size={17} />
        {t("stays")}
      </Link>
      <div className="detail-heading">
        <div>
          <span className="eyebrow">SUKA HOMESTAY</span>
          <h1>{names[a.id][lang]}</h1>
          <Counts bedrooms={a.bedrooms} bathrooms={a.bathrooms} />
        </div>
        <div className="detail-rate">
          {catalog.settings.demo_rates && <small>{t("sample")}</small>}
          <strong>{money(a.rate, lang)}</strong>
          <span>/ {t("night")}</span>
        </div>
      </div>
      <Photo accommodation={a} className="detail-hero" />
      {a.photos.length > 1 && (
        <div className="detail-photo-rail">
          {a.photos.slice(1).map((src) => (
            <Photo key={src} src={src} />
          ))}
        </div>
      )}
      <div className="detail-columns">
        <div>
          <h2>{t("stayTitle")}</h2>
          <p>
            {a.description[lang] ||
              t(
                a.id === "MAIN"
                  ? "mainDesc"
                  : a.id === "WHOLE"
                    ? "wholeDesc"
                    : "roomDesc",
              )}
          </p>
          <h3>{t("amenities")}</h3>
          {a.amenities.length ? (
            <ul className="amenity-list">
              {a.amenities.map((am) => (
                <li key={am}>
                  <Check size={18} />
                  {t(am as TranslationKey) ||
                    am.split("|")[lang === "ms" ? 0 : 1] ||
                    am}
                </li>
              ))}
            </ul>
          ) : (
            <p>{t("missing")}</p>
          )}
          {a.id.startsWith("ROOM") && <Notice>{t("access")}</Notice>}
          <h3>{t("capacity")}</h3>
          <p>
            {a.capacity ? `${a.capacity} ${t("guest")}` : t("capacityMissing")}
          </p>
          <h3>{t("rules")}</h3>
          <p className="preserve">
            {catalog.settings.rules[lang] || t("missing")}
          </p>
          <h3>{t("policies")}</h3>
          <p className="preserve">
            {catalog.settings.policies[lang] || t("policyMissing")}
          </p>
          {a.id.startsWith("ROOM") && (
            <div className="room-links">
              {(["ROOM_A", "ROOM_B", "ROOM_C"] as PackageId[]).map((id) => (
                <Link
                  className={`button ${id === a.id ? "" : "outline"}`}
                  key={id}
                  to={`/stay/${id}`}
                >
                  {names[id][lang]}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div>
          <AvailabilityCalendar ids={selectedResources(a.id)} />
          <div className="detail-summary">
            <ErrorNotice code={error} />
            <PriceSummary quote={quote} />
          </div>
          <Link
            className="button full"
            to="/book"
            onClick={() => setDraft({ resources: selectedResources(a.id) })}
          >
            {t("check")}
            <ArrowRight size={18} />
          </Link>
          <p className="small muted">{t("priceNote")}</p>
        </div>
      </div>
    </div>
  );
}
