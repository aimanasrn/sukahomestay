import { useEffect } from "react";
import { motion } from "framer-motion";
import BookingForm from "@/components/sukahomestay/BookingForm";
import {
  formatCurrency,
  formatDisplayDate,
  getBookingPricing,
} from "@/components/sukahomestay/bookingSummary";
import { getPropertyTypeLabel, usePublicI18n } from "@/i18n/publicI18n";

function toDateKey(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextDate(date) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  return nextDate;
}

export default function BookingRequestModal({
  isOpen,
  selectedDate,
  bookingType = "homestay",
  roomId = "",
  properties = [],
  roomOptions = [],
  onClose,
}) {
  const { language, messages, dateLocale } = usePublicI18n();
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !selectedDate) {
    return null;
  }

  const checkInDate = toDateKey(selectedDate);
  const checkOutDate = toDateKey(getNextDate(selectedDate));
  const pricing = getBookingPricing({
    bookingType,
    roomId,
    checkInDate,
    checkOutDate,
    properties,
    roomOptions,
  });

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[#182230]/55 px-4 py-8"
      initial={{ opacity: 0 }}
    >
      <button
        aria-label="Close booking modal"
        className="absolute inset-0"
        onClick={onClose}
        type="button"
      />
      <motion.div
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/60 bg-[#fffdfb] p-4 shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:p-6"
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mb-5 flex items-start justify-between gap-4 px-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#f97316]">
              {messages.shared.modal.eyebrow}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#16213e]">
              {messages.shared.modal.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[#667085]">
              {messages.shared.modal.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#fff1e8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#ff7a1a]">
                {getPropertyTypeLabel(bookingType, messages)}
              </span>
              <span className="rounded-full bg-[#fff8f3] px-4 py-2 text-xs font-semibold text-[#16213e]">
                {messages.shared.labels.selectedDate}: {formatDisplayDate(checkInDate, dateLocale)}
              </span>
              <span className="rounded-full bg-[#fff8f3] px-4 py-2 text-xs font-semibold text-[#16213e]">
                {messages.shared.labels.total}: {formatCurrency(pricing.totalAmount, dateLocale)}
              </span>
              {bookingType === "roomstay" && roomId ? (
                <span className="rounded-full bg-[#fff8f3] px-4 py-2 text-xs font-semibold text-[#16213e]">
                  {messages.shared.labels.roomId}: {roomId}
                </span>
              ) : null}
            </div>
          </div>
          <button
            className="rounded-full border border-[#ffd9bd] bg-white px-4 py-2 text-sm font-semibold text-[#ff7a1a]"
            onClick={onClose}
            type="button"
          >
            {messages.shared.modal.close}
          </button>
        </div>

        <BookingForm
          initialValues={{
            bookingType,
            checkInDate,
            checkOutDate,
            roomId,
          }}
          properties={properties}
          roomOptions={roomOptions}
          key={`${checkInDate}-${bookingType}-${roomId}`}
        />
      </motion.div>
    </motion.div>
  );
}
