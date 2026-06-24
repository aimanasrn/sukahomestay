import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import {
  FAQSection,
  TestimonialsSection,
} from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function ReviewsPage() {
  const { messages } = usePublicI18n();
  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.reviews.badge}
        title={messages.pages.reviews.title}
        description={messages.pages.reviews.description}
      />
      <TestimonialsSection />
      <FAQSection />
    </main>
  );
}
