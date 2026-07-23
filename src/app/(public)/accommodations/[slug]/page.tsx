import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Users, CheckCircle2, ArrowRight } from "lucide-react";
import { units } from "@/data/units";

export default async function UnitPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const unit = units.find((x) => x.slug === slug);

  if (!unit) return notFound();

  return (
    <section className="section">
      <div className="shell split">
        <div>
          <span className="eyebrow">{unit.type.replace("_", " ")}</span>
          <h1 className="title">{unit.name}</h1>
          <p className="lead" style={{ marginBottom: 24 }}>
            {unit.shortDescription}
          </p>

          <div className="meta" style={{ marginBottom: 24 }}>
            <span><BedDouble size={18} /> {unit.bedrooms} {unit.bedrooms === 1 ? "Bedroom" : "Bedrooms"}</span>
            <span><Bath size={18} /> {unit.bathrooms} {unit.bathrooms === 1 ? "Bathroom" : "Bathrooms"}</span>
            <span><Users size={18} /> Max {unit.maximumGuests} Guests</span>
          </div>

          <h3 style={{ color: "var(--navy)", marginBottom: 14 }}>Amenities & Conveniences</h3>
          <div className="amenities" style={{ marginBottom: 28 }}>
            {unit.amenities.map((item) => (
              <div className="amenity" key={item}>
                <CheckCircle2 size={18} color="var(--emerald)" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="price" style={{ fontSize: "1.6rem", marginBottom: 24 }}>
            RM {unit.basePrice} <small>/ night</small>
          </div>

          <Link className="button" href={`/booking?unit=${unit.slug}`}>
            <span>Reserve This Stay</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="hero-image" style={{ height: 440 }}>
          <Image
            src={unit.image}
            width={1600}
            height={1000}
            alt={unit.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
    </section>
  );
}
