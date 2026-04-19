import Razorpay from 'razorpay';
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/session";

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

export async function POST(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth?.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan } = await req.json();
    const planPrice = Number(plan?.price);
    if (!Number.isFinite(planPrice) || planPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid plan price" },
        { status: 400 }
      );
    }

    const options = {
      amount: Math.round(planPrice * 100), // Razorpay needs amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Order creation failed' }, { status: 500 });
  }
}
