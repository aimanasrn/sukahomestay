import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import { PropertyShowcase } from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";
import usePublicProperties from "@/hooks/usePublicProperties";

export default function StaysPage() {
  const { properties } = usePublicProperties();
  const { messages } = usePublicI18n();
  const homestay = properties.find((item) => item.type === "homestay");
  const roomstay = properties.find((item) => item.type === "roomstay");
  const wholeHouse = properties.find((item) => item.type === "whole_house");

  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.stays.badge}
        title={messages.pages.stays.title}
        description={messages.pages.stays.description}
      />
      <PropertyShowcase accent="warm" property={homestay} />
      <PropertyShowcase property={roomstay} />
      <PropertyShowcase accent="warm" property={wholeHouse} />
    </main>
  );
}
