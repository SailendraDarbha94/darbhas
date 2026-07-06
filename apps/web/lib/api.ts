import type { Application, Tenant, TenantWithWorks, Work } from "@darbha/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4400/v1";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { revalidate?: number } = {},
): Promise<T> {
  const { revalidate, ...rest } = init;
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: { "Content-Type": "application/json", ...rest.headers },
    ...(revalidate !== undefined ? { next: { revalidate } } : {}),
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(", ") : (body.message ?? message);
    } catch {
      // keep statusText
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

/* ----- public (server components) ----- */

export function getTenants(): Promise<Tenant[]> {
  return request<Tenant[]>("/tenants", { revalidate: 60 });
}

export function getTenantBySlug(slug: string): Promise<TenantWithWorks> {
  return request<TenantWithWorks>(`/tenants/${encodeURIComponent(slug)}`, { revalidate: 60 });
}

/* ----- authed (admin dashboard, client side) ----- */

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const adminApi = {
  listApplications: (token: string, status?: string) =>
    request<Application[]>(`/applications${status ? `?status=${status}` : ""}`, {
      headers: authHeaders(token),
      cache: "no-store",
    }),
  reviewApplication: (token: string, id: string, status: "approved" | "rejected") =>
    request<unknown>(`/applications/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    }),
  listAllTenants: (token: string) =>
    request<Tenant[]>("/tenants/all", { headers: authHeaders(token), cache: "no-store" }),
  updateTenant: (token: string, id: string, data: Partial<Tenant>) =>
    request<Tenant>(`/tenants/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
  listWorks: (token: string) =>
    request<(Work & { tenant?: { slug: string; displayName: string } })[]>("/works", {
      headers: authHeaders(token),
      cache: "no-store",
    }),
  getWork: (token: string, id: string) =>
    request<Work>(`/works/${id}`, { headers: authHeaders(token), cache: "no-store" }),
  createWork: (token: string, data: Partial<Work>) =>
    request<Work>("/works", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
  updateWork: (token: string, id: string, data: Partial<Work>) =>
    request<Work>(`/works/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(data),
    }),
  deleteWork: (token: string, id: string) =>
    request<{ ok: boolean }>(`/works/${id}`, { method: "DELETE", headers: authHeaders(token) }),
};

export function submitApplication(data: {
  firstName: string;
  lastName: string;
  requestedSlug: string;
  email: string;
  message?: string;
  genre: string;
}) {
  return request<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
