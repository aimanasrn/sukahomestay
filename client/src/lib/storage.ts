import { supabase } from "./supabase";

const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const receiptTypes = new Set([...imageTypes, "application/pdf"]);
const extension = (file: File) => ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" })[file.type];

export async function uploadAvatar(userId: string, file: File) {
  if (!imageTypes.has(file.type) || file.size > 2 * 1024 * 1024) throw new Error("Avatar must be JPEG, PNG, or WebP and no larger than 2 MB");
  const path = `${userId}/${crypto.randomUUID()}.${extension(file)}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error; return path;
}

export async function uploadPaymentReceipt(bookingId: string, file: File) {
  if (!receiptTypes.has(file.type) || file.size > 5 * 1024 * 1024) throw new Error("Receipt must be an image or PDF and no larger than 5 MB");
  const path = `${bookingId}/${crypto.randomUUID()}.${extension(file)}`;
  const { error } = await supabase.storage.from("payment-receipts").upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error; return path;
}

export async function getPrivateReceiptUrl(path: string) {
  const { data, error } = await supabase.storage.from("payment-receipts").createSignedUrl(path, 300);
  if (error) throw error; return data.signedUrl;
}
