import { NextResponse } from 'next/server';
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { enforceRateLimit } from "@/lib/security/rateLimit";
import { logApiError } from "@/lib/logger";

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const rateLimitResponse = await enforceRateLimit({
      req,
      type: "PAYMENT",
      identifier: String(auth.userId),
      cookieHeaders: auth.cookieHeaders,
    });
    if (rateLimitResponse) return rateLimitResponse;

    const response = NextResponse.json({
      success: true,
      key: process.env.RAZOR_PAY_ID,
    });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (error) {
    logApiError("API/PAYMENT/GET_KEY", error);
    return NextResponse.json(
      { success: false, error: 'Failed to get payment key' },
      { status: 500 }
    );
  }
}
