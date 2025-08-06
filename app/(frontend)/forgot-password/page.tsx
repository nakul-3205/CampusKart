"use client";

import { useState } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  EnvelopeIcon,
  KeyIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// A decorative component for the abstract lines in the background
const AbstractLines = () => (
  <svg
    width="100%"
    height="100%"
    className="absolute top-0 left-0"
    preserveAspectRatio="none"
  >
    <path
      d="M-100,50 C150,150 250,0 500,100 S700,200 800,50"
      stroke="rgba(255,255,255,0.2)"
      fill="none"
      strokeWidth="2"
    />
    <path
      d="M-150,200 C100,300 300,150 550,250 S700,300 900,150"
      stroke="rgba(255,255,255,0.2)"
      fill="none"
      strokeWidth="2"
    />
  </svg>
);

export default function ForgotPasswordPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState(false);
  const router = useRouter();

  // Step 1: Send the password reset code to the user's email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;

    try {
      setLoading(true);
      setError("");
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setSentEmail(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.longMessage ||
        "Failed to send reset code. Please check your email."
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify the code and set the new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || loading) return;

    try {
      setLoading(true);
      setError("");
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/feed");
      } else {
        console.error(JSON.stringify(result, null, 2));
        setError("Invalid code or password. Please try again.");
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.longMessage ||
        "Password reset failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundImage: `url('/images/iu.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-screen-xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[75vh]">

        {/* Left Side: Purple Branding Panel */}
        <div className="hidden md:flex flex-col items-start justify-center w-full md:w-1/2 p-12 lg:p-24 bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative">
          <AbstractLines />
          <div className="relative z-10">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">Reset your password</h1>
            <p className="text-purple-100 text-lg">
              We'll send you a verification code to help you reset your password.
            </p>
          </div>
          <div className="absolute top-10 right-10 text-white/50 text-2xl z-10">+</div>
          <div className="absolute bottom-1/4 left-10 text-white/50 text-2xl z-10">+</div>
        </div>

        {/* Right Side: White Form Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-4xl font-bold text-gray-800 mb-10">Reset Password</h2>

            {error && (
              <p className="text-sm text-red-600 text-center pb-4">{error}</p>
            )}

            {!sentEmail ? (
              // STEP 1: Request email
              <form onSubmit={handleEmailSubmit} className="space-y-7">
                <div className="relative">
                  <Label htmlFor="email" className="sr-only">
                    Email
                  </Label>
                  <EnvelopeIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-12 pr-4 py-3 text-base h-14"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-14 rounded-lg text-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-px"
                >
                  {loading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            ) : (
              // STEP 2: Enter code and new password
              <form onSubmit={handleResetPassword} className="space-y-7">
                <p className="text-gray-600 text-center text-sm mb-4">
                  A verification code has been sent to <span className="font-semibold text-gray-800">{email}</span>.
                </p>
                <div className="relative">
                  <Label htmlFor="code" className="sr-only">
                    Verification Code
                  </Label>
                  <KeyIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                  <Input
                    id="code"
                    type="text"
                    placeholder="Verification Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                    className="pl-12 pr-4 py-3 text-base h-14 text-center tracking-widest"
                  />
                </div>
                <div className="relative">
                  <Label htmlFor="password" className="sr-only">
                    New Password
                  </Label>
                  <LockClosedIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 py-3 text-base h-14"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-4 flex items-center text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-6 w-6" />
                    ) : (
                      <EyeIcon className="h-6 w-6" />
                    )}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-lg text-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-px"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}
            
            <p className="mt-10 text-center text-base text-gray-600">
              <Link
                href="/sign-in"
                className="font-medium text-purple-600 hover:text-purple-500 flex items-center justify-center"
              >
                 <ArrowLeftIcon className="h-4 w-4 mr-2"/>
                Back to Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}