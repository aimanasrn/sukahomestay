import React, { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import { useAdminAuth } from "@/context/AdminAuthContext";

function normalizeDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-MY", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const AdminAvailabilityPage = () => {
  const { authFetch } = useAdminAuth();
  const [rules, setRules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({
    bookingType: "homestay",
    status: "blocked",
    roomId: "",
  });
  const [properties, setProperties] = useState([]);
  const [error, setError] = useState("");

  async function loadData() {
    const [rulesResult, propertiesResult] = await Promise.all([
      authFetch("/admin/availability-rules"),
      authFetch("/admin/properties"),
    ]);
    setRules(rulesResult.rules);
    setProperties(propertiesResult.properties);
  }

  useEffect(() => {
    loadData().catch((loadError) => setError(loadError.message));
  }, []);

  const selectedDateKey = normalizeDate(selectedDate);
  const selectedDateRules = useMemo(
    () =>
      rules.filter((rule) => normalizeDate(rule.date) === selectedDateKey),
    [rules, selectedDateKey]
  );

  const roomOptions = useMemo(() => {
    const roomstay = properties.find((property) => property.type === "roomstay");
    return roomstay?.rooms || [];
  }, [properties]);

  async function handleCreateRule(event) {
    event.preventDefault();

    try {
      await authFetch("/admin/availability-rules", {
        method: "POST",
        body: JSON.stringify({
          date: selectedDateKey,
          bookingType: form.bookingType,
          roomId: form.bookingType === "roomstay" ? form.roomId || null : null,
          status: form.status,
        }),
      });
      await loadData();
    } catch (createError) {
      setError(createError.message);
    }
  }

  async function handleDeleteRule(ruleId) {
    try {
      await authFetch(`/admin/availability-rules/${ruleId}`, {
        method: "DELETE",
      });
      await loadData();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)] sm:p-7">
        <p className="text-sm uppercase tracking-[0.18em] text-[#f97316]">Availability</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#182230]">
          Control blocked and special dates
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[#667085]">
          The calendar below lets you mark unavailable dates for homestay, roomstay, or individual room units.
        </p>
      </section>

      {error ? (
        <div className="rounded-[24px] border border-[#fecaca] bg-[#fff1f2] px-5 py-4 text-sm text-[#b42318]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
          <div className="landing-calendar admin-calendar">
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              tileClassName={({ date }) =>
                rules.some((rule) => normalizeDate(rule.date) === normalizeDate(date))
                  ? "!bg-[#fff1e5] !text-[#f97316] !font-semibold"
                  : ""
              }
            />
          </div>
        </section>

        <section className="space-y-6">
          <article className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">
              Selected date
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#182230]">
              {formatDate(selectedDate)}
            </h2>

            <form className="mt-6 grid gap-4" onSubmit={handleCreateRule}>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#344054]">Stay type</span>
                <select
                  value={form.bookingType}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      bookingType: event.target.value,
                      roomId: event.target.value === "roomstay" ? current.roomId : "",
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-[#ffd7bc] bg-[#fffdfb] px-4"
                >
                  <option value="homestay">Homestay</option>
                  <option value="roomstay">Roomstay</option>
                  <option value="whole_house">Whole House</option>
                </select>
              </label>

              {form.bookingType === "roomstay" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-[#344054]">Room</span>
                  <select
                    value={form.roomId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, roomId: event.target.value }))
                    }
                    className="h-12 w-full rounded-2xl border border-[#ffd7bc] bg-[#fffdfb] px-4"
                  >
                    <option value="">All roomstay rooms</option>
                    {roomOptions.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#344054]">Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value }))
                  }
                  className="h-12 w-full rounded-2xl border border-[#ffd7bc] bg-[#fffdfb] px-4"
                >
                  <option value="blocked">Blocked</option>
                  <option value="limited">Limited</option>
                  <option value="special_rate">Special Rate</option>
                </select>
              </label>

              <button
                type="submit"
                className="h-12 rounded-2xl bg-[#ff7a1a] px-4 text-sm font-semibold text-white"
              >
                Save availability rule
              </button>
            </form>
          </article>

          <article className="rounded-[32px] border border-white/80 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.07)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">
              Active rules
            </p>
            <div className="mt-5 space-y-3">
              {selectedDateRules.length ? (
                selectedDateRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between gap-4 rounded-[22px] border border-[#ffe1ca] bg-[#fff8f1] px-4 py-4"
                  >
                    <div>
                      <p className="font-semibold capitalize text-[#182230]">
                        {rule.bookingType.replace("_", " ")}
                      </p>
                      <p className="text-sm text-[#667085]">{rule.status}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(rule.id)}
                      className="rounded-full border border-[#fecaca] bg-white px-3 py-2 text-xs font-semibold text-[#b42318]"
                    >
                      Remove
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#667085]">No rules saved for this day yet.</p>
              )}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
};

export default AdminAvailabilityPage;
