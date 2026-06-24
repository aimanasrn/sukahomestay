import { useState } from "react";
import BookingRequestModal from "@/components/sukahomestay/BookingRequestModal";
import {
  AnimatedPanel,
  Reveal,
  StaggerGroup,
} from "@/components/sukahomestay/MotionReveal";
import {
  StayPreviewGrid,
  TrustStatsSection,
  WhatsAppCtaSection,
} from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";
import usePublicProperties from "@/hooks/usePublicProperties";

export default function HomePage() {
  const { properties } = usePublicProperties();
  const { messages } = usePublicI18n();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const roomOptions =
    properties.find((property) => property.type === "roomstay")?.rooms || [];

  return (
    <>
      <main className="space-y-10 pb-20 lg:space-y-14">
        <Reveal
          as="section"
          className="relative grid gap-6 overflow-hidden rounded-[2rem] border border-[#f7dfcc] bg-[linear-gradient(135deg,#fff8f1_0%,#ffffff_45%,#fff1e5_100%)] p-6 shadow-[0_24px_70px_rgba(255,122,26,0.08)] lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:p-8"
        >
          <div className="pointer-events-none absolute -left-16 top-12 h-40 w-40 rounded-full bg-[#ffd7ba]/40 blur-3xl" />
          <div className="pointer-events-none absolute bottom-8 right-12 h-48 w-48 rounded-full bg-[#fff0e0] blur-3xl" />
          <StaggerGroup className="relative space-y-6" stagger={0.08}>
            <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
              {messages.home.eyebrow}
            </Reveal>
            <Reveal as="h1" className="max-w-2xl text-4xl font-semibold tracking-[-0.06em] text-[#16213e] lg:text-6xl" distance={20}>
              {messages.home.title}
            </Reveal>
            <Reveal as="p" className="max-w-xl text-lg leading-8 text-[#667085]" distance={20} delay={0.04}>
              {messages.home.description}
            </Reveal>
            <Reveal className="flex flex-wrap gap-3" distance={18} delay={0.08}>
              <a
                className="inline-flex rounded-full bg-[#ff7a1a] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,122,26,0.22)] transition hover:bg-[#ef6d10] active:scale-[0.98]"
                href="/availability"
              >
                {messages.home.ctas.checkAvailability}
              </a>
              <button
                className="inline-flex rounded-full border border-[#ffb98a] bg-white px-6 py-3 text-sm font-semibold text-[#ff7a1a] shadow-[0_10px_24px_rgba(255,122,26,0.08)] transition hover:bg-[#fff6ef] active:scale-[0.98]"
                onClick={() => setIsBookingModalOpen(true)}
                type="button"
              >
                {messages.home.ctas.bookNow}
              </button>
              <a
                className="inline-flex rounded-full border border-[#16213e] bg-[#16213e] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(22,33,62,0.2)] transition hover:bg-[#0f172a] active:scale-[0.98]"
                href="https://wa.me/60123456789"
                rel="noreferrer"
                target="_blank"
              >
                {messages.home.ctas.whatsappAdmin}
              </a>
            </Reveal>
          </StaggerGroup>

          <AnimatedPanel className="relative min-h-[520px] overflow-hidden rounded-[2rem] bg-[#f6f7fb]" hoverLift={false}>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${properties[0]?.imageUrl || "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80"})`,
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(22,33,62,0.04)_0%,rgba(22,33,62,0.55)_100%)]" />
            <Reveal className="absolute bottom-6 left-6 right-6 rounded-[1.75rem] border border-white/25 bg-white/15 p-5 text-white backdrop-blur" delay={0.18} distance={24}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#ffe6d2]">
                {messages.home.imageBadge}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
                {messages.home.imageTitle}
              </h2>
            </Reveal>
          </AnimatedPanel>
        </Reveal>

        <TrustStatsSection />

        <Reveal as="section" className="space-y-4">
          <StaggerGroup className="space-y-3" stagger={0.06}>
            <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
              {messages.home.stayPreviewEyebrow}
            </Reveal>
            <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
              {messages.home.stayPreviewTitle}
            </Reveal>
          </StaggerGroup>
          <StayPreviewGrid properties={properties} />
        </Reveal>

        <WhatsAppCtaSection />
      </main>

      <BookingRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        properties={properties}
        roomOptions={roomOptions}
        selectedDate={selectedDate}
      />
    </>
  );
}
