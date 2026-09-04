import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
const pages: Record<
  string,
  { title: string; intro: string; sections: Array<[string, string]> }
> = {
  about: {
    title: "A warmer way to stay.",
    intro:
      "SUKA HOMESTAY brings together comfortable Malaysian homes chosen for real connection, easy arrivals and dependable care.",
    sections: [
      [
        "Homes with a sense of place",
        "We favour thoughtful spaces, local character and practical comforts over anonymous hotel rooms.",
      ],
      [
        "Hosted with care",
        "Our team prepares every home, confirms every detail and stays reachable throughout your trip.",
      ],
    ],
  },
  contact: {
    title: "We’re here to help.",
    intro:
      "Questions about a home, an upcoming stay or a special request? Talk to our local team.",
    sections: [
      ["WhatsApp", "Start a reservation or use your booking page to open the configured WhatsApp contact."],
      ["Email", "Send booking questions to hello@sukahomestay.test."],
    ],
  },
  faq: {
    title: "Questions, answered.",
    intro: "Everything you need to know before booking and arriving.",
    sections: [
      [
        "What time is check-in and check-out?",
        "Most homes welcome guests from 3:00 PM, with check-out by 11:00 AM.",
      ],
      [
        "Can I cancel my booking?",
        "Eligible confirmed bookings can be cancelled at least three days before check-in.",
      ],
      [
        "Can I book just one room?",
        "Yes. Selected homes support private room bookings as well as the entire property.",
      ],
      [
        "How long is a reservation hold?",
        "New requests are held for admin review. After approval, a separate manual-payment deadline applies.",
      ],
    ],
  },
  terms: {
    title: "Booking terms",
    intro: "These terms keep stays clear, fair and comfortable for everyone.",
    sections: [
      [
        "Reservations and payment",
        "A booking is confirmed only after an administrator verifies the manual bank transfer or DuitNow payment.",
      ],
      [
        "Cancellations",
        "The policy displayed on the property and checkout pages applies to your reservation.",
      ],
      [
        "Guest responsibility",
        "Guests must follow house rules, occupancy limits and local laws.",
      ],
    ],
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "We collect only the information needed to manage accounts, bookings, payments and guest support.",
    sections: [
      [
        "Information we use",
        "Contact details, booking preferences and payment references are used to deliver your stay.",
      ],
      [
        "How we protect it",
        "Sensitive credentials stay server-side. Authentication uses Supabase Auth and access is role restricted.",
      ],
      [
        "Your choices",
        "You may update notification preferences or request account assistance from our team.",
      ],
    ],
  },
};
export function ContentPage() {
  const key = useLocation().pathname.slice(1) || "about";
  const page = pages[key] ?? pages.about!;
  return (
    <section className="container-shell section-pad">
      <div className="max-w-3xl">
        <h1 className="font-display text-6xl text-primary">{page.title}</h1>
        <p className="mt-6 text-xl leading-8 text-muted-foreground">
          {page.intro}
        </p>
        <div className="mt-12 flex flex-col gap-10">
          {page.sections.map(([h, p]) => (
            <section key={h}>
              <h2 className="font-display text-3xl text-primary">{h}</h2>
              <p className="mt-3 leading-7 text-muted-foreground">{p}</p>
            </section>
          ))}
        </div>
        <Button asChild className="mt-12" variant="terracotta">
          <Link to="/search">Find a stay</Link>
        </Button>
      </div>
    </section>
  );
}
