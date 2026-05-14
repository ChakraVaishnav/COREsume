import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";
import { logCreditHistory } from "@/lib/featureUsage";

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { creds: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.creds < 1) {
      return NextResponse.json({ error: "Insufficient credits" }, { status: 400 });
    }
    const { reason } = await req.json().catch(() => ({}));

    await prisma.user.update({
      where: { id: auth.userId },
      data: { creds: { decrement: 1 } },
    });

    await logCreditHistory(auth.userId, -1, reason || "AI Content Suggestion");

    const response = NextResponse.json({ success: true }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
