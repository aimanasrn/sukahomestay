import { supabaseAdmin } from "../config/supabase.js";
import { sql } from "../config/database.js";
import { ApiError } from "../utils/api-error.js";

export async function createReceiptSignedUrl(paymentId: string) {
  const rows = await sql<{ receipt_path: string | null }[]>`select receipt_path from public.manual_payments where id=${paymentId} limit 1`;
  const path = rows[0]?.receipt_path;
  if (!path) throw new ApiError(404, "Payment receipt not found");
  const { data, error } = await supabaseAdmin.storage.from("payment-receipts").createSignedUrl(path, 300);
  if (error) throw new ApiError(502, "Unable to create receipt link", "STORAGE_ERROR");
  return { signedUrl: data.signedUrl, expiresIn: 300 };
}
