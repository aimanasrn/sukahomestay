import { useState } from "react";
import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";
import BookingRequestModal from "@/components/sukahomestay/BookingRequestModal";
import PublicAvailabilityCalendar from "@/components/sukahomestay/PublicAvailabilityCalendar";

export default function ContactSection() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section
        className="overflow-hidden rounded-[2rem] border border-[#edf1f6] bg-[linear-gradient(135deg,#ffffff_0%,#fff6ef_100%)] px-8 py-10 lg:px-12 lg:py-14"
        id="contact"
      >
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4">
          <SectionEyebrow className="text-[#ff7a1a]">
            {landingContent.contact.eyebrow}
          </SectionEyebrow>
          <h2 className="max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#16213e] lg:text-5xl">
            {landingContent.contact.title}
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-[#667085]">
            {landingContent.contact.description}
          </p>
            <div className="grid gap-3 rounded-[1.5rem] border border-[#ffd9bd] bg-white/90 p-5 text-sm text-[#16213e] sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-[#fff8f3] p-4">
                Pick an open date in the calendar.
              </div>
              <div className="rounded-[1.25rem] bg-[#fff8f3] p-4">
                The booking form opens with your date already selected.
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-[#ffd9bd] bg-white/90 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">
                Selected date
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[#16213e]">
                {selectedDate.toLocaleDateString("en-MY", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-3 text-sm leading-7 text-[#667085]">
                Click any available date in the calendar to launch the booking form immediately.
              </p>
              <button
                className="mt-5 rounded-full border border-[#ffb98a] bg-white px-5 py-3 text-sm font-semibold text-[#ff7a1a] transition hover:bg-[#fff6ef]"
                onClick={() => setIsModalOpen(true)}
                type="button"
              >
                Open Booking Form
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <PublicAvailabilityCalendar
              onAvailableDateClick={(date) => {
                setSelectedDate(date);
                setIsModalOpen(true);
              }}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
            <div className="flex items-center gap-4 rounded-[1.5rem] border border-[#ffd9bd] bg-white p-4 text-sm text-[#667085]">
              <span className="inline-block h-3 w-3 rounded-full bg-[#ffd1b1]" />
              <p>Blocked dates cannot be selected. Open dates will take you straight into the request form.</p>
            </div>
          </div>
        </div>
      </section>
      <BookingRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedDate={selectedDate}
      />
    </>
  );
}
