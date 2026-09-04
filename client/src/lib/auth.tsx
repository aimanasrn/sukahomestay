import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type Role = "CUSTOMER" | "ADMIN";
type AuthState = { session: Session | null; user: User | null; role: Role | null; loading: boolean };
const AuthContext = createContext<AuthState>({ session: null, user: null, role: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, user: null, role: null, loading: true });
  useEffect(() => {
    let current = true;
    const apply = async (session: Session | null) => {
      let role: Role | null = null;
      if (session?.user) {
        const { data } = await supabase.from("profiles").select("role").eq("id", session.user.id).maybeSingle();
        role = data?.role ?? null;
      }
      if (current) setState({ session, user: session?.user ?? null, role, loading: false });
    };
    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => { void apply(session); });
    return () => { current = false; data.subscription.unsubscribe(); };
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
