import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarClock, Check, MessageCircle, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";

type AdminBooking = {
  id: string; reference: string; status: string; checkIn: string; checkOut: string;
  totalSen: number; expiresAt?: string | null; property: { name: string };
  guests: Array<{ fullName: string; phone?: string; email?: string }>;
  payments: Array<{ verificationStatus: string; transactionReference?: string }>;
};

const demoBookings: AdminBooking[] = [
  { id: "demo-pending", reference: "SUKA-20260904-A8K2", status: "PENDING_APPROVAL", checkIn: "2026-09-18", checkOut: "2026-09-21", totalSen: 203000, expiresAt: "2026-09-04T12:00:00+08:00", property: { name: "Alam Villa Langkawi" }, guests: [{ fullName: "Aiman Zulkifli", phone: "60199887766", email: "guest@example.com" }], payments: [] },
  { id: "demo-awaiting", reference: "SUKA-20260904-N7Q4", status: "AWAITING_PAYMENT", checkIn: "2026-09-22", checkOut: "2026-09-24", totalSen: 146000, property: { name: "Damai Hillside Home" }, guests: [{ fullName: "Siti Nurhaliza" }], payments: [] },
  { id: "demo-submitted", reference: "SUKA-20260903-P3K9", status: "PAYMENT_SUBMITTED", checkIn: "2026-09-25", checkOut: "2026-09-27", totalSen: 130000, property: { name: "Rimba Retreat Janda Baik" }, guests: [{ fullName: "Jason Cheng" }], payments: [{ verificationStatus: "PENDING_VERIFICATION", transactionReference: "TRX-82491" }] },
];

const label = (status: string) => status.toLowerCase().replaceAll("_", " ");

export function AdminBookingsPage() {
  const query = useQuery({ queryKey: ["admin-bookings"], queryFn: () => api<AdminBooking[]>("/admin/bookings").catch(() => demoBookings) });
  const [selectedId, setSelectedId] = useState(demoBookings[0]!.id);
  const [localStatus, setLocalStatus] = useState<string>();
  const [reason, setReason] = useState("");
  const [transactionReference, setTransactionReference] = useState("");
  const bookings = query.data ?? demoBookings;
  const selected = bookings.find((item) => item.id === selectedId) ?? bookings[0]!;
  const status = localStatus ?? selected.status;
  const action = useMutation({
    mutationFn: async ({ path, body, nextStatus }: { path: string; body?: unknown; nextStatus?: string }) => {
      if (selected.id.startsWith("demo-")) return nextStatus;
      const result = await api<{ booking?: AdminBooking; whatsappUrl?: string }>(`/admin/bookings/${selected.id}/${path}`, { method: "POST", body: JSON.stringify(body ?? {}) });
      if (result.whatsappUrl) window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      return result.booking?.status ?? nextStatus;
    },
    onSuccess: (nextStatus) => { if (nextStatus) setLocalStatus(nextStatus); toast.success("Booking updated"); },
    onError: (error) => toast.error(error.message),
  });
  const run = (path: string, nextStatus?: string, body?: unknown) => action.mutate({ path, ...(nextStatus ? { nextStatus } : {}), ...(body !== undefined ? { body } : {}) });
  const contact = async () => {
    if (selected.id.startsWith("demo-")) return toast.info("Contact link is available when connected to the authenticated admin API.");
    try { const result = await api<{ whatsappUrl: string }>(`/admin/bookings/${selected.id}/contact`); window.open(result.whatsappUrl, "_blank", "noopener,noreferrer"); }
    catch (error) { toast.error(error instanceof Error ? error.message : "Unable to open WhatsApp"); }
  };
  return (
    <><div><h1 className="font-display text-5xl text-primary">Bookings</h1><p className="mt-2 text-muted-foreground">Review reservations, collect manual payment details and control confirmation.</p></div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <Card><CardHeader><CardTitle>Reservation queue</CardTitle></CardHeader><CardContent className="flex flex-col gap-2">{bookings.map((booking) => <button className="rounded-xl border p-4 text-left hover:bg-muted" key={booking.id} onClick={() => { setSelectedId(booking.id); setLocalStatus(undefined); }}><div className="flex items-center justify-between gap-3"><strong>{booking.reference}</strong><Badge>{label(booking.status)}</Badge></div><p className="mt-2 text-sm text-muted-foreground">{booking.guests[0]?.fullName} · {booking.property.name}</p></button>)}</CardContent></Card>
        <Card><CardHeader className="flex-row items-start justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Booking detail</p><CardTitle className="mt-2">{selected.reference}</CardTitle></div><Badge>{label(status)}</Badge></CardHeader><CardContent className="flex flex-col gap-6">
          <div className="grid gap-4 border-y py-5 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Guest</p><p className="font-semibold">{selected.guests[0]?.fullName}</p></div><div><p className="text-xs text-muted-foreground">Stay</p><p className="font-semibold">{selected.checkIn} – {selected.checkOut}</p></div><div><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold">{money(selected.totalSen)}</p></div></div>
          {status === "PENDING_APPROVAL" ? <FieldGroup><Field><Label htmlFor="reason">Rejection reason</Label><Textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required when rejecting" /></Field><div className="flex flex-wrap gap-2"><Button disabled={action.isPending} onClick={() => run("approve", "AWAITING_PAYMENT")}><Check data-icon="inline-start" />Approve reservation</Button><Button variant="outline" disabled={reason.length < 3 || action.isPending} onClick={() => run("reject", "REJECTED", { reason })}><X data-icon="inline-start" />Reject</Button><Button variant="outline" onClick={() => run("extend-expiry", status, { hours: 24, autoExpiryDisabled: false })}><CalendarClock data-icon="inline-start" />Extend expiry</Button></div></FieldGroup> : null}
          {status === "AWAITING_PAYMENT" ? <FieldGroup><Field><Label htmlFor="transaction">Transaction reference</Label><Input id="transaction" value={transactionReference} onChange={(event) => setTransactionReference(event.target.value)} placeholder="Bank or DuitNow reference" /></Field><div className="flex flex-wrap gap-2"><Button disabled={!transactionReference || action.isPending} onClick={() => run("payment-submitted", "PAYMENT_SUBMITTED", { transactionReference, paymentMethod: "Bank transfer", amountSen: selected.totalSen })}><ShieldCheck data-icon="inline-start" />Mark payment submitted</Button><Button variant="outline" onClick={() => run("extend-expiry", status, { hours: 24, autoExpiryDisabled: false })}>Extend deadline</Button><Button variant="outline" onClick={() => run("cancel", "CANCELLED", { reason: "Cancelled by admin" })}>Cancel reservation</Button></div></FieldGroup> : null}
          {status === "PAYMENT_SUBMITTED" ? <FieldGroup><Field><Label htmlFor="paymentReason">Payment rejection reason</Label><Textarea id="paymentReason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Required when rejecting payment" /></Field><div className="flex flex-wrap gap-2"><Button disabled={action.isPending} onClick={() => run("verify-payment", "CONFIRMED")}><ShieldCheck data-icon="inline-start" />Verify payment & confirm</Button><Button variant="outline" disabled={reason.length < 3} onClick={() => run("reject-payment", "AWAITING_PAYMENT", { reason })}>Reject payment</Button><Button variant="outline" onClick={() => void contact()}>Request another receipt</Button></div></FieldGroup> : null}
          {status === "CONFIRMED" ? <Button className="self-start" onClick={() => run("stay-status", "CHECKED_IN", { status: "CHECKED_IN" })}>Mark checked in</Button> : null}
          {status === "CHECKED_IN" ? <Button className="self-start" onClick={() => run("stay-status", "COMPLETED", { status: "COMPLETED" })}>Complete stay</Button> : null}
          <Button variant="ghost" onClick={() => void contact()}><MessageCircle data-icon="inline-start" />Contact customer on WhatsApp</Button>
        </CardContent></Card>
      </div></>
  );
}
