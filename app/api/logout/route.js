import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  REFRESH_TOKEN_COOKIE,
  verifyRefreshToken,
  buildClearSessionCookies,
  appendSetCookieHeaders,
} from "@/lib/auth/token";
import { logApiError } from "@/lib/logger";

export async function POST(req) {
  try {
    const token = req.cookies.get(REFRESH_TOKEN_COOKIE)?.value;

    if (token) {
      try {
        const payload = verifyRefreshToken(token);

        await prisma.token.update({
          where: {
            jti: payload.jti,
          },
          data: {
            isRevoked: true,
          },
        });
      } catch {
        // Ignore invalid/expired refresh token.
        // We still clear the cookies below.
      }
    }

    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    return appendSetCookieHeaders(
      response,
      buildClearSessionCookies()
    );
  } catch (error) {
    logApiError("API/LOGOUT", error);
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    return appendSetCookieHeaders(
      response,
      buildClearSessionCookies()
    );
  }
}
