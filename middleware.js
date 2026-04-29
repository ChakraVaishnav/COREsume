import { NextResponse } from "next/server";
import { authenticateRequest } from "./lib/auth/session";

// Protect important routes — redirect to /login if unauthenticated
export async function middleware(req) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  // Only protect these prefixes
  const protectedPrefixes = ["/dashboard", "/resume-form", "/resume-preview", "/admin"];
  const needsAuth = protectedPrefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (!needsAuth) return NextResponse.next();

  try {
    const session = await authenticateRequest(req);
    if (!session || !session.userId) {
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  } catch (e) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/resume-form/:path*", "/resume-preview/:path*", "/admin/:path*"],
};
