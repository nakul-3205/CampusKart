'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRightIcon,
  BookOpenIcon, // New icon for 'Academic Exchange'
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CurrencyDollarIcon // New icon for 'Earn/Save'
} from '@heroicons/react/24/solid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="bg-white shadow-sm py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-2xl font-extrabold text-gray-900 tracking-tight">
          CampusKart
        </Link>
        <div className="space-x-4">
          <Link href="/signin" passHref>
            <button className="text-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
              Sign In
            </button>
          </Link>
          <Link href="/signup" passHref>
            <button className="bg-gray-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:bg-black transition-colors duration-200">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-6 md:py-28 lg:py-36 overflow-hidden">
        <div className="max-w-4xl mx-auto z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-gray-900">
            CampusKart: Buy, Sell, <br className="hidden md:inline" /> Connect on Campus.
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Your exclusive marketplace for students to easily buy and sell textbooks, electronics, furniture, and more within your university community.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link href="/signup" passHref>
              <button className="bg-gray-800 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:bg-black transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Join CampusKart <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link href="/feed" passHref>
              <button className="bg-white text-gray-800 border-2 border-gray-800 font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Explore Listings <MagnifyingGlassIcon className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
        {/* Thematic image placeholder for CampusKart */}
        <div className="mt-16 w-full max-w-5xl px-4">
          <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gray-200 rounded-3xl shadow-2xl overflow-hidden border border-gray-300 flex items-center justify-center">
            <Image
              src="https://placehold.co/1200x600/E0E0E0/333333?text=Campus+Marketplace+Scene"
              alt="Campus Marketplace Scene"
              layout="fill"
              objectFit="cover"
              className="rounded-2xl"
            />
            <span className="absolute text-gray-500 text-xl font-semibold">Your Campus, Your Marketplace</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Why CampusKart?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            A trusted and convenient way for students to save money, earn cash, and find campus essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Feature 1: Seamless Transactions */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <ShoppingBagIcon className="h-16 w-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Easy Buying & Selling</h3>
            <p className="text-gray-700">
              Post items or discover deals in a few taps. Connect directly with students on your campus.
            </p>
          </div>
          {/* Feature 2: Academic Exchange */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <BookOpenIcon className="h-16 w-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Textbooks & Notes</h3>
            <p className="text-gray-700">
              Find used textbooks at great prices or sell your old ones to new students, recycling resources on campus.
            </p>
          </div>
          {/* Feature 3: Community Focused */}
          <div className="bg-gray-50 rounded-xl p-8 shadow-lg border border-gray-200 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
            <UserGroupIcon className="h-16 w-16 text-gray-700 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Trusted Campus Network</h3>
            <p className="text-gray-700">
              Trade safely and conveniently with verified students within your university's trusted network.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 md:px-8 lg:px-12 text-center bg-gradient-to-r from-gray-800 to-black text-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Connect with Your Campus?
          </h2>
          <p className="text-lg md:text-xl mb-10 opacity-90">
            Join CampusKart today and revolutionize how you buy and sell at university!
          </p>
          <Link href="/signup" passHref>
            <button className="bg-white text-gray-800 font-bold py-4 px-10 rounded-full text-xl shadow-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
              Create Your CampusKart Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-6 md:px-8 lg:px-12 text-center">
        <div className="max-w-6xl mx-auto">
          <p className="mb-4 text-lg font-semibold">CampusKart</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} CampusKart. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-6">
            <Link href="/privacy" className="text-sm hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
            <Link href="/contact" className="text-sm hover:text-white transition-colors duration-200">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}