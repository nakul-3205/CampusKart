'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  TagIcon,
  CubeTransparentIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/solid';

type ListingDetails = {
  _id: string;
  title: string;
  price: number;
  description?: string;
  image: string;
  status: 'Available' | 'Sold' | string;
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
        setError('Failed to load listing details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center text-gray-700">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-purple-600 mb-4" />
          <p className="text-xl font-medium">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-800 p-6">
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Available
          </span>
        );
      case 'Sold':
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-red-100 text-red-800">
            <XCircleIcon className="h-4 w-4 mr-2" />
            Sold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
            <CubeTransparentIcon className="h-4 w-4 mr-2" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <Link href="/feed" className="inline-flex items-center text-gray-600 hover:text-purple-600 transition-colors font-medium">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back to Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white rounded-3xl shadow-2xl overflow-hidden p-6 md:p-10">
          {/* Image Section */}
          <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={listing.image}
              alt={listing.title}
              layout="fill"
              objectFit="contain" 
              priority
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 leading-tight pr-4">
                  {listing.title}
                </h1>
                <div className="flex-shrink-0 mt-1">
                  {getStatusBadge(listing.status)}
                </div>
              </div>

              <p className="mt-4 text-5xl font-extrabold text-purple-600 flex items-center">
                <TagIcon className="h-10 w-10 mr-4 text-purple-500" />
                ₹{listing.price.toLocaleString('en-IN')}
              </p>
            </div>
            
            {listing.description && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-3 flex items-center">
                  <ClipboardDocumentListIcon className="h-6 w-6 mr-3 text-purple-600" />
                  Description
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}
            
            {(listing.sellerName || listing.sellerEmail) && (
              <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                  <UserCircleIcon className="h-6 w-6 mr-3 text-purple-600" />
                  Seller Information
                </h2>
                <div className="space-y-3">
                  {listing.sellerName && (
                    <p className="text-lg text-gray-700 flex items-center">
                      <span className="font-medium w-24">Name:</span>
                      <span className="ml-3 font-semibold text-gray-700">
                        {listing.sellerName}
                      </span>
                    </p>
                  )}
                  {listing.sellerEmail && (
                    <p className="text-lg text-gray-700 flex items-center">
                      <span className="font-medium w-24">Email:</span>
                      <a
                        href={`mailto:${listing.sellerEmail}`}
                        className="ml-3 text-purple-600 hover:underline font-semibold"
                      >
                        {listing.sellerEmail}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {listing.status === 'Available' && (
              <a
                href={`mailto:${listing.sellerEmail}`}
                className="mt-8 w-full flex items-center justify-center bg-purple-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-purple-700 transition-colors shadow-lg text-lg"
              >
                <EnvelopeIcon className="h-6 w-6 mr-3" />
                Contact Seller
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}