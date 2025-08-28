'use client';

import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Link from 'next/link';

const basePricePerCredit = 19;

const pricingPlans = [
  {
    id: 1,
    name: "Starter",
    credits: 1,
    price: 19,
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
    name: "Professional",
    credits: 5,
    price: 59,
    popular: false,
  },
  {
    id: 4,
    name: "Max Pro",
    credits: 8,
    price: 79,
    popular: false,
  },
].map(plan => {
  const fullPrice = plan.credits * basePricePerCredit;
  const discount = fullPrice > plan.price ? Math.round(((fullPrice - plan.price) / fullPrice) * 100) : 0;

  return {
    ...plan,
    fullPrice,
    discount,
    bonusCredits: Math.ceil(plan.credits * 0.5),
    features: [
      `${plan.credits} Resume Generation${plan.credits > 1 ? 's' : ''}`,
      "All Templates",
      "No Watermark",
      ...(discount > 0 ? [`Save ${discount}%`] : [])
    ]
  };
});

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
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
      } catch (error) {
        console.error('Error fetching Razorpay key:', error);
      }
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
                credits: plan.credits + plan.bonusCredits,
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
            console.error('Verification error:', error);
            alert('Error verifying payment. Please try again.');
          }
        }
      });

      rzp.open();

    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong with payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
  
      <div className="relative px-4 sm:px-6 lg:px-8 py-12 max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-block bg-white text-yellow-500 border-2 border-yellow-500 px-6 py-2 rounded-lg hover:bg-yellow-500 hover:text-white transition-colors font-semibold"
          >
            ← Back to Dashboard
          </Link>
        </div>
  
        {/* Hero Quote */}
        <h2 className="text-3xl sm:text-4xl text-center font-bold text-black mb-10">
          Your resume is your first impression,<br></br>Free builders blur it, {" "}
          <span className="text-black">CORE</span>
          <span className="text-yellow-400">sume</span>
          <span className="text-black"> sharpens it.</span>
        </h2>
  
        {/* Offer Highlight */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
            🌧 Monsoon Offer: Get 50% Extra Credits on Every Purchase!
          </h2>
          <p className="text-gray-600 mt-2 text-base">
            Limited time deal – Build more resumes for less.
          </p>
        </div>
  
        {/* Section Heading */}
        <div className="text-center mb-14">
          <h1 className="text-4xl font-bold text-black mb-4">Choose Your Plan</h1>
          <p className="text-gray-600 text-lg">Select the perfect plan for your career journey</p>
        </div>
  
        {/* Pricing Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-2xl border-2 transition-all duration-300 hover:scale-[1.03] ${
                plan.popular
                  ? "border-yellow-500 bg-yellow-50"
                  : "border-gray-200 hover:border-yellow-500"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-yellow-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
  
              <div className="p-6">
                <h3 className="text-xl font-bold text-black mb-2">{plan.name}</h3>
  
                {/* Price Display */}
                <div className="mb-4">
                  {plan.discount > 0 ? (
                    <div className="flex flex-col items-start">
                      <span className="text-sm line-through text-gray-500">₹{plan.fullPrice}</span>
                      <span className="text-3xl font-bold text-black">₹{plan.price}</span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-black">₹{plan.price}</span>
                  )}
                  <span className="text-gray-600 text-sm"> / one-time</span>
                </div>
  
                {/* Bonus Info */}
                <div className="mb-6 text-left">
                  <span className="text-lg font-semibold text-yellow-600">
                    {plan.credits} Credits +{" "}
                    <span className="text-green-600 font-bold">{plan.bonusCredits} Bonus</span>
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    as part of our <span className="font-semibold text-yellow-600">🌧 Monsoon Offer</span>
                  </p>
                </div>
  
                {/* Feature List */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-gray-600">
                      <svg
                        className="w-5 h-5 text-yellow-500 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
  
                {/* Buy Button */}
                <button
                  onClick={() => handleBuyNow(plan)}
                  disabled={loading || !razorpayLoaded || !razorpayKey}
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? "bg-yellow-500 text-white hover:bg-white hover:text-yellow-500 border-2 border-yellow-500"
                      : "bg-white text-yellow-500 border-2 border-yellow-500 hover:bg-yellow-500 hover:text-white"
                  } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {loading && selectedPlan?.id === plan.id ? "Processing..." : "Buy Now"}
                </button>
              </div>
            </div>
          ))}
        </div>
  
        {/* Contact Prompt */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Need a custom plan?{" "}
            <Link href="/contact" className="text-yellow-500 hover:text-yellow-600 font-semibold">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  
}
