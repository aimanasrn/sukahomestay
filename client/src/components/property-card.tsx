import { BedDouble, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { Property } from "@/lib/types";
import { money } from "@/lib/utils";
export function PropertyCard({ property }: { property: Property }) {
  return (
    <article className="group overflow-hidden rounded-2xl bg-card">
      <Link to={`/properties/${property.slug}`} className="focus-ring block">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            className="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
            src={property.images[0]?.url}
            alt={property.images[0]?.alt ?? property.name}
          />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl text-primary">
                {property.name}
              </h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-4" />
                {property.city}, {property.state}
              </p>
            </div>
            <p className="shrink-0 text-right text-xs text-muted-foreground">
              From
              <br />
              <strong className="text-lg text-accent">
                {money(property.basePriceSen)}
              </strong>
              <span> /night</span>
            </p>
          </div>
          <div className="mt-4 flex gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BedDouble className="size-4" />
              {property.bedrooms} bedrooms
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" />
              Up to {property.maxGuests}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
