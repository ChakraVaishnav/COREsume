import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { data } = body;

    if (!data || typeof data !== "object") {
      return NextResponse.json({ error: "Invalid resume data" }, { status: 400 });
    }

    await prisma.resume.upsert({
      where: { userId: auth.userId },
      create: {
        userId: auth.userId,
        data,
      },
      update: {
        data,
      },
    });

    const response = NextResponse.json({ success: true }, { status: 200 });
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    console.error("[resume/save] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
