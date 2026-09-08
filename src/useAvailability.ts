import { useCallback, useEffect, useRef, useState } from "react";
import { availability, supabase } from "./api";
import type { Allocation } from "./domain";

// Fail closed while refreshing, and discard responses for superseded requests.
export function useAvailability(ci: string, co: string, selection = "") {
  const key = `${ci}|${co}|${selection}`;
  const sequence = useRef(0);
  const [result, setResult] = useState<{
    key: string;
    rows: Allocation[];
    loading: boolean;
    error: string;
  }>({ key: "", rows: [], loading: true, error: "" });
  const refresh = useCallback(async () => {
    const seq = ++sequence.current;
    if (!ci || !co || co <= ci) {
      setResult({ key, rows: [], loading: false, error: "" });
      return [];
    }
    setResult({ key, rows: [], loading: true, error: "" });
    try {
      const rows = await availability(ci, co);
      if (seq === sequence.current)
        setResult({ key, rows, loading: false, error: "" });
      return rows;
    } catch {
      if (seq === sequence.current)
        setResult({
          key,
          rows: [],
          loading: false,
          error: "AVAILABILITY_FAILED",
        });
      return null;
    }
  }, [key, ci, co]);
  useEffect(() => {
    void refresh();
    const update = () => {
      if (document.visibilityState !== "hidden") void refresh();
    };
    window.addEventListener("focus", update);
    window.addEventListener("storage", update);
    window.addEventListener("suka:availability", update);
    document.addEventListener("visibilitychange", update);
    const timer = window.setInterval(update, 30000);
    const channel = supabase
      ?.channel(`availability-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "availability_revision" },
        update,
      )
      .subscribe();
    return () => {
      sequence.current++;
      window.removeEventListener("focus", update);
      window.removeEventListener("storage", update);
      window.removeEventListener("suka:availability", update);
      document.removeEventListener("visibilitychange", update);
      clearInterval(timer);
      if (channel) void supabase?.removeChannel(channel);
    };
  }, [refresh]);
  useEffect(() => {
    const expiries = result.rows
      .flatMap((a) =>
        a.state === "pending" && a.expires_at ? [Date.parse(a.expires_at)] : [],
      )
      .filter((t) => t > Date.now());
    if (!expiries.length) return;
    const timer = setTimeout(
      () => void refresh(),
      Math.min(Math.min(...expiries) - Date.now() + 100, 2147483647),
    );
    return () => clearTimeout(timer);
  }, [result.rows, refresh]);
  return { ...result, loading: result.loading || result.key !== key, refresh };
}
