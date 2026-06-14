import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    // userId ALWAYS from JWT — no param from frontend
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await prisma.couponUsage.findUnique({
      where: { userId: auth.userId },
    });

    const response = NextResponse.json(
      { hasUsedCoupon: !!existing },
      { status: 200 }
    );
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("[coupon/status]", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
