import React, { useEffect, useState } from "react";
import { useAdminAuth } from "@/context/AdminAuthContext";

function formatDate(value) {
  return new Date(value).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const AdminBookingsPage = () => {
  const { authFetch } = useAdminAuth();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  async function loadBookings() {
    const result = await authFetch("/admin/bookings");
    setBookings(result.bookings);
  }

  useEffect(() => {
    loadBookings().catch((loadError) => setError(loadError.message));
  }, []);

  async function handleStatusUpdate(bookingId, status) {
    try {
      await authFetch(`/admin/bookings/${bookingId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadBookings();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7">
        <p className="text-sm uppercase tracking-[0.18em] text-[#f97316]">Bookings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#182230]">
          Manage reservation requests
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085]">
          Confirm or reject incoming requests while keeping the public booking flow clean and trustworthy.
        </p>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[#fff8f1] text-[#98a2b3]">
              <tr>
                <th className="px-6 py-4 font-semibold">Guest</th>
                <th className="px-6 py-4 font-semibold">Stay</th>
                <th className="px-6 py-4 font-semibold">Dates</th>
                <th className="px-6 py-4 font-semibold">Guests</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-t border-[#f2f4f7] align-top">
                  <td className="px-6 py-5">
                    <p className="font-semibold text-[#182230]">{booking.fullName}</p>
                    <p className="text-[#667085]">{booking.email}</p>
                    <p className="text-[#667085]">{booking.phone}</p>
                  </td>
                  <td className="px-6 py-5 text-[#344054]">
                    <p className="font-semibold capitalize">
                      {booking.room?.property?.name || booking.bookingType.replace("_", " ")}
                    </p>
                    {booking.room?.name ? <p>{booking.room.name}</p> : null}
                  </td>
                  <td className="px-6 py-5 text-[#667085]">
                    {formatDate(booking.checkInDate)} - {formatDate(booking.checkOutDate)}
                  </td>
                  <td className="px-6 py-5 text-[#344054]">{booking.guestCount}</td>
                  <td className="px-6 py-5">
                    <span className="rounded-full bg-[#fff1e5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#f97316]">
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(booking.id, "booked")}
                        className="rounded-full bg-[#ff7a1a] px-3 py-2 text-xs font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusUpdate(booking.id, "rejected")}
                        className="rounded-full border border-[#fecaca] bg-white px-3 py-2 text-xs font-semibold text-[#b42318]"
                      >
                        Reject
                      </button>
                    </div>
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

export default AdminBookingsPage;
