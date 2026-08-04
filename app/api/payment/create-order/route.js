import Razorpay from 'razorpay';
import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET,
});
const plans = [
  {
    id: 1,
    name: "Starter",
    credits: 5,
    price: 29,
    popular: false,
  },
  {
    id: 2,
    name: "Value Pack",
    credits: 10,
    price: 49,
    popular: true,
  },
  {
    id: 3,
    name: "Ultra Value Pack",
    credits: 25,
    price: 99,
    popular: false,
  }
];
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
    const selectedPlan = plans.find(p => p.id === plan.id);
    if (!selectedPlan) {
      return NextResponse.json(
        { success: false, error: "Invalid plan selected" },
        { status: 400 }
      );
    }
    const planPrice = Number(selectedPlan.price);
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
    await prisma.orders.create({
      data:{
        userId: auth.userId,
        orderId: order.id,
        planId: selectedPlan.id,
        price: planPrice,
        credits: selectedPlan.credits,
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Order creation failed' }, { status: 500 });
  }
}
