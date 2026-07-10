import { NextRequest, NextResponse } from "next/server";
import { extractSubdomain, normalizeHost } from "./lib/tenant-host";

/**
 * Host-based multi-tenant routing:
 *   darbha.info            -> apex (gallery + apply form), /admin dashboard
 *   admin.darbha.info      -> /admin
 *   {slug}.darbha.info     -> /s/{slug}
 * Locally, {slug}.localhost:3000 behaves the same way.
 */
export function proxy(request: NextRequest) {
  const host = normalizeHost(
    request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
  );

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

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
