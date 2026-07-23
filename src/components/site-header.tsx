"use client";

import Link from "next/link";
import { Heart, Menu, X, User, LogOut, ShieldAlert, Calendar, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { useLanguage } from "@/context/language-context";

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();

  const [signedIn, setSignedIn] = useState(false);
  const [admin, setAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function sync() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setSignedIn(Boolean(user));
        if (user) {
          setUserEmail(user.email || null);
          const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
          setAdmin(data?.role === "admin");
        } else {
          setUserEmail(null);
          setAdmin(false);
        }
      } catch (err) {
        console.warn("Auth sync error:", err);
      }
    }
    sync();

    try {
      const supabase = createClient();
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => sync());
      return () => subscription.unsubscribe();
    } catch (err) {
      console.warn("Auth listener error:", err);
    }
  }, []);

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } catch (err) {
      console.warn("Sign out error:", err);
    }
    setSignedIn(false);
    setAdmin(false);
    setUserEmail(null);
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  }

  const navLinks = [
    { href: "/", label: t("nav_home") },
    { href: "/accommodations", label: t("nav_accommodations") },
    { href: "/availability", label: t("nav_availability") },
    { href: "/contact", label: t("nav_contact") },
  ];

  return (
    <header className="nav">
      <div className="shell nav-in">
        <Link href="/" className="brand" onClick={() => setMobileMenuOpen(false)}>
          <Heart size={24} fill="currentColor" />
          <span>SukaHomestay</span>
        </Link>

        {/* Desktop Links */}
        <nav className="links" aria-label="Primary Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? "active" : ""}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="nav-actions">
          <div className="desktop-actions">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="button secondary"
              style={{ height: 40, padding: "0 12px", fontSize: "0.85rem", gap: 6 }}
              title="Tukar Bahasa / Switch Language"
            >
              <Globe size={16} color="var(--primary)" />
              <span style={{ fontWeight: 700 }}>{language === "en" ? "BM" : "EN"}</span>
            </button>

            {signedIn && (
              <Link
                href={admin ? "/admin" : "/dashboard"}
                className="button secondary"
                style={{ height: 40, padding: "0 14px", fontSize: "0.88rem" }}
              >
                {admin ? <ShieldAlert size={16} /> : <User size={16} />}
                <span>{admin ? t("nav_admin") : t("nav_my_bookings")}</span>
              </Link>
            )}

            <Link href="/availability" className="button" style={{ height: 40, padding: "0 18px", fontSize: "0.88rem" }}>
              {t("nav_book_now")}
            </Link>

            {signedIn ? (
              <button
                onClick={signOut}
                className="button secondary"
                style={{ height: 40, width: 40, padding: 0 }}
                title={`${t("nav_sign_out")} (${userEmail})`}
              >
                <LogOut size={16} />
              </button>
            ) : (
              <Link href="/login" className="button secondary" style={{ height: 40, padding: "0 16px", fontSize: "0.88rem" }}>
                {t("nav_login")}
              </Link>
            )}
          </div>

          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>Menu</span>
            <button
              onClick={toggleLanguage}
              className="button secondary"
              style={{ height: 34, padding: "0 12px", fontSize: "0.825rem", gap: 6 }}
            >
              <Globe size={14} color="var(--primary)" />
              <span>{language === "en" ? "Bahasa Melayu (BM)" : "English (EN)"}</span>
            </button>
          </div>

          <nav style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`mobile-nav-link ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div style={{ borderTop: "1px solid var(--line)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
            <Link
              href="/availability"
              className="button"
              onClick={() => setMobileMenuOpen(false)}
              style={{ width: "100%", justifyContent: "center" }}
            >
              <Calendar size={18} />
              <span>{t("nav_book_now")}</span>
            </Link>

            {signedIn ? (
              <>
                <Link
                  href={admin ? "/admin" : "/dashboard"}
                  className="button secondary"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {admin ? <ShieldAlert size={18} /> : <User size={18} />}
                  <span>{admin ? t("nav_admin") : t("nav_my_bookings")}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="button secondary"
                  style={{ width: "100%", justifyContent: "center", color: "var(--rose)" }}
                >
                  <LogOut size={18} />
                  <span>{t("nav_sign_out")} ({userEmail})</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="button secondary"
                onClick={() => setMobileMenuOpen(false)}
                style={{ width: "100%", justifyContent: "center" }}
              >
                <User size={18} />
                <span>{t("nav_login")}</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
