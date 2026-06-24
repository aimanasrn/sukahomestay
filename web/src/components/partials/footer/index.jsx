import React from "react";
import { motion } from "framer-motion";
import { usePublicI18n } from "@/i18n/publicI18n";

const Footer = () => {
  const year = new Date().getFullYear();
  const { messages } = usePublicI18n();

  return (
    <motion.footer
      className="border-t border-[#eef1f6] bg-[linear-gradient(180deg,#fffaf5_0%,#ffffff_100%)]"
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
    >
      <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:px-6">
        <div>
          <p className="text-2xl font-semibold tracking-[-0.04em] text-[#16213e]">Sukahomestay</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-[#667085]">
            {messages.footer.description}
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">{messages.footer.explore}</p>
          <div className="mt-4 space-y-2 text-sm text-[#667085]">
            <a className="block hover:text-[#16213e]" href="/stays">{messages.nav.stays}</a>
            <a className="block hover:text-[#16213e]" href="/facilities">{messages.nav.facilities}</a>
            <a className="block hover:text-[#16213e]" href="/gallery">{messages.nav.gallery}</a>
            <a className="block hover:text-[#16213e]" href="/how-it-works">{messages.footer.howBookingWorks}</a>
            <a className="block hover:text-[#16213e]" href="/reviews">{messages.nav.reviews}</a>
            <a className="block hover:text-[#16213e]" href="/contact">{messages.nav.contact}</a>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#f97316]">{messages.footer.contact}</p>
          <div className="mt-4 space-y-2 text-sm text-[#667085]">
            <a className="block hover:text-[#16213e]" href="https://wa.me/60123456789">{messages.header.whatsappAdmin}</a>
            <a className="block hover:text-[#16213e]" href="mailto:admin@sukahomestay.com">admin@sukahomestay.com</a>
            <p className="pt-2">{messages.footer.copyright} {year} Sukahomestay</p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
