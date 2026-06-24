import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import BookingRequestModal from "@/components/sukahomestay/BookingRequestModal";
import PublicAvailabilityCalendar from "@/components/sukahomestay/PublicAvailabilityCalendar";
import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import {
  formatCurrency,
  getBookingPricing,
} from "@/components/sukahomestay/bookingSummary";
import { toDateKey } from "@/components/sukahomestay/publicSiteContent";
import { getPropertyTypeLabel, usePublicI18n } from "@/i18n/publicI18n";
import usePublicProperties from "@/hooks/usePublicProperties";

export default function AvailabilityPage() {
  const location = useLocation();
  const { properties } = usePublicProperties();
  const { messages, dateLocale } = usePublicI18n();
  const initialForm = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return {
      checkInDate: params.get("checkInDate") || "",
      checkOutDate: params.get("checkOutDate") || "",
      bookingType: params.get("bookingType") || "homestay",
      roomId: params.get("roomId") || "",
    };
  }, [location.search]);
  const [selectedDate, setSelectedDate] = useState(
    initialForm.checkInDate ? new Date(initialForm.checkInDate) : new Date()
  );
  const [bookingType, setBookingType] = useState(initialForm.bookingType);
  const [roomId, setRoomId] = useState(initialForm.roomId);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const isRoomstay = bookingType === "roomstay";
  const roomOptions = useMemo(
    () =>
      properties.find((property) => property.type === "roomstay")?.rooms || [],
    [properties]
  );
  const checkInDate = toDateKey(selectedDate);
  const nextDate = new Date(selectedDate);
  nextDate.setDate(nextDate.getDate() + 1);
  const checkOutDate = toDateKey(nextDate);
  const pricing = useMemo(
    () =>
      getBookingPricing({
        bookingType,
        roomId,
        checkInDate,
        checkOutDate,
        properties,
        roomOptions,
      }),
    [bookingType, roomId, checkInDate, checkOutDate, properties, roomOptions]
  );

  function handleBookingTypeChange(event) {
    const nextType = event.target.value;
    setBookingType(nextType);

    if (nextType !== "roomstay") {
      setRoomId("");
    }
  }

  return (
    <>
      <main className="space-y-8 pb-16">
        <PublicPageHero
          badge={messages.pages.availability.badge}
          description={messages.pages.availability.description}
          title={messages.pages.availability.title}
        />

        <section className="grid gap-8 rounded-[2rem] border border-[#edf1f6] bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]">
                {messages.shared.booking.sectionEyebrow}
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e]">
                {messages.shared.booking.sectionTitle}
              </h2>
              <p className="max-w-xl text-base leading-8 text-[#667085]">
                {messages.shared.booking.sectionDescription}
              </p>
            </div>

            <div className="grid gap-4 rounded-[1.75rem] bg-[#fff8f3] p-5">
              <label className="block text-sm font-medium text-[#475467]">
                {messages.shared.labels.bookingType}
                <select
                  className="mt-2 block h-12 w-full rounded-[1rem] border border-[#eef1f6] bg-white px-4 text-[#16213e] outline-none transition focus:border-[#ffb98a]"
                  value={bookingType}
                  onChange={handleBookingTypeChange}
                >
                  <option value="homestay">{getPropertyTypeLabel("homestay", messages)}</option>
                  <option value="roomstay">{getPropertyTypeLabel("roomstay", messages)}</option>
                  <option value="whole_house">{getPropertyTypeLabel("whole_house", messages)}</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-[#475467]">
                {messages.shared.booking.roomIdHelp}
                <select
                  className={`mt-2 block h-12 w-full rounded-[1rem] border px-4 outline-none transition ${
                    isRoomstay
                      ? "border-[#eef1f6] bg-white text-[#16213e] focus:border-[#ffb98a]"
                      : "cursor-not-allowed border-[#f2e6dc] bg-[#fff4eb] text-[#98a2b3]"
                  }`}
                  disabled={!isRoomstay}
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                >
                  <option value="">
                    {isRoomstay
                      ? roomOptions.length
                        ? messages.shared.booking.selectRoom
                        : messages.shared.booking.noRoomstayRooms
                      : messages.shared.booking.roomstayOnly}
                  </option>
                  {roomOptions.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-[1.5rem] border border-[#ffd9bd] bg-white px-4 py-4 text-sm leading-7 text-[#667085]">
                {messages.shared.labels.selectedDate}:
                <span className="ml-2 font-semibold text-[#16213e]">
                  {selectedDate.toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="rounded-[1.5rem] border border-[#ffd9bd] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">
                  {messages.shared.booking.paymentSummary}
                </p>
                <div className="mt-3 grid gap-3 text-sm text-[#667085]">
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
                  <div className="flex items-center justify-between gap-4 border-t border-[#fff1e8] pt-3">
                    <span>{messages.shared.labels.totalToPay}</span>
                    <span className="text-lg font-semibold text-[#ff7a1a]">
                      {formatCurrency(pricing.totalAmount, dateLocale)}
                    </span>
                  </div>
                  <p className="text-xs leading-6 text-[#98a2b3]">
                    {messages.shared.booking.paymentManualNote}
                  </p>
                </div>
              </div>

              <button
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#ffb98a] bg-white px-5 text-sm font-semibold text-[#ff7a1a] transition hover:bg-[#fff6ef]"
                onClick={() => setIsBookingModalOpen(true)}
                type="button"
              >
                {messages.shared.booking.bookNow}
              </button>
            </div>
          </div>

          <PublicAvailabilityCalendar
            bookingType={bookingType}
            isInteractive
            onSelectDate={setSelectedDate}
            roomId={isRoomstay ? roomId : ""}
            selectedDate={selectedDate}
          />
        </section>
      </main>

      <BookingRequestModal
        bookingType={bookingType}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        properties={properties}
        roomOptions={roomOptions}
        roomId={isRoomstay ? roomId : ""}
        selectedDate={selectedDate}
      />
    </>
  );
}
