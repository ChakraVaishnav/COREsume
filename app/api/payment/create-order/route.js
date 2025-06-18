import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

export async function POST(request) {
  try {
    const { plan } = await request.json();
    
    const options = {
      amount: plan.price * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: plan.id,
        planName: plan.name,
        credits: plan.credits,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 