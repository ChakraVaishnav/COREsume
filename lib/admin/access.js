import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

function getAdminUserIdFromEnv() {
  const raw = String(process.env.ADMIN_USER_ID || "").trim();
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function requireAdmin(req) {
  const auth = await authenticateRequest(req);

  if (!auth?.userId) {
    return {
      response: NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 401 }
      ),
      cookieHeaders: auth?.cookieHeaders || [],
    };
  }

  const adminUserId = getAdminUserIdFromEnv();
  if (adminUserId === null) {
    return {
      response: NextResponse.json(
        { error: "ADMIN_CONFIG_MISSING", message: "Admin configuration missing." },
        { status: 500 }
      ),
      cookieHeaders: auth.cookieHeaders || [],
    };
  }

  if (Number(auth.userId) !== adminUserId) {
    return {
      response: NextResponse.json(
        { error: "UNAUTHORIZED", message: "Unauthorized" },
        { status: 403 }
      ),
      cookieHeaders: auth.cookieHeaders || [],
    };
  }

  return { userId: Number(auth.userId), cookieHeaders: auth.cookieHeaders || [] };
}

export function withAdminCookies(response, cookieHeaders = []) {
  return appendSetCookieHeaders(response, cookieHeaders);
}
