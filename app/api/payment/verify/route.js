import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth/session";
import crypto from "crypto";
import { logCreditHistory } from "@/lib/featureUsage";
import{enforceRateLimit} from "@/lib/security/rateLimit";
export async function POST(req) {
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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }= await req.json();

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature)
    {
      return NextResponse.json(
        { success: false, error: "Missing payment info" },
        { status: 400 }
      );
    }
    //get the order from the database
    const order = await prisma.orders.findUnique({
      where: { orderId: razorpay_order_id },
    });
    
    // check if the order exists and belongs to the authenticated user
    if(!order){
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }
    if (order.userId !== auth.userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized order",
        },
        {
          status: 403,
        }
      );
    }
    const creditsToAdd = Number(order?.credits);
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

    // Step 2: Claim order + increment credits atomically to avoid double-credit race conditions.
    const claimResult = await prisma.$transaction(async (tx) => {
      const claimed = await tx.orders.updateMany({
        where: {
          orderId: razorpay_order_id,
          userId: auth.userId,
          verified: false,
        },
        data: {
          verified: true,
          paymentId: razorpay_payment_id,
        },
      });

      if (claimed.count === 0) {
        return { claimed: false };
      }

      await tx.user.update({
        where: {
          id: auth.userId,
        },
        data: {
          creds: {
            increment: creditsToAdd,
          },
        },
      });

      return { claimed: true };
    });

    if (!claimResult.claimed) {
      return NextResponse.json(
        { success: false, error: "Order already processed" },
        { status: 400 }
      );
    }

    // Step 3: Log credit history
    const planName =
      order.planId === 1
        ? "Starter Pack"
        : order.planId === 2
        ? "Value Pack"
        : "Ultra Value Pack";

    await logCreditHistory(
      auth.userId,
      creditsToAdd,
      `Purchased ${planName}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
