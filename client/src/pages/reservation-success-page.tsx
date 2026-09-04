import { Check, Clipboard, ExternalLink, Search } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReservationResult } from "@/lib/types";
import { money } from "@/lib/utils";

function savedReservation() {
  try {
    const value = sessionStorage.getItem("suka:last-reservation:v1");
    return value ? (JSON.parse(value) as ReservationResult) : undefined;
  } catch {
    return undefined;
  }
}

export function ReservationSuccessPage() {
  const { reference } = useParams();
  const location = useLocation();
  const reservation = (location.state as ReservationResult | undefined) ?? savedReservation();
  const booking = reservation?.booking;
  if (!booking || booking.reference !== reference) {
    return (
      <section className="container-shell flex min-h-[620px] items-center justify-center py-16">
        <Card className="w-full max-w-xl"><CardHeader><CardTitle>Find your reservation</CardTitle></CardHeader><CardContent className="flex flex-col gap-5"><p className="text-muted-foreground">For privacy, enter your booking reference together with your phone number or email.</p><Button asChild variant="terracotta"><Link to="/reservation-lookup"><Search data-icon="inline-start" />Check reservation status</Link></Button></CardContent></Card>
      </section>
    );
  }
  const dates = `${new Date(booking.checkIn).toLocaleDateString("en-MY")} – ${new Date(booking.checkOut).toLocaleDateString("en-MY")}`;
  return (
    <section className="container-shell py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center"><span className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground"><Check /></span><p className="mt-5 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Reservation received</p><h1 className="mt-2 font-display text-5xl text-primary">Pending admin approval</h1></div>
        <Alert className="mt-8 text-center">Permohonan tempahan anda telah diterima.<br /><br />Tarikh pilihan anda sedang ditahan sementara dan menunggu semakan admin. Tempahan masih belum disahkan. Admin akan menghubungi anda melalui WhatsApp untuk kelulusan dan arahan pembayaran.</Alert>
        <Card className="mt-6">
          <CardHeader className="flex-row items-center justify-between"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">Reservation reference</p><CardTitle className="mt-2 text-3xl">{booking.reference}</CardTitle></div><Badge>Pending approval</Badge></CardHeader>
          <CardContent className="grid gap-5 border-t pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="text-xs text-muted-foreground">Property</p><p className="mt-1 font-semibold">{booking.property.name}</p></div>
            <div><p className="text-xs text-muted-foreground">Dates</p><p className="mt-1 font-semibold">{dates}</p></div>
            <div><p className="text-xs text-muted-foreground">Guests</p><p className="mt-1 font-semibold">{booking.adultCount} adults, {booking.childCount} children</p></div>
            <div><p className="text-xs text-muted-foreground">Total</p><p className="mt-1 font-semibold">{money(booking.totalSen)}</p></div>
          </CardContent>
        </Card>
        <Card className="mt-6"><CardHeader><CardTitle>What happens next</CardTitle></CardHeader><CardContent><ol className="grid gap-4 sm:grid-cols-4">{["Permohonan dihantar", "Semakan admin", "Pembayaran manual", "Pengesahan tempahan"].map((stage, index) => <li className="flex items-center gap-3 sm:flex-col sm:items-start" key={stage}><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground">{index + 1}</span><span className="text-sm font-semibold">{stage}</span></li>)}</ol>{booking.expiresAt ? <p className="mt-6 text-sm text-muted-foreground">Temporary hold expires at {new Date(booking.expiresAt).toLocaleString("en-MY")}, unless an admin extends it.</p> : null}</CardContent></Card>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button variant="terracotta" onClick={() => window.open(reservation.whatsappUrl, "_blank", "noopener,noreferrer")}><ExternalLink data-icon="inline-start" />Open WhatsApp Again</Button>
          <Button variant="outline" onClick={() => void navigator.clipboard.writeText(booking.reference).then(() => toast.success("Booking reference copied"))}><Clipboard data-icon="inline-start" />Copy Booking Reference</Button>
          {booking.userId ? <Button asChild variant="outline"><Link to="/account">View My Booking</Link></Button> : <Button asChild variant="outline"><Link to="/reservation-lookup">Check reservation status</Link></Button>}
        </div>
      </div>
    </section>
  );
}
