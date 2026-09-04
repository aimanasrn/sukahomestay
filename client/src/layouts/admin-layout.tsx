import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarDays,
  ChevronLeft,
  CreditCard,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
const links = [
  [LayoutDashboard, "Overview", "/admin"],
  [CalendarDays, "Calendar", "/admin/calendar"],
  [BedDouble, "Bookings", "/admin/bookings"],
  [Building2, "Properties", "/admin/properties"],
  [BedDouble, "Rooms", "/admin/rooms"],
  [UsersRound, "Customers", "/admin/customers"],
  [CreditCard, "Payments", "/admin/payments"],
  [BarChart3, "Reports", "/admin/reports"],
  [Settings, "Settings", "/admin/settings"],
] as const;
export function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#f7f3ea]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-primary p-4 text-primary-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-3 py-5">
          <Link to="/admin" className="font-display text-xl tracking-wide">
            SUKA HOMESTAY
          </Link>
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <nav className="mt-5 flex flex-1 flex-col gap-1">
          {links.map(([Icon, label, path]) => (
            <NavLink
              end={path === "/admin"}
              to={path}
              key={path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-primary-foreground/75 hover:bg-white/10 hover:text-white",
                  isActive && "bg-white/12 text-white shadow-inner",
                )
              }
            >
              <Icon className="size-5" strokeWidth={1.7} />
              {label}
            </NavLink>
          ))}
        </nav>
        <button className="flex items-center gap-3 border-t border-white/20 px-3 pt-5 text-sm">
          <ChevronLeft />
          Collapse
        </button>
      </aside>
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <div className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b bg-[#f7f3ea] px-5 lg:px-10">
          <Button
            className="lg:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
          <label className="ml-auto mr-5 hidden w-full max-w-md items-center gap-2 rounded-xl border bg-card px-4 py-2.5 text-sm text-muted-foreground md:flex">
            <Search className="size-4" />
            <input
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
              aria-label="Search bookings, guests and properties"
              placeholder="Search bookings, guests, properties…"
            />
          </label>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">Nadia</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-display text-primary">
              NR
            </span>
          </div>
        </header>
        <main className="p-5 lg:p-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
