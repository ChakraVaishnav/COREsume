import { parse } from "cookie";
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
    cookieHeaders: buildSessionCookies({ accessToken, refreshToken }),
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

  const nextSession = await issueSessionForUser({
    id: userId,
    email: typeof refreshPayload.email === "string" ? refreshPayload.email : undefined,
  });
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
