import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET,
});

export async function POST(req) {
  const { plan } = await req.json();

  try {
    const options = {
      amount: plan.price * 100, // Razorpay needs amount in paise
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ success: false, error: 'Order creation failed' }, { status: 500 });
  }
}
