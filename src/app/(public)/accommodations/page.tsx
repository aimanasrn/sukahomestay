import { units } from "@/data/units";
import { UnitCard } from "@/components/unit-card";

export default function Accommodations() {
  return (
    <section className="section soft">
      <div className="shell">
        <span className="eyebrow">OUR ACCOMMODATIONS</span>
        <h1 className="title">Explore All Homestays & Rooms</h1>
        <p className="lead" style={{ marginBottom: 40 }}>
          From quiet individual roomstays to full family homestays and whole-estate reservations, choose the perfect space for your travel plans.
        </p>

        <div className="cards">
          {units.map((unit) => (
            <UnitCard unit={unit} key={unit.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
