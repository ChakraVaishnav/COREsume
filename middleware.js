import { NextResponse } from "next/server";
// NOTE: Middleware runs on the Edge runtime. Avoid Node-only deps (e.g., jsonwebtoken).
// We only check for presence of auth cookies here; full verification happens in API routes.

// Protect important routes — redirect to /login if unauthenticated
export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Only protect these prefixes
  const protectedPrefixes = ["/dashboard", "/resume-form", "/resume-preview", "/admin"];
  const needsAuth = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  // Allow export mode for Puppeteer to bypass auth
  if (pathname === "/resume-preview" && url.searchParams.get("export") === "1") {
    return NextResponse.next();
  }

  if (!needsAuth) return NextResponse.next();

  const accessToken = req.cookies.get("token")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!accessToken && !refreshToken) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/resume-form/:path*", "/resume-preview/:path*", "/admin/:path*"],
};
