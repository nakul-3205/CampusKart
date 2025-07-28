"use client";

import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid"; // Import for error icon

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email.endsWith("@atharvacoe.ac.in")) {
      setError("⚠️ Use your college email ID (@atharvacoe.ac.in)");
      return;
    }

    try {
      // Clear previous error message
      setError("");

      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setPendingVerification(true);
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Something went wrong");
    }
  };

  const handleVerify = async () => {
    try {
      // Clear previous error message
      setError("");

      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed"); // Redirect to your feed page upon successful verification
      } else {
        setError("Invalid verification code. Please try again.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.message || "Something went wrong");
    }
  };

  if (!isLoaded) {
    // You might want a loading spinner or skeleton here
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
          Create Your Account
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

        {!pendingVerification ? (
          <>
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
            />
            <input
              type="email"
              placeholder="College Email (@atharvacoe.ac.in)"
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
              onClick={handleSignUp}
              className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            <p className="text-center text-gray-700 mb-6 text-sm">
              We've sent a verification code to{" "}
              <span className="font-semibold">{email}</span>. Please enter it
              below to complete your registration.
            </p>
            <input
              type="text"
              placeholder="Enter verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800 tracking-wider text-center"
            />
            <button
              onClick={handleVerify}
              className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transform transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-md"
            >
              Verify Email
            </button>
          </>
        )}
      </div>
    </div>
  );
}