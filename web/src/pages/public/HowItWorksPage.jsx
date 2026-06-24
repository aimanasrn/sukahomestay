import { useState } from "react";
import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import {
  CalendarPreviewSection,
  HowBookingWorksSection,
  WhatsAppCtaSection,
} from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function HowItWorksPage() {
  const { messages } = usePublicI18n();
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.howItWorks.badge}
        title={messages.pages.howItWorks.title}
        description={messages.pages.howItWorks.description}
      />
      <CalendarPreviewSection
        isInteractive={false}
        onBookNow={() => {}}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
      />
      <HowBookingWorksSection />
      <WhatsAppCtaSection />
    </main>
  );
}
