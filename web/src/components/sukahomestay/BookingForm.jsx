import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  buildWhatsAppBookingHref,
  formatCurrency,
  formatDisplayDate,
  getBookingPricing,
} from "@/components/sukahomestay/bookingSummary";
import { getPropertyTypeLabel, usePublicI18n } from "@/i18n/publicI18n";
import { publicApi } from "@/services/publicApi";

function useQueryDefaults() {
  const location = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      bookingType: params.get("bookingType") || "homestay",
      roomId: params.get("roomId") || "",
    };
  }, [location.search]);
}

function buildInitialForm(defaults, initialValues = {}) {
  return {
    fullName: "",
    phone: "",
    email: "",
    checkInDate: "",
    checkOutDate: "",
    guestCount: "1",
    bookingType: defaults.bookingType,
    roomId: defaults.roomId,
    specialRequest: "",
    ...initialValues,
  };
}

export default function BookingForm({
  initialValues = {},
  properties = [],
  roomOptions = [],
}) {
  const navigate = useNavigate();
  const defaults = useQueryDefaults();
  const { language, messages, dateLocale } = usePublicI18n();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(() =>
    buildInitialForm(defaults, initialValues)
  );
  const isRoomstay = form.bookingType === "roomstay";
  const pricing = useMemo(
    () =>
      getBookingPricing({
        bookingType: form.bookingType,
        roomId: form.roomId,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        properties,
        roomOptions,
      }),
    [
      form.bookingType,
      form.roomId,
      form.checkInDate,
      form.checkOutDate,
      properties,
      roomOptions,
    ]
  );

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await publicApi.createBooking({
        ...form,
        guestCount: Number(form.guestCount),
      });
      navigate("/booking/success", {
        state: {
          bookingId: response.booking?.id || "",
          fullName: form.fullName,
          phone: form.phone,
          guestCount: Number(form.guestCount),
            bookingType: form.bookingType,
            roomId: form.roomId,
            roomName: pricing.roomName,
            checkInDate: form.checkInDate,
            checkOutDate: form.checkOutDate,
            nights: pricing.nights,
            totalAmount: pricing.totalAmount,
            language,
            whatsappHref: buildWhatsAppBookingHref({
              bookingId: response.booking?.id || "",
              fullName: form.fullName,
            phone: form.phone,
            guestCount: Number(form.guestCount),
            bookingType: form.bookingType,
            roomId: form.roomId,
            roomName: pricing.roomName,
            checkInDate: form.checkInDate,
              checkOutDate: form.checkOutDate,
              nights: pricing.nights,
              totalAmount: pricing.totalAmount,
              language,
              dateLocale,
            }),
          },
        });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const nextForm = {
        ...current,
        [name]: value,
      };

      if (name === "bookingType" && value !== "roomstay") {
        nextForm.roomId = "";
      }

      return nextForm;
    });
  }

  return (
    <form
      className="space-y-6 rounded-[1.5rem] border border-[#edf1f6] bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.fullName}
          <input
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            name="fullName"
            required
            placeholder={messages.shared.bookingForm.fullNamePlaceholder}
            value={form.fullName}
            onChange={updateField}
          />
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.phone}
          <input
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            name="phone"
            required
            placeholder={messages.shared.bookingForm.phonePlaceholder}
            value={form.phone}
            onChange={updateField}
          />
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.email}
          <input
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            name="email"
            required
            type="email"
            placeholder={messages.shared.bookingForm.emailPlaceholder}
            value={form.email}
            onChange={updateField}
          />
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.guests}
          <input
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            min="1"
            name="guestCount"
            required
            type="number"
            value={form.guestCount}
            onChange={updateField}
          />
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.checkIn}
          <input
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            name="checkInDate"
            required
            type="date"
            value={form.checkInDate}
            onChange={updateField}
          />
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.checkOut}
          <input
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            name="checkOutDate"
            required
            type="date"
            value={form.checkOutDate}
            onChange={updateField}
          />
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.bookingType}
          <select
            className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
            name="bookingType"
            value={form.bookingType}
            onChange={updateField}
          >
            <option value="homestay">{getPropertyTypeLabel("homestay", messages)}</option>
            <option value="roomstay">{getPropertyTypeLabel("roomstay", messages)}</option>
            <option value="whole_house">{getPropertyTypeLabel("whole_house", messages)}</option>
          </select>
        </label>
        <label className="block text-sm font-medium text-[#475467]">
          {messages.shared.bookingForm.roomId}
          <select
            className={`mt-2 block w-full rounded-[1rem] border px-4 py-3 outline-none transition ${
              isRoomstay
                ? "border-[#eef1f6] bg-[#f9fbff] text-[#16213e] focus:border-[#ffb98a] focus:bg-white"
                : "cursor-not-allowed border-[#f2e6dc] bg-[#fff4eb] text-[#98a2b3]"
            }`}
            disabled={!isRoomstay}
            name="roomId"
            value={form.roomId}
            onChange={updateField}
          >
            <option value="">
              {isRoomstay
                ? roomOptions.length
                  ? messages.shared.booking.selectRoom
                  : messages.shared.booking.noRoomstayRooms
                : messages.shared.bookingForm.roomIdDisabled}
            </option>
            {roomOptions.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="rounded-[1.5rem] border border-[#ffd9bd] bg-[#fff8f3] p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">
          {messages.shared.bookingForm.amountSummary}
        </p>
        <div className="mt-3 grid gap-3 text-sm text-[#667085]">
          <div className="flex items-center justify-between gap-4">
            <span>{messages.shared.bookingForm.checkIn}</span>
            <span className="font-semibold text-[#16213e]">
              {formatDisplayDate(form.checkInDate, dateLocale)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>{messages.shared.bookingForm.checkOut}</span>
            <span className="font-semibold text-[#16213e]">
              {formatDisplayDate(form.checkOutDate, dateLocale)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>{messages.shared.booking.ratePerNight}</span>
            <span className="font-semibold text-[#16213e]">
              {formatCurrency(pricing.nightlyRate, dateLocale)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>{messages.shared.labels.nights}</span>
            <span className="font-semibold text-[#16213e]">
              {pricing.nights}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-[#ffd9bd] pt-3">
            <span>{messages.shared.bookingForm.totalToPayWhatsapp}</span>
            <span className="text-lg font-semibold text-[#ff7a1a]">
              {formatCurrency(pricing.totalAmount, dateLocale)}
            </span>
          </div>
        </div>
      </div>
      <label className="block text-sm font-medium text-[#475467]">
        {messages.shared.bookingForm.specialRequest}
        <textarea
          className="mt-2 block w-full rounded-[1rem] border border-[#eef1f6] bg-[#f9fbff] px-4 py-3 text-[#16213e] outline-none transition focus:border-[#ffb98a] focus:bg-white"
          name="specialRequest"
          rows="4"
          value={form.specialRequest}
          onChange={updateField}
        />
      </label>
      {error ? <p className="text-sm text-[#ff7a1a]">{error}</p> : null}
      <button
        className="btn w-full bg-[#ff7a1a] text-white hover:bg-[#ef6d10]"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? messages.shared.bookingForm.submitting : messages.shared.bookingForm.submit}
      </button>
    </form>
  );
}
