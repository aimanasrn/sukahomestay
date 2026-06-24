import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import {
  ContactMapSection,
  WhatsAppCtaSection,
} from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function ContactPage() {
  const { messages } = usePublicI18n();
  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.contact.badge}
        title={messages.pages.contact.title}
        description={messages.pages.contact.description}
      />
      <ContactMapSection onBookNow={null} />
      <WhatsAppCtaSection />
    </main>
  );
}
