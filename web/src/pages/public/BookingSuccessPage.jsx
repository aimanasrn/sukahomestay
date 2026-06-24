import { useLocation } from "react-router-dom";
import {
  formatCurrency,
  formatDisplayDate,
  getBookingTypeLabel,
} from "@/components/sukahomestay/bookingSummary";
import { contactInfo } from "@/components/sukahomestay/publicSiteContent";
import { usePublicI18n } from "@/i18n/publicI18n";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function BookingSuccessPage() {
  const location = useLocation();
  const { language, messages, dateLocale } = usePublicI18n();
  const booking = location.state || {};
  const whatsappHref = booking.whatsappHref || contactInfo.whatsappHref;

  return (
    <main className="space-y-6 pb-16">
      <Card
        bodyClass="p-8"
        className="rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
        title={messages.pages.bookingSuccess.title}
        titleClass="text-[#16213e]"
      >
        <p className="text-lg leading-8 text-[#667085]">
          {messages.pages.bookingSuccess.description}
        </p>
        {booking.totalAmount ? (
          <div className="mt-6 rounded-[1.5rem] border border-[#ffd9bd] bg-[#fff8f3] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f97316]">
              {messages.pages.bookingSuccess.summaryTitle}
            </p>
            <div className="mt-3 grid gap-3 text-sm text-[#667085] md:grid-cols-2">
              <div className="flex items-center justify-between gap-4">
                <span>{messages.shared.bookingSuccess.bookingType}</span>
                <span className="font-semibold text-[#16213e]">
                  {getBookingTypeLabel(booking.bookingType, language)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{messages.shared.bookingSuccess.guests}</span>
                <span className="font-semibold text-[#16213e]">
                  {booking.guestCount}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{messages.shared.bookingSuccess.checkIn}</span>
                <span className="font-semibold text-[#16213e]">
                  {formatDisplayDate(booking.checkInDate, dateLocale)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span>{messages.shared.bookingSuccess.checkOut}</span>
                <span className="font-semibold text-[#16213e]">
                  {formatDisplayDate(booking.checkOutDate, dateLocale)}
                </span>
              </div>
              {booking.roomName ? (
                <div className="flex items-center justify-between gap-4">
                  <span>{messages.shared.bookingSuccess.room}</span>
                  <span className="font-semibold text-[#16213e]">
                    {booking.roomName}
                  </span>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-4">
                <span>{messages.shared.bookingSuccess.totalNights}</span>
                <span className="font-semibold text-[#16213e]">
                  {booking.nights}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-[#ffd9bd] pt-3 md:col-span-2">
                <span>{messages.shared.bookingSuccess.totalToPay}</span>
                <span className="text-lg font-semibold text-[#ff7a1a]">
                  {formatCurrency(booking.totalAmount, dateLocale)}
                </span>
              </div>
            </div>
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            className="bg-[#ff7a1a] px-6 text-white hover:bg-[#ef6d10]"
            link="/"
            text={messages.pages.bookingSuccess.backHome}
          />
          <a
            className="btn inline-flex justify-center border border-[#ffb98a] bg-white px-6 text-[#ff7a1a] hover:bg-[#fff6ef]"
            href={whatsappHref}
            rel="noreferrer"
            target="_blank"
          >
            {messages.pages.bookingSuccess.notifyAdmin}
          </a>
        </div>
      </Card>
    </main>
  );
}
