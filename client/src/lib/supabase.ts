import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../server/src/types/database.types";

// Placeholders keep static builds/test runners deterministic; deployments must
// provide the documented publishable values for network operations to work.
const url = import.meta.env.VITE_SUPABASE_URL ?? "http://127.0.0.1:54321";
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "local-publishable-key";

export const supabase = createClient<Database>(url, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});
