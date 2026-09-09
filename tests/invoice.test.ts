import { describe, it, expect } from "vitest";
import { demoInvoice } from "../src/invoice";
import { invoiceDocument } from "../src/invoicePdf";
import { demoCatalog } from "../src/data";
import type { Booking } from "../src/domain";
const booking = {
  id: "b",
  reference: "SUKA-1",
  name: "Guest",
  phone: "0100000000",
  email: "",
  check_in: "2026-10-10",
  check_out: "2026-10-12",
  resources: ["MAIN"],
  language: "en",
  paid_sen: 10001,
  quote: {
    items: [{ label: "MAIN", quantity: 2, unit_sen: 48000, total_sen: 96000 }],
    total_sen: 96000,
    nights: 2,
  },
  notes: "PRIVATE ADMIN NOTES",
} as Booking;
describe("payment invoices", () => {
  it("retains the payment-time balance independently from later booking changes", () => {
    const source = structuredClone(booking);
    const invoice = demoInvoice(
      source,
      demoCatalog.settings,
      10001,
      "BANK-1",
      "payment",
      "p1",
    );
    const old = invoice.snapshot.quote.total_sen;
    source.paid_sen = 96000;
    source.quote.total_sen = 99999;
    expect(invoice.snapshot.net_paid_sen).toBe(10001);
    expect(invoice.snapshot.balance_sen).toBe(85999);
    expect(invoice.snapshot.quote.total_sen).toBe(old);
    expect(JSON.stringify(invoice)).not.toContain("PRIVATE ADMIN NOTES");
  });
  it("labels one payment separately from booking total and renders cents in BM and EN", () => {
    const invoice = demoInvoice(
      booking,
      demoCatalog.settings,
      10001,
      "BANK-1",
      "payment",
      "p1",
    );
    const en = JSON.stringify(invoiceDocument(invoice, "en"));
    const ms = JSON.stringify(invoiceDocument(invoice, "ms"));
    expect(en).toContain("THIS PAYMENT RECEIVED");
    expect(en).toContain("RM 100.01");
    expect(en).toContain("RM 859.99");
    expect(ms).toContain("BAYARAN INI DITERIMA");
  });
  it("uses a separate refund document instead of rewriting a payment invoice", () => {
    const invoice = demoInvoice(
      booking,
      demoCatalog.settings,
      500,
      "BANK-REFUND",
      "refund",
      "r1",
    );
    expect(invoice.invoice_number).toContain("RF");
    expect(JSON.stringify(invoiceDocument(invoice, "en"))).toContain(
      "REFUND RECEIPT",
    );
  });
});
