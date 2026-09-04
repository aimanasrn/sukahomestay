import { CalendarDays, Search, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
export function SearchBox({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState("2026-09-18");
  const [checkOut, setCheckOut] = useState("2026-09-21");
  const [guests, setGuests] = useState(4);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/search?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`,
    );
  };
  return (
    <form
      aria-label="Search availability"
      onSubmit={submit}
      className={
        compact
          ? "grid gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-[1fr_1fr_.7fr_auto]"
          : "grid gap-1 rounded-2xl border bg-card p-2 shadow-[0_18px_50px_rgba(39,51,42,.13)] sm:grid-cols-[1fr_1fr_.8fr_auto]"
      }
    >
      <label className="flex min-w-0 flex-col gap-1 rounded-xl px-4 py-2 focus-within:bg-muted/60">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <CalendarDays className="size-4" />
          Check-in
        </span>
        <Input
          className="h-6 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 rounded-xl px-4 py-2 focus-within:bg-muted/60">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <CalendarDays className="size-4" />
          Check-out
        </span>
        <Input
          className="h-6 border-0 bg-transparent p-0 focus-visible:ring-0"
          type="date"
          value={checkOut}
          min={checkIn}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1 rounded-xl px-4 py-2">
        <Label className="flex items-center gap-2 text-xs">
          <Users className="size-4" />
          Guests
        </Label>
        <Input
          aria-label="Number of guests"
          className="h-6 border-0 bg-transparent p-0 focus-visible:ring-0"
          type="number"
          min={1}
          max={30}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
        />
      </label>
      <Button type="submit" variant="terracotta" className="h-full min-h-12">
        <Search data-icon="inline-start" />
        Search stays
      </Button>
    </form>
  );
}
