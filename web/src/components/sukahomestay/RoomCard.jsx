import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { formatCurrency } from "@/components/sukahomestay/bookingSummary";
import { usePublicI18n } from "@/i18n/publicI18n";

export default function RoomCard({ room }) {
  const { messages, dateLocale } = usePublicI18n();
  return (
    <Card
      bodyClass="p-6"
      className="rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
    >
      <p className="text-sm font-semibold text-[#ff7a1a]">
        {messages.shared.roomCard.badge}
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-[#16213e]">{room.name}</h2>
      <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-[#667085]">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#98a2b3]">{messages.shared.labels.bedrooms}</p>
          <p className="mt-1 font-semibold text-[#16213e]">{room.bedrooms}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#98a2b3]">{messages.shared.labels.bathrooms}</p>
          <p className="mt-1 font-semibold text-[#16213e]">{room.bathrooms}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#98a2b3]">{messages.shared.labels.guests}</p>
          <p className="mt-1 font-semibold text-[#16213e]">{room.maxGuests}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#98a2b3]">{messages.shared.labels.perNight}</p>
          <p className="mt-1 font-semibold text-[#16213e]">{formatCurrency(room.pricePerNight, dateLocale)}</p>
        </div>
      </div>
      <Button
        className="mt-6 w-full bg-[#ff7a1a] text-white hover:bg-[#ef6d10]"
        link={`/availability?bookingType=roomstay&roomId=${room.id}`}
        text={messages.shared.roomCard.cta}
      />
    </Card>
  );
}
