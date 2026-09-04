import { useMutation, useQuery } from "@tanstack/react-query";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { ArrowLeft, LoaderCircle, MessageCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { properties } from "@/lib/demo-data";
import type { ReservationResult } from "@/lib/types";
import { money } from "@/lib/utils";

const newIdempotencyKey = () => crypto.randomUUID();

export function CheckoutPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const property = properties.find((item) => item.id === params.get("property") || item.slug === params.get("slug")) ?? properties[0]!;
  const [idempotencyKey] = useState(newIdempotencyKey);
  const [checkIn, setCheckIn] = useState(format(addDays(new Date(), 10), "yyyy-MM-dd"));
  const [checkOut, setCheckOut] = useState(format(addDays(new Date(), 13), "yyyy-MM-dd"));
  const [inventoryChoice, setInventoryChoice] = useState("ENTIRE_PROPERTY");
  const [adultCount, setAdultCount] = useState(4);
  const [childCount, setChildCount] = useState(0);
  const [fullName, setFullName] = useState("Aiman Zulkifli");
  const [email, setEmail] = useState("guest@sukahomestay.test");
  const [phone, setPhone] = useState("0199887766");
  const [specialRequests, setSpecialRequests] = useState("");
  const [agreements, setAgreements] = useState({ house: false, cancellation: false, privacy: false });

  const selectedRoom = property.rooms.find((room) => room.id === inventoryChoice);
  const inventoryType = selectedRoom ? "ROOM" : "ENTIRE_PROPERTY";
  const nights = Math.max(1, differenceInCalendarDays(new Date(`${checkOut}T12:00:00`), new Date(`${checkIn}T12:00:00`)));
  const localSubtotal = (selectedRoom?.priceSen ?? property.basePriceSen) * nights;
  const localPrice = { subtotalSen: localSubtotal, cleaningFeeSen: property.cleaningFeeSen, extraGuestFeeSen: 0, totalSen: localSubtotal + property.cleaningFeeSen, nights };
  const quote = useQuery({
    queryKey: ["quote", property.id, inventoryChoice, checkIn, checkOut, adultCount, childCount],
    queryFn: () => api<typeof localPrice>("/bookings/quote", { method: "POST", body: JSON.stringify({ propertyId: property.id, inventoryType, ...(selectedRoom ? { roomId: selectedRoom.id } : {}), checkIn, checkOut, guests: adultCount + childCount }) }).catch(() => localPrice),
  });
  const price = quote.data ?? localPrice;

  const mutation = useMutation({
    mutationFn: () => api<ReservationResult>("/bookings/reserve", {
      method: "POST",
      body: JSON.stringify({
        idempotencyKey, propertyId: property.id, inventoryType,
        ...(selectedRoom ? { roomId: selectedRoom.id } : {}),
        checkIn, checkOut, adultCount, childCount, specialRequests,
        houseRulesAccepted: agreements.house,
        cancellationPolicyAccepted: agreements.cancellation,
        privacyPolicyAccepted: agreements.privacy,
        guest: { fullName, email, phone },
      }),
    }),
    onSuccess: (result) => {
      sessionStorage.setItem("suka:last-reservation:v1", JSON.stringify(result));
      window.open(result.whatsappUrl, "_blank", "noopener,noreferrer");
      navigate(`/reservation-success/${result.booking.reference}`, { state: result });
    },
    onError: (error) => toast.error(error.message),
  });
  const accepted = agreements.house && agreements.cancellation && agreements.privacy;

  return (
    <section className="container-shell py-12">
      <Link className="inline-flex items-center gap-2 text-sm font-semibold" to={`/properties/${property.slug}`}>
        <ArrowLeft data-icon="inline-start" /> Back to property
      </Link>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-accent">Manual reservation</p>
      <h1 className="mt-2 font-display text-5xl text-primary">Reserve via WhatsApp</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">Your dates will be held temporarily for admin review. Payment instructions are shared only after approval.</p>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
        <form className="flex flex-col gap-8" onSubmit={(event) => { event.preventDefault(); if (accepted) mutation.mutate(); }}>
          <Card>
            <CardHeader><CardTitle>Your stay</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup className="sm:grid sm:grid-cols-2">
                <Field className="sm:col-span-2">
                  <Label htmlFor="inventory">Property or room</Label>
                  <select id="inventory" className="h-11 rounded-lg border border-input bg-background px-3 text-sm" value={inventoryChoice} onChange={(event) => setInventoryChoice(event.target.value)}>
                    <option value="ENTIRE_PROPERTY">Entire property · {property.name}</option>
                    {property.rooms.map((room) => <option value={room.id} key={room.id}>{room.name}</option>)}
                  </select>
                </Field>
                <Field><Label htmlFor="checkIn">Check-in</Label><Input id="checkIn" type="date" value={checkIn} onChange={(event) => setCheckIn(event.target.value)} required /></Field>
                <Field><Label htmlFor="checkOut">Check-out</Label><Input id="checkOut" type="date" min={checkIn} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required /></Field>
                <Field><Label htmlFor="adults">Adults</Label><Input id="adults" type="number" min={1} max={property.maxGuests} value={adultCount} onChange={(event) => setAdultCount(Number(event.target.value))} required /></Field>
                <Field><Label htmlFor="children">Children</Label><Input id="children" type="number" min={0} max={property.maxGuests} value={childCount} onChange={(event) => setChildCount(Number(event.target.value))} required /></Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Guest and contact details</CardTitle></CardHeader>
            <CardContent>
              <FieldGroup className="sm:grid sm:grid-cols-2">
                <Field className="sm:col-span-2"><Label htmlFor="guestName">Full name</Label><Input id="guestName" value={fullName} onChange={(event) => setFullName(event.target.value)} required /></Field>
                <Field><Label htmlFor="guestEmail">Email address</Label><Input id="guestEmail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
                <Field><Label htmlFor="guestPhone">Malaysian phone number</Label><Input id="guestPhone" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} pattern="^(?:\+?60|0)?1\d{8,9}$" required /><FieldDescription>Example: 0123456789. We convert it to WhatsApp format.</FieldDescription></Field>
                <Field className="sm:col-span-2"><Label htmlFor="requests">Special requests</Label><Textarea id="requests" value={specialRequests} onChange={(event) => setSpecialRequests(event.target.value)} placeholder="Accessibility, arrival time, or other requests" /></Field>
              </FieldGroup>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Agreements</CardTitle></CardHeader>
            <CardContent><FieldGroup>
              {([
                ["house", "I agree to the house rules."],
                ["cancellation", "I agree to the cancellation policy."],
                ["privacy", "I agree to the privacy policy."],
              ] as const).map(([key, label]) => (
                <label className="flex items-start gap-3 text-sm" key={key}><Checkbox checked={agreements[key]} onChange={(event) => setAgreements((current) => ({ ...current, [key]: event.target.checked }))} required /><span>{label}</span></label>
              ))}
            </FieldGroup></CardContent>
          </Card>
          {mutation.isError ? <Alert>{mutation.error.message.includes("Tarikh") ? mutation.error.message : "We could not save your reservation. Please review your details and try again."}</Alert> : null}
          <Button type="submit" size="lg" disabled={!accepted || mutation.isPending} variant="terracotta">
            {mutation.isPending ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <MessageCircle data-icon="inline-start" />}
            {mutation.isPending ? "Saving reservation…" : "Reserve via WhatsApp"}
          </Button>
        </form>
        <Card className="h-fit lg:sticky lg:top-6">
          <img className="aspect-[16/9] w-full rounded-t-2xl object-cover" src={property.images[0]?.url} alt={property.images[0]?.alt} />
          <CardHeader><CardTitle>{property.name}</CardTitle><p className="text-sm text-muted-foreground">{property.city}, {property.state}</p></CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between"><span>{price.nights} nights</span><span>{money(price.subtotalSen)}</span></div>
            <div className="flex justify-between"><span>Cleaning fee</span><span>{money(price.cleaningFeeSen)}</span></div>
            <div className="flex justify-between"><span>Additional fee</span><span>{money(price.extraGuestFeeSen)}</span></div>
            <div className="flex justify-between border-t pt-4 text-base font-bold"><span>Total</span><span>{money(price.totalSen)}</span></div>
            <Alert className="flex items-start gap-2"><ShieldCheck data-icon="inline-start" />Availability and pricing are checked again securely before your reservation is saved.</Alert>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
