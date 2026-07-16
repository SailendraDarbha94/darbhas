import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_DOMAIN, apexUrl, extractSubdomain, normalizeHost, tenantUrl } from "@/lib/tenant-host";
import { getTenantBySlug, getTenants } from "@/lib/api";

// Output depends on the request Host, so it must never be cached across hosts.
export const dynamic = "force-dynamic";

/**
 * Per-host sitemap. Like robots.ts, it's served unrewritten so the Host header
 * selects the surface:
 *   - apex   -> the gallery, plus each active tenant's home for discovery
 *   - {slug} -> that tenant's home + every published work
 *   - admin  -> nothing (also blocked in robots.ts)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") ?? h.get("host")) || SITE_DOMAIN;
  const sub = extractSubdomain(host);

  if (sub === "admin") return [];

  if (!sub || sub === "www") {
    let tenants: Awaited<ReturnType<typeof getTenants>> = [];
    try {
      tenants = await getTenants();
    } catch {
      // API asleep: still emit the apex home so the site is never sitemap-less.
    }
    return [
      { url: apexUrl(), lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
      {
        url: `${apexUrl()}/privacy`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
      {
        url: `${apexUrl()}/terms`,
        lastModified: new Date(),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      },
      ...tenants.map((t) => ({
        url: tenantUrl(t.slug),
        lastModified: new Date(t.updatedAt),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  }

  try {
    const tenant = await getTenantBySlug(sub);
    const base = tenantUrl(sub);
    return [
      {
        url: base,
        lastModified: new Date(tenant.updatedAt),
        changeFrequency: "weekly",
        priority: 1,
      },
      ...tenant.works.map((w) => ({
        url: `${base}/works/${w.id}`,
        lastModified: new Date(w.updatedAt ?? w.publishedAt ?? tenant.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
    ];
  } catch {
    return [];
  }
}
