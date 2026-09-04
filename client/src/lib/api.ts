import type { ApiResponse } from "./types";
const base = import.meta.env.VITE_API_URL ?? "/api/v1";
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const authorization = data.session ? { Authorization: `Bearer ${data.session.access_token}` } : {};
  const response = await fetch(`${base}${path}`, {
    headers: { "Content-Type": "application/json", ...authorization, ...options?.headers },
    ...options,
  });
  const payload = (await response.json()) as ApiResponse<T> & {
    errors?: Array<{ field: string; message: string }>;
  };
  if (!response.ok)
    throw new ApiClientError(
      payload.message ?? "Request failed",
      response.status,
    );
  return payload.data;
}
import { supabase } from "./supabase";
