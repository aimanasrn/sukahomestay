"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Lock, Mail, User as UserIcon, ArrowRight, AlertCircle } from "lucide-react";

function AuthForm() {
  const pathname = usePathname();
  const signup = pathname === "/signup";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const name = String(form.get("name") || "");
    const supabase = createClient();

    const result = signup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (signup) {
      setMessage("Account created successfully! You can now log in.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Unable to verify session after login.");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const next = searchParams.get("next");
    router.push(next?.startsWith("/") ? next : profile?.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <section className="section">
      <div className="shell" style={{ maxWidth: 520 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <span className="eyebrow">SUKAHOMESTAY ACCOUNT</span>
          <h1 className="title" style={{ fontSize: "2.2rem" }}>
            {signup ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="lead" style={{ fontSize: "0.95rem", margin: "0 auto" }}>
            {signup
              ? "Sign up to easily track your homestay reservations and upload receipts."
              : "Log in to manage your bookings and view your stay details."}
          </p>
        </div>

        <div className="form-card">
          <form className="form" onSubmit={submit}>
            {signup && (
              <div className="field-group">
                <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>Full Name</label>
                <div style={{ position: "relative" }}>
                  <UserIcon size={18} style={{ position: "absolute", left: 14, top: 16, color: "var(--muted)" }} />
                  <input name="name" required placeholder="Full Name" style={{ paddingLeft: 42 }} />
                </div>
              </div>
            )}

            <div className="field-group">
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <Mail size={18} style={{ position: "absolute", left: 14, top: 16, color: "var(--muted)" }} />
                <input name="email" type="email" required placeholder="name@example.com" style={{ paddingLeft: 42 }} />
              </div>
            </div>

            <div className="field-group">
              <label style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--navy)", marginBottom: 6, display: "block" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={18} style={{ position: "absolute", left: 14, top: 16, color: "var(--muted)" }} />
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="Minimum 8 characters"
                  style={{ paddingLeft: 42 }}
                />
              </div>
            </div>

            {message && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--rose)", fontSize: "0.9rem" }}>
                <AlertCircle size={16} />
                <span>{message}</span>
              </div>
            )}

            <button className="button" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
              <span>{loading ? "Please wait..." : signup ? "Create Account" : "Log In"}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)", textAlign: "center", fontSize: "0.9rem", color: "var(--muted)" }}>
            {signup ? "Already have an account?" : "New to SukaHomestay?"}{" "}
            <Link
              href={signup ? "/login" : "/signup"}
              style={{ color: "var(--primary)", fontWeight: 700 }}
            >
              {signup ? "Log In Here" : "Create An Account"}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<section className="section"><div className="shell">Loading authentication...</div></section>}>
      <AuthForm />
    </Suspense>
  );
}
