import Button from "@/components/ui/Button";
import landingContent from "@/constant/sukahomestayLandingContent";
import SectionEyebrow from "@/components/sukahomestay/SectionEyebrow";

const propertyCards = [
  {
    title: "Sea Breeze Homestay",
    location: "Langkawi, Kedah",
    details: "3 Bedrooms | 2 Bathrooms | 6 Guests",
    price: "RM 280 / night",
    rating: "4.8 (120)",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Ipoh Garden Home",
    location: "Ipoh, Perak",
    details: "4 Bedrooms | 3 Bathrooms | 8 Guests",
    price: "RM 320 / night",
    rating: "4.9 (98)",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=901&q=80",
  },
  {
    title: "Cameron Cozy Cottage",
    location: "Cameron Highlands, Pahang",
    details: "2 Bedrooms | 1 Bathroom | 4 Guests",
    price: "RM 250 / night",
    rating: "4.7 (76)",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=902&q=80",
  },
  {
    title: "Urban Suites Homestay",
    location: "Penang, Pulau Pinang",
    details: "3 Bedrooms | 2 Bathrooms | 6 Guests",
    price: "RM 300 / night",
    rating: "4.6 (88)",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=903&q=80",
  },
];

export default function PropertyHighlightSection() {
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <SectionEyebrow>{landingContent.stayOptions.eyebrow}</SectionEyebrow>
          <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.03em] text-[#16213e] lg:text-5xl">
            {landingContent.stayOptions.title}
          </h2>
          <p className="text-lg text-[#667085]">
            Handpicked stays with strong ratings, flexible capacity, and direct support.
          </p>
        </div>
        <Button
          className="border border-[#ffb98a] bg-white px-6 text-[#ff7a1a] hover:bg-[#fff6ef]"
          link="/homestay"
          text="View All Stays"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {propertyCards.map((card) => (
          <article
            key={card.title}
            className="overflow-hidden rounded-[1.5rem] border border-[#edf1f6] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
          >
            <img alt={card.title} className="h-56 w-full object-cover" src={card.image} />
            <div className="space-y-3 p-5">
              <div className="flex items-center justify-between gap-3 text-sm text-[#667085]">
                <span>{card.location}</span>
                <span className="font-semibold text-[#ff7a1a]">{card.rating}</span>
              </div>
              <h3 className="text-2xl font-semibold leading-tight text-[#16213e]">
                {card.title}
              </h3>
              <p className="text-sm text-[#667085]">{card.details}</p>
              <div className="border-t border-[#eef1f6] pt-3">
                <p className="text-sm text-[#667085]">From</p>
                <p className="text-2xl font-semibold text-[#ff7a1a]">{card.price}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
