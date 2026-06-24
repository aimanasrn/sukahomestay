import Button from "@/components/ui/Button";
import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";
import AvailabilitySearchCard from "@/components/sukahomestay/AvailabilitySearchCard";

const heroImage =
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1400&q=80";

export default function HeroSection() {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-[#eef0f4] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.07)]">
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-between px-6 py-8 lg:px-12 lg:py-12">
          <div className="space-y-6">
            <SectionEyebrow className="rounded-full bg-[#fff1e8] px-4 py-2 text-[#ff7a1a] inline-flex tracking-[0.02em] normal-case text-sm font-semibold">
              {landingContent.hero.eyebrow}
            </SectionEyebrow>
            <div className="space-y-4">
              <h1 className="max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-[#16213e] lg:text-7xl">
                Find Your Perfect <span className="text-[#ff7a1a]">Homestay</span>
              </h1>
              <p className="max-w-lg text-lg leading-8 text-[#5f6980]">
                {landingContent.hero.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-[#ff7a1a] px-7 text-white hover:bg-[#ef6d10]"
                link="/availability"
                text={landingContent.hero.primaryCta}
              />
              <Button
                className="border border-[#ffb98a] bg-white px-7 text-[#ff7a1a] hover:bg-[#fff6ef]"
                link="/roomstay"
                text={landingContent.hero.secondaryCta}
              />
            </div>
          </div>
          <AvailabilitySearchCard />
        </div>
        <div className="relative min-h-[560px]">
          <img
            alt="Modern orange-accented homestay exterior"
            className="h-full w-full object-cover"
            src={heroImage}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0)_35%,rgba(12,20,39,0.08)_100%)]" />
          <div className="absolute bottom-8 left-8 right-8 grid gap-3 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-white/92 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.12)] backdrop-blur">
              <p className="text-sm font-semibold text-[#16213e]">
                Trusted stays for family trips and short getaways
              </p>
              <p className="mt-2 text-sm leading-6 text-[#5f6980]">
                Browse roomstay, homestay, and whole-house options with direct booking support.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-[#16213e] p-5 text-white shadow-[0_16px_40px_rgba(15,23,42,0.2)]">
              <p className="text-sm font-semibold text-white">Fast availability checks</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                See calendar status early and move to booking when your dates work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
