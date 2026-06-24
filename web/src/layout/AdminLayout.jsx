import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const navItems = [
  { label: "Overview", to: "/admin" },
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Availability", to: "/admin/availability" },
  { label: "Properties", to: "/admin/properties" },
];

const AdminLayout = () => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[#fff8f1] text-[#1f2937]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-r border-[#ffd7bc] bg-[linear-gradient(180deg,#fffdfb_0%,#fff3e7_100%)] px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff7a1a] text-lg font-bold text-white shadow-[0_18px_40px_rgba(255,122,26,0.22)]">
              S
            </div>
            <div>
              <p className="text-lg font-semibold tracking-[-0.03em] text-[#182230]">
                Sukahomestay
              </p>
              <p className="text-xs uppercase tracking-[0.24em] text-[#f97316]">
                Admin Console
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-[28px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.07)]">
            <p className="text-sm text-[#98a2b3]">Signed in as</p>
            <p className="mt-2 text-base font-semibold text-[#182230]">{user?.fullName}</p>
            <p className="text-sm text-[#667085]">{user?.email}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/admin"}
                className={({ isActive }) =>
                  `flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-[#ff7a1a] text-white shadow-[0_16px_34px_rgba(255,122,26,0.25)]"
                      : "text-[#344054] hover:bg-white hover:text-[#ff7a1a]"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 rounded-[28px] bg-[#182230] p-5 text-white shadow-[0_24px_60px_rgba(24,34,48,0.24)]">
            <p className="text-sm uppercase tracking-[0.18em] text-[#ffd3b0]">Quick note</p>
            <p className="mt-3 text-sm leading-6 text-[#f8fafc]">
              Use this dashboard to confirm bookings, block dates, and keep every stay aligned with the new public booking flow.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded-2xl border border-[#ffb98a] bg-white px-4 py-3 text-sm font-semibold text-[#ff7a1a] transition hover:bg-[#fff1e5]"
          >
            Log out
          </button>
        </aside>

        <main className="px-5 py-6 sm:px-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
