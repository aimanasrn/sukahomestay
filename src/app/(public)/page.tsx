"use client";

import Link from "next/link";
import { CheckCircle2, Wifi, Wind, Utensils, Car, Users, Key, ArrowRight } from "lucide-react";
import { BookingSearch } from "@/components/booking-search";
import { UnitCard } from "@/components/unit-card";
import { units } from "@/data/units";
import { useLanguage } from "@/context/language-context";

export default function Home() {
  const { t } = useLanguage();

  const amenityList = [
    { icon: Wifi, text: "High-Speed Wi-Fi" },
    { icon: Wind, text: "Full Air Conditioning" },
    { icon: Utensils, text: "Equipped Kitchen" },
    { icon: Car, text: "Free Private Parking" },
    { icon: Users, text: "Family & Group Friendly" },
    { icon: Key, text: "Self & Easy Check-in" },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="shell hero">
        <div className="hero-content">
          <span className="eyebrow">{t("hero_eyebrow")}</span>
          <h1>
            {t("hero_title_1")}<em>{t("hero_title_2")}</em>
          </h1>
          <p>{t("hero_lead")}</p>

          <div className="actions">
            <Link className="button" href="/availability">
              <span>{t("hero_btn_book")}</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary" href="/accommodations">
              {t("hero_btn_explore")}
            </Link>
          </div>

          <BookingSearch />

          <div className="trust">
            <span><CheckCircle2 size={16} /> Direct Booking</span>
            <span><CheckCircle2 size={16} /> Instant Price Breakdown</span>
            <span><CheckCircle2 size={16} /> Secure Bank Transfer</span>
            <span><CheckCircle2 size={16} /> Fast Host Confirmation</span>
          </div>
        </div>

        <div className="hero-image">
          <img src="/images/sukahomestay-hero.png" alt="SukaHomestay Luxury Property Exterior" />
        </div>
      </section>

      {/* Accommodation Section */}
      <section id="availability" className="section soft">
        <div className="shell">
          <span className="eyebrow">{t("features_eyebrow")}</span>
          <h2 className="title">{t("features_title")}</h2>
          <p className="lead">
            Choose a full house for family privacy, a cozy roomstay for quick trips, or reserve the entire estate for grand gatherings.
          </p>

          <div className="cards">
            {units.map((unit) => (
              <UnitCard unit={unit} key={unit.id} />
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="section">
        <div className="shell split">
          <div>
            <span className="eyebrow">EVERYTHING YOU NEED</span>
            <h2 className="title">Comforts That Make A House Feel Like Home</h2>
            <p className="lead">
              We provide essential modern conveniences so you can focus on making memorable moments with family and friends.
            </p>
          </div>

          <div className="amenities">
            {amenityList.map((item) => (
              <div className="amenity" key={item.text}>
                <item.icon size={20} />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3-Step Process Section */}
      <section className="section soft">
        <div className="shell">
          <span className="eyebrow">{t("steps_eyebrow")}</span>
          <h2 className="title">{t("steps_title")}</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>{t("step_1_title")}</h3>
              <p>{t("step_1_desc")}</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>{t("step_2_title")}</h3>
              <p>{t("step_2_desc")}</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>{t("step_3_title")}</h3>
              <p>{t("step_3_desc")}</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
