import { NextResponse } from "next/server";
import { PrismaClient } from "../../../generated/prisma"; // use your correct path
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      credits,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !credits) {
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

    // Step 2: Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Step 3: Add credits
    const updatedCredits = (user.creds || 0) + credits;

    await prisma.user.update({
      where: { email },
      data: { creds: updatedCredits },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
