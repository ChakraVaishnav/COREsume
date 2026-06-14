import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import { appendSetCookieHeaders } from "@/lib/auth/token";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    // ── 1. Authenticate — userId ALWAYS comes from JWT, never from body ──
    const auth = await authenticateRequest(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = auth.userId;

    // ── 2. Parse request body ──
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const couponCode = String(body?.couponCode || "").trim().toUpperCase();
    if (!couponCode) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    // ── 3. Check if this user has already used any coupon ──
    const existingUsage = await prisma.couponUsage.findUnique({
      where: { userId },
    });
    if (existingUsage) {
      return NextResponse.json(
        { error: "You have already redeemed a coupon. Each account can only redeem one coupon." },
        { status: 409 }
      );
    }

    // ── 4. Look up coupon ──
    const coupon = await prisma.coupon.findUnique({
      where: { couponCode },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 404 }
      );
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 410 }
      );
    }

    // ── 5. Fetch user details (for logging) ──
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true, creds: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── 6. Apply credits + log usage — all in one transaction ──
    await prisma.$transaction([
      // Add credits to user
      prisma.user.update({
        where: { id: userId },
        data: { creds: { increment: coupon.couponCredits } },
      }),
      // Log coupon usage
      prisma.couponUsage.create({
        data: {
          couponId: coupon.id,
          userId,
          username: user.username,
          couponCode: coupon.couponCode,
          couponCredits: coupon.couponCredits,
        },
      }),
      // Log in credit history
      prisma.creditHistory.create({
        data: {
          userId,
          credits: coupon.couponCredits,
          reason: `Coupon Redeemed: ${coupon.couponCode}`,
        },
      }),
    ]);

    const response = NextResponse.json(
      {
        message: "Coupon redeemed successfully!",
        creditsAdded: coupon.couponCredits,
        newCredits: user.creds + coupon.couponCredits,
      },
      { status: 200 }
    );
    return appendSetCookieHeaders(response, auth.cookieHeaders);
  } catch (err) {
    // Catch DB unique constraint violation (double-submit race condition)
    if (err?.code === "P2002") {
      return NextResponse.json(
        { error: "You have already redeemed a coupon. Each account can only redeem one coupon." },
        { status: 409 }
      );
    }
    console.error("[coupon/redeem]", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
