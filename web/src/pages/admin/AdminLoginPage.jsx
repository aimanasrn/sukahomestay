import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [form, setForm] = useState({
    email: "admin@sukahomestay.com",
    password: "admin12345",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(form);
      navigate("/admin");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8f1] px-4 py-10">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_top_left,#ffddb8_0%,transparent_45%),radial-gradient(circle_at_top_right,#ffd2a6_0%,transparent_35%)]" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="px-2 lg:px-6">
          <span className="inline-flex rounded-full border border-[#ffd7bc] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">
            Admin access
          </span>
          <h1 className="mt-6 max-w-xl text-4xl font-semibold tracking-[-0.05em] text-[#182230] sm:text-5xl">
            Manage bookings with the same polished feel as the guest journey.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#475467]">
            Review reservation requests, block dates, and keep property details aligned across the public booking site.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "Approve guest bookings faster",
              "Track blocked dates with clarity",
              "Keep room and homestay details consistent",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[24px] border border-white/70 bg-white/75 p-4 text-sm font-medium text-[#344054] shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/80 bg-white/92 p-7 shadow-[0_32px_90px_rgba(15,23,42,0.12)] backdrop-blur sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ff7a1a] text-lg font-bold text-white">
              S
            </div>
            <div>
              <p className="text-lg font-semibold text-[#182230]">Sukahomestay</p>
              <p className="text-sm text-[#667085]">Admin Console Login</p>
            </div>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#344054]">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="h-14 w-full rounded-2xl border border-[#ffd7bc] bg-[#fffdfb] px-4 text-[#182230] outline-none transition focus:border-[#ff7a1a] focus:ring-4 focus:ring-[#ffeddc]"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#344054]">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({ ...current, password: event.target.value }))
                }
                className="h-14 w-full rounded-2xl border border-[#ffd7bc] bg-[#fffdfb] px-4 text-[#182230] outline-none transition focus:border-[#ff7a1a] focus:ring-4 focus:ring-[#ffeddc]"
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-[#fecaca] bg-[#fff1f2] px-4 py-3 text-sm text-[#b42318]">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-14 w-full rounded-2xl bg-[#ff7a1a] px-5 text-sm font-semibold text-white shadow-[0_20px_44px_rgba(255,122,26,0.3)] transition hover:bg-[#ef6d10] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Signing in..." : "Enter admin console"}
            </button>
          </form>

          <p className="mt-5 text-sm text-[#667085]">
            Return to the public site at <Link to="/" className="font-semibold text-[#ff7a1a]">Sukahomestay homepage</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AdminLoginPage;
