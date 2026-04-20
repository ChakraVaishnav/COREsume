import crypto from "crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import {
  GOOGLE_OAUTH_MODE_COOKIE,
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthErrorPath,
  clearGoogleOAuthCookies,
  getGoogleClientId,
  getGoogleClientSecret,
  getGoogleRedirectUri,
  isGoogleOAuthConfigured,
  normalizeGoogleOAuthMode,
} from "@/lib/auth/google";

const redirectWithError = (req, mode, errorCode) => {
  const response = NextResponse.redirect(
    new URL(buildGoogleAuthErrorPath(mode, errorCode), req.url)
  );
  clearGoogleOAuthCookies(response);
  return response;
};

const exchangeCodeForIdToken = async (code) => {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: getGoogleRedirectUri(),
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google authorization code");
  }

  const data = await response.json();
  if (!data.id_token) {
    throw new Error("Google did not return an ID token");
  }

  return data.id_token;
};

const verifyIdTokenPayload = async (idToken) => {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error("Failed to validate Google ID token");
  }

  const payload = await response.json();
  if (payload.aud !== getGoogleClientId()) {
    throw new Error("Google token audience mismatch");
  }

  if (payload.email_verified !== "true" && payload.email_verified !== true) {
    throw new Error("Google account email is not verified");
  }

  if (!payload.email) {
    throw new Error("Google account did not include an email");
  }

  return payload;
};

const buildUsernameFromGooglePayload = (email) => {
  const localPart = (email.split("@")[0] || "user").trim();
  const cleaned = localPart.replace(/[^a-zA-Z0-9._-]/g, "");
  const raw = cleaned || "user";

  return raw.slice(0, 50);
};

export async function GET(req) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const oauthError = requestUrl.searchParams.get("error");
  const mode = normalizeGoogleOAuthMode(
    req.cookies.get(GOOGLE_OAUTH_MODE_COOKIE)?.value
  );

  if (!isGoogleOAuthConfigured()) {
    return redirectWithError(req, mode, "google_not_configured");
  }

  if (oauthError) {
    return redirectWithError(req, mode, "google_access_denied");
  }

  const savedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;
  if (!savedState || !state || savedState !== state) {
    return redirectWithError(req, mode, "google_invalid_state");
  }

  if (!code) {
    return redirectWithError(req, mode, "google_missing_code");
  }

  try {
    const idToken = await exchangeCodeForIdToken(code);
    const googlePayload = await verifyIdTokenPayload(idToken);
    const email = String(googlePayload.email).trim().toLowerCase();

    let user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    if (!user) {
      const hashedPassword = await bcrypt.hash(crypto.randomUUID(), 10);
      user = await prisma.user.create({
        data: {
          username: buildUsernameFromGooglePayload(email),
          email,
          password: hashedPassword,
        },
      });
    }

    const session = await createSession({ id: user.id, email: user.email });
    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    clearGoogleOAuthCookies(response);
    return appendSetCookieHeaders(response, session.cookieHeaders);
  } catch (error) {
    console.error("Google OAuth callback failed", error);
    return redirectWithError(req, mode, "google_signup_failed");
  }
}
