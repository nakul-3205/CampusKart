'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  TagIcon, // For price
  CubeTransparentIcon, // For general item
  UserCircleIcon, // For seller name
  EnvelopeIcon, // For seller email
  ArrowPathIcon, // For loading
  ExclamationCircleIcon, // For error
  CheckCircleIcon, // For status Available
  XCircleIcon // For status Sold
} from '@heroicons/react/24/solid';

type ListingDetails = {
  _id: string;
  title: string;
  price: number;
  description?: string;
  image: string; // Assuming this is the URL
  status: 'Available' | 'Sold' | string; // Explicitly define common statuses
  sellerName?: string;
  sellerEmail?: string;
};

export default function ListingDetailsPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<ListingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setLoading(false);
        setError('Listing ID is missing.');
        return;
      }
      try {
        const res = await fetch(`/api/listings/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setListing(data.listing);
        } else {
          setError(data.message || 'Listing not found.');
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center text-gray-700">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-indigo-600 mb-4" />
          <p className="text-xl font-medium">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-800 p-6">
        <ExclamationCircleIcon className="h-12 w-12 mr-4" />
        <p className="text-xl font-semibold text-center">{error}</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-gray-700 p-6">
        <ExclamationCircleIcon className="h-12 w-12 mr-4" />
        <p className="text-xl font-semibold text-center">Listing not found.</p>
      </div>
    );
  }

  // Determine status badge colors
  const statusColors = {
    Available: 'bg-green-100 text-green-800',
    Sold: 'bg-red-100 text-red-800',
    default: 'bg-gray-100 text-gray-800',
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors.Available}`}><CheckCircleIcon className="h-4 w-4 mr-1" /> Available</span>;
      case 'Sold':
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors.Sold}`}><XCircleIcon className="h-4 w-4 mr-1" /> Sold</span>;
      default:
        return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors.default}`}><CubeTransparentIcon className="h-4 w-4 mr-1" /> {status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
        {/* Image Section */}
        <div className="relative w-full h-96 bg-gray-200 overflow-hidden">
          <Image
            src={listing.image}
            alt={listing.title}
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Details Section */}
        <div className="p-8 md:p-10">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-4xl font-extrabold text-gray-900 leading-tight pr-4">
              {listing.title}
            </h1>
            <div className="flex-shrink-0 mt-1">
              {getStatusBadge(listing.status)}
            </div>
          </div>

          <p className="text-5xl font-extrabold text-indigo-600 flex items-center mb-6">
            <TagIcon className="h-10 w-10 mr-4 text-indigo-500" />
            ₹{listing.price.toLocaleString('en-IN')}
          </p>

          {listing.description && (
            <>
              <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2 border-gray-200">
                Description
              </h2>
              <p className="mt-4 text-gray-700 leading-relaxed text-lg mb-8">
                {listing.description}
              </p>
            </>
          )}

          {/* Seller Info Section */}
          {(listing.sellerName || listing.sellerEmail) && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <UserCircleIcon className="h-6 w-6 mr-3 text-indigo-500" />
                Seller Information
              </h2>
              {listing.sellerName && (
                <p className="text-lg text-gray-700 flex items-center mb-2">
                  <UserCircleIcon className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="font-medium">Name:</span> {listing.sellerName}
                </p>
              )}
              {listing.sellerEmail && (
                <p className="text-lg text-gray-700 flex items-center">
                  <EnvelopeIcon className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="font-medium">Email:</span>{' '}
                  <a href={`mailto:${listing.sellerEmail}`} className="text-blue-600 hover:underline">
                    {listing.sellerEmail}
                  </a>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}