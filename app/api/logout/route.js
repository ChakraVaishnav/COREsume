import { NextResponse } from "next/server";
import { buildClearSessionCookies, appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  const response = NextResponse.json({ success: true }, { status: 200 });
  return appendSetCookieHeaders(response, buildClearSessionCookies());
}
