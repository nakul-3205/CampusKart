'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs'; // Import useClerk for logout functionality
import {
  PlusCircleIcon,
  // PencilIcon, // Removed this icon as the edit button is removed
  TagIcon,
  CubeTransparentIcon,
  UserCircleIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon, // Icon for logout
  ArrowPathIcon, // Icon for loading spinner
  HomeIcon // Icon for "Go to Feed" button (representing home/feed)
} from '@heroicons/react/24/solid';
import { toast } from 'sonner'; // Assuming you use sonner for notifications

interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string; // Assuming 'image' here corresponds to 'imageUrl' from backend
  isSold?: boolean;
}

type UserDetails = {
  name: string;
  email: string;
  avatar?: string;
};

export default function UserDashboard() {
  const { signOut } = useClerk(); // Get signOut function from Clerk
  const [user, setUser] = useState<UserDetails | null>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setUser(data.userDetails);
        setListings(data.listings);
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard. Please try again.');
        toast.error('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggle = async (id: string) => {
    try {
      const response = await fetch(`/api/dashboard/${id}`, {
        method: 'PUT', // Assuming PUT is for toggling status
        headers: {
          'Content-Type': 'application/json',
        },
        // You might send a payload like { isSold: true/false } based on your backend API
      });

      if (!response.ok) {
        throw new Error('Failed to toggle listing status');
      }

      // Optimistically update the UI
      setListings((prev) =>
        prev ? prev.map((l) => (l._id === id ? { ...l, isSold: !l.isSold } : l)) : []
      );
      toast.success('Listing status updated!');
    } catch (err) {
      console.error('Error toggling listing status:', err);
      toast.error('Could not update listing status. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Clerk handles redirection after signOut, usually to the sign-in page.
      toast.success('Successfully logged out!');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center text-gray-700">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
          <p className="text-xl font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800 p-6">
        <p className="text-xl font-semibold text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center border-b border-gray-100">
        <Link href="/" className="text-3xl font-extrabold text-gray-900 tracking-tight hover:text-indigo-600 transition-colors duration-200">
          Your Dashboard
        </Link>
        <div className="flex items-center space-x-4">
          {/* New "Go to Feed" button */}
          <Link href="/feed" passHref>
            <button
              className="hidden sm:flex items-center bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Go to Feed"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Feed
            </button>
          </Link>

          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name || 'User Avatar'}
              width={40}
              height={40}
              className="rounded-full border-2 border-indigo-400 shadow-sm"
            />
          ) : (
            <UserCircleIcon className="h-10 w-10 text-gray-400" />
          )}
          <span className="font-semibold text-gray-800 hidden sm:block">
            {user?.name || 'User'}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-8 lg:px-12">
        {/* User Info & Add Listing Button */}
        <section className="bg-white rounded-xl shadow-lg p-6 mb-8 flex flex-col sm:flex-row justify-between items-center border border-gray-100 transform transition-transform duration-200 hover:scale-[1.005]">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Welcome, {user?.name?.split(' ')[0] || 'User'}!
            </h2>
            <p className="text-gray-600 text-sm">{user?.email}</p>
          </div>
          <Link href="/sell" passHref>
            <button className="mt-4 sm:mt-0 flex items-center bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Add New Listing
            </button>
          </Link>
        </section>

        {/* Your Listings Section */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            Your Listings
          </h3>

          {listings && listings.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center text-gray-600 border border-gray-100">
              <CubeTransparentIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-4">You don't have any listings yet!</p>
              <p className="mb-6">Start selling by adding your first item.</p>
              <Link href="/sell" passHref>
                <button className="inline-flex items-center bg-green-500 text-white font-semibold py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
                  <PlusCircleIcon className="h-5 w-5 mr-2" />
                  Create Your First Listing
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings?.map((l) => (
                <div
                  key={l._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex flex-col border border-gray-100
                    ${l.isSold ? 'opacity-60 grayscale' : ''}
                  `}
                >
                  <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                    <Image
                      src={l.image}
                      alt={l.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 hover:scale-105"
                    />
                    {l.isSold && (
                      <div className="absolute inset-0 bg-red-500 bg-opacity-70 flex items-center justify-center text-white text-xl font-bold uppercase z-10">
                        <ShoppingBagIcon className="h-8 w-8 mr-2" /> SOLD
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2 truncate">
                      {l.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {l.description}
                    </p>
                    <p className="text-indigo-600 font-extrabold text-2xl mb-4 flex items-center">
                      <TagIcon className="h-6 w-6 mr-2 text-indigo-500" />
                      ₹{l.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex flex-col space-y-3 mt-auto pt-4 border-t border-gray-100">
                      {/* Removed the Link and button for "Edit Listing" */}
                      <button
                        onClick={() => toggle(l._id)}
                        className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 shadow-sm hover:shadow-md
                          ${l.isSold
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600'}
                        `}
                      >
                        {l.isSold ? 'Mark Available' : 'Mark Sold'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}