"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserCircleIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ArchiveBoxXMarkIcon,
  ExclamationTriangleIcon,
  TagIcon,
} from "@heroicons/react/24/solid";

// --- Import the new constants file ---
import { PRODUCT_CATEGORIES } from "@/lib/constants";

interface Listing {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

function Header() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between p-4">
        <Link href="/feed" className="text-2xl font-bold text-gray-900">
          Campus<span className="text-purple-600">Kart</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/sell" passHref>
            <button className="hidden sm:flex items-center bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors shadow-sm">
              <PlusCircleIcon className="h-5 w-5 mr-2" />
              Create Listing
            </button>
          </Link>
          <Link href="/user-dashboard" className="p-2 rounded-full text-gray-600 hover:text-purple-600 hover:bg-gray-100 transition-colors">
            <UserCircleIcon className="h-8 w-8" />
          </Link>
        </div>
      </div>
    </header>
  );
}

const CategoryFilter = ({ name, active, onClick }: { name: string; active?: boolean; onClick: () => void; }) => (
  <button
    onClick={onClick}
    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
      active ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-200'
    }`}
  >
    {name}
  </button>
);

function ProductCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={`/feed/${listing._id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      <div className="relative w-full h-40 overflow-hidden">
        <Image
          src={listing.image}
          alt={listing.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-purple-600 text-lg">
          {listing.title}
        </h3>
        <p className="mt-2 font-bold text-gray-900 text-xl flex items-center">
          <TagIcon className="h-6 w-6 mr-2 text-purple-500" />
          ₹{listing.price.toLocaleString("en-IN")}
        </p>
      </div>
    </Link>
  );
}

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-700">
    <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="text-xl font-medium">Loading listings...</p>
  </div>
);

const EmptyState = () => (
  <div className="col-span-full flex justify-center">
    <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm p-12 text-center shadow-sm max-w-lg w-full">
      <ArchiveBoxXMarkIcon className="h-20 w-20 text-gray-400" />
      <h3 className="mt-4 text-2xl font-bold text-gray-800">Marketplace is Empty</h3>
      <p className="mt-2 text-gray-500">Be the first to list an item and get the ball rolling!</p>
      <Link href="/sell" className="mt-6 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 transition-colors">
        Sell Your First Item
      </Link>
    </div>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="col-span-full flex justify-center">
    <div className="flex flex-col items-center justify-center rounded-2xl bg-red-50 p-12 text-center text-red-800 shadow-sm border border-red-200 max-w-lg w-full">
      <ExclamationTriangleIcon className="h-16 w-16 text-red-500" />
      <h3 className="mt-4 text-2xl font-bold">Could Not Load Listings</h3>
      <p className="mt-2 text-red-700">{message}</p>
    </div>
  </div>
);

export default function FeedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();
        if (res.ok && data.success) {
          const listingsWithCategory = data.data.map((item: any) => ({
            ...item,
            category: item.category || "Other",
          }));
          setListings(listingsWithCategory);
        } else {
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

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || listing.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Explore the Campus Marketplace
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-gray-600">
            Find amazing deals on textbooks, electronics, and more from students just like you, right here on campus.
          </p>
        </div>

        <div className="mb-12 space-y-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-5 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search for an item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-16 w-full rounded-full border-2 border-gray-200 bg-white pl-14 pr-6 text-lg shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-center flex-wrap gap-3">
            {/* --- Updated: Map over the imported PRODUCT_CATEGORIES array --- */}
            {PRODUCT_CATEGORIES.map((category) => (
              <CategoryFilter
                key={category}
                name={category}
                active={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              />
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} />
        ) : filteredListings.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredListings.map((listing) => (
              <ProductCard key={listing._id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      <Link href="/sell" className="fixed bottom-6 right-6 z-40 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg transition-transform hover:scale-105 sm:hidden">
        <PlusCircleIcon className="h-9 w-9" />
        <span className="sr-only">Create Listing</span>
      </Link>
    </div>
  );
}