import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import {
  FacilitiesGridSection,
  WhyChooseUsSection,
} from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function FacilitiesPage() {
  const { messages } = usePublicI18n();
  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.facilities.badge}
        title={messages.pages.facilities.title}
        description={messages.pages.facilities.description}
      />
      <FacilitiesGridSection />
      <WhyChooseUsSection />
    </main>
  );
}
