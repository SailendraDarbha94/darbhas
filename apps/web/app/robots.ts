import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE_DOMAIN, extractSubdomain, normalizeHost } from "@/lib/tenant-host";

// Output depends on the request Host, so it must never be cached across hosts.
export const dynamic = "force-dynamic";

/**
 * Per-host robots. Served unrewritten (the proxy excludes /robots.txt), so the
 * Host header tells us which surface we're on:
 *   - admin.*  -> keep crawlers out entirely
 *   - apex / {slug}.*  -> allow, point at this host's own sitemap
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = normalizeHost(h.get("x-forwarded-host") ?? h.get("host")) || SITE_DOMAIN;
  const sub = extractSubdomain(host);

  if (sub === "admin") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin"] }],
    sitemap: `https://${host}/sitemap.xml`,
  };
}
