import { useEffect, useState } from "react";
import { Download, Share2, FileText } from "lucide-react";
import { listInvoices } from "./api";
import { useLanguage } from "./i18n";
import { money } from "./domain";
import type { PaymentInvoice } from "./invoice";
import { downloadInvoice, invoiceFile } from "./invoicePdf";
import { ErrorNotice } from "./components";

export default function PaymentInvoices({
  bookingId,
  revision,
}: {
  bookingId: string;
  revision: number;
}) {
  const { t, lang } = useLanguage();
  const [rows, setRows] = useState<PaymentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    listInvoices(bookingId)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch(() => {
        if (active) setError("invoiceLoadFailed");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [bookingId, revision, retry]);
  return (
    <section className="payment-invoices">
      <h3>{t("paymentInvoices")}</h3>
      <p className="small">{t("invoiceSendHelp")}</p>
      {loading ? (
        <p role="status">{t("loading")}</p>
      ) : error ? (
        <>
          <ErrorNotice code={error} />
          <button
            type="button"
            className="button outline"
            onClick={() => setRetry((n) => n + 1)}
          >
            {t("retryAvailability")}
          </button>
        </>
      ) : !rows.length ? (
        <p>{t("noInvoices")}</p>
      ) : (
        rows.map((row) => (
          <InvoiceRow key={`${row.payment_id}-${lang}`} invoice={row} />
        ))
      )}
    </section>
  );
}
function InvoiceRow({ invoice }: { invoice: PaymentInvoice }) {
  const { lang, t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setFile(null);
    setError("");
  }, [lang]);
  const prepare = async () => {
    setBusy(true);
    setError("");
    try {
      setFile(await invoiceFile(invoice, lang));
    } catch {
      setError("invoicePdfFailed");
    } finally {
      setBusy(false);
    }
  };
  const share = async () => {
    if (!file) return;
    setError("");
    try {
      await navigator.share({ files: [file], title: invoice.invoice_number });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError("invoiceShareFailed");
    }
  };
  return (
    <article className="invoice-row">
      <div>
        <strong>{invoice.invoice_number}</strong>
        <p>
          {invoice.kind === "refund" ? t("refundReceipt") : t("paymentInvoice")}{" "}
          · {money(invoice.amount_sen, lang)}
        </p>
        <small>
          {new Intl.DateTimeFormat(lang === "ms" ? "ms-MY" : "en-MY", {
            dateStyle: "medium",
            timeZone: "Asia/Kuala_Lumpur",
          }).format(new Date(invoice.issued_at))}{" "}
          · {invoice.snapshot.payment_reference}
        </small>
      </div>
      <div className="action-row">
        {!file ? (
          <button
            type="button"
            className="button outline"
            disabled={busy}
            onClick={() => void prepare()}
          >
            <FileText size={16} />
            {busy ? t("preparingPdf") : t("preparePdf")}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="button outline"
              onClick={() => downloadInvoice(file)}
            >
              <Download size={16} />
              {t("downloadPdf")}
            </button>
            {navigator.canShare?.({ files: [file] }) && (
              <button
                type="button"
                className="button outline"
                onClick={() => void share()}
              >
                <Share2 size={16} />
                {t("sharePdf")}
              </button>
            )}
          </>
        )}
      </div>
      <ErrorNotice code={error} />
    </article>
  );
}
