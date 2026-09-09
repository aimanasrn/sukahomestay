import { describe, it, expect } from "vitest";
import { demoInvoice } from "../src/invoice";
import { invoiceDocument, invoiceFile } from "../src/invoicePdf";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
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
  it("brands old snapshots and formats nightly room labels without changing financial records", () => {
    const invoice = demoInvoice(
      booking,
      demoCatalog.settings,
      10001,
      "BANK-1",
      "payment",
      "p1",
    );
    invoice.snapshot.seller.name = "SUKA HOMESTAY";
    invoice.snapshot.quote.items[0].label = "ROOM_B|2026-10-10";
    const original = structuredClone(invoice);
    const doc = invoiceDocument(invoice, "en");
    const text = JSON.stringify(doc);
    expect(text).toContain("SUKA Room&Homestay");
    expect(text).not.toContain("SUKA HOMESTAY");
    expect(text).toContain("Roomstay 2");
    expect(text).toContain("10 Oct 2026");
    expect(text).not.toContain("ROOM_B|");
    expect(text).toContain("data:image/png;base64,");
    expect(invoice).toEqual(original);
  });

  it("generates branded payment and refund PDFs with embedded logo", async () => {
    const invoice = demoInvoice(
      booking,
      demoCatalog.settings,
      62000,
      "BANK-TRANSFER / DEPOSIT",
      "payment",
      "PREVIEW",
    );
    invoice.snapshot.seller.name = "SUKA HOMESTAY";
    invoice.snapshot.resources = ["MAIN", "ROOM_B"];
    invoice.snapshot.quote.items = [
      "MAIN|2026-10-10",
      "MAIN|2026-10-11",
      "ROOM_B|2026-10-10",
      "ROOM_B|2026-10-11",
    ].map((label) => ({
      label,
      quantity: 1,
      unit_sen: label.startsWith("MAIN") ? 48000 : 14000,
      total_sen: label.startsWith("MAIN") ? 48000 : 14000,
    }));
    invoice.snapshot.quote.total_sen = 124000;
    invoice.snapshot.net_paid_sen = 62000;
    invoice.snapshot.balance_sen = 62000;
    for (const lang of ["ms", "en"] as const) {
      const file = await invoiceFile(invoice, lang);
      const bytes = Buffer.from(await file.arrayBuffer());
      expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
      expect(bytes.length).toBeGreaterThan(10000);
      if (process.env.SUKA_PDF_QA_DIR) {
        await mkdir(process.env.SUKA_PDF_QA_DIR, { recursive: true });
        await writeFile(
          path.join(process.env.SUKA_PDF_QA_DIR, `invoice-preview-${lang}.pdf`),
          bytes,
        );
      }
    }
    const refund = await invoiceFile(
      { ...invoice, kind: "refund", amount_sen: 10000 },
      "en",
    );
    expect(refund.type).toBe("application/pdf");
    // Long stays exercise repeated table headings and multi-page layout.
    invoice.snapshot.quote.items = Array.from(
      { length: 60 },
      () => invoice.snapshot.quote.items[0],
    );
    const longFile = await invoiceFile(invoice, "en");
    if (process.env.SUKA_PDF_QA_DIR)
      await writeFile(
        path.join(process.env.SUKA_PDF_QA_DIR, "invoice-long-preview.pdf"),
        Buffer.from(await longFile.arrayBuffer()),
      );
    expect(longFile.size).toBeGreaterThan(10000);
  }, 20000);
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
