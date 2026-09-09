import type { Booking, Lang, Quote, Resource, Settings } from "./domain";

export interface PaymentInvoice {
  payment_id: string;
  booking_id: string;
  invoice_number: string;
  issued_at: string;
  kind: "payment" | "refund";
  amount_sen: number;
  snapshot: {
    version: number;
    booking_reference: string;
    name: string;
    phone: string;
    email: string;
    check_in: string;
    check_out: string;
    resources: Resource[];
    quote: Quote;
    language: Lang;
    payment_reference: string;
    net_paid_sen: number;
    balance_sen: number;
    seller: { name: string; address: string; email: string; phone: string };
  };
}

export function demoInvoice(
  b: Booking,
  settings: Settings,
  amount: number,
  reference: string,
  kind: PaymentInvoice["kind"],
  paymentId: string,
): PaymentInvoice {
  return {
    payment_id: paymentId,
    booking_id: b.id,
    invoice_number: `DEMO-${kind === "payment" ? "INV" : "RF"}-${paymentId}`,
    issued_at: new Date().toISOString(),
    kind,
    amount_sen: amount,
    snapshot: {
      version: 1,
      booking_reference: b.reference,
      name: b.name,
      phone: b.phone,
      email: b.email,
      check_in: b.check_in,
      check_out: b.check_out,
      resources: [...b.resources],
      quote: structuredClone(b.quote),
      language: b.language,
      payment_reference: reference,
      net_paid_sen: b.paid_sen,
      balance_sen: b.quote.total_sen - b.paid_sen,
      seller: {
        name: "SUKA HOMESTAY",
        address: settings.address,
        email: settings.contact_email,
        phone: settings.whatsapp,
      },
    },
  };
}
