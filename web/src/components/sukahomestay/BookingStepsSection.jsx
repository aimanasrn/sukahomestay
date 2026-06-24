import Card from "@/components/ui/Card";
import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";

const steps = [
  "Explore the stay style that fits your trip.",
  "Browse availability before making a decision.",
  "Submit your booking request with the essential details.",
  "Confirm timing and payment coordination over WhatsApp.",
];

export default function BookingStepsSection() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <SectionEyebrow>{landingContent.bookingSteps.eyebrow}</SectionEyebrow>
        <h2 className="font-serif text-4xl leading-tight text-[#2f2c26] lg:text-5xl">
          {landingContent.bookingSteps.title}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => (
          <Card
            key={step}
            bodyClass="p-7"
            className="rounded-[1.5rem] border border-[#e3dacb] bg-white shadow-none"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7c6b45]">
              Step {index + 1}
            </p>
            <p className="mt-4 leading-7 text-[#4a463d]">{step}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
