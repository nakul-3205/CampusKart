'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import {
  ArrowPathIcon,
  PhotoIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/solid';

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Listing ID is missing.');
      return;
    }

    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/dashboard/${id}`);
        const json = await res.json();

        if (res.ok && json.listing) {
          setFormData({
            title: json.listing.title || '',
            description: json.listing.description || '',
            price: json.listing.price?.toString() || '',
          });
          setCurrentImageUrl(json.listing.imageUrl || null);
          setPreviewUrl(json.listing.imageUrl || null);
        } else {
          setError(json.error || 'Listing not found.');
          toast.error(json.error || 'Listing not found.');
        }
      } catch (err) {
        console.error('Failed to fetch listing:', err);
        setError('Failed to fetch listing data. Please try again.');
        toast.error('Failed to fetch listing data.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (e.g., JPEG, PNG, GIF).');
        setNewImageFile(null);
        setPreviewUrl(currentImageUrl);
        e.target.value = '';
        return;
      }
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setNewImageFile(null);
      setPreviewUrl(currentImageUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    if (!formData.title || !formData.description || !formData.price) {
        toast.error('Please fill in all required fields.');
        setSubmitting(false);
        return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        toast.error('Price must be a positive number.');
        setSubmitting(false);
        return;
    }

    try {
      let imageToSend: string | undefined;
      if (newImageFile) {
        imageToSend = await convertToBase64(newImageFile);
      } else if (currentImageUrl && !newImageFile) {
        imageToSend = undefined;
      } else {
        imageToSend = undefined;
      }

      const payload: {
        title: string;
        description: string;
        price: number;
        image?: string;
      } = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
      };

      if (imageToSend) {
        payload.image = imageToSend;
      }

      const res = await fetch(`/api/dashboard/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success('Listing updated successfully!', {
          icon: <CheckCircleIcon className="h-5 w-5 text-green-500" />,
        });
        router.push('/user-dashboard');
      } else {
        const err = await res.json();
        const errorMessage = err.error || 'Failed to update listing.';
        setError(errorMessage);
        toast.error(errorMessage, {
          icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
        });
      }
    } catch (err: any) {
      console.error('Error updating listing:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'An unexpected error occurred.', {
        icon: <XCircleIcon className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center text-gray-600">
          <ArrowPathIcon className="animate-spin h-10 w-10 text-blue-500 mb-3" />
          <p>Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 p-4">
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-tight flex items-center justify-center">
          <PencilSquareIcon className="h-9 w-9 text-purple-600 mr-4" />
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              id="title"
              name="title"
              placeholder="Product Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Detailed description of your product..."
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800 resize-y"
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
            <input
              id="price"
              name="price"
              placeholder="e.g., 999.00"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <div className="relative w-full h-56 bg-gray-100 rounded-lg overflow-hidden shadow-inner flex items-center justify-center border border-gray-200">
              {previewUrl ? (
                <Image
                  src={previewUrl}
                  alt="Product Preview"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              ) : (
                <div className="text-gray-500 flex flex-col items-center">
                  <PhotoIcon className="h-12 w-12 mb-2" />
                  <p>No Image Selected</p>
                </div>
              )}
              <label
                htmlFor="image-upload"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 text-white text-lg font-semibold cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-lg"
              >
                <PhotoIcon className="h-8 w-8 mr-2" />
                Change Image
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
              ${submitting
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-[1.01] focus:ring-purple-500'}
            `}
          >
            {submitting ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                Updating Listing...
              </>
            ) : (
              <>
                <PencilSquareIcon className="h-5 w-5 mr-3" />
                Update Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided for conversion.'));
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}