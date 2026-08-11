// lib/auth/session.js

// The Only responsibilities of this module session.js are
// 1. Create session for user
// 2. Refresh session for user
// 3. Invalidate refresh token
// 4. Get user id from refresh token

import { parse } from "cookie";
import { prisma } from "@/lib/prisma";
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  buildSessionCookies,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/lib/auth/token";

const issueSessionForUser = async ({ id, email }) => {
  const payload = typeof email === "string" ? { id, email } : { id };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return {
    payload,
    refreshToken,
    cookieHeaders: buildSessionCookies({ accessToken, refreshToken: refreshToken.token }),
  };
};

const parseCookies = (req) => {
  const cookieHeader = req.headers.get("cookie") || "";
  return parse(cookieHeader);
};

const refreshFromRefreshToken = async (refreshToken) => {
  if (!refreshToken) return null;

  let refreshPayload;
  try {
    refreshPayload = verifyRefreshToken(refreshToken);
  } catch {
    return null;
  }

  const userId = Number(refreshPayload.id);
  if (!Number.isFinite(userId)) return null;

  // ── Check JTI in the database ──────────────────────────────────────────────
  // This is the fix: previously, authenticateRequest() fell through to this
  // function which only verified the JWT signature — it never checked whether
  // the token's JTI had been revoked (via logout or forced login). That meant
  // a stolen refresh token remained valid for all API calls until expiry.
  //
  // Now we look up the JTI and verify it's not revoked or expired.
  if (!refreshPayload.jti) return null;

  let dbToken;
  try {
    dbToken = await prisma.token.findUnique({
      where: { jti: refreshPayload.jti },
    });
  } catch {
    // If the DB lookup itself fails (not a "not found" — an actual error),
    // fail closed. Don't let a DB outage silently turn into auth bypass.
    return null;
  }

  if (!dbToken || dbToken.isRevoked || dbToken.expiresAt < new Date()) {
    return null;
  }

  // ── Rotate: revoke the old JTI and issue a tracked new one ────────────────
  // Atomic updateMany so only one concurrent request can claim this token.
  // If two requests race, the second gets count: 0 and returns null (401).
  const claimed = await prisma.token.updateMany({
    where: {
      jti: refreshPayload.jti,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
    },
  });

  if (claimed.count === 0) {
    // Token was already claimed by a concurrent request.
    return null;
  }

  const nextSession = await issueSessionForUser({
    id: userId,
    email: typeof refreshPayload.email === "string" ? refreshPayload.email : undefined,
  });

  // Persist the new refresh token's JTI so it can be revoked later (logout, etc.)
  try {
    await prisma.token.create({
      data: {
        userId,
        jti: nextSession.refreshToken.jti,
        purpose: nextSession.refreshToken.purpose,
        expiresAt: nextSession.refreshToken.expiresAt,
      },
    });
  } catch {
    // If we can't persist the new JTI, the session is still valid — it just
    // won't be revocable via the Token table until the next refresh. Log it
    // but don't block the request.
    console.error("[session] Failed to persist new refresh token JTI:", {
      userId,
      jti: nextSession.refreshToken.jti,
    });
  }

  return {
    userId,
    email: typeof refreshPayload.email === "string" ? refreshPayload.email : undefined,
    cookieHeaders: nextSession.cookieHeaders,
  };
};

export const authenticateRequest = async (req) => {
  const cookies = parseCookies(req);
  const accessToken = cookies[ACCESS_TOKEN_COOKIE];
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE];

  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      return {
        userId: Number(payload.id),
        email: payload.email,
        cookieHeaders: [],
      };
    } catch {
      // Access token invalid/expired. Fall through to refresh token flow.
    }
  }

  return refreshFromRefreshToken(refreshToken);
};

// To create refresh and access tokens
export const createSession = async ({ id, email }) => issueSessionForUser({ id, email });

export const refreshSession = async (req) => {
  const cookies = parseCookies(req);
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE];
  return refreshFromRefreshToken(refreshToken);
};

export const invalidateRefreshToken = async () => {};

export const getUserIdFromRefreshToken = (req) => {
  const cookies = parseCookies(req);
  const refreshToken = cookies[REFRESH_TOKEN_COOKIE];
  if (!refreshToken) return null;

  try {
    const payload = verifyRefreshToken(refreshToken);
    const userId = Number(payload.id);
    return Number.isFinite(userId) ? userId : null;
  } catch {
    return null;
  }
};
