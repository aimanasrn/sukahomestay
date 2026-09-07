import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { BookingInput, Catalog } from "./domain";
import { defaultBooking, getCatalog } from "./api";
import { demoCatalog } from "./data";
const Context = createContext<{
  catalog: Catalog;
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  draft: BookingInput;
  setDraft: (p: Partial<BookingInput>) => void;
  reset: () => void;
}>({
  catalog: demoCatalog,
  loading: true,
  error: "",
  reload: async () => {},
  draft: defaultBooking(),
  setDraft: () => {},
  reset: () => {},
});
export function AppProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState(demoCatalog);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draft, set] = useState<BookingInput>(defaultBooking);
  const reload = async () => {
    try {
      setCatalog(await getCatalog());
      setError("");
    } catch {
      setError("REQUEST_FAILED");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void reload();
  }, []);
  return (
    <Context.Provider
      value={{
        catalog,
        loading,
        error,
        reload,
        draft,
        setDraft: (p) => set((d) => ({ ...d, ...p })),
        reset: () => set(defaultBooking()),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
