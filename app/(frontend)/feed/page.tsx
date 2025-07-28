"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserCircleIcon, // For Dashboard link
  PlusCircleIcon, // For "Create Listing" button
  TagIcon, // For price tag on listings
  ArrowPathIcon, // For loading spinner
  ArchiveBoxIcon // For empty state
} from "@heroicons/react/24/solid";

interface Listing {
  _id: string;
  title: string;
  price: number;
  image: string; // Assuming this is the URL for the image
}

export default function FeedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();
        if (res.ok && data.success) {
          setListings(data.data);
        } else {
          console.error("Error fetching listings:", data.message || "Unknown error");
          setError(data.message || "Failed to load listings.");
        }
      } catch (err) {
        console.error("Fetch failed:", err);
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 md:px-8 lg:px-12 flex justify-between items-center border-b border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
          <span className="text-indigo-600 mr-2">🔥</span> Live Listings
        </h1>

        <div className="flex items-center space-x-4">
          <Link href="/sell" passHref>
            <button className="hidden sm:flex items-center bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create Listing
            </button>
          </Link>
          <Link
            href="/user-dashboard"
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            aria-label="User Dashboard"
          >
            <UserCircleIcon className="h-8 w-8" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-8 lg:px-12">
        {/* Mobile "Create Listing" Button (visible on small screens) */}
        <div className="sm:hidden mb-6">
          <Link href="/sell" passHref>
            <button className="w-full flex items-center justify-center bg-green-500 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-600 transition-all duration-250 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create New Listing
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-700">
            <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
            <p className="text-xl font-medium">Loading listings...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-red-100 text-red-800 p-8 rounded-lg shadow-inner">
            <p className="text-xl font-semibold text-center">{error}</p>
            <p className="text-md mt-2">Please try refreshing the page.</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white rounded-xl shadow-lg p-8 text-center text-gray-600 border border-gray-100">
            <ArchiveBoxIcon className="h-20 w-20 mx-auto mb-6 text-gray-400" />
            <p className="text-2xl font-bold mb-3">No Listings Found!</p>
            <p className="text-lg mb-6">It looks a little empty here. Be the first to sell something!</p>
            <Link href="/sell" passHref>
              <button className="inline-flex items-center bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <PlusCircleIcon className="h-5 w-5 mr-2" />
                Start Selling Now
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing._id}
                href={`/feed/${listing._id}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl flex flex-col group"
              >
                <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {listing.title}
                  </h2>
                  <p className="text-indigo-600 font-extrabold text-2xl flex items-center mt-auto">
                    <TagIcon className="h-6 w-6 mr-2 text-indigo-500" />
                    ₹{listing.price.toLocaleString('en-IN')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}