import { useQuery } from "@tanstack/react-query";
import {
  Bath,
  BedDouble,
  Check,
  MapPin,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import { properties } from "@/lib/demo-data";
import type { Property } from "@/lib/types";
import { money } from "@/lib/utils";
import { publishedProperty } from "@/lib/properties";
export function PropertyPage() {
  const { slug } = useParams();
  const query = useQuery({
    queryKey: ["property", slug],
    queryFn: () =>
      publishedProperty(slug!).catch(
        () => properties.find((p) => p.slug === slug) ?? properties[0]!,
      ),
  });
  const p = query.data;
  if (!p) return null;
  return (
    <>
      <section className="container-shell pt-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              {p.city}, {p.state}
            </p>
            <h1 className="mt-2 font-display text-5xl text-primary">
              {p.name}
            </h1>
          </div>
          <p className="text-muted-foreground">
            From{" "}
            <strong className="font-display text-3xl text-accent">
              {money(p.basePriceSen)}
            </strong>{" "}
            / night
          </p>
        </div>
        <div className="mt-8 grid h-[500px] gap-3 overflow-hidden rounded-2xl md:grid-cols-[1.6fr_1fr]">
          <img
            className="size-full object-cover"
            src={p.images[0]?.url}
            alt={p.images[0]?.alt}
          />
          <img
            className="hidden size-full object-cover md:block"
            src={p.images[1]?.url ?? p.images[0]?.url}
            alt={p.images[1]?.alt ?? `${p.name} interior`}
          />
        </div>
      </section>
      <section className="container-shell grid gap-10 py-14 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="flex flex-wrap gap-6 border-b pb-7 text-sm">
            <span className="flex items-center gap-2">
              <Users className="size-5" />
              Up to {p.maxGuests} guests
            </span>
            <span className="flex items-center gap-2">
              <BedDouble className="size-5" />
              {p.bedrooms} bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath className="size-5" />
              {p.bathrooms} bathrooms
            </span>
          </div>
          <h2 className="mt-9 font-display text-3xl text-primary">
            A place to slow down
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
            {p.description}
          </p>
          <h2 className="mt-10 font-display text-3xl text-primary">
            What this place offers
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(
              p.amenities?.map((a) => a.amenity.name) ?? [
                "High-speed Wi-Fi",
                "Air conditioning",
                "Equipped kitchen",
                "Free parking",
              ]
            ).map((a) => (
              <span className="flex items-center gap-3" key={a}>
                <Check className="size-4 text-primary" />
                {a}
              </span>
            ))}
          </div>
          <h2 className="mt-10 font-display text-3xl text-primary">
            Good to know
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="font-semibold">House rules</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {p.houseRules}
              </p>
            </div>
            <div>
              <p className="font-semibold">Cancellation</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {p.cancellationPolicy}
              </p>
            </div>
          </div>
        </div>
        <Card className="h-fit lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle>Plan your stay</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-xl bg-secondary p-4 text-sm">
              <ShieldCheck className="mb-2 text-primary" />
              <strong>Book with confidence</strong>
              <p className="mt-1 text-muted-foreground">
                Availability is checked again before a temporary admin-review hold is created.
              </p>
            </div>
            <Button asChild size="lg" variant="terracotta">
              <Link to={`/checkout?property=${p.id}&slug=${p.slug}`}>
                Check availability
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
