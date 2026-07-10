/**
 * Host <-> tenant helpers, shared by the routing proxy and the SEO routes
 * (robots.ts / sitemap.ts) so they can never disagree about what a host means.
 */

export const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

/** Strip the port and lowercase a raw Host / X-Forwarded-Host value. */
export function normalizeHost(raw: string | null | undefined): string {
  return (raw ?? "").split(":")[0].toLowerCase();
}

/**
 * The tenant slug encoded in a host, or null for the apex, `www`, `admin`,
 * and local dev roots. Mirrors the routing rules in proxy.ts.
 */
export function extractSubdomain(host: string): string | null {
  // Production: {sub}.darbha.info
  if (host === SITE_DOMAIN) return null;
  if (host.endsWith(`.${SITE_DOMAIN}`)) {
    return host.slice(0, -(SITE_DOMAIN.length + 1));
  }
  // Local dev: {sub}.localhost
  if (host === "localhost" || host === "127.0.0.1") return null;
  if (host.endsWith(".localhost")) {
    return host.slice(0, -".localhost".length);
  }
  // Vercel preview URLs and anything else: treat as apex.
  return null;
}

/** Canonical https URL for the apex site. */
export function apexUrl(): string {
  return `https://${SITE_DOMAIN}`;
}

/** Canonical https URL for a tenant's subdomain. */
export function tenantUrl(slug: string): string {
  return `https://${slug}.${SITE_DOMAIN}`;
}
