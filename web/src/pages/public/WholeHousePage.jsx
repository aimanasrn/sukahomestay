import Button from "@/components/ui/Button";
import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import { PropertyShowcase } from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";
import usePublicProperties from "@/hooks/usePublicProperties";

export default function WholeHousePage() {
  const { properties } = usePublicProperties();
  const { messages } = usePublicI18n();
  const wholeHouse = properties.find((item) => item.type === "whole_house");

  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.wholeHouse.badge}
        title={messages.pages.wholeHouse.title}
        description={messages.pages.wholeHouse.description}
        actions={
          <Button
            className="bg-[#ff7a1a] px-6 text-white hover:bg-[#ef6d10]"
            link="/availability?bookingType=whole_house"
            text={messages.pages.wholeHouse.cta}
          />
        }
      />
      <PropertyShowcase accent="warm" property={wholeHouse} />
    </main>
  );
}
