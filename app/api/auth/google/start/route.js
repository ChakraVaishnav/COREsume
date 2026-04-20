import { NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_MODE_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthErrorPath,
  buildGoogleOAuthUrl,
  createGoogleOAuthState,
  isGoogleOAuthConfigured,
  normalizeGoogleOAuthMode,
} from "@/lib/auth/google";

export async function GET(req) {
  const requestUrl = new URL(req.url);
  const mode = normalizeGoogleOAuthMode(requestUrl.searchParams.get("mode"));

  if (!isGoogleOAuthConfigured()) {
    const fallback = buildGoogleAuthErrorPath(mode, "google_not_configured");
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  const state = createGoogleOAuthState();
  const googleAuthUrl = buildGoogleOAuthUrl({ state });

  const response = NextResponse.redirect(googleAuthUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  };

  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, cookieOptions);
  response.cookies.set(GOOGLE_OAUTH_MODE_COOKIE, mode, cookieOptions);

  return response;
}
