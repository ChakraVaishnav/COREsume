
// The only responsibilities of this module token.js are 
// 1.Generate JWT
// 2.Verify JWT
// 3.Build Cookies

import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import crypto from "crypto";
export const ACCESS_TOKEN_COOKIE = "token";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const PASSWORD_RESET_COOKIE = "passwordResetToken";


const DEFAULT_FORGOT_PASSWORD_EXPIRES_IN = "10m";
const DEFAULT_ACCESS_EXPIRES_IN = "1h";
const DEFAULT_REFRESH_EXPIRES_IN = "7d";

// Purposes 
export const TOKEN_PURPOSE = {
  REFRESH : "refresh",
  FORGOT_PASSWORD : "forgot_password",
}

const parseExpiryToSeconds = (value, fallbackSeconds) => {
  if (!value || typeof value !== "string") return fallbackSeconds;

  if (/^\d+$/.test(value)) {
    return Number(value);
  }

  const match = value.trim().match(/^(\d+)([smhd])$/i);
  if (!match) return fallbackSeconds;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();

  const unitToSeconds = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * unitToSeconds[unit];
};

const getAccessTokenExpiresIn = () =>
  process.env.JWT_ACCESS_EXPIRES_IN || DEFAULT_ACCESS_EXPIRES_IN;

const getRefreshTokenExpiresIn = () =>
  process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN;

const getAccessTokenMaxAgeSeconds = () =>
  parseExpiryToSeconds(
    process.env.JWT_ACCESS_MAX_AGE_SECONDS || getAccessTokenExpiresIn(),
    3600
  );

const getRefreshTokenMaxAgeSeconds = () =>
  parseExpiryToSeconds(
    process.env.JWT_REFRESH_MAX_AGE_SECONDS || getRefreshTokenExpiresIn(),
    7 * 24 * 3600
  );

const getAccessTokenSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }
  return process.env.JWT_SECRET;
};

const getRefreshTokenSecret = () => {
  return process.env.JWT_REFRESH_SECRET || getAccessTokenSecret();
};

export const signAccessToken = (payload) =>
  jwt.sign(payload, getAccessTokenSecret(), {
    expiresIn: getAccessTokenExpiresIn(),
  });


  // Refresh token with jti (JWT ID) to uniquely identify the token
export const signRefreshToken = (payload) => {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    {
      ...payload,
      purpose: TOKEN_PURPOSE.REFRESH,
      jti,
    },
    getRefreshTokenSecret(),
    {
      expiresIn: getRefreshTokenExpiresIn(),
    }
  );

  return {
    token,
    purpose : TOKEN_PURPOSE.REFRESH,
    jti,
    expiresAt: new Date(Date.now() + getRefreshTokenMaxAgeSeconds() * 1000),
  };
};

export const verifyAccessToken = (token) => jwt.verify(token, getAccessTokenSecret());

export const verifyRefreshToken = (token) => jwt.verify(token, getRefreshTokenSecret());

const serializeAuthCookie = (name, value, maxAge) =>
  serialize(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });

export const buildSessionCookies = ({ accessToken, refreshToken }) => [
  serializeAuthCookie(ACCESS_TOKEN_COOKIE, accessToken, getAccessTokenMaxAgeSeconds()),
  serializeAuthCookie(REFRESH_TOKEN_COOKIE, refreshToken, getRefreshTokenMaxAgeSeconds()),
];

export const buildClearSessionCookies = () => [
  serialize(ACCESS_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  }),
  serialize(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  }),
];

export const appendSetCookieHeaders = (response, cookieHeaders) => {
  cookieHeaders.forEach((cookieHeader) => {
    response.headers.append("Set-Cookie", cookieHeader);
  });
  return response;
};

// -----------------------------------------------------------------------------
// Forgot Password Token
// -----------------------------------------------------------------------------

const getForgotPasswordSecret = () => {
  if (!process.env.FORGOT_PASSWORD_SECRET) {
    throw new Error("FORGOT_PASSWORD_SECRET is not configured");
  }

  return process.env.FORGOT_PASSWORD_SECRET;
};

const getForgotPasswordExpiresIn = () =>
  process.env.FORGOT_PASSWORD_EXPIRES_IN ||
  DEFAULT_FORGOT_PASSWORD_EXPIRES_IN;

const getForgotPasswordMaxAgeSeconds = () =>
  parseExpiryToSeconds(
    process.env.FORGOT_PASSWORD_MAX_AGE_SECONDS ||
      getForgotPasswordExpiresIn(),
    10 * 60
  );

  // Forgot password with JWT ID (jti) to uniquely identify the token
export const signForgotPasswordToken = (payload) =>{
  const jti = crypto.randomUUID();
  const token= jwt.sign(
    {
      ...payload,
      purpose: TOKEN_PURPOSE.FORGOT_PASSWORD,
      jti,
    },
    getForgotPasswordSecret(),
    {
      expiresIn: getForgotPasswordExpiresIn(),
    }
  );

  return {
    token,
    jti,
    purpose : TOKEN_PURPOSE.FORGOT_PASSWORD,
    expiresAt: new Date(
      Date.now() + getForgotPasswordMaxAgeSeconds() * 1000
    ),
  };
};

export const verifyForgotPasswordToken = (token) =>
  jwt.verify(token, getForgotPasswordSecret());

export const buildForgotPasswordCookie = (token) =>
  serialize(PASSWORD_RESET_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: getForgotPasswordMaxAgeSeconds(),
  });

export const buildClearForgotPasswordCookie = () =>
  serialize(PASSWORD_RESET_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });