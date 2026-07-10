import type { TenantWithWorks } from './types';

// Public configuration only — the API is a public read endpoint, no secrets.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4400/v1';
export const TENANT_SLUG = process.env.EXPO_PUBLIC_TENANT_SLUG ?? 'baburao';

/** The tenant and all their published works, in one call. */
export async function fetchTenant(): Promise<TenantWithWorks> {
  const res = await fetch(`${API_URL}/tenants/${TENANT_SLUG}`);
  if (!res.ok) {
    throw new Error(`Could not load the works (HTTP ${res.status})`);
  }
  return (await res.json()) as TenantWithWorks;
}
