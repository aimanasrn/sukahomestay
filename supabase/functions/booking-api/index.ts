import { createClient } from "npm:@supabase/supabase-js@2.115.0";

const origin = Deno.env.get("ALLOWED_ORIGIN") || "";
const url = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const db = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const cors = {
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  Vary: "Origin",
  "Cache-Control": "no-store",
};
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
const allowedErrors = [
  "INVALID_DATES",
  "INVALID_RESOURCES",
  "INVALID_CUSTOMER",
  "POLICY_REQUIRED",
  "BOOKING_NOT_CONFIGURED",
  "CAPACITY_NOT_CONFIGURED",
  "CAPACITY_EXCEEDED",
  "RATE_LIMITED",
  "IDEMPOTENCY_MISMATCH",
  "FORBIDDEN",
  "INVALID_STATUS",
  "PAYMENT_REQUIRED",
  "INVALID_PAYMENT",
  "INVALID_BLOCK",
  "INVALID_INPUT",
];
Deno.serve(async (req: Request) => {
  if (!origin || req.headers.get("origin") !== origin)
    return response({ error: "FORBIDDEN" }, 403);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  if (req.method !== "POST")
    return response({ error: "METHOD_NOT_ALLOWED" }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 16000) return response({ error: "INVALID_INPUT" }, 413);
    const body = JSON.parse(raw);
    if (body.action === "submit") {
      const secret = Deno.env.get("TURNSTILE_SECRET_KEY");
      if (!secret) return response({ error: "BOOKING_NOT_CONFIGURED" }, 503);
      const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const verify = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          body: new URLSearchParams({
            secret,
            response: body.turnstile_token || "",
            remoteip: ip,
          }),
        },
      );
      const verified = await verify.json();
      if (!verified.success || verified.hostname !== new URL(origin).hostname)
        return response({ error: "CAPTCHA_REQUIRED" }, 400);
      const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(ip + secret),
      );
      const ipHash = Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const { data, error } = await db.rpc("create_booking", {
        p: body.booking,
        ip_hash: ipHash,
      });
      if (error) throw error;
      return response({ data });
    }
    if (body.action === "admin") {
      const jwt = req.headers.get("authorization")?.replace(/^Bearer /i, "");
      if (!jwt) return response({ error: "FORBIDDEN" }, 401);
      const {
        data: { user },
        error: authError,
      } = await db.auth.getUser(jwt);
      if (authError || !user) return response({ error: "FORBIDDEN" }, 401);
      const { data: profile } = await db
        .from("admin_profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!profile) return response({ error: "FORBIDDEN" }, 403);
      const { data, error } = await db.rpc("admin_action", {
        actor: user.id,
        p: body.payload,
      });
      if (error) throw error;
      return response({ data });
    }
    return response({ error: "INVALID_ACTION" }, 400);
  } catch (error) {
    const e = error as { message?: string; code?: string };
    const code =
      e.code === "23P01"
        ? "UNAVAILABLE"
        : allowedErrors.find((c) => e.message?.includes(c)) || "REQUEST_FAILED";
    // Do not return database details: exclusion errors can contain booking identifiers.
    return response({ error: code }, code === "UNAVAILABLE" ? 409 : 400);
  }
});
