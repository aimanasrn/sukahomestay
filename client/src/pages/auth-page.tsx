import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
const schema = z.object({
  fullName: z.string().optional(),
  email: z.email(),
  password: z.string().min(8, "Use at least 8 characters"),
});
type Form = z.infer<typeof schema>;
export function AuthPage() {
  const register = useLocation().pathname === "/register";
  const navigate = useNavigate();
  const form = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: register ? "" : "guest@sukahomestay.test",
      password: register ? "" : "Guest123!",
      fullName: "",
    },
  });
  const mutation = useMutation({
    mutationFn: async (formData: Form) => {
      if (register) {
        const { data, error } = await supabase.auth.signUp({ email: formData.email, password: formData.password, options: { data: { full_name: formData.fullName ?? "" }, emailRedirectTo: `${window.location.origin}/account` } });
        if (error) throw error;
        return { session: data.session, role: "CUSTOMER" };
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) throw error;
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      return { session: data.session, role: profile?.role ?? "CUSTOMER" };
    },
    onSuccess: (data) => {
      if (register && !data.session) {
        toast.success("Check your email to verify your account");
        navigate("/login");
        return;
      }
      toast.success(register ? "Welcome to SUKA HOMESTAY" : "Welcome back");
      navigate(data.role === "ADMIN" ? "/admin" : "/account");
    },
    onError: (e) => toast.error(e.message),
  });
  return (
    <section className="container-shell grid min-h-[690px] items-center gap-10 py-16 lg:grid-cols-2">
      <div>
        <h1 className="max-w-lg font-display text-6xl leading-[1] text-primary">
          {register
            ? "Your next good stay starts here."
            : "Good to have you back."}
        </h1>
        <p className="mt-6 max-w-md text-lg leading-8 text-muted-foreground">
          {register
            ? "Create an account to book, manage stays and keep every detail close."
            : "Sign in to view upcoming stays, confirmations and payment details."}
        </p>
      </div>
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>{register ? "Create your account" : "Log in"}</CardTitle>
          <CardDescription>
            {register
              ? "It only takes a minute."
              : "Use your email and password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-5"
            onSubmit={form.handleSubmit((d) => mutation.mutate(d))}
          >
            {register && (
              <label className="flex flex-col gap-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  aria-invalid={!!form.formState.errors.fullName}
                  {...form.register("fullName")}
                />
              </label>
            )}
            <label className="flex flex-col gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
            </label>
            <label className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                aria-invalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              <span className="text-xs text-destructive">
                {form.formState.errors.password?.message}
              </span>
            </label>
            {!register && (
              <Link
                className="self-end text-sm font-semibold text-accent"
                to="/forgot-password"
              >
                Forgot password?
              </Link>
            )}
            <Button
              disabled={mutation.isPending}
              type="submit"
              size="lg"
              variant="terracotta"
            >
              {mutation.isPending
                ? "Please wait…"
                : register
                  ? "Create account"
                  : "Log in"}
              <ArrowRight data-icon="inline-end" />
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              {register ? "Already have an account?" : "New to SUKA HOMESTAY?"}{" "}
              <Link
                className="font-semibold text-primary"
                to={register ? "/login" : "/register"}
              >
                {register ? "Log in" : "Create account"}
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
