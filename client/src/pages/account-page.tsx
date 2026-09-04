import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Download, MessageCircle, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { properties } from "@/lib/demo-data";
import type { Booking } from "@/lib/types";
import { money } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
const demo: Booking = {
  id: "demo",
  reference: "SUKA-20260904-DEMO",
  status: "CONFIRMED",
  checkIn: "2026-09-18",
  checkOut: "2026-09-21",
  guestCount: 5,
  adultCount: 4,
  childCount: 1,
  totalSen: 203000,
  property: properties[0]!,
  items: [],
  payments: [{ verificationStatus: "VERIFIED" }],
};
export function AccountPage() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("bookings").select("*, properties(*, property_images(*)), booking_items(*, rooms(*)), manual_payments(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return (data as any[]).map((b):Booking=>({ id:b.id, reference:b.booking_reference,status:b.status,checkIn:b.check_in,checkOut:b.check_out,guestCount:b.adult_count+b.child_count,adultCount:b.adult_count,childCount:b.child_count,totalSen:b.total_amount,expiresAt:b.pending_expires_at??b.payment_expires_at,property:{...properties[0]!,...b.properties,basePriceSen:b.properties.base_price_sen,cleaningFeeSen:b.properties.cleaning_fee_sen,securityDepositSen:b.properties.security_deposit_sen,maxGuests:b.properties.max_guests,houseRules:b.properties.house_rules,cancellationPolicy:b.properties.cancellation_policy,images:(b.properties.property_images??[]).map((i:any)=>({id:i.id,url:i.storage_path,alt:i.alt}))},items:b.booking_items??[],payments:(b.manual_payments??[]).map((p:any)=>({verificationStatus:p.verification_status}))}));
    },
  });
  const b = query.data?.[0] ?? demo;
  return (
    <section className="container-shell py-14">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Customer portal</p>
          <h1 className="font-display text-5xl text-primary">
            Welcome back, Aiman.
          </h1>
        </div>
        <Button variant="outline">
          <UserRound />
          Profile settings
        </Button>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_330px]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming stay</p>
              <CardTitle className="mt-1">{b.property.name}</CardTitle>
            </div>
            <Badge>{b.status.toLowerCase().replace("_", " ")}</Badge>
          </CardHeader>
          <CardContent>
            <img
              className="aspect-[21/8] w-full rounded-xl object-cover"
              src={b.property.images[0]?.url}
              alt={b.property.images[0]?.alt}
            />
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Booking reference
                </p>
                <p className="mt-1 font-semibold">{b.reference}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dates</p>
                <p className="mt-1 font-semibold">18–21 Sep 2026</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Guests</p>
                <p className="mt-1 font-semibold">{b.guestCount} guests</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button>
                <CalendarDays />
                View details
              </Button>
              <Button variant="outline">
                <Download />
                Print confirmation
              </Button>
              <Button asChild variant="ghost">
                <Link to="/reservation-lookup">
                  <MessageCircle />
                  Reservation status
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Booking summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span>Payment</span>
                <Badge>{b.payments[0]?.verificationStatus ?? "NOT SUBMITTED"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Total paid</span>
                <strong>{money(b.totalSen)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Check-in</span>
                <strong>3:00 PM</strong>
              </div>
              <div className="flex justify-between">
                <span>Check-out</span>
                <strong>11:00 AM</strong>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Need a hand?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                We’re available on WhatsApp for check-in questions and stay
                support.
              </p>
              <Button className="mt-4 w-full" variant="secondary">
                Contact us
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="mt-12 flex gap-8 border-b text-sm font-semibold">
        <button className="border-b-2 border-primary pb-3">
          Upcoming stays
        </button>
        <button className="pb-3 text-muted-foreground">Previous stays</button>
        <button className="pb-3 text-muted-foreground">Cancelled</button>
      </div>
      <p className="py-10 text-sm text-muted-foreground">
        You have no other bookings.{" "}
        <Link className="font-semibold text-accent" to="/search">
          Find another stay.
        </Link>
      </p>
    </section>
  );
}
