import Card from "@/components/ui/Card";

export default function AvailabilityResults({ result }) {
  if (!result) return null;

  return (
    <Card
      bodyClass="p-6"
      className="rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.05)]"
      title={result.available ? "Dates available" : "Dates unavailable"}
      titleClass="text-[#16213e]"
    >
      <p className={result.available ? "text-[#1d7a43]" : "text-[#ff7a1a]"}>
        {result.available
          ? "The selected stay looks available."
          : `This stay is currently unavailable${result.reason ? ` (${result.reason})` : ""}.`}
      </p>
      {!result.available && result.conflictingBookings?.length ? (
        <div className="mt-4 space-y-3 text-sm text-[#667085]">
          {result.conflictingBookings.map((booking, index) => (
            <div
              key={`${booking.bookingType}-${booking.roomId || "none"}-${index}`}
              className="rounded-[1.25rem] border border-[#eef1f6] bg-[#f9fbff] p-4"
            >
              <p className="font-medium capitalize text-[#16213e]">{booking.bookingType}</p>
              <p className="mt-1">
                {booking.checkInDate} to {booking.checkOutDate}
              </p>
              <p className="mt-1 uppercase tracking-wide text-[#98a2b3]">
                {booking.status}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
