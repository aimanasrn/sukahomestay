import type {
  TDocumentDefinitions,
  Content,
  TableCell,
} from "pdfmake/interfaces";
import { formatDate, money, names, type Lang } from "./domain";
import type { PaymentInvoice } from "./invoice";

export function invoiceDocument(
  invoice: PaymentInvoice,
  lang: Lang,
): TDocumentDefinitions {
  const s = invoice.snapshot;
  const ms = lang === "ms";
  const label = (bm: string, en: string) => (ms ? bm : en);
  const title =
    invoice.kind === "payment"
      ? label("INVOIS / RESIT BAYARAN", "INVOICE / PAYMENT RECEIPT")
      : label("RESIT BAYARAN BALIK", "REFUND RECEIPT");
  const amount = (n: number) =>
    new Intl.NumberFormat(lang === "ms" ? "ms-MY" : "en-MY", {
      style: "currency",
      currency: "MYR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
      .format(n / 100)
      .replace(/\u00a0/g, " ");
  const issued = new Intl.DateTimeFormat(ms ? "ms-MY" : "en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kuala_Lumpur",
  }).format(new Date(invoice.issued_at));
  const seller = [s.seller.address, s.seller.email, s.seller.phone]
    .filter(Boolean)
    .join("\n");
  const itemLabel = (value: string) =>
    names[value as keyof typeof names]?.[lang] ||
    (value === "cleaning" ? label("Caj pembersihan", "Cleaning fee") : value);
  const content: Content[] = [
    {
      text: s.seller.name,
      fontSize: 25,
      bold: true,
      color: "#192238",
      margin: [0, 0, 0, 5],
    },
    { text: seller, color: "#535D70", margin: [0, 0, 0, seller ? 20 : 0] },
    {
      text: title,
      fontSize: 17,
      bold: true,
      color: "#C44F00",
      margin: [0, 10, 0, 12],
    },
    { text: invoice.invoice_number, bold: true, fontSize: 11 },
    {
      text: `${label("Tarikh dikeluarkan", "Issued")}: ${issued} (MYT)`,
      margin: [0, 5, 0, 18],
    },
    {
      columns: [
        {
          width: "*",
          stack: [
            { text: label("KEPADA", "BILL TO"), style: "label" },
            { text: s.name, bold: true },
            { text: s.phone },
            { text: s.email },
          ],
        },
        {
          width: "*",
          stack: [
            { text: label("TEMPAHAN", "BOOKING"), style: "label" },
            { text: s.booking_reference, bold: true },
            {
              text: `${formatDate(s.check_in, lang)} - ${formatDate(s.check_out, lang)}`,
            },
            { text: s.resources.map((r) => names[r][lang]).join(" + ") },
            { text: `${s.quote.nights} ${label("malam", "nights")}` },
          ],
        },
      ],
      columnGap: 25,
      margin: [0, 0, 0, 22],
    },
    {
      table: {
        headerRows: 1,
        widths: ["*", 38, 82, 82],
        body: [
          [
            label("Butiran penginapan", "Stay charges"),
            label("Kuantiti", "Qty"),
            label("Kadar", "Rate"),
            label("Jumlah", "Amount"),
          ].map((text) => ({ text, bold: true, fillColor: "#EAF5FF" })),
          ...s.quote.items.map((i): TableCell[] => [
            { text: itemLabel(i.label) },
            String(i.quantity),
            { text: amount(i.unit_sen), alignment: "right" },
            { text: amount(i.total_sen), alignment: "right" },
          ]),
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 16],
    },
    {
      text: `${label("Jumlah tempahan", "Booking total")}: ${amount(s.quote.total_sen)}`,
      alignment: "right",
      bold: true,
      margin: [0, 0, 0, 18],
    },
    {
      table: {
        widths: ["*", "auto"],
        body: [
          [
            {
              text:
                invoice.kind === "payment"
                  ? label("BAYARAN INI DITERIMA", "THIS PAYMENT RECEIVED")
                  : label("BAYARAN BALIK INI", "THIS REFUND"),
              bold: true,
              color: "#FFFFFF",
              fillColor: "#C44F00",
            },
            {
              text: amount(invoice.amount_sen),
              bold: true,
              color: "#FFFFFF",
              fillColor: "#C44F00",
              alignment: "right",
            },
          ],
          [
            label(
              "Bayaran bersih selepas transaksi ini",
              "Net paid after this transaction",
            ),
            { text: amount(s.net_paid_sen), alignment: "right" },
          ],
          [
            label(
              "Baki selepas transaksi ini",
              "Balance after this transaction",
            ),
            { text: amount(s.balance_sen), alignment: "right" },
          ],
        ],
      },
      layout: "lightHorizontalLines",
      margin: [0, 0, 0, 16],
    },
    {
      text: `${label("Rujukan bayaran", "Payment reference")}: ${s.payment_reference}`,
      margin: [0, 0, 0, 18],
    },
    {
      text: label(
        "Dokumen ini merekodkan satu transaksi bayaran sahaja. Jumlah penginapan ditunjukkan untuk rujukan. Bayaran atau bayaran balik kemudian mempunyai dokumen berasingan.",
        "This document records one payment transaction. Stay charges are shown for reference. Later payments or refunds have separate documents.",
      ),
      fontSize: 9,
      color: "#535D70",
    },
    {
      text: label(
        "Terima kasih kerana memilih SUKA HOMESTAY.",
        "Thank you for choosing SUKA HOMESTAY.",
      ),
      margin: [0, 14, 0, 0],
      color: "#C44F00",
    },
  ];
  return {
    pageSize: "A4",
    pageMargins: [42, 42, 42, 52],
    defaultStyle: {
      font: "Roboto",
      fontSize: 10,
      color: "#192238",
      lineHeight: 1.25,
    },
    styles: { label: { fontSize: 9, color: "#667085", margin: [0, 0, 0, 7] } },
    content,
    info: {
      title: `${title} ${invoice.invoice_number}`,
      author: "SUKA HOMESTAY",
      subject: s.booking_reference,
    },
    footer: (page, count) => ({
      text: `SUKA HOMESTAY | ${invoice.invoice_number} | ${page} / ${count}`,
      alignment: "center",
      fontSize: 8,
      color: "#667085",
      margin: [42, 18, 42, 0],
    }),
    ...(invoice.invoice_number.startsWith("DEMO-")
      ? { watermark: { text: "DEMO", color: "#667085", opacity: 0.08 } }
      : {}),
  };
}

export async function invoiceFile(
  invoice: PaymentInvoice,
  lang: Lang,
): Promise<File> {
  const [{ default: pdfMake }, { default: fonts }] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    import("pdfmake/build/vfs_fonts"),
  ]);
  pdfMake.addVirtualFileSystem(fonts);
  const blob = await pdfMake
    .createPdf(invoiceDocument(invoice, lang))
    .getBlob();
  return new File([blob], `${invoice.invoice_number}-${lang}.pdf`, {
    type: "application/pdf",
  });
}
export function downloadInvoice(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
