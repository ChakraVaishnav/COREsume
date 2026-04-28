'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

const pricingPlans = [
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
  },
].map(plan => ({
  ...plan,
  features: [
    "1 Credit = 1 AI action",
    "Summary Auto Generation",
    "Skills Auto Generation",
    "Experience Quantifying",
    "Project Description Quantifying",
    "Check you resume ATS score",
    "Can Access Resume from PDF feature",
    "Can Access Job Search feature",
  ]
}));

export default function Pricing() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    // Fetch Razorpay key
    const fetchKey = async () => {
      try {
        const res = await fetch('/api/payment/get-key');
        const data = await res.json();
        if (data.success) setRazorpayKey(data.key);
      } catch (error) {}
    };

    fetchKey();

    const getEmail = async () => {
      try{
        const res = await fetch('/api/user/info', { 
          method: "GET",
          credentials: 'include' });
        const data = await res.json();
        if (res.ok) setUserEmail(data.email); 
      }
      catch (error) {
        throw error;
      }
    };
    getEmail();
  }, []);

  const handleBuyNow = async (plan) => {
    if (!razorpayLoaded || !razorpayKey) {
      alert('Payment gateway is loading. Please try again.');
      return;
    }

    setLoading(true);
    setSelectedPlan(plan);

    try {
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const orderData = await res.json();
      if (!orderData.success) throw new Error(orderData.error || 'Order failed');

      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'COREsume',
        description: `${plan.name} Plan - ${plan.credits} Credits`,
        order_id: orderData.order.id,
        prefill: { email: userEmail },
        theme: { color: '#EAB308' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setSelectedPlan(null);
          },
        },
        handler: async function (response) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: userEmail,
                credits: plan.credits,
              }),
            });

            const verifyData = await verifyRes.json();


            if (verifyData.success) {
              alert('✅ Payment successful! Credits added.');
              window.location.href = '/dashboard';
            } else {
              alert('❌ Payment verification failed.');
            }
          } catch {
            alert('Error verifying payment. Please try again.');
          }
        }
      });

      rzp.open();
    } catch {
      alert('Something went wrong with payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50">
      <Navbar fixed />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col px-4 pt-20 pb-4 sm:pt-24">
        <button
          onClick={() => router.back()}
          className="mb-3 self-start text-yellow-500 font-medium hover:underline"
        >
          ← Back
        </button>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your AI Credit Plan</h1>
          <p className="text-base text-gray-600">1 Credit = 1 AI action to improve your resume</p>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-lg shadow-sm bg-white p-3 border ${
                plan.popular ? "border-yellow-500 shadow-lg scale-100" : "border-gray-200"
              } transition-transform`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-semibold px-3 py-0.5 rounded-full">
                  Most Popular
                </span>
              )}

              <h3 className="text-base font-bold text-gray-900 mb-2">{plan.name}</h3>

              <div className="mb-3">
                <span className="text-xl font-bold text-gray-900">₹{plan.price}</span>
                <span className="text-gray-500 text-[11px]"> / one-time</span>
              </div>

              <p className="text-sm font-semibold text-yellow-600 mb-3">{plan.credits} Credits</p>

              <ul className="space-y-1.5 mb-4 text-xs sm:text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-gray-700">
                    <svg className="w-4 h-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuyNow(plan)}
                disabled={loading || !razorpayLoaded || !razorpayKey}
                className={`w-full py-2 rounded-lg font-semibold text-sm transition-colors ${
                  plan.popular
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50"
                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading && selectedPlan?.id === plan.id ? "Processing..." : "Buy Now"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          Need a custom plan?{" "}
          <Link href="/contact" className="text-yellow-500 font-semibold hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
