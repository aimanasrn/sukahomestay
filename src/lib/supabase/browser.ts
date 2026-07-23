import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cijnvbduxaasqtgrysee.supabase.co";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNpam52YmR1eGFhc3F0Z3J5c2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ1MjYxNzUsImV4cCI6MjEwMDEwMjE3NX0.gqnpef5jDuWKYngLx2wrDpCYUoJHtZ-4PIMEmna6d4k";

  return createBrowserClient(url, key);
}
