import Constants from "expo-constants";
import type { TenantWithWorks } from "@darbha/types";

const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; tenantSlug?: string };

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? extra.apiUrl ?? "http://localhost:4400/v1";
export const TENANT_SLUG = process.env.EXPO_PUBLIC_TENANT_SLUG ?? extra.tenantSlug ?? "kameswara";

export async function fetchTenant(): Promise<TenantWithWorks> {
  const res = await fetch(`${API_URL}/tenants/${TENANT_SLUG}`);
  if (!res.ok) {
    throw new Error(`Could not load the plays (HTTP ${res.status})`);
  }
  return res.json() as Promise<TenantWithWorks>;
}
