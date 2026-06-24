import landingContent from "@/constant/sukahomestayLandingContent";

const facilities = [
  {
    title: "Verified Homestays",
    description: "Every listed stay is reviewed for clearer details and guest confidence.",
  },
  {
    title: "Best Price Guarantee",
    description: "Book direct with straightforward pricing and fewer booking surprises.",
  },
  {
    title: "Easy and Secure Booking",
    description: "Move from date checking to booking request in a simpler guest flow.",
  },
  {
    title: "24/7 Customer Support",
    description: "Reach out anytime for help with rooms, dates, or booking concerns.",
  },
];

export default function FacilitiesSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#16213e] lg:text-5xl">
          {landingContent.amenities.title}
        </h2>
        <p className="max-w-3xl text-lg leading-8 text-[#667085]">
          Travel planning should feel clear from the beginning, so the homepage highlights trust, support, and quick action.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {facilities.map((facility) => (
          <div
            key={facility.title}
            className="rounded-[1.5rem] border border-[#edf1f6] bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.05)]"
          >
            <h3 className="text-xl font-semibold text-[#16213e]">{facility.title}</h3>
            <p className="mt-3 leading-7 text-[#667085]">{facility.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
