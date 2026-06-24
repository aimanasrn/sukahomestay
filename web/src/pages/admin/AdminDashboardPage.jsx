import React, { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

const metricLabels = [
  ["Properties", "properties"],
  ["Rooms", "rooms"],
  ["Bookings", "totalBookings"],
  ["Pending", "pendingBookings"],
  ["Booked", "bookedBookings"],
  ["Blocked Dates", "availabilityRules"],
];

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const AdminDashboardPage = () => {
  const { authFetch, user } = useAdminAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const result = await authFetch("/admin/dashboard");
        if (!cancelled) {
          setData(result);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [authFetch]);

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] bg-[linear-gradient(135deg,#182230_0%,#2c3b50_52%,#ff7a1a_135%)] px-6 py-8 text-white shadow-[0_28px_80px_rgba(24,34,48,0.24)] sm:px-8">
        <p className="text-sm uppercase tracking-[0.22em] text-[#ffd3b0]">Overview</p>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
              Welcome back, {user?.fullName?.split(" ")[0]}.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#e4e7ec] sm:text-base">
              This admin area gives you a clear view of bookings, room inventory, and manual availability controls behind the new public experience.
            </p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-[#ffd3b0]">Guest experience</p>
            <p className="mt-2 text-lg font-semibold text-white">Orange hospitality system active</p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricLabels.map(([label, key]) => (
          <article
            key={key}
            className="rounded-[28px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]"
          >
            <p className="text-sm font-medium text-[#98a2b3]">{label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[#182230]">
              {data?.metrics?.[key] ?? "--"}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-[#f97316]">Recent bookings</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#182230]">
              Latest guest requests
            </h2>
          </div>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#eaecf0] text-[#98a2b3]">
                <th className="pb-3 font-semibold">Guest</th>
                <th className="pb-3 font-semibold">Stay</th>
                <th className="pb-3 font-semibold">Dates</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentBookings || []).map((booking) => (
                <tr key={booking.id} className="border-b border-[#f2f4f7] last:border-b-0">
                  <td className="py-4">
                    <p className="font-semibold text-[#182230]">{booking.fullName}</p>
                    <p className="text-[#667085]">{booking.email}</p>
                  </td>
                  <td className="py-4 capitalize text-[#344054]">
                    {booking.room?.property?.name || booking.bookingType.replace("_", " ")}
                  </td>
                  <td className="py-4 text-[#667085]">
                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                  </td>
                  <td className="py-4">
                    <span className="rounded-full bg-[#fff1e5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
