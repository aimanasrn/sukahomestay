import { CalendarPlus, Download, Filter, Plus, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
const copy: Record<
  string,
  { title: string; description: string; action: string }
> = {
  calendar: {
    title: "Availability calendar",
    description:
      "Review bookings, holds and maintenance blocks across every property.",
    action: "Block dates",
  },
  bookings: {
    title: "Bookings",
    description: "Search, filter and manage customer stays from one place.",
    action: "New booking",
  },
  properties: {
    title: "Properties",
    description: "Publish homes, update amenities, images and house details.",
    action: "Add property",
  },
  rooms: {
    title: "Rooms",
    description: "Manage room inventory, capacity and nightly rates.",
    action: "Add room",
  },
  customers: {
    title: "Customers",
    description: "View guest contact details, spend and booking history.",
    action: "Add customer",
  },
  payments: {
    title: "Payments",
    description: "Record bank transfers and verify manual payments.",
    action: "Record payment",
  },
  reports: {
    title: "Reports",
    description: "Understand revenue, occupancy and booking performance.",
    action: "Export CSV",
  },
  settings: {
    title: "Settings",
    description: "Configure business details, policies and booking holds.",
    action: "Save changes",
  },
};
export function AdminModulePage() {
  const key = useLocation().pathname.split("/").pop() ?? "bookings";
  const item = copy[key] ?? copy.bookings!;
  return (
    <>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-display text-5xl text-primary">{item.title}</h1>
          <p className="mt-2 text-muted-foreground">{item.description}</p>
        </div>
        <Button variant="terracotta">
          {key === "reports" ? (
            <Download />
          ) : key === "calendar" ? (
            <CalendarPlus />
          ) : (
            <Plus />
          )}
          {item.action}
        </Button>
      </div>
      <Card className="mt-8">
        <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle>
            {key === "calendar" ? "September 2026" : `All ${key}`}
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input className="pl-9" placeholder={`Search ${key}…`} />
            </div>
            <Button variant="outline">
              <Filter />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {key === "calendar" ? <CalendarGrid /> : <DataRows type={key} />}
        </CardContent>
      </Card>
    </>
  );
}
function CalendarGrid() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap gap-3 text-xs">
        {[
          ["bg-calendar-pending", "Pending approval"], ["bg-calendar-awaiting", "Awaiting payment"],
          ["bg-calendar-submitted", "Payment submitted"], ["bg-calendar-confirmed", "Confirmed"],
          ["bg-calendar-checked-in", "Checked in"], ["bg-calendar-blocked", "Manually blocked"],
          ["bg-calendar-released", "Rejected or cancelled"], ["bg-calendar-expired", "Expired"],
        ].map(([color, text]) => <span className="inline-flex items-center gap-2" key={text}><i className={cn("size-3 rounded-full", color)} />{text}</span>)}
      </div>
      <div className="grid grid-cols-7 overflow-hidden rounded-xl border bg-border text-sm">
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
        <div
          className="bg-secondary p-3 text-center text-xs font-semibold"
          key={d}
        >
          {d}
        </div>
      ))}
      {Array.from({ length: 35 }, (_, i) => (
        <button
          className="min-h-24 bg-card p-2 text-left hover:bg-muted"
          key={i}
        >
          <span className="text-xs">{i + 1}</span>
          {[4, 5, 6].includes(i) && (
            <span className="mt-2 block rounded-md bg-calendar-pending px-2 py-1 text-[10px] text-foreground">
              Pending approval
            </span>
          )}
          {[14, 15, 22].includes(i) && <span className="mt-2 block rounded-md bg-calendar-confirmed px-2 py-1 text-[10px] text-primary-foreground">Confirmed</span>}
          {[10, 11].includes(i) && (
            <span className="mt-2 block rounded-md bg-[#f5dfd5] px-2 py-1 text-[10px] text-accent">
              Maintenance
            </span>
          )}
        </button>
      ))}
      </div>
    </div>
  );
}
function DataRows({ type }: { type: string }) {
  const names =
    type === "properties"
      ? [
          "Alam Villa Langkawi",
          "Damai Hillside Home",
          "Rimba Retreat Janda Baik",
        ]
      : type === "customers"
        ? ["Aiman Zulkifli", "Siti Nurhaliza", "Jason Cheng"]
        : ["SH-2026-8F21A4", "SH-2026-A31C09", "SH-2026-DEMO01"];
  return (
    <div className="divide-y">
      {names.map((name, i) => (
        <div
          className="grid items-center gap-3 py-4 sm:grid-cols-[1fr_1fr_auto]"
          key={name}
        >
          <div>
            <p className="font-semibold">{name}</p>
            <p className="text-xs text-muted-foreground">
              Updated {i + 1} Sep 2026
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            {i % 2 ? "Damai Hillside Home" : "Alam Villa Langkawi"}
          </p>
          <Badge>{i === 1 ? "Pending" : "Active"}</Badge>
        </div>
      ))}
    </div>
  );
}
