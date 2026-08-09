import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth/session";
import { appendSetCookieHeaders, buildClearSessionCookies, verifyRefreshToken } from "@/lib/auth/token";
import { prisma } from "@/lib/prisma";
import { logApiError } from "@/lib/logger";

export async function POST(req) {
  const refreshToken = req.cookies.get("refreshToken")?.value;
  if (!refreshToken) {
  const unauthorized = NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );

  return appendSetCookieHeaders(
    unauthorized,
    buildClearSessionCookies()
  );
}
  if(refreshToken){
    try{
      const payload = verifyRefreshToken(refreshToken);
      const token = await prisma.token.findUnique({
        where: {
          jti: payload.jti,
        },
      });
      if(!token || token.isRevoked || token.expiresAt < new Date()) {
        const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        return appendSetCookieHeaders(unauthorized, buildClearSessionCookies());
      }
    }
    catch(error){
      logApiError("API/AUTH/REFRESH_VERIFY", error);
      const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      return appendSetCookieHeaders(unauthorized, buildClearSessionCookies());
    }
  }

  const refreshed = await refreshSession(req);

  if (!refreshed) {
    const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return appendSetCookieHeaders(unauthorized, buildClearSessionCookies());
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  return appendSetCookieHeaders(response, refreshed.cookieHeaders);
}
