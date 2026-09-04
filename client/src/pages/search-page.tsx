import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PropertyCard } from "@/components/property-card";
import { SearchBox } from "@/components/search-box";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { properties as fallback } from "@/lib/demo-data";
import type { Property } from "@/lib/types";
import { publishedProperties } from "@/lib/properties";
export function SearchPage() {
  const [params] = useSearchParams();
  const qs = params.toString();
  const query = useQuery({
    queryKey: ["properties", qs],
    queryFn: () =>
      (qs ? api<Property[]>(`/properties?${qs}`) : publishedProperties()).catch(() => fallback),
  });
  return (
    <section className="container-shell section-pad">
      <h1 className="font-display text-5xl text-primary">Find your stay</h1>
      <p className="mt-3 text-muted-foreground">
        Homes and rooms with availability for your trip.
      </p>
      <div className="my-8">
        <SearchBox compact />
      </div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {query.data?.length ?? 0} stays available
        </p>
        <button className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="size-4" />
          Filters
        </button>
      </div>
      {query.isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton className="h-96" key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {query.data?.map((p) => (
            <PropertyCard property={p} key={p.id} />
          ))}
        </div>
      )}
    </section>
  );
}
