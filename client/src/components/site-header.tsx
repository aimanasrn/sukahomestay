import { Menu, UserRound, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
const links = [
  ["Stay", "/search"],
  ["About", "/about"],
  ["FAQ", "/faq"],
  ["My reservation", "/reservation-lookup"],
  ["Contact", "/contact"],
] as const;
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  return (
    <header className="relative z-20 border-b border-border/60 bg-background/95">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link
          className="font-display text-xl tracking-wide text-primary focus-ring"
          to="/"
        >
          SUKA HOMESTAY
        </Link>
        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-8 md:flex"
        >
          {links.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className="focus-ring text-sm font-medium hover:text-accent"
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost">
            <Link to={user ? "/account" : "/login"}>
              <UserRound data-icon="inline-start" />
              {user ? "Account" : "Log in"}
            </Link>
          </Button>
          {user && <Button variant="ghost" onClick={() => void supabase.auth.signOut()}>Log out</Button>}
          <Button asChild variant="terracotta">
            <Link to="/search">Find a stay</Link>
          </Button>
        </div>
        <Button
          aria-expanded={open}
          aria-label="Toggle navigation"
          className="md:hidden"
          variant="ghost"
          size="icon"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="container-shell flex flex-col gap-2 border-t py-4 md:hidden">
          {links.map(([label, path]) => (
            <Link
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-3 font-medium hover:bg-muted"
              key={path}
              to={path}
            >
              {label}
            </Link>
          ))}
          <Link className="rounded-lg px-3 py-3 font-medium" to="/login">
            Log in
          </Link>
        </nav>
      )}
    </header>
  );
}
