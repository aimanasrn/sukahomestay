import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export function PasswordPage() {
  const reset = useLocation().pathname === "/reset-password";
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true);
    const result = reset
      ? await supabase.auth.updateUser({ password: value })
      : await supabase.auth.resetPasswordForEmail(value, { redirectTo: `${window.location.origin}/reset-password` });
    setPending(false);
    if (result.error) return toast.error(result.error.message);
    toast.success(reset ? "Password updated" : "Reset link sent");
    if (reset) navigate("/account");
  }
  return <section className="container-shell flex min-h-[620px] items-center justify-center">
    <Card className="w-full max-w-md"><CardHeader>
      <CardTitle>{reset ? "Choose a new password" : "Reset your password"}</CardTitle>
      <p className="text-sm text-muted-foreground">{reset ? "Use at least eight characters." : "Enter your account email and we’ll send a secure reset link."}</p>
    </CardHeader><CardContent><form className="flex flex-col gap-4" onSubmit={submit}>
      <label className="flex flex-col gap-2"><Label>{reset ? "New password" : "Email address"}</Label>
        <Input type={reset ? "password" : "email"} minLength={reset ? 8 : undefined} value={value} onChange={(e)=>setValue(e.target.value)} required />
      </label>
      <Button variant="terracotta" disabled={pending}>{pending ? "Please wait…" : reset ? "Update password" : "Send reset link"}</Button>
    </form></CardContent></Card>
  </section>;
}
