'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image' // For optimized image preview
import {
  PhotoIcon, // For image upload icon
  ArrowPathIcon, // For loading spinner
  PaperAirplaneIcon // For submit button icon
} from '@heroicons/react/24/solid'

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    image: null as File | null,
  })
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file (e.g., JPEG, PNG, GIF).');
        setFormData(prev => ({ ...prev, image: null }));
        setPreviewUrl(null);
        e.target.value = ''; // Clear the input
        return;
      }
      setFormData(prev => ({ ...prev, image: file }))
      const reader = new FileReader()
      reader.onloadend = () => setPreviewUrl(reader.result as string)
      reader.readAsDataURL(file)
    } else {
      // If user cancels file selection, clear the state
      setFormData(prev => ({ ...prev, image: null }));
      setPreviewUrl(null);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Basic client-side validation
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.image) {
      toast.error('Please fill in all fields and select an image.')
      setLoading(false)
      return
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('Price must be a positive number.')
      setLoading(false)
      return;
    }

    try {
      const base64Image = await convertToBase64(formData.image)
      const res = await fetch('/api/sell', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price), // Ensure price is number
          image: base64Image,
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status === 402) {
        toast.warning('You need to pay to create more listings!')
        router.push('/payments')
        return
      }

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err?.error || 'Failed to create listing')
      }

      // const data = await res.json() // Data is received but not used directly after success toast
      toast.success('Listing created successfully!')
      router.push('/user-dashboard') // Redirect after successful creation
    } catch (err: any) {
      console.error("Error submitting listing:", err);
      toast.error(err.message || 'Something went wrong while creating listing.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl p-8 sm:p-10 transform transition-all duration-300 hover:shadow-3xl">
        <h1 className="text-4xl font-extrabold mb-8 text-center text-gray-900 tracking-tight">
          Create New Listing
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
              step="0.01" // Allows decimal values for currency
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
              <span>{formData.image ? formData.image.name : 'Upload Product Image'}</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                className="hidden" // Hide the default input
              />
            </label>
            {previewUrl && (
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden shadow-lg border border-gray-200">
                  <Image src={previewUrl} alt="Product Preview" layout="fill" objectFit="cover" className="rounded-lg" />
                </div>
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
  )
}

// Utility function to convert File to Base64
async function convertToBase64(file: File | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) return reject('No image selected');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}