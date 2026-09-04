import postgres from "postgres";
import { env } from "./env.js";

// prepare:false is compatible with Supavisor transaction mode. Critical
// reservation operations stay on one transaction connection.
export const sql = postgres(env.SUPABASE_DATABASE_URL, {
  max: env.NODE_ENV === "test" ? 1 : 10,
  prepare: false,
  ssl: env.SUPABASE_DATABASE_URL.includes("127.0.0.1") || env.SUPABASE_DATABASE_URL.includes("localhost") ? false : "require",
  idle_timeout: 20,
  connect_timeout: 10,
});
