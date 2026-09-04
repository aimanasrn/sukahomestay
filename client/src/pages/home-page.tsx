import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarCheck,
  Car,
  Check,
  CookingPot,
  Headphones,
  KeyRound,
  MapPin,
  MessageCircle,
  Snowflake,
  Sparkles,
  Star,
  Tv,
  WashingMachine,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import { PropertyCard } from "@/components/property-card";
import { SearchBox } from "@/components/search-box";
import { Button } from "@/components/ui/button";
import { properties } from "@/lib/demo-data";
const amenities = [
  [Wifi, "High-speed Wi-Fi"],
  [Snowflake, "Air conditioning"],
  [CookingPot, "Equipped kitchen"],
  [Car, "Free parking"],
  [WashingMachine, "Washing machine"],
  [Tv, "Smart TV"],
  [Sparkles, "Essentials provided"],
] as const;
const gallery = [
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=85",
];
export function HomePage() {
  return (
    <>
      <section className="container-shell grid min-h-[650px] items-center gap-8 py-8 md:grid-cols-[1fr_1.08fr] md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10"
        >
          <h1 className="max-w-xl font-display text-[clamp(3.4rem,6.2vw,5.65rem)] leading-[.94] tracking-[-.035em] text-primary">
            Stay somewhere that feels like home.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-8 text-muted-foreground">
            Thoughtful homestays for family time, quiet weekends and everything
            in between.
          </p>
          <div className="mt-10 md:mr-[-14rem]">
            <SearchBox />
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65 }}
          className="h-[440px] overflow-hidden rounded-[1.4rem] sm:h-[560px]"
        >
          <img
            className="size-full object-cover"
            src="/assets/alam-villa-hero.png"
            alt="Warm tropical Malaysian homestay with open timber doors"
          />
        </motion.div>
      </section>
      <section className="section-pad border-t bg-card">
        <div className="container-shell">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-4xl text-primary">
              Made for meaningful stays
            </h2>
            <Link
              className="hidden items-center gap-2 text-sm font-semibold text-accent sm:flex"
              to="/search"
            >
              Browse all stays
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {properties.map((p) => (
              <PropertyCard property={p} key={p.id} />
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-shell">
          <h2 className="font-display text-4xl text-primary">
            Everything you need, already here
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border bg-border sm:grid-cols-4 md:grid-cols-7">
            {amenities.map(([Icon, label]) => (
              <div
                className="flex min-h-32 flex-col items-center justify-center gap-4 bg-background p-4 text-center text-sm"
                key={label}
              >
                <Icon className="size-7 text-primary" strokeWidth={1.6} />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad bg-card">
        <div className="container-shell">
          <h2 className="font-display text-4xl text-primary">
            Your stay, made simple
          </h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {(
              [
                [
                  CalendarCheck,
                  "Search your dates",
                  "Pick dates and guests to find the right stay.",
                ],
                [
                  KeyRound,
                  "Choose your homestay",
                  "Browse photos, amenities and house details.",
                ],
                [
                  Check,
                  "Book with confidence",
                  "Secure your booking in just a few taps.",
                ],
              ] as Array<[LucideIcon, string, string]>
            ).map(([Icon, title, body], i) => (
              <div className="relative flex gap-5" key={title as string}>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                  <Icon />
                </span>
                <div>
                  <p className="mb-1 text-xs font-bold text-accent">0{i + 1}</p>
                  <h3 className="font-semibold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {body as string}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4">
            {gallery.map((src, i) => (
              <img
                className="aspect-[4/3] size-full rounded-2xl object-cover"
                src={src}
                alt={`SUKA HOMESTAY interior ${i + 1}`}
                key={src}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad">
        <div className="container-shell">
          <h2 className="font-display text-4xl text-primary">
            Loved by our guests
          </h2>
          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {[
              [
                "Aisyah K.",
                "“Beautiful home, spotless and so comfortable. Our family had everything we needed and more.”",
                "Kuala Lumpur",
              ],
              [
                "Daniel Lim",
                "“Peaceful, private and close to everything. Perfect for our weekend getaway with friends.”",
                "Johor Bahru",
              ],
            ].map(([name, quote, city]) => (
              <figure className="rounded-2xl border bg-card p-7" key={name}>
                <div className="mb-5 flex text-[#b89a5b]">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className="size-4" fill="currentColor" />
                  ))}
                </div>
                <blockquote className="font-display text-2xl leading-8 text-primary">
                  {quote}
                </blockquote>
                <figcaption className="mt-6 text-sm font-semibold">
                  {name}
                  <span className="ml-2 font-normal text-muted-foreground">
                    {city}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section className="pb-20">
        <div className="container-shell grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-display text-4xl text-primary">
              Close to what matters
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {[
                ["Pantai Cenang", "8 min drive"],
                ["Langkawi SkyCab", "15 min drive"],
                ["Kuching Waterfront", "12 min drive"],
                ["Sarawak Museum", "10 min drive"],
              ].map(([place, time]) => (
                <div className="rounded-xl border bg-card p-4" key={place}>
                  <MapPin className="mb-3 size-5 text-accent" />
                  <p className="font-semibold">{place}</p>
                  <p className="text-xs text-muted-foreground">{time}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-display text-4xl text-primary">
              Questions, answered
            </h2>
            <div className="mt-7 divide-y overflow-hidden rounded-xl border bg-card">
              {[
                "What time is check-in and check-out?",
                "Is the homestay suitable for children?",
                "Can I bring pets?",
                "How do I make a booking?",
              ].map((q) => (
                <Link
                  to="/faq"
                  className="flex items-center justify-between p-4 text-sm hover:bg-muted"
                  key={q}
                >
                  {q}
                  <ArrowRight className="size-4" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="container-shell mb-8 flex flex-col items-start justify-between gap-6 rounded-2xl bg-primary px-7 py-8 text-primary-foreground sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <MessageCircle className="size-10" />
          <div>
            <h2 className="text-lg font-semibold">
              Need help choosing a stay?
            </h2>
            <p className="text-sm text-primary-foreground/70">
              Chat with us on WhatsApp. We’re happy to help.
            </p>
          </div>
        </div>
        <Button asChild variant="secondary">
          <a href="https://wa.me/60123456789" target="_blank" rel="noreferrer">
            Chat on WhatsApp
          </a>
        </Button>
      </section>
    </>
  );
}
