import { Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
export function SiteFooter() {
  return (
    <footer className="bg-primary py-14 text-primary-foreground">
      <div className="container-shell grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-2xl">SUKA HOMESTAY</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-primary-foreground/70">
            Thoughtful homestays for family time, quiet weekends and everything
            in between.
          </p>
          <div className="mt-5 flex gap-4">
            <Instagram aria-label="Instagram" />
            <Youtube aria-label="YouTube" />
          </div>
        </div>
        {[
          ["Explore", ["All stays", "Destinations", "Long stays"]],
          ["About", ["About us", "Our homes", "House rules"]],
          ["Support", ["Help & FAQs", "Booking terms", "Contact us"]],
        ].map(([title, items]) => (
          <div key={title as string}>
            <p className="mb-4 font-semibold">{title as string}</p>
            <ul className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              {(items as string[]).map((i) => (
                <li key={i}>
                  <Link to="/faq" className="hover:text-white">
                    {i}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-shell mt-12 flex flex-col gap-3 border-t border-white/20 pt-6 text-xs text-primary-foreground/60 sm:flex-row sm:justify-between">
        <p>© 2026 SUKA HOMESTAY. All rights reserved.</p>
        <div className="flex gap-5">
          <Link to="/privacy">Privacy policy</Link>
          <Link to="/terms">Terms of service</Link>
        </div>
      </div>
    </footer>
  );
}
