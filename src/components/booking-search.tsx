"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Calendar, Home, Users, Search } from "lucide-react";
import { useLanguage } from "@/context/language-context";

export function BookingSearch() {
  const router = useRouter();
  const { t } = useLanguage();

  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();

    const unit = String(formData.get("unit") || "");
    const checkin = String(formData.get("checkin") || "");
    const checkout = String(formData.get("checkout") || "");
    const guests = String(formData.get("guests") || "2");

    if (unit) params.set("unit", unit);
    if (checkin) params.set("checkin", checkin);
    if (checkout) params.set("checkout", checkout);
    if (guests) params.set("guests", guests);

    router.push(`/availability?${params.toString()}`);
  }

  return (
    <form className="search" onSubmit={search}>
      <div className="field">
        <label htmlFor="unit" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Home size={13} /> {t("search_unit_type")}
        </label>
        <select id="unit" name="unit" defaultValue="">
          <option value="">{t("search_all_units")}</option>
          <option value="Full Homestay (4 Bedrooms)">Full Homestay</option>
          <option value="Roomstay 1 (Master Bedroom)">Roomstay 1</option>
          <option value="Roomstay 2 (Deluxe Queen)">Roomstay 2</option>
          <option value="Whole House (Grand Package)">Whole House</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="checkin" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={13} /> {t("search_checkin")}
        </label>
        <input id="checkin" name="checkin" type="date" required />
      </div>

      <div className="field">
        <label htmlFor="checkout" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Calendar size={13} /> {t("search_checkout")}
        </label>
        <input id="checkout" name="checkout" type="date" required />
      </div>

      <div className="field">
        <label htmlFor="guests" style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <Users size={13} /> {t("unit_max_guests")}
        </label>
        <select id="guests" name="guests" defaultValue="2">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="8">8+</option>
        </select>
      </div>

      <button className="button" type="submit">
        <Search size={18} />
        <span>{t("search_btn")}</span>
      </button>
    </form>
  );
}
