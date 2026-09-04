import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Booking } from "@/lib/types";
import { money } from "@/lib/utils";

export function ReservationLookupPage() {
  const [reference, setReference] = useState("");
  const [contact, setContact] = useState("");
  const lookup = useMutation({ mutationFn: () => api<Booking>("/bookings/lookup", { method: "POST", body: JSON.stringify({ reference, contact }) }) });
  return (
    <section className="container-shell py-16"><div className="mx-auto max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Guest access</p><h1 className="mt-2 font-display text-5xl text-primary">Check your reservation</h1><p className="mt-3 text-muted-foreground">For privacy, both the reference and the matching phone number or email are required.</p>
      <Card className="mt-8"><CardContent className="pt-6"><form onSubmit={(event) => { event.preventDefault(); lookup.mutate(); }}><FieldGroup><Field><Label htmlFor="reference">Booking reference</Label><Input id="reference" value={reference} onChange={(event) => setReference(event.target.value.toUpperCase())} placeholder="SUKA-20260904-A8K2" required /></Field><Field><Label htmlFor="contact">Phone number or email</Label><Input id="contact" value={contact} onChange={(event) => setContact(event.target.value)} required /></Field><Button type="submit" variant="terracotta" disabled={lookup.isPending}><Search data-icon="inline-start" />{lookup.isPending ? "Checking…" : "Check status"}</Button></FieldGroup></form></CardContent></Card>
      {lookup.isError ? <Alert className="mt-5">{lookup.error.message}</Alert> : null}
      {lookup.data ? <Card className="mt-5"><CardHeader className="flex-row items-center justify-between"><CardTitle>{lookup.data.reference}</CardTitle><Badge>{lookup.data.status.replaceAll("_", " ")}</Badge></CardHeader><CardContent className="grid gap-4 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Property</p><p className="font-semibold">{lookup.data.property.name}</p></div><div><p className="text-xs text-muted-foreground">Guests</p><p className="font-semibold">{lookup.data.adultCount} adults, {lookup.data.childCount} children</p></div><div><p className="text-xs text-muted-foreground">Total</p><p className="font-semibold">{money(lookup.data.totalSen)}</p></div></CardContent></Card> : null}
    </div></section>
  );
}
