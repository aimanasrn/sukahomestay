import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";

export const metadata: Metadata = {
  title: "SukaHomestay | Comfortable Homestay and Roomstay Booking",
  description: "Book Full Homestay, individual Roomstay or the entire house with SukaHomestay.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip" href="#content">
          Skip to content
        </a>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
