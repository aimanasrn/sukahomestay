"use client";

import "./admin.css";
import "./drawer.css";
import "./mobile-overrides.css";
import Link from "next/link";
import { LogOut, Menu, X, Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

const links = [
  "Overview",
  "Bookings",
  "Calendar",
  "Accommodations",
  "Pricing",
  "Payments",
  "Customers",
  "Gallery",
  "Amenities",
  "Blocked dates",
  "Promotions",
  "Reviews",
  "Settings",
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("sukahomestay-bookings");
    }
    const close = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const nav = (
    <nav aria-label="Admin navigation">
      {links.map((x) => {
        const href = x === "Overview" ? "/admin" : `/admin/${x.toLowerCase().replace(" ", "-")}`;
        const isActive = pathname === href;
        return (
          <Link
            onClick={() => setMenuOpen(false)}
            href={href}
            key={x}
            className={isActive ? "active" : ""}
          >
            {x}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="dash admin-shell">
      <aside className="side admin-side">
        <div className="admin-brand">
          <strong>Admin console</strong>
          <span>SukaHomestay</span>
        </div>
        {nav}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 16 }}>
          <Link
            href="/"
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
            <span>Back to Website</span>
          </Link>
          <button className="admin-signout" onClick={signOut}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <main className="main admin-main">
        <div className="admin-mobile-bar">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <strong>Admin console</strong>
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
          <div>
            <button className="admin-signout" onClick={signOut}>
              <LogOut size={17} /> Sign out
            </button>
            <button
              className="admin-menu-button"
              aria-label="Open admin menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
        {children}
      </main>

      {menuOpen && <button className="admin-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <aside className={`admin-drawer ${menuOpen ? "open" : ""}`} aria-hidden={!menuOpen}>
        <div className="drawer-head">
          <strong>Admin navigation</strong>
          <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
            <X size={21} />
          </button>
        </div>
        {nav}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto", paddingTop: 16 }}>
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
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
            <span>Back to Website</span>
          </Link>
          <button className="admin-signout" onClick={signOut}>
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
    </div>
  );
}
