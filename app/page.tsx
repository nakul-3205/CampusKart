'use client';

import Link from 'next/link';
import {
  ArrowRightIcon,
  BookOpenIcon,
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/solid';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="text-2xl font-extrabold text-purple-400 tracking-tight">
          CampusKart
        </Link>
        <div className="space-x-4">
          <Link href="/sign-in" passHref>
            <button className="text-gray-300 font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200">
              Sign In
            </button>
          </Link>
          <Link href="/sign-up" passHref>
            <button className="bg-purple-600 text-white font-semibold px-4 py-2 rounded-full shadow-md hover:bg-purple-700 transition-colors duration-200">
              Sign Up
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-24 px-6 md:py-32 lg:py-40 bg-gray-900 overflow-hidden">
        {/* Abstract background gradient and shapes for a modern feel */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-1/4 h-64 w-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
          <div className="absolute top-1/2 right-1/4 h-64 w-64 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 h-64 w-64 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
        </div>
        <div className="max-w-4xl mx-auto z-10 relative">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 text-white tracking-tighter">
            Your Campus, <br className="hidden md:inline" /> Your Marketplace.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            CampusKart is the secure, student-exclusive platform to buy, sell, and trade everything from textbooks to electronics with your peers.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
            <Link href="/signup" passHref>
              <button className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Get Started for Free <ArrowRightIcon className="ml-2 h-5 w-5" />
              </button>
            </Link>
            <Link href="/feed" passHref>
              <button className="bg-transparent text-white border-2 border-purple-500 font-bold py-3 px-8 rounded-full text-lg shadow-xl hover:bg-purple-500 hover:border-purple-500 transform hover:scale-105 transition-all duration-300 flex items-center justify-center">
                Explore Listings <MagnifyingGlassIcon className="ml-2 h-5 w-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 md:px-8 lg:px-12 bg-gray-800">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Designed for University Life
          </h2>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            A trusted and convenient way for students to save money, earn cash, and find campus essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {/* Feature 1: Seamless Transactions */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-700 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <ShoppingBagIcon className="h-16 w-16 text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Easy Buying & Selling</h3>
            <p className="text-gray-400">
              Post items or discover deals in a few taps. Connect directly with students on your campus.
            </p>
          </div>
          {/* Feature 2: Academic Essentials (Updated) */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-700 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <BookOpenIcon className="h-16 w-16 text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Academic Essentials</h3>
            <p className="text-gray-400">
              Find used textbooks, tech, furniture, and other university essentials at great prices.
            </p>
          </div>
          {/* Feature 3: Community Focused */}
          <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-700 flex flex-col items-center text-center transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
            <UserGroupIcon className="h-16 w-16 text-purple-400 mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Trusted Campus Network</h3>
            <p className="text-gray-400">
              Trade safely and conveniently with verified students within your university's trusted network.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-6 md:px-8 lg:px-12 text-center bg-gray-900 border-t border-gray-800">
        <div className="max-w-3xl mx-auto">
          <RocketLaunchIcon className="h-20 w-20 text-purple-500 mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Revolutionize Your Campus Life?
          </h2>
          <p className="text-lg md:text-xl mb-10 text-gray-300">
            Join thousands of students and start buying, selling, and connecting today!
          </p>
          <Link href="/sign-up" passHref>
            <button className="bg-purple-600 text-white font-bold py-4 px-10 rounded-full text-xl shadow-xl hover:bg-purple-700 transform hover:scale-105 transition-all duration-300">
              Create Your Free CampusKart Account
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-500 py-8 px-6 md:px-8 lg:px-12 text-center border-t border-gray-800">
        <div className="max-w-6xl mx-auto">
          <p className="mb-4 text-2xl font-extrabold text-purple-400">CampusKart</p>
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