"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid"; // Import for error icon

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      // Clear previous error message
      setError("");

      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed"); // Redirect to your feed page upon successful sign-in
      } else {
        // This part handles cases like 2FA or other intermediate steps if Clerk returns them
        // For a simple sign-in, it typically goes straight to 'complete' or throws an error.
        console.log(result);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Something went wrong");
    }
  };

  if (!isLoaded) {
    // A simple loading indicator while Clerk loads
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10 transform transition-all duration-300 hover:shadow-3xl">
        <h2 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">
          Welcome Back!
        </h2>

        {error && (
          <div
            className="flex items-center bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6"
            role="alert"
          >
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
        />
        <button
          onClick={handleSignIn}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}