'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  TagIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  UserCircleIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { toast } from 'sonner';

// Define the types for our data
interface Listing {
  _id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  status: "active" | "sold";
  category: string;
  createdAt: string;
}

interface UserDetails {
  name: string;
  email: string;
  avatar: string;
}

interface DashboardData {
  userDetails: UserDetails;
  listings: Listing[];
}

interface ListingCardProps {
  listing: Listing;
  onToggleStatus: (id: string) => void;
}

// --- Animated Listing Card Component ---
const ListingCard = ({ listing, onToggleStatus }: ListingCardProps) => {
  const router = useRouter();
  const isSold = listing.status === "sold";

  const handleCardClick = () => {
    router.push(`/user-dashboard/${listing._id}`);
  };

  const handleToggleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleStatus(listing._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card
        onClick={handleCardClick}
        className={`overflow-hidden cursor-pointer group transition-all duration-300 transform border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-lg ${
          isSold ? "opacity-60" : ""
        }`}
      >
        {isSold && (
          <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-md">
            SOLD
          </div>
        )}
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={listing.image}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
            className="rounded-t-lg transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        <CardContent className="p-4 relative text-gray-900">
          <h3 className="text-xl font-bold truncate">
            {listing.title}
          </h3>
          <div className="flex items-center text-sm text-gray-500 my-2">
            <TagIcon className="w-4 h-4 mr-1 text-indigo-500" />
            <p className="truncate">{listing.category}</p>
          </div>
          <p className="text-gray-900 text-2xl font-bold mt-2">
            ₹{listing.price}
          </p>
          <Button
            onClick={handleToggleStatusClick}
            className={`mt-4 w-full font-bold transition-colors duration-200 ${
              isSold
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <CheckBadgeIcon className="w-5 h-5 mr-2" />
            {isSold ? "Mark Available" : "Mark Sold"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// --- Main Dashboard Page Component ---
export default function UserDashboard() {
  const router = useRouter();
  const { signOut } = useClerk();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/dashboard");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch dashboard data.");
      }
      const result: DashboardData = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setData(null);
    fetchDashboardData();
  };

  const handleSellClick = () => {
    router.push("/sell");
  };

  const handleLogout = async () => {
    try {
      await signOut(() => router.push("/"));
      toast.success('Successfully logged out!');
    } catch (err) {
      console.error('Error signing out:', err);
      toast.error('Failed to log out. Please try again.');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const previousListings = data?.listings || [];

    // Optimistic UI update
    setData(prevData => {
      if (!prevData) return null;
      const updatedListings = prevData.listings.map(l => 
        l._id === id ? { ...l, status: l.status === "active" ? "sold" : "active" } : l
      );
      return { ...prevData, listings: updatedListings };
    });

    try {
      const response = await fetch(`/api/dashboard/${id}`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update listing status.");
      }
      
      const responseData = await response.json();
      const newStatus = responseData.status;

      // Update state with the *actual* new status from the database
      setData(prevData => {
        if (!prevData) return null;
        const updatedListings = prevData.listings.map(l => 
          l._id === id ? { ...l, status: newStatus } : l
        );
        return { ...prevData, listings: updatedListings };
      });

      toast.success(`Listing successfully marked as ${newStatus}.`);

    } catch (err: any) {
      // Revert UI on error
      setData(prevData => prevData ? { ...prevData, listings: previousListings } : null);
      setError(err.message);
      toast.error('Could not update listing status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <ArrowPathIcon className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-xl font-medium">Loading your marketplace...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-red-600">
        <ExclamationTriangleIcon className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Error</h2>
        <p className="text-center">{error}</p>
        <Button onClick={handleRefresh} className="mt-6 bg-red-600 hover:bg-red-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  const { userDetails, listings } = data!;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* Sidebar */}
      <aside className="w-20 bg-white border-r border-gray-200 p-4 flex flex-col items-center shadow-lg z-20">
        <div className="relative w-12 h-12 mb-8">
          <Image
            src={userDetails.avatar}
            alt="User Avatar"
            fill
            style={{ objectFit: "cover" }}
            className="rounded-full border-2 border-indigo-400 shadow-md cursor-pointer"
            onClick={() => setShowUserDetails(!showUserDetails)}
          />
          <AnimatePresence>
            {showUserDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95, x: 20 }}
                className="absolute top-0 left-full ml-4 mt-2 w-64 p-4 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 origin-top-left"
              >
                <div className="flex items-center space-x-3 mb-2">
                  <UserCircleIcon className="w-6 h-6 text-indigo-500" />
                  <span className="font-bold text-gray-900">{userDetails.name}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{userDetails.email}</p>
                <Button
                  variant="outline"
                  className="mt-4 w-full justify-start text-gray-600 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <nav className="flex-1 space-y-4">
          <div className="relative group">
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center text-indigo-600 hover:bg-gray-100 rounded-lg"
              onClick={() => router.push("/")}
            >
              <HomeIcon className="w-6 h-6" />
            </Button>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              Go to Feed
            </span>
          </div>
          <div className="relative group">
            <Button
              variant="ghost"
              className="w-12 h-12 p-0 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg"
              onClick={handleSellClick}
            >
              <PlusIcon className="w-6 h-6" />
            </Button>
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              New Listing
            </span>
          </div>
        </nav>
        <div className="relative group">
          <Button
            variant="ghost"
            className="w-12 h-12 p-0 flex items-center justify-center text-gray-500 hover:bg-red-500 hover:text-white rounded-lg"
            onClick={handleLogout}
          >
            <ArrowRightOnRectangleIcon className="w-6 h-6" />
          </Button>
          <span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Logout
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-screen-2xl mx-auto"
        >
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-lg text-gray-500 mt-2">
              Manage your listings and profile.
            </p>
          </header>

          <Separator className="my-8 bg-gray-200" />

          {/* Listings Section */}
          <div className="pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Listings ({listings.length})
            </h2>
            {listings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-lg border border-gray-200">
                <TagIcon className="h-16 w-16 text-indigo-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Listings Yet!</h2>
                <p className="text-gray-500 text-center max-w-md">
                  It looks like you haven't listed anything for sale. List your first item and turn it into cash!
                </p>
                <Button onClick={handleSellClick} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                  List Your First Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} onToggleStatus={handleToggleStatus} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}