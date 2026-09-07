import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CookingPot,
  House,
  MapPin,
  Plus,
  Sofa,
  Utensils,
} from "lucide-react";
import { useLanguage } from "../i18n";
import { useApp } from "../state";
import {
  AccommodationCard,
  Counts,
  Photo,
  SearchBar,
  Modal,
} from "../components";
import { canonicalPackage, names, type Resource } from "../domain";
export default function Home() {
  const { t, lang } = useLanguage();
  const { catalog, setDraft } = useApp();
  const [selected, setSelected] = useState<Resource[]>(["MAIN"]);
  const [gallery, setGallery] = useState<string | null>(null);
  const beds = selected.reduce((s, r) => s + (r === "MAIN" ? 4 : 1), 0),
    baths = selected.reduce((s, r) => s + (r === "MAIN" ? 3 : 1), 0);
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src="/images/courtyard.webp"
          alt={t("photo")}
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <h1>
            {t("hero1")}
            <br />
            {t("hero2")}
            <br />
            <em>{t("hero3")}</em>
          </h1>
          <p>{t("heroDesc")}</p>
          <a className="hero-link" href="#stays">
            {t("discover")}
            <ArrowRight size={27} />
          </a>
        </div>
        <span className="hero-caption">{t("photo")}</span>
      </section>
      <div className="search-wrap">
        <SearchBar />
      </div>
      <section id="stays" className="section accommodation-section">
        <div className="stay-intro">
          <span className="eyebrow">{t("stayEyebrow")}</span>
          <h2>{t("stayTitle")}</h2>
          <span className="accent-line" />
          <p>{t("stayDesc")}</p>
          <a className="text-link" href="#spaces">
            {t("propertyEyebrow").toLocaleLowerCase(lang)}
            <ArrowRight size={18} />
          </a>
        </div>
        {(["MAIN", "ROOM_A", "WHOLE"] as const).map((id) => (
          <AccommodationCard
            key={id}
            a={catalog.accommodations.find((a) => a.id === id)!}
            roomGroup={id === "ROOM_A"}
          />
        ))}
      </section>
      <section id="spaces" className="property-band">
        <div className="section property-top">
          <div>
            <span className="eyebrow">{t("propertyEyebrow")}</span>
            <h2>{t("propertyTitle")}</h2>
            <p>{t("propertyDesc")}</p>
            <div className="addon-note">
              <Plus size={22} />
              <div>
                <h4>{t("addonTitle")}</h4>
                <p>{t("addonDesc")}</p>
              </div>
            </div>
          </div>
          <div className="property-visual">
            <p>{t("diagramHelp")}</p>
            <div className="property-diagram">
              {(["MAIN", "ROOM_A", "ROOM_B", "ROOM_C"] as Resource[]).map(
                (id) => (
                  <button
                    key={id}
                    className={`property-unit ${id === "MAIN" ? "main-unit" : ""} ${selected.includes(id) ? "active" : ""}`}
                    aria-pressed={selected.includes(id)}
                    onClick={() =>
                      setSelected((s) =>
                        s.includes(id) ? s.filter((r) => r !== id) : [...s, id],
                      )
                    }
                  >
                    <House size={id === "MAIN" ? 58 : 38} strokeWidth={1} />
                    <strong>{names[id][lang]}</strong>
                    <span>
                      {id === "MAIN" ? "4" : "1"} {t("bedroom")}
                    </span>
                    <span>
                      {id === "MAIN" ? "3" : "1"} {t("bathroom")}
                    </span>
                    {selected.includes(id) && (
                      <Check className="unit-check" size={16} />
                    )}
                  </button>
                ),
              )}
            </div>
            <div className="diagram-result">
              <Counts bedrooms={beds} bathrooms={baths} />
              <span>
                {selected.length === 4
                  ? names.WHOLE[lang]
                  : `${selected.length} ${t("selected").toLowerCase()}`}
              </span>
            </div>
            <small>{t("diagramNote")}</small>
            {selected.length > 0 &&
              (selected.includes("MAIN") || selected.length === 1) && (
                <Link
                  to="/book"
                  className="text-link"
                  onClick={() => setDraft({ resources: selected })}
                >
                  {t("book")}
                  <ArrowRight size={18} />
                </Link>
              )}
          </div>
        </div>
        <div className="section comparison-wrap">
          <table className="comparison">
            <thead>
              <tr>
                <th>{t("type")}</th>
                <th>{t("bed")}</th>
                <th>{t("bath")}</th>
                <th>{t("living")}</th>
                <th>{t("dining")}</th>
                <th>{t("kitchen")}</th>
              </tr>
            </thead>
            <tbody>
              {(["MAIN", "ROOM_A", "WHOLE"] as const).map((id) => (
                <tr key={id}>
                  <td>
                    {id === "ROOM_A" ? "Roomstay A / B / C" : names[id][lang]}
                  </td>
                  <td>{id === "MAIN" ? 4 : id === "WHOLE" ? 7 : 1}</td>
                  <td>{id === "MAIN" ? 3 : id === "WHOLE" ? 6 : 1}</td>
                  {["living", "dining", "kitchen"].map((k) => (
                    <td key={k}>
                      {catalog.accommodations
                        .find((a) => a.id === id)
                        ?.amenities.includes(k) ? (
                        <Check size={17} aria-label={t("included")} />
                      ) : (
                        <span aria-label={t("notIncluded")}>—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="section facilities">
        <div>
          <span className="eyebrow">{t("spaces")}</span>
          <h2>{t("facilitiesTitle")}</h2>
          <p>{t("facilitiesDesc")}</p>
        </div>
        <div className="facility-list">
          {(
            [
              { key: "living", icon: Sofa },
              { key: "dining", icon: Utensils },
              { key: "kitchen", icon: CookingPot },
            ] as const
          ).map(({ key, icon: Icon }) => (
            <div key={key}>
              <Icon size={30} strokeWidth={1.25} />
              <h3>{t(key)}</h3>
              <small>
                {names.MAIN[lang]} · {names.WHOLE[lang]}
              </small>
            </div>
          ))}
        </div>
        <p className="access-note">{t("access")}</p>
      </section>
      <section id="gallery" className="section gallery-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">{t("galleryEyebrow")}</span>
            <h2>{t("galleryTitle")}</h2>
          </div>
          <p>{t("galleryDesc")}</p>
        </div>
        <div className="gallery-rail">
          {["/images/courtyard.webp", "/images/bedroom.webp"].map((src, n) => (
            <button
              key={src}
              className={`gallery-image gallery-${n}`}
              aria-label={`${t("gallery")} ${n + 1}`}
              onClick={() => setGallery(src)}
            >
              <Photo src={src} />
              <span className="gallery-expand">
                <Plus size={22} />
              </span>
            </button>
          ))}
        </div>
      </section>
      <section id="location" className="section location-section">
        <div className="location-illustration">
          <MapPin size={46} strokeWidth={1} />
          <h3>SUKA HOMESTAY</h3>
          <p>{catalog.settings.address || t("missing")}</p>
          {catalog.settings.map_url &&
            /^https:\/\//.test(catalog.settings.map_url) && (
              <a
                href={catalog.settings.map_url}
                target="_blank"
                rel="noreferrer"
                className="button"
              >
                {t("map")}
                <ArrowUpRight size={18} />
              </a>
            )}
        </div>
        <div>
          <span className="eyebrow">{t("location")}</span>
          <h2>{t("locationTitle")}</h2>
          <p>{catalog.settings.address || t("locationDesc")}</p>
          <div className="location-details">
            <div>
              <span>{t("checkInTime")}</span>
              <strong>{catalog.settings.check_in || t("missing")}</strong>
            </div>
            <div>
              <span>{t("checkOutTime")}</span>
              <strong>{catalog.settings.check_out || t("missing")}</strong>
            </div>
          </div>
        </div>
      </section>
      <section className="section faq-section">
        <div>
          <span className="eyebrow">FAQ</span>
          <h2>{t("faqTitle")}</h2>
          <p>{t("faqSub")}</p>
        </div>
        <div className="faq-list">
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <details key={n}>
              <summary>
                {t(`faq${n}`)}
                <ChevronDown size={19} />
              </summary>
              <p>{t(`faqA${n}`)}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="final-cta">
        <House size={40} strokeWidth={1} />
        <h2>{t("finalTitle")}</h2>
        <p>{t("finalDesc")}</p>
        <Link className="button light" to="/book">
          {t("check")}
          <ArrowRight size={18} />
        </Link>
      </section>
      {gallery && (
        <Modal label={t("gallery")} onClose={() => setGallery(null)}>
          <Photo src={gallery} className="lightbox-photo" />
        </Modal>
      )}
    </>
  );
}
