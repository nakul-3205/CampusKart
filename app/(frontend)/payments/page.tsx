'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  RocketLaunchIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ArrowLeftIcon // This icon is no longer used, but keeping the import is fine.
} from '@heroicons/react/24/solid';

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFakePayment = async () => {
    setLoading(true);
    try {
      // Simulate a network delay for a better UX
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      const res = await fetch("/api/payments/unlock", {
        method: "POST",
      });

      if (res.ok) {
        // On success, redirect back to the sell page
        router.push("/sell");
      } else {
        const data = await res.json();
        alert(data?.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 relative"
      // CORRECTED: Image URL syntax
      style={{ backgroundImage: `url('/images/image2.jpg')` }}
    >
      {/* REMOVED: The "Back to Listing" button */}

      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-24">
          
          {/* Left Column: Benefits & Information */}
          <div className="text-white">
            <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl [text-wrap:balance]" style={{textShadow: '0 2px 10px rgba(0,0,0,0.3)'}}>
              Unlock Your Full Potential.
            </h1>
            <p className="mt-6 text-xl text-indigo-100 [text-wrap:balance]" style={{textShadow: '0 1px 5px rgba(0,0,0,0.3)'}}>
              You’ve used your free listing. Go premium to post unlimited items, get priority support, and stand out with a special seller badge.
            </p>
            <div className="mt-10 space-y-6">
              <div className="flex items-start gap-4">
                <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'}} />
                <div>
                    <h3 className="font-semibold text-white text-lg">Unlimited Listings</h3>
                    <p className="text-indigo-200">Post as many items as you want without any restrictions.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'}} />
                <div>
                    <h3 className="font-semibold text-white text-lg">Priority Support</h3>
                    <p className="text-indigo-200">Get faster help and responses from our support team.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CheckCircleIcon className="h-8 w-8 text-green-300 flex-shrink-0" style={{filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))'}} />
                <div>
                    <h3 className="font-semibold text-white text-lg">Premium Seller Badge</h3>
                    <p className="text-indigo-200">Stand out from the crowd with a special badge on your profile.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Card */}
          <div className="w-full">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl p-8 text-center border border-gray-200">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg -mt-20">
                <RocketLaunchIcon className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mt-6">
                Premium Plan
              </h2>
              <div className="my-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                  <p className="text-sm font-semibold text-purple-800">ONE-TIME PAYMENT</p>
                  <p className="mt-2 text-5xl font-extrabold text-gray-900">
                      ₹59
                  </p>
                  <p className="text-purple-700">For the entire semester</p>
              </div>
              <button
                onClick={handleFakePayment}
                disabled={loading}
                className={`w-full h-14 flex items-center justify-center font-bold text-lg rounded-xl shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 
                  ${loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 transform hover:-translate-y-px'
                  }`}
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-6 w-6 mr-3" />
                    Processing Payment...
                  </>
                ) : (
                  "Upgrade Now & Sell More"
                )}
              </button>
              <p className="text-xs text-gray-400 mt-4">
                  Secure payment simulation. No real charges will be applied.
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};