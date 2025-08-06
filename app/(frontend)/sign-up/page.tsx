'use client';

import { useState } from 'react';
import { useSignUp } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ExclamationCircleIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (!email.endsWith('@atharvacoe.ac.in')) {
      setError('⚠️ Please use your college email ID (@atharvacoe.ac.in)');
      return;
    }

    try {
      setError('');
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.longMessage || 'Something went wrong during sign up.'
      );
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      setError('');
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.push('/feed');
      } else {
        console.error(JSON.stringify(result, null, 2));
        setError('Invalid verification code. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(
        err.errors?.[0]?.longMessage ||
          'Verification failed. Please try again.'
      );
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p>Loading...</p>
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
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              Join Your Campus Marketplace
            </h1>
            <p className="text-purple-100 text-lg">
              Create an account to start buying and selling with fellow students.
            </p>
          </div>
          <div className="absolute top-10 right-10 text-white/50 text-2xl z-10">+</div>
          <div className="absolute bottom-1/4 left-10 text-white/50 text-2xl z-10">+</div>
        </div>

        {/* Right Side: White Form Panel */}
        <div className="w-full md:w-1/2 p-8 sm:p-16 flex flex-col justify-center">
          <div className="max-w-md mx-auto w-full">
            {/* Conditional Rendering for Verification Step */}
            {!pendingVerification ? (
              // STEP 1: SIGN UP FORM
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-8">
                  Create an Account
                </h2>
                {error && (
                  <p className="text-sm text-red-600 text-center pb-4">
                    {error}
                  </p>
                )}
                <form onSubmit={handleSignUp} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:space-x-4">
                    <div className="relative w-full">
                      <UserIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                        className="pl-12 pr-4 py-3 text-base h-14"
                      />
                    </div>
                    <div className="relative w-full mt-6 sm:mt-0">
                      <UserIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                        className="pl-12 pr-4 py-3 text-base h-14"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <EnvelopeIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="College Email (@atharvacoe.ac.in)"
                      required
                      className="pl-12 pr-4 py-3 text-base h-14"
                    />
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="pl-12 pr-12 py-3 text-base h-14"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold h-14 rounded-lg text-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-px"
                  >
                    Create Account
                  </Button>
                </form>
                <p className="mt-8 text-center text-base text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/sign-in"
                    className="font-medium text-purple-600 hover:text-purple-500"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            ) : (
              // STEP 2: VERIFICATION FORM
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4 text-center">
                  Check your email
                </h2>
                <p className="text-gray-600 text-center mb-8">
                  We sent a verification code to{' '}
                  <span className="font-semibold text-gray-800">{email}</span>.
                </p>
                {error && (
                  <p className="text-sm text-red-600 text-center pb-4">
                    {error}
                  </p>
                )}
                <form onSubmit={handleVerify} className="space-y-6">
                  <div className="relative">
                    <KeyIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2" />
                    <Input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Verification Code"
                      required
                      className="pl-12 pr-4 py-3 text-base h-14 text-center tracking-[0.25em]"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-lg text-lg shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-px"
                  >
                    Verify
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}