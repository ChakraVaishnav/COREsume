'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

const basePricePerCredit = 19;

let pricingPlans = [
  {
    id: 1,
    name: "Starter",
    credits: 1,
    price: 2, // original
    originalPrice: 19, // 🎉 Monsoon Offer
    popular: false,
  },
  {
    id: 2,
    name: "Value Pack",
    credits: 3,
    price: 39,
    popular: true,
  },
  {
    id: 3,
    name: "Ultra Value Pack",
    credits: 5,
    price: 59,
    popular: false,
  },
].map(plan => {
  const fullPrice = plan.credits * basePricePerCredit;
  const discount = fullPrice > plan.price ? Math.floor(((fullPrice - plan.price) / fullPrice) * 100) : 0;

  return {
    ...plan,
    fullPrice,
    discount,
    features: [
      `Resume Generations`,
      "All Templates",
      "AI Suggestions & Improvements",
      "No Watermark",
      ...(discount > 0 ? [`Save ${discount}%`] : []),
    ]
  };
});

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isOfferActive, setIsOfferActive] = useState(false);

  useEffect(() => {
    // Check if Monsoon Offer is still active (till Sept 10)
    const offerEnd = new Date("2025-09-10T23:59:59");
    setIsOfferActive(new Date() <= offerEnd);

    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      document.body.appendChild(script);
      return () => document.body.removeChild(script);
    };

    const fetchRazorpayKey = async () => {
      try {
        const res = await fetch('/api/payment/get-key');
        const data = await res.json();
        if (data.success) setRazorpayKey(data.key);
      } catch (error) {}
    };

    const getEmailFromStorage = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.email) setUserEmail(user.email);
      else window.location.href = '/login';
    };

    loadRazorpay();
    fetchRazorpayKey();
    getEmailFromStorage();
  }, []);

  const handleBuyNow = async (plan) => {
    if (!razorpayLoaded || !razorpayKey) {
      alert('Payment gateway is loading. Please try again in a moment.');
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
                credits: plan.credits + (plan.bonusCredits || 0),
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              alert('✅ Payment successful! Credits added.');
              window.location.href = '/dashboard';
            } else {
              alert('❌ Payment verification failed.');
            }
          } catch (error) {
            alert('Error verifying payment. Please try again.');
          }
        }
      });

      rzp.open();

    } catch (error) {
      alert('Something went wrong with payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/dashboard"
          className="inline-block mb-6 text-yellow-500 font-medium hover:underline"
        >
          ← Back to Dashboard
        </Link>

        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">Get more downloads at student-friendly prices</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => {
            const isStarterWithOffer = plan.id === 1 && isOfferActive;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-sm bg-white p-6 border ${
                  plan.popular ? "border-yellow-500 shadow-lg scale-105" : "border-gray-200"
                } transition-transform`}
              >
                {/* Badge for Popular */}
                {plan.popular && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </span>
                )}

                {/* Badge for Monsoon Offer */}
                {isStarterWithOffer && (
                  <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    🌧️ Monsoon Offer
                  </span>
                )}

                <h3 className="text-xl font-bold text-gray-900 mb-4">{plan.name}</h3>

                <div className="mb-6">
                  {/* Starter Plan with offer */}
                  {isStarterWithOffer ? (
                    <>
                      <span className="text-sm line-through text-gray-500 block">₹{plan.originalPrice}</span>
                      <span className="text-3xl font-bold text-black">₹{plan.price}</span>
                      <span className="block text-sm text-green-600 mt-1">Limited time till Sept 10</span>
                    </>
                  ) : (
                    <>
                      {plan.discount > 0 && (
                        <span className="text-sm line-through text-gray-500 block">₹{plan.fullPrice}</span>
                      )}
                      <span className="text-3xl font-bold text-gray-900">₹{plan.price}</span>
                    </>
                  )}
                  <span className="text-gray-500 text-sm"> / one-time</span>
                </div>

                <p className="text-lg font-semibold text-yellow-600 mb-6">
                  {plan.credits} Credits
                </p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleBuyNow(plan)}
                  disabled={loading || !razorpayLoaded || !razorpayKey}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-yellow-500 text-white hover:bg-yellow-600"
                      : "bg-white text-yellow-500 border border-yellow-500 hover:bg-yellow-50"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading && selectedPlan?.id === plan.id ? "Processing..." : "Buy Now"}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-gray-600">
          Need a custom plan?{" "}
          <Link href="/contact" className="text-yellow-500 font-semibold hover:underline">
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
