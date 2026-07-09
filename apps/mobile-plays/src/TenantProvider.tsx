import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { TenantWithWorks, Work } from "@darbha/types";
import { fetchTenant } from "./api";

interface TenantContextValue {
  tenant: TenantWithWorks | null;
  error: string | null;
  refreshing: boolean;
  refresh: () => Promise<void>;
  findWork: (id: string) => Work | undefined;
}

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantWithWorks | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setTenant(await fetchTenant());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const findWork = useCallback(
    (id: string) => tenant?.works.find((w) => w.id === id),
    [tenant],
  );

  return (
    <TenantContext.Provider value={{ tenant, error, refreshing, refresh, findWork }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
