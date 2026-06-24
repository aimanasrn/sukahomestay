import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";

export default function WhyStaySection() {
  return (
    <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
      <div className="space-y-3">
        <SectionEyebrow>{landingContent.intro.eyebrow}</SectionEyebrow>
        <h2 className="max-w-lg font-serif text-4xl leading-tight text-[#2f2c26] lg:text-5xl">
          {landingContent.intro.title}
        </h2>
      </div>
      <div className="rounded-[1.75rem] border border-[#e3dacb] bg-[#f8f4ec] p-8 text-base leading-8 text-[#5f5b53]">
        {landingContent.intro.description}
      </div>
    </section>
  );
}
