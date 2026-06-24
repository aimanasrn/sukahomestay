import { useState } from "react";
import { motion } from "framer-motion";
import {
  AnimatedPanel,
  FadePresence,
  Reveal,
  StaggerGroup,
} from "@/components/sukahomestay/MotionReveal";
import PublicAvailabilityCalendar from "@/components/sukahomestay/PublicAvailabilityCalendar";
import {
  formatCurrency,
} from "@/components/sukahomestay/bookingSummary";
import { getPropertyTypeLabel, usePublicI18n } from "@/i18n/publicI18n";
import {
  contactInfo,
  galleryImages,
} from "@/components/sukahomestay/publicSiteContent";

function propertyDetailPath(type) {
  if (type === "homestay") return "/homestay";
  if (type === "roomstay") return "/roomstay";
  return "/whole-house";
}

function getPropertyDescription(property, messages) {
  return messages.shared.propertyDescriptions[property.type] || property.description;
}

export function TrustStatsSection() {
  const { messages } = usePublicI18n();

  return (
    <StaggerGroup as="section" className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
      {messages.shared.trustStats.map((item) => (
        <AnimatedPanel
          key={item.label}
          className="rounded-[1.75rem] border border-[#edf1f6] bg-white px-5 py-6 shadow-[0_14px_34px_rgba(255,122,26,0.06)]"
        >
          <p className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e]">{item.value}</p>
          <p className="mt-3 text-sm leading-7 text-[#667085]">{item.label}</p>
        </AnimatedPanel>
      ))}
    </StaggerGroup>
  );
}

export function StayPreviewGrid({ properties = [] }) {
  const { messages, dateLocale } = usePublicI18n();

  return (
    <StaggerGroup as="section" className="grid gap-5 lg:grid-cols-3" stagger={0.1}>
      {properties.map((property) => (
        <AnimatedPanel
          key={property.id}
          className="overflow-hidden rounded-[2rem] border border-[#edf1f6] bg-white shadow-[0_18px_46px_rgba(255,122,26,0.07)]"
        >
          <div
            className="h-60 bg-cover bg-center"
            style={{ backgroundImage: `url(${property.imageUrl})` }}
          />
          <div className="space-y-4 p-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">
                {getPropertyTypeLabel(property.type, messages)}
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#16213e]">
                {property.name}
              </h2>
            </div>
            <p className="text-sm leading-7 text-[#667085]">{getPropertyDescription(property, messages)}</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-[#344054]">
              <div className="rounded-[1.25rem] bg-[#fff8f3] px-4 py-3">
                {property.maxGuests} {messages.shared.labels.guests.toLowerCase()}
              </div>
              <div className="rounded-[1.25rem] bg-[#fff8f3] px-4 py-3">
                {messages.shared.labels.from} {formatCurrency(property.pricePerNight, dateLocale)}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                className="inline-flex rounded-full bg-[#ff7a1a] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#ef6d10]"
                href="/availability"
              >
                {messages.shared.stayPreview.ctaAvailability}
              </a>
              <a
                className="inline-flex rounded-full border border-[#ffb98a] bg-white px-4 py-3 text-sm font-semibold text-[#ff7a1a] transition hover:bg-[#fff6ef]"
                href={propertyDetailPath(property.type)}
              >
                {messages.shared.stayPreview.ctaDetails}
              </a>
            </div>
          </div>
        </AnimatedPanel>
      ))}
    </StaggerGroup>
  );
}

export function PropertyShowcase({ property, accent = "light" }) {
  const { messages, dateLocale } = usePublicI18n();

  if (!property) {
    return null;
  }

  const isWarm = accent === "warm";

  return (
    <Reveal
      as="section"
      className={`grid gap-6 overflow-hidden rounded-[2rem] border p-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:p-8 ${
        isWarm
          ? "border-[#ffd6b8] bg-[linear-gradient(135deg,#fff6ef_0%,#ffffff_100%)]"
          : "border-[#edf1f6] bg-white"
      }`}
    >
      <StaggerGroup className="space-y-5" stagger={0.08}>
        <div className="space-y-3">
          <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
            {getPropertyTypeLabel(property.type, messages)}
          </Reveal>
          <Reveal as="h2" className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
            {property.name}
          </Reveal>
          <Reveal as="p" className="max-w-2xl text-base leading-8 text-[#667085]" distance={18}>
            {getPropertyDescription(property, messages)}
          </Reveal>
        </div>

        <StaggerGroup className="grid gap-3 sm:grid-cols-4" stagger={0.06}>
          <AnimatedPanel className="rounded-[1.35rem] bg-[#fff8f3] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">{messages.shared.labels.bedrooms}</p>
            <p className="mt-2 text-xl font-semibold text-[#16213e]">{property.bedrooms}</p>
          </AnimatedPanel>
          <AnimatedPanel className="rounded-[1.35rem] bg-[#fff8f3] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">{messages.shared.labels.bathrooms}</p>
            <p className="mt-2 text-xl font-semibold text-[#16213e]">{property.bathrooms}</p>
          </AnimatedPanel>
          <AnimatedPanel className="rounded-[1.35rem] bg-[#fff8f3] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">{messages.shared.labels.guests}</p>
            <p className="mt-2 text-xl font-semibold text-[#16213e]">{property.maxGuests}</p>
          </AnimatedPanel>
          <AnimatedPanel className="rounded-[1.35rem] bg-[#fff8f3] px-4 py-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#98a2b3]">{messages.shared.labels.from}</p>
            <p className="mt-2 text-xl font-semibold text-[#16213e]">
              {formatCurrency(property.pricePerNight, dateLocale)}
            </p>
          </AnimatedPanel>
        </StaggerGroup>

        {property.rooms?.length ? (
          <StaggerGroup className="grid gap-3 md:grid-cols-3" stagger={0.06}>
            {property.rooms.map((room) => (
              <AnimatedPanel
                key={room.id}
                className="rounded-[1.5rem] border border-[#ffe1ca] bg-[#fffdfb] px-4 py-4"
              >
                <p className="text-base font-semibold text-[#16213e]">{room.name}</p>
                <p className="mt-2 text-sm leading-7 text-[#667085]">
                  {messages.shared.propertyShowcase.roomMeta
                    .replace("{guests}", room.maxGuests)
                    .replace("{bedrooms}", room.bedrooms)
                    .replace("{bathrooms}", room.bathrooms)}
                </p>
                <p className="mt-3 text-sm font-semibold text-[#f97316]">
                  {formatCurrency(room.pricePerNight, dateLocale)} / {messages.shared.labels.perNight.toLowerCase()}
                </p>
              </AnimatedPanel>
            ))}
          </StaggerGroup>
        ) : null}

        <Reveal className="flex flex-wrap gap-3" distance={18}>
          <a
            className="inline-flex rounded-full bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,122,26,0.18)] transition hover:bg-[#ef6d10] active:scale-[0.98]"
            href="/availability"
          >
            {messages.shared.propertyShowcase.ctaAvailability}
          </a>
          <a
            className="inline-flex rounded-full border border-[#ffb98a] bg-white px-5 py-3 text-sm font-semibold text-[#ff7a1a] shadow-[0_10px_24px_rgba(255,122,26,0.08)] transition hover:bg-[#fff6ef] active:scale-[0.98]"
            href={propertyDetailPath(property.type)}
          >
            {messages.shared.propertyShowcase.ctaDetails}
          </a>
        </Reveal>
      </StaggerGroup>

      <Reveal
        className="min-h-[320px] rounded-[2rem] bg-cover bg-center"
        distance={24}
      >
        <div
        className="min-h-[320px] rounded-[2rem] bg-cover bg-center"
        style={{ backgroundImage: `url(${property.imageUrl})` }}
        />
      </Reveal>
    </Reveal>
  );
}

export function FacilitiesGridSection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="grid gap-8 rounded-[2rem] border border-[#edf1f6] bg-white p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:p-8">
      <StaggerGroup className="space-y-4" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.facilitiesSection.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.facilitiesSection.title}
        </Reveal>
        <Reveal as="p" className="max-w-xl text-base leading-8 text-[#667085]" distance={18}>
          {messages.shared.facilitiesSection.description}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3" stagger={0.06}>
        {messages.shared.facilities.map((item) => (
          <AnimatedPanel
            key={item}
            className="rounded-[1.5rem] bg-[#fff8f3] px-4 py-5 text-sm font-medium text-[#16213e]"
          >
            {item}
          </AnimatedPanel>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function WhyChooseUsSection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="space-y-4">
      <StaggerGroup className="space-y-3" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.whyChooseSection.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.whyChooseSection.title}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="grid gap-4 md:grid-cols-3" stagger={0.08}>
        {messages.shared.whyChooseUs.map((item) => (
          <AnimatedPanel
            key={item.title}
            className="rounded-[1.75rem] border border-[#edf1f6] bg-white px-5 py-6 shadow-[0_14px_34px_rgba(255,122,26,0.06)]"
          >
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[#16213e]">
              {item.title}
            </h2>
            <p className="mt-3 text-base leading-8 text-[#667085]">{item.description}</p>
          </AnimatedPanel>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function CalendarPreviewSection({
  selectedDate,
  setSelectedDate,
  onBookNow,
  isInteractive = true,
}) {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="grid gap-8 rounded-[2rem] bg-[linear-gradient(135deg,#ffffff_0%,#fff6ef_100%)] p-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:p-8">
      <StaggerGroup className="space-y-4" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.calendarPreview.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.calendarPreview.title}
        </Reveal>
        <Reveal as="p" className="max-w-xl text-base leading-8 text-[#667085]" distance={18}>
          {isInteractive
            ? messages.shared.calendarPreview.interactiveDescription
            : messages.shared.calendarPreview.previewDescription}
        </Reveal>
        <Reveal className="flex flex-wrap gap-3" distance={18}>
          <button
            className={`inline-flex rounded-full px-5 py-3 text-sm font-semibold shadow-[0_14px_34px_rgba(255,122,26,0.14)] transition active:scale-[0.98] ${
              isInteractive
                ? "bg-[#ff7a1a] text-white hover:bg-[#ef6d10]"
                : "border border-[#ffb98a] bg-white text-[#ff7a1a] hover:bg-[#fff6ef]"
            }`}
            onClick={onBookNow}
            type="button"
          >
            {messages.shared.calendarPreview.bookNow}
          </button>
        </Reveal>
      </StaggerGroup>
      <Reveal distance={24}>
        <PublicAvailabilityCalendar
        isInteractive={isInteractive}
        onAvailableDateClick={
          isInteractive
            ? (date) => {
                setSelectedDate(date);
                onBookNow();
              }
            : undefined
        }
        onSelectDate={setSelectedDate}
        selectedDate={selectedDate}
      />
      </Reveal>
    </Reveal>
  );
}

export function GallerySection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="space-y-4">
      <StaggerGroup className="space-y-3" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.gallerySection.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.gallerySection.title}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
        {galleryImages.map((image, index) => (
          <AnimatedPanel
            key={image}
            className={`${index === 0 ? "md:col-span-2 md:row-span-2 min-h-[420px]" : "min-h-[200px]"} rounded-[1.75rem] bg-cover bg-center`}
            style={{ backgroundImage: `url(${image})` }}
          />
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function NearbyAttractionsSection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="space-y-4">
      <StaggerGroup className="space-y-3" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.nearbySection.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.nearbySection.title}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="grid gap-4 lg:grid-cols-3" stagger={0.08}>
        {messages.shared.nearbyAttractions.map((item) => (
          <AnimatedPanel
            key={item.title}
            className="rounded-[1.75rem] bg-[linear-gradient(135deg,#16213e_0%,#233250_100%)] px-5 py-6 text-white shadow-[0_20px_48px_rgba(22,33,62,0.18)]"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#ffd2af]">
              {item.distance}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#e4e7ec]">{item.description}</p>
          </AnimatedPanel>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function HowBookingWorksSection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="grid gap-6 rounded-[2rem] border border-[#edf1f6] bg-white p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:p-8">
      <StaggerGroup className="space-y-4" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.howBookingWorks.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.howBookingWorks.title}
        </Reveal>
        <Reveal as="p" className="max-w-xl text-base leading-8 text-[#667085]" distance={18}>
          {messages.shared.howBookingWorks.description}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="space-y-3" stagger={0.08}>
        {messages.shared.bookingSteps.map((step, index) => (
          <AnimatedPanel
            key={step}
            className="flex items-start gap-4 rounded-[1.5rem] bg-[#fff8f3] px-5 py-5"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ff7a1a] text-sm font-semibold text-white">
              {index + 1}
            </span>
            <p className="pt-1 text-base leading-7 text-[#16213e]">{step}</p>
          </AnimatedPanel>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function TestimonialsSection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="space-y-4">
      <StaggerGroup className="space-y-3" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.testimonialsSection.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.testimonialsSection.title}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="grid gap-4 lg:grid-cols-3" stagger={0.08}>
        {messages.shared.testimonials.map((item) => (
          <AnimatedPanel
            key={item.name}
            className="rounded-[1.75rem] border border-[#edf1f6] bg-white px-5 py-6 shadow-[0_14px_34px_rgba(255,122,26,0.06)]"
          >
            <p className="text-base leading-8 text-[#16213e]">"{item.quote}"</p>
            <p className="mt-5 text-lg font-semibold text-[#16213e]">{item.name}</p>
            <p className="text-sm text-[#667085]">{item.trip}</p>
          </AnimatedPanel>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function FAQSection() {
  const { messages } = usePublicI18n();
  const [faqOpenIndex, setFaqOpenIndex] = useState(0);

  return (
    <Reveal as="section" className="space-y-4">
      <StaggerGroup className="space-y-3" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>{messages.shared.faqSection.eyebrow}</Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.faqSection.title}
        </Reveal>
      </StaggerGroup>
      <StaggerGroup className="space-y-3" stagger={0.06}>
        {messages.shared.faqs.map((item, index) => (
          <AnimatedPanel
            key={item.question}
            className="rounded-[1.5rem] border border-[#edf1f6] bg-white px-5 py-5 shadow-[0_12px_30px_rgba(255,122,26,0.06)]"
            hoverLift={false}
          >
            <button
              className="flex w-full items-center justify-between gap-4 text-left"
              onClick={() => setFaqOpenIndex(faqOpenIndex === index ? -1 : index)}
              type="button"
            >
              <span className="text-lg font-semibold text-[#16213e]">{item.question}</span>
              <span className="text-2xl leading-none text-[#f97316]">
                {faqOpenIndex === index ? "-" : "+"}
              </span>
            </button>
            <FadePresence mode="sync">
              {faqOpenIndex === index ? (
                <motion.p
                  animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                  className="max-w-3xl overflow-hidden text-base leading-8 text-[#667085]"
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                >
                  {item.answer}
                </motion.p>
              ) : null}
            </FadePresence>
          </AnimatedPanel>
        ))}
      </StaggerGroup>
    </Reveal>
  );
}

export function WhatsAppCtaSection() {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="rounded-[2rem] bg-[linear-gradient(135deg,#ff7a1a_0%,#ff9346_100%)] px-6 py-8 text-white shadow-[0_24px_60px_rgba(255,122,26,0.24)] lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <StaggerGroup className="space-y-3" stagger={0.08}>
          <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#fff1e5]" distance={16}>
            {messages.shared.whatsappCta.eyebrow}
          </Reveal>
          <Reveal as="h2" className="max-w-2xl text-3xl font-semibold tracking-[-0.05em] lg:text-4xl" distance={18}>
            {messages.shared.whatsappCta.title}
          </Reveal>
          <Reveal as="p" className="max-w-xl text-base leading-8 text-[#fff4ec]" distance={18}>
            {messages.shared.whatsappCta.description}
          </Reveal>
        </StaggerGroup>
        <Reveal distance={18}>
          <a
          className="inline-flex rounded-full border border-white/30 bg-white px-6 py-3 text-sm font-semibold text-[#ff7a1a] shadow-[0_16px_34px_rgba(255,255,255,0.2)] transition hover:bg-[#fff3ea] active:scale-[0.98]"
          href={contactInfo.whatsappHref}
          rel="noreferrer"
          target="_blank"
        >
          {messages.shared.whatsappCta.cta}
        </a>
        </Reveal>
      </div>
    </Reveal>
  );
}

export function ContactMapSection({ onBookNow }) {
  const { messages } = usePublicI18n();

  return (
    <Reveal as="section" className="grid gap-6 rounded-[2rem] border border-[#edf1f6] bg-white p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:p-8">
      <StaggerGroup className="space-y-4" stagger={0.08}>
        <Reveal className="text-sm font-semibold uppercase tracking-[0.22em] text-[#f97316]" distance={16}>
          {messages.shared.contactSection.eyebrow}
        </Reveal>
        <Reveal as="h2" className="text-3xl font-semibold tracking-[-0.05em] text-[#16213e] lg:text-4xl" distance={18}>
          {messages.shared.contactSection.title}
        </Reveal>
        <Reveal as="p" className="max-w-xl text-base leading-8 text-[#667085]" distance={18}>
          {messages.shared.contactSection.description}
        </Reveal>
        <AnimatedPanel className="space-y-3 rounded-[1.75rem] bg-[#fff8f3] p-5" hoverLift={false}>
          <p className="text-base font-semibold text-[#16213e]">{messages.shared.contactSection.adminTitle}</p>
          <p className="text-sm leading-7 text-[#667085]">
            {messages.shared.contactSection.whatsappLabel}: {contactInfo.whatsapp}
            <br />
            {messages.shared.contactSection.emailLabel}: {contactInfo.email}
          </p>
        </AnimatedPanel>
        <Reveal className="flex flex-wrap gap-3" distance={18}>
          <a
            className="inline-flex rounded-full bg-[#ff7a1a] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(255,122,26,0.18)] transition hover:bg-[#ef6d10] active:scale-[0.98]"
            href="/booking"
          >
            {messages.shared.contactSection.bookNow}
          </a>
          <a
            className="inline-flex rounded-full border border-[#ffb98a] bg-white px-5 py-3 text-sm font-semibold text-[#ff7a1a] shadow-[0_10px_24px_rgba(255,122,26,0.08)] transition hover:bg-[#fff6ef] active:scale-[0.98]"
            href={contactInfo.whatsappHref}
            rel="noreferrer"
            target="_blank"
          >
            {messages.shared.contactSection.whatsappAdmin}
          </a>
        </Reveal>
      </StaggerGroup>

      <Reveal className="overflow-hidden rounded-[2rem] border border-[#ffd6b8]" distance={24}>
        <iframe
          className="h-[420px] w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src="https://www.openstreetmap.org/export/embed.html?bbox=101.6500%2C3.1000%2C101.7600%2C3.2100&layer=mapnik"
          title={messages.shared.contactSection.mapTitle}
        />
      </Reveal>
    </Reveal>
  );
}
