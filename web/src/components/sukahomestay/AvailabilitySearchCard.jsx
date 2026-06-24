import Button from "@/components/ui/Button";

export default function AvailabilitySearchCard() {
  return (
    <div className="mt-8 rounded-[1.5rem] border border-[#edf1f7] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_1fr_1fr_auto] lg:items-center">
        <label className="rounded-[1.1rem] border border-[#eef1f6] px-4 py-3 text-sm font-medium text-[#667085]">
          Destination
          <input
            className="mt-1 block w-full border-0 bg-transparent p-0 text-base font-semibold text-[#16213e] placeholder:text-[#98a2b3] focus:outline-none"
            placeholder="Where are you going?"
            type="text"
          />
        </label>
        <label className="rounded-[1.1rem] border border-[#eef1f6] px-4 py-3 text-sm font-medium text-[#667085]">
          Check In
          <input
            className="mt-1 block w-full border-0 bg-transparent p-0 text-base font-semibold text-[#16213e] focus:outline-none"
            type="date"
          />
        </label>
        <label className="rounded-[1.1rem] border border-[#eef1f6] px-4 py-3 text-sm font-medium text-[#667085]">
          Check Out
          <input
            className="mt-1 block w-full border-0 bg-transparent p-0 text-base font-semibold text-[#16213e] focus:outline-none"
            type="date"
          />
        </label>
        <label className="rounded-[1.1rem] border border-[#eef1f6] px-4 py-3 text-sm font-medium text-[#667085]">
          Guests
          <select className="mt-1 block w-full border-0 bg-transparent p-0 text-base font-semibold text-[#16213e] focus:outline-none">
            <option>2 Guests</option>
            <option>4 Guests</option>
            <option>6 Guests</option>
          </select>
        </label>
        <Button
          className="h-full min-h-[68px] bg-[#ff7a1a] px-8 text-white hover:bg-[#ef6d10]"
          link="/availability"
          text="Search"
        />
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-medium text-[#16213e]">
        <span className="rounded-full bg-[#fff6ef] px-4 py-2 text-[#ff7a1a]">Best Price Guarantee</span>
        <span className="rounded-full bg-[#f5f7fb] px-4 py-2">Verified Properties</span>
        <span className="rounded-full bg-[#f5f7fb] px-4 py-2">24/7 Support</span>
        <span className="rounded-full bg-[#f5f7fb] px-4 py-2">Easy Booking</span>
      </div>
    </div>
  );
}
