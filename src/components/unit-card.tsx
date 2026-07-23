"use client";

import Link from "next/link";
import { BedDouble, Bath, Users, ArrowRight } from "lucide-react";
import type { Unit } from "@/types";
import { useLanguage } from "@/context/language-context";

export function UnitCard({ unit }: { unit: Unit }) {
  const { t } = useLanguage();

  return (
    <article className="card">
      <figure>
        <img src={unit.image} alt={`Exterior of ${unit.name}`} loading="lazy" />
        <span className="unit-badge">{unit.type.replace("_", " ")}</span>
      </figure>

      <div className="card-body">
        <h3>{unit.name}</h3>
        <p>{unit.shortDescription}</p>

        <div className="meta">
          <span><BedDouble size={16} /> {unit.bedrooms} {t("unit_bedrooms")}</span>
          <span><Bath size={16} /> {unit.bathrooms} {t("unit_bathrooms")}</span>
          <span><Users size={16} /> {t("unit_max_guests")} {unit.maximumGuests}</span>
        </div>

        <div className="price">
          RM {unit.basePrice} <small>{t("unit_per_night")}</small>
        </div>

        <Link className="button secondary" href={`/accommodations/${unit.slug}`} style={{ width: "100%" }}>
          <span>{t("unit_details_btn")}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
