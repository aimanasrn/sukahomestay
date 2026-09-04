import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "../..");
const migration = readFileSync(resolve(root, "supabase/migrations/20260904025147_initial_supabase_schema.sql"), "utf8");
const clientFiles = ["client/src/lib/supabase.ts", "client/.env.example"].map((p)=>readFileSync(resolve(root,p),"utf8")).join("\n");

describe("Supabase security configuration", () => {
  it("enables RLS for every application table", () => { expect(migration).toContain("alter table public.%I enable row level security"); expect(migration).toContain("'audit_logs','app_settings'"); });
  it("does not expose service credentials in frontend source", () => { expect(clientFiles).not.toMatch(/SUPABASE_(SECRET|SERVICE_ROLE)/); expect(clientFiles).not.toMatch(/service_role/i); });
  it("keeps expiry privileged and outside public", () => { expect(migration).toContain("private.expire_reservations"); expect(migration).toContain("revoke all on function private.expire_reservations(timestamptz) from public, anon, authenticated"); });
  it("uses a private receipt bucket", () => { expect(migration).toMatch(/'payment-receipts', 'payment-receipts', false/); });
});
