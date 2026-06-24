import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import PublicPageHero from "@/components/sukahomestay/PublicPageHero";
import RoomCard from "@/components/sukahomestay/RoomCard";
import { usePublicI18n } from "@/i18n/publicI18n";
import { publicApi } from "@/services/publicApi";

export default function RoomstayPage() {
  const { messages } = usePublicI18n();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    publicApi
      .getRoomstay()
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

  const rooms = property?.rooms || [];

  return (
    <main className="space-y-8 pb-16">
      <PublicPageHero
        badge={messages.pages.roomstay.badge}
        description={messages.pages.roomstay.description}
        title={messages.pages.roomstay.title}
        actions={
          <Button
            className="bg-[#ff7a1a] px-6 text-white hover:bg-[#ef6d10]"
            link="/availability?bookingType=roomstay"
            text={messages.pages.roomstay.cta}
          />
        }
      />
      {error ? (
        <Card
          className="rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          title={messages.pages.roomstay.errorTitle}
          titleClass="text-[#16213e]"
        >
          <p className="text-sm text-[#ff7a1a]">{error}</p>
        </Card>
      ) : (
        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </section>
      )}
    </main>
  );
}
