import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/auth/session";
import { appendSetCookieHeaders, buildClearSessionCookies } from "@/lib/auth/token";

export async function POST(req) {
  const refreshed = await refreshSession(req);

  if (!refreshed) {
    const unauthorized = NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return appendSetCookieHeaders(unauthorized, buildClearSessionCookies());
  }

  const response = NextResponse.json({ success: true }, { status: 200 });
  return appendSetCookieHeaders(response, refreshed.cookieHeaders);
}
