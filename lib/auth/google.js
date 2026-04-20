import crypto from "crypto";

export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
export const GOOGLE_OAUTH_MODE_COOKIE = "google_oauth_mode";

const GOOGLE_OAUTH_MODES = new Set(["signup", "login"]);

export const normalizeGoogleOAuthMode = (value) =>
  GOOGLE_OAUTH_MODES.has(value) ? value : "signup";

export const createGoogleOAuthState = () => crypto.randomUUID();

export const isGoogleOAuthConfigured = () =>
  Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );

export const getGoogleClientId = () => process.env.GOOGLE_CLIENT_ID || "";

export const getGoogleClientSecret = () => process.env.GOOGLE_CLIENT_SECRET || "";

export const getGoogleRedirectUri = () => process.env.GOOGLE_REDIRECT_URI || "";

export const buildGoogleOAuthUrl = ({ state }) => {
  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const buildGoogleAuthErrorPath = (mode, errorCode) => {
  const basePath = mode === "login" ? "/login" : "/signup";
  return `${basePath}?error=${encodeURIComponent(errorCode)}`;
};

export const clearGoogleOAuthCookies = (response) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  };

  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", cookieOptions);
  response.cookies.set(GOOGLE_OAUTH_MODE_COOKIE, "", cookieOptions);
};
