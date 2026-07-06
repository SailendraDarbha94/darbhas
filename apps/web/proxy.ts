import { NextRequest, NextResponse } from "next/server";

const SITE_DOMAIN = process.env.NEXT_PUBLIC_SITE_DOMAIN ?? "darbha.info";

/**
 * Host-based multi-tenant routing:
 *   darbha.info            -> apex (gallery + apply form), /admin dashboard
 *   admin.darbha.info      -> /admin
 *   {slug}.darbha.info     -> /s/{slug}
 * Locally, {slug}.localhost:3000 behaves the same way.
 */
export function proxy(request: NextRequest) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(":")[0]
    .toLowerCase();

  const subdomain = extractSubdomain(host);
  const { pathname } = request.nextUrl;

  // Never let tenant paths be reached directly on the apex host.
  if (!subdomain || subdomain === "www") {
    if (pathname.startsWith("/s/") || pathname === "/s") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (subdomain === "admin") {
    if (pathname.startsWith("/admin")) return NextResponse.next();
    return NextResponse.rewrite(new URL(`/admin${pathname === "/" ? "" : pathname}`, request.url));
  }

  return NextResponse.rewrite(new URL(`/s/${subdomain}${pathname === "/" ? "" : pathname}`, request.url));
}

function extractSubdomain(host: string): string | null {
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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
