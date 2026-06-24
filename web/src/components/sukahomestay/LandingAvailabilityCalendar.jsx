import { useState } from "react";
import Button from "@/components/ui/Button";
import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";
import PublicAvailabilityCalendar from "@/components/sukahomestay/PublicAvailabilityCalendar";

export default function LandingAvailabilityCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <section
      className="grid gap-8 rounded-[2rem] bg-[#fff8f3] p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:p-8"
      id="how-it-works"
    >
      <div className="space-y-4">
        <SectionEyebrow>{landingContent.availability.eyebrow}</SectionEyebrow>
        <h2 className="max-w-xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#16213e] lg:text-5xl">
          {landingContent.availability.title}
        </h2>
        <p className="max-w-xl text-lg leading-8 text-[#667085]">
          {landingContent.availability.description}
        </p>
        <div className="grid gap-3 rounded-[1.5rem] border border-[#ffd9bd] bg-white p-5 text-sm text-[#16213e] sm:grid-cols-3">
          {[
            "Choose your stay type and review open dates first.",
            "Avoid blocked dates before moving into the booking request.",
            "Use the contact section calendar to open the booking form instantly.",
          ].map((item) => (
            <div key={item} className="rounded-[1.25rem] bg-[#fff8f3] p-4 leading-7">
              {item}
            </div>
          ))}
        </div>
        <div className="space-y-3 rounded-[1.5rem] border border-[#ffd9bd] bg-white p-5 text-sm text-[#16213e]">
          <div className="flex items-center gap-3">
            <span className="inline-block h-3 w-3 rounded-full bg-[#ff7a1a]" />
            <span>Available dates</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block h-3 w-3 rounded-full bg-[#ffd1b1]" />
            <span>Blocked dates</span>
          </div>
          <p className="text-[#667085]">
            Selected date:{" "}
            <span className="font-semibold text-[#16213e]">
              {selectedDate.toLocaleDateString("en-MY", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        </div>
        <Button
          className="bg-[#ff7a1a] px-6 text-white hover:bg-[#ef6d10]"
          link="/#contact"
          text="Continue To Contact Calendar"
        />
      </div>
      <PublicAvailabilityCalendar
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />
    </section>
  );
}
