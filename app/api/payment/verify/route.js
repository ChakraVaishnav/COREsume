import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import crypto from "crypto";

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      credits,
    } = await req.json();

    const creditsToAdd = Number(credits);
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !Number.isFinite(creditsToAdd) ||
      creditsToAdd <= 0
    ) {
      return NextResponse.json(
        { success: false, error: "Missing payment or user info" },
        { status: 400 }
      );
    }

    // Step 1: Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZOR_PAY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return NextResponse.json(
        { success: false, error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Step 2: Atomically add credits to user
    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: { creds: { increment: creditsToAdd } },
    });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
