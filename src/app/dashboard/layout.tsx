"use client";

import "./dashboard.css";
import "./drawer-fix.css";
import Link from "next/link";
import { LogOut, Menu, X, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/context/language-context";

const links = ["Overview", "Bookings", "Payments", "Profile", "Reviews"];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav aria-label="Customer navigation">
      {links.map((x) => (
        <Link
          key={x}
          onClick={() => setOpen(false)}
          href={x === "Overview" ? "/dashboard" : `/dashboard/${x.toLowerCase()}`}
        >
          {x}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="dash customer-shell">
      <aside className="side customer-side">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <strong>SukaHomestay</strong>
          <button
            onClick={toggleLanguage}
            style={{
              background: "rgba(255, 255, 255, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#fff",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: "0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <Globe size={13} /> {language === "en" ? "BM" : "EN"}
          </button>
        </div>
        {nav}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 16 }}>
          <Link
            href="/"
            className="website-link"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 42,
              padding: "0 13px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 10,
              background: "rgba(255, 255, 255, 0.08)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              transition: "all 0.2s ease"
            }}
          >
            <Globe size={17} />
            <span>{t("nav_back_to_website")}</span>
          </Link>
          <button className="customer-signout" onClick={signOut}>
            <LogOut size={17} /> {t("nav_sign_out")}
          </button>
        </div>
      </aside>

      <main className="main customer-main">
        <div className="customer-mobile-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <strong>SukaHomestay</strong>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: "0.8rem",
                color: "var(--primary)",
                fontWeight: 600,
                textDecoration: "none"
              }}
            >
              <Globe size={14} /> Website
            </Link>
          </div>
          <button className="customer-menu" aria-label="Open account menu" onClick={() => setOpen(true)}>
            <Menu size={21} />
          </button>
        </div>
        {children}
      </main>

      {open && <button className="customer-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <aside className={`customer-drawer ${open ? "open" : ""}`}>
        <div className="customer-drawer-head">
          <strong>My account</strong>
          <button aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={21} />
          </button>
        </div>
        {nav}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 16 }}>
          <button
            onClick={toggleLanguage}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 42,
              padding: "0 13px",
              border: "1px solid var(--line)",
              borderRadius: 10,
              background: "var(--soft-bg)",
              color: "var(--navy)",
              fontWeight: 600,
              fontSize: "0.9rem",
              cursor: "pointer"
            }}
          >
            <Globe size={17} />
            <span>{language === "en" ? "Tukar Ke Bahasa Melayu" : "Switch to English"}</span>
          </button>

          <Link
            href="/"
            onClick={() => setOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              minHeight: 42,
              padding: "0 13px",
              border: "1px solid var(--line)",
              borderRadius: 10,
              background: "var(--soft-bg)",
              color: "var(--navy)",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none"
            }}
          >
            <Globe size={17} />
            <span>{t("nav_back_to_website")}</span>
          </Link>

          <button className="customer-signout" onClick={signOut}>
            <LogOut size={17} /> {t("nav_sign_out")}
          </button>
        </div>
      </aside>
    </div>
  );
}
