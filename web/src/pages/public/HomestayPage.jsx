import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatCurrency } from "@/components/sukahomestay/bookingSummary";
import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import { usePublicI18n } from "@/i18n/publicI18n";
import { publicApi } from "@/services/publicApi";

export default function HomestayPage() {
  const { messages, dateLocale } = usePublicI18n();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    publicApi
      .getHomestay()
      .then((data) => {
        if (!ignore) setProperty(data.property);
      })
      .catch((requestError) => {
        if (!ignore) setError(requestError.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.homestay.badge}
        description={messages.pages.homestay.description}
        title={messages.pages.homestay.title}
        actions={
          <Button
            className="bg-[#ff7a1a] px-6 text-white hover:bg-[#ef6d10]"
            link="/availability?bookingType=homestay"
            text={messages.pages.homestay.cta}
          />
        }
      />
      {error ? (
        <Card
          className="rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          title={messages.pages.homestay.errorTitle}
          titleClass="text-[#16213e]"
        >
          <p className="text-sm text-[#ff7a1a]">{error}</p>
        </Card>
      ) : (
        <Card
          bodyClass="p-8"
          className="rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          title={property?.name || "Sukahomestay"}
          titleClass="text-[#16213e]"
        >
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-[#98a2b3]">
                {messages.shared.labels.bedrooms}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#16213e]">
                {property?.bedrooms ?? 4}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#98a2b3]">
                {messages.shared.labels.bathrooms}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#16213e]">
                {property?.bathrooms ?? 3}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#98a2b3]">
                {messages.shared.labels.maxGuests}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#16213e]">
                {property?.maxGuests ?? 10}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[#98a2b3]">
                {messages.shared.booking.ratePerNight}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#ff7a1a]">
                {formatCurrency(property?.pricePerNight ?? "280.00", dateLocale)}
              </p>
            </div>
          </div>
          <p className="mt-6 text-lg leading-8 text-[#667085]">
            {messages.shared.propertyDescriptions.homestay ||
              property?.description ||
              messages.pages.homestay.fallbackDescription}
          </p>
        </Card>
      )}
    </main>
  );
}
