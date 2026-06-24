import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import {
  GallerySection,
  NearbyAttractionsSection,
} from "@/components/sukahomestay/PublicSiteSections";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function GalleryPage() {
  const { messages } = usePublicI18n();
  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.gallery.badge}
        title={messages.pages.gallery.title}
        description={messages.pages.gallery.description}
      />
      <GallerySection />
      <NearbyAttractionsSection />
    </main>
  );
}
