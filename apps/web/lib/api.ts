import type {
  Application,
  ClapState,
  InviteResult,
  ProfileRole,
  Tenant,
  TenantWithWorks,
  Work,
} from "@darbha/types";

/** GET /tenants/me — the signed-in caller's role and own tenant (null for unlinked admins). */
export interface Me {
  role: ProfileRole;
  tenantId: string | null;
  tenant: Tenant | null;
}

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
  me: (token: string) =>
    request<Me>("/tenants/me", { headers: authHeaders(token), cache: "no-store" }),
  listApplications: (token: string, status?: string) =>
    request<Application[]>(`/applications${status ? `?status=${status}` : ""}`, {
      headers: authHeaders(token),
      cache: "no-store",
    }),
  reviewApplication: (token: string, id: string, status: "approved" | "rejected") =>
    request<ReviewResult>(`/applications/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify({ status }),
    }),
  inviteWriter: (token: string, tenantId: string, email: string) =>
    request<InviteResult>(`/tenants/${tenantId}/invite`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ email }),
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

/** PATCH /applications/:id — rejection returns just the application. */
export interface ReviewResult {
  application?: Application;
  tenant?: Tenant;
  invite?: InviteResult;
}

export function submitApplication(data: {
  firstName: string;
  lastName: string;
  requestedSlug: string;
  email: string;
  phone: string;
  message?: string;
  genre: string;
}) {
  return request<Application>("/applications", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* ----- claps (public, called from the reader's browser) ----- */

/** The reader id rides in a header so it never appears in request-URL logs. */
export function getClaps(workId: string, visitorId?: string) {
  return request<ClapState>(`/works/${workId}/claps`, {
    cache: "no-store",
    headers: visitorId ? { "X-Visitor-Id": visitorId } : {},
  });
}

/** `keepalive` lets a final batch survive the reader navigating away. */
export function sendClaps(workId: string, visitorId: string, count: number, keepalive = false) {
  return request<ClapState>(`/works/${workId}/claps`, {
    method: "POST",
    body: JSON.stringify({ visitorId, count }),
    keepalive,
  });
}
