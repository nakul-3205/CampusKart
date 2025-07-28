"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const PaymentsPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFakePayment = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/unlock", {
        method: "POST",
      });

      if (res.ok) {
        router.push("/sell");
      } else {
        const data = await res.json();
        alert(data?.error || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert("Error while unlocking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
      <h1 className="text-3xl font-semibold mb-4">Upgrade Required</h1>
      <p className="text-gray-600 max-w-md mb-6">
        You’ve already used your free listing. Unlock premium to post more listings.
      </p>

      <button
        onClick={handleFakePayment}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        {loading ? "Processing..." : "Unlock Listings"}
      </button>
    </div>
  );
};

export default PaymentsPage;
