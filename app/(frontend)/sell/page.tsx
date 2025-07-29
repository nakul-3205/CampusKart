'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  PhotoIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/solid';

interface FormDataState {
  title: string;
  description: string;
  category: string;
  price: string;
  image: null | File; // File object cannot be directly stored in localStorage
}

export default function SellPage() {
  const [formData, setFormData] = useState<FormDataState>({
    title: '',
    description: '',
    category: '',
    price: '',
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageReuploadNeeded, setImageReuploadNeeded] = useState(false); // New state for image re-upload prompt

  // --- useEffect for localStorage Persistence ---
  useEffect(() => {
    // Ensure loading state is false when component mounts (after any navigation)
    setLoading(false);

    const savedFormData = localStorage.getItem('sellFormData');
    const savedPreviewUrl = localStorage.getItem('sellFormPreviewUrl');

    if (savedFormData) {
      try {
        const parsedData: Omit<FormDataState, 'image'> = JSON.parse(savedFormData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          image: null // Image is always null when rehydrating from localStorage
        }));
        // If there was a preview URL, it means an image was selected before redirect
        if (savedPreviewUrl) {
          setPreviewUrl(savedPreviewUrl);
          setImageReuploadNeeded(true); // Indicate that image needs re-upload
          toast.info('Please re-upload your product image to proceed.', {
            duration: 5000,
            id: 'reupload-image-prompt' // Use an ID to prevent duplicate toasts
          });
        }
      } catch (e) {
        console.error("Failed to parse saved form data from localStorage", e);
        localStorage.removeItem('sellFormData');
        localStorage.removeItem('sellFormPreviewUrl');
        setFormData({ title: '', description: '', category: '', price: '', image: null }); // Reset form
        setPreviewUrl(null);
        setImageReuploadNeeded(false);
      }
    }

    // You can choose to clear localStorage on unmount or not.
    // Keeping it commented out means data persists until successful submission.
    // return () => {
    //   localStorage.removeItem('sellFormData');
    //   localStorage.removeItem('sellFormPreviewUrl');
    // };
  }, []); // Run only once on mount

  // Function to save form data to localStorage
  const saveFormDataToLocalStorage = (data: FormDataState) => {
    const dataToSave = {
      title: data.title,
      description: data.description,
      category: data.category,
      price: data.price,
    };
    localStorage.setItem('sellFormData', JSON.stringify(dataToSave));
    if (previewUrl) {
      localStorage.setItem('sellFormPreviewUrl', previewUrl);
    } else {
      localStorage.removeItem('sellFormPreviewUrl'); // Clear if no preview
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    saveFormDataToLocalStorage(newFormData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (e.g., JPEG, PNG, GIF).');
        setFormData(prev => ({ ...prev, image: null }));
        setPreviewUrl(null);
        e.target.value = '';
        saveFormDataToLocalStorage({ ...formData, image: null });
        localStorage.removeItem('sellFormPreviewUrl');
        setImageReuploadNeeded(false); // Reset prompt if user tries to upload wrong file
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        toast.error('Image size exceeds 5MB limit. Please choose a smaller image.');
        setFormData(prev => ({ ...prev, image: null }));
        setPreviewUrl(null);
        e.target.value = '';
        saveFormDataToLocalStorage({ ...formData, image: null });
        localStorage.removeItem('sellFormPreviewUrl');
        setImageReuploadNeeded(false); // Reset prompt if user tries to upload too big file
        return;
      }

      const newFormData = { ...formData, image: file };
      setFormData(newFormData);
      setImageReuploadNeeded(false); // Image has been re-uploaded, so clear prompt
      toast.dismiss('reupload-image-prompt'); // Dismiss the info toast

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        localStorage.setItem('sellFormPreviewUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData(prev => ({ ...prev, image: null }));
      setPreviewUrl(null);
      saveFormDataToLocalStorage({ ...formData, image: null });
      localStorage.removeItem('sellFormPreviewUrl');
      setImageReuploadNeeded(true); // User cleared image, prompt re-upload
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Re-check image: If preview exists but actual File object is null
    if (!formData.image && previewUrl) {
      toast.error('Please re-upload your product image to proceed.', { duration: 5000 });
      setLoading(false);
      return;
    }

    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.image) {
      toast.error('Please fill in all fields and select an image.');
      setLoading(false);
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('Price must be a positive number.');
      setLoading(false);
      return;
    }

    try {
      const base64Image = await convertToBase64(formData.image);
      const res = await fetch('/api/sell', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          image: base64Image,
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 402) {
        toast.warning('You need to pay to create more listings!');
        saveFormDataToLocalStorage(formData);
        router.push('/payments');
        return;
      }

      if (!res.ok) {
        let errData: { error?: string } | null = null;
        try {
          errData = await res.json();
        } catch (jsonError) {
          console.error("Error parsing JSON response (could be non-JSON error or network issue):", jsonError);
          const textError = await res.text();
          toast.error(textError || `Server error: ${res.status}. Please try again.`);
          setLoading(false);
          return;
        }

        if (errData?.error && (errData.error.includes('Sightengine flagged:') || errData.error.includes('Hive flagged:'))) {
          toast.error('We detected explicit or inappropriate content in your image. Please upload a suitable image for your listing.', {
            duration: 6000
          });
        } else {
          toast.error(errData?.error || 'Failed to create listing');
        }
        setLoading(false);
        return;
      }

      toast.success('Listing created successfully!');
      localStorage.removeItem('sellFormData');
      localStorage.removeItem('sellFormPreviewUrl');
      toast.dismiss('reupload-image-prompt'); // Dismiss any lingering re-upload prompt
      router.push('/user-dashboard');
    } catch (err: any) {
      console.error("Error submitting listing:", err);
      toast.error(`Network or unexpected error: ${err.message || 'Something went wrong.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">
          Create New Listing
        </h1>

        {/* --- Warning Section --- */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-6 rounded-lg shadow-sm" role="alert">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <p className="font-semibold text-lg">Important Notice</p>
              <p className="text-sm">
                Once a listing is created, it **cannot be edited or refunded**. Please review all details carefully before submitting.
              </p>
            </div>
          </div>
        </div>
        {/* --- End Warning Section --- */}

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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800 resize-y"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              id="category"
              name="category"
              placeholder="e.g., Electronics, Books, Fashion"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all duration-200 placeholder-gray-400 text-gray-800"
            />
          </div>

          <div>
            <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <label
              htmlFor="image-upload"
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all duration-200 text-gray-600 font-medium"
            >
              <PhotoIcon className="h-6 w-6 mr-2 text-gray-500" />
              <span>{formData.image ? formData.image.name : (imageReuploadNeeded ? 'Re-upload Image Required' : 'Upload Product Image')}</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required={!previewUrl} // Make required only if no previous image was set
                className="hidden"
              />
            </label>
            {previewUrl && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden shadow-lg border border-gray-200">
                  <Image src={previewUrl} alt="Product Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                </div>
                {imageReuploadNeeded && (
                    <p className="text-sm text-red-600 mt-2 font-medium">Please re-upload this image to proceed.</p>
                )}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center font-bold py-3 px-6 rounded-lg transition-all duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2
              ${loading
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.01] focus:ring-blue-500'}
            `}
          >
            {loading ? (
              <>
                <ArrowPathIcon className="animate-spin h-5 w-5 mr-3" />
                Creating Listing...
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5 mr-3 transform rotate-45" />
                Create Listing
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

async function convertToBase64(file: File | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) return reject('No image selected');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}