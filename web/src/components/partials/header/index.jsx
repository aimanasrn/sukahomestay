import React from "react";
import { motion } from "framer-motion";
import { Link, NavLink } from "react-router-dom";
import { usePublicI18n } from "@/i18n/publicI18n";
import Button from "@/components/ui/Button";

const Header = () => {
  const { messages } = usePublicI18n();
  const navItems = [
    { label: messages.nav.home, to: "/" },
    { label: messages.nav.stays, to: "/stays" },
    { label: messages.nav.facilities, to: "/facilities" },
    { label: messages.nav.gallery, to: "/gallery" },
    { label: messages.nav.howItWorks, to: "/how-it-works" },
    { label: messages.nav.reviews, to: "/reviews" },
    { label: messages.nav.contact, to: "/contact" },
  ];

  return (
    <motion.header
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-[#eef1f6] bg-white/95 backdrop-blur"
      initial={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-6">
        <Link className="flex items-center gap-3 text-[#16213e]" to="/">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ff7a1a] text-lg font-bold text-white">
            S
          </span>
          <span>
            <span className="block text-2xl font-semibold tracking-[-0.03em]">Sukahomestay</span>
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-[#98a2b3]">
              {messages.header.brandTag}
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-[#475467]">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 transition ${
                  isActive
                    ? "text-[#ff7a1a]"
                    : "hover:text-[#16213e]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button
            className="border border-[#ffb98a] bg-white px-5 text-[#ff7a1a] hover:bg-[#fff6ef]"
            link="/availability"
            text={messages.header.startBooking}
          />
          <Button
            className="bg-[#ff7a1a] px-5 text-white hover:bg-[#ef6d10]"
            div
            onClick={() =>
              window.open(
                "https://wa.me/60123456789",
                "_blank",
                "noopener,noreferrer"
              )
            }
            text={messages.header.whatsappAdmin}
          />
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
