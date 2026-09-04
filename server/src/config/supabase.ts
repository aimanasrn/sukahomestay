import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";
import type { Database } from "../types/database.types.js";

const auth = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false };
export const supabasePublic = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_PUBLISHABLE_KEY, { auth });
// Bypasses RLS; use only after backend authorization.
export const supabaseAdmin = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, { auth });
