"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  PhotoIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TagIcon,
  CurrencyRupeeIcon,
  CameraIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/solid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// --- Import the new constants file ---
import { PRODUCT_CATEGORIES } from '@/lib/constants';

// Helper function
async function convertToBase64(file: File | null): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file) return reject('No image selected');
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

// Re-using the decorative component from other pages
const AbstractLines = () => (
  <svg width="100%" height="100%" className="absolute top-0 left-0" preserveAspectRatio="none">
    <path d="M-100,50 C150,150 250,0 500,100 S700,200 800,50" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2" />
    <path d="M-150,200 C100,300 300,150 550,250 S700,300 900,150" stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2" />
  </svg>
);


interface FormDataState {
  title: string;
  description: string;
  category: string;
  price: string;
  image: null | File;
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
  const [imageReuploadNeeded, setImageReuploadNeeded] = useState(false);
  const [isExplicit, setIsExplicit] = useState(false);

  useEffect(() => {
    setLoading(false);
    const savedFormData = localStorage.getItem('sellFormData');
    const savedPreviewUrl = localStorage.getItem('sellFormPreviewUrl');
    if (savedFormData) {
      try {
        const parsedData: Omit<FormDataState, 'image'> = JSON.parse(savedFormData);
        // Ensure the saved category is a valid value from our new list
        const restoredCategory = PRODUCT_CATEGORIES.includes(parsedData.category) ? parsedData.category : '';
        setFormData(prev => ({ ...prev, ...parsedData, category: restoredCategory, image: null }));
        if (savedPreviewUrl) {
          setPreviewUrl(savedPreviewUrl);
          setImageReuploadNeeded(true);
          toast.info('Please re-upload your product image to proceed.', { duration: 5000, id: 'reupload-image-prompt' });
        }
      } catch (e) {
        console.error("Failed to parse saved form data", e);
        localStorage.removeItem('sellFormData');
        localStorage.removeItem('sellFormPreviewUrl');
      }
    }
  }, []);

  const saveFormDataToLocalStorage = (data: FormDataState, currentPreviewUrl: string | null) => {
    const dataToSave = { title: data.title, description: data.description, category: data.category, price: data.price };
    localStorage.setItem('sellFormData', JSON.stringify(dataToSave));
    if (currentPreviewUrl) {
      localStorage.setItem('sellFormPreviewUrl', currentPreviewUrl);
    } else {
      localStorage.removeItem('sellFormPreviewUrl');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    saveFormDataToLocalStorage(newFormData, previewUrl);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5 MB limit
        toast.error('Image size exceeds 5MB limit.');
        return;
      }
      
      setIsExplicit(false);
      
      const newFormData = { ...formData, image: file };
      setFormData(newFormData);
      setImageReuploadNeeded(false);
      toast.dismiss('reupload-image-prompt');
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultUrl = reader.result as string;
        setPreviewUrl(resultUrl);
        saveFormDataToLocalStorage(newFormData, resultUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setIsExplicit(false);

    if (!formData.image && previewUrl) {
      toast.error('Please re-upload your product image to proceed.');
      setLoading(false);
      return;
    }
    if (!formData.title || !formData.description || !formData.category || !formData.price || !formData.image) {
      toast.error('Please fill in all fields and upload an image.');
      setLoading(false);
      return;
    }
    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      toast.error('Price must be a positive number.');
      setLoading(false);
      return;
    }
    if (formData.category === 'All' || formData.category === '') {
      toast.error('Please select a valid category for your listing.');
      setLoading(false);
      return;
    }

    try {
      const base64Image = await convertToBase64(formData.image);
      const res = await fetch('/api/sell', {
        method: 'POST',
        body: JSON.stringify({ ...formData, price: parseFloat(formData.price), image: base64Image }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.status === 402) {
        toast.warning('You need to pay to create more listings!');
        saveFormDataToLocalStorage(formData, previewUrl);
        router.push('/payments');
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json();
        if (errorData?.message.includes('Explicit content')) {
          setIsExplicit(true);
          toast.error('Explicit image detected. Please upload a new image.');
        } else {
          toast.error(errorData?.message || 'Failed to create listing. Please try again.');
        }
        setLoading(false);
        return;
      }
      
      toast.success('Listing created successfully!');
      localStorage.removeItem('sellFormData');
      localStorage.removeItem('sellFormPreviewUrl');
      router.push('/user-dashboard');
    } catch (err: any) {
      console.error("Error submitting listing:", err);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 md:p-8"
      style={{
        backgroundImage: `url('/images/iu.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-screen-xl flex flex-col md:flex-row bg-white rounded-2xl shadow-2xl overflow-hidden min-h-[85vh]">
        
        {/* Left Side: Purple Branding Panel */}
        <div className="hidden md:flex flex-col items-start justify-center w-full md:w-2/5 p-12 bg-gradient-to-br from-purple-600 to-indigo-700 text-white relative">
          {/* ... (existing left side code) ... */}
          <AbstractLines />
          <div className="relative z-10">
            <h1 className="text-5xl font-bold mb-4">Sell Your Stuff</h1>
            <p className="text-purple-100 text-lg">
              Turn your unused items into cash. Fill out the details to create your listing.
            </p>
            <div className="mt-12 w-full space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
                  <CameraIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">1. Snap & Upload</h3>
                  <p className="text-sm text-purple-200">Take clear, well-lit photos. They are key to a quick sale!</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
                  <PencilSquareIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">2. Add Details</h3>
                  <p className="text-sm text-purple-200">Provide an honest description, fair price, and category.</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                <div className="flex-shrink-0 bg-white/20 p-2 rounded-full">
                  <ChatBubbleLeftRightIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">3. Connect & Sell</h3>
                  <p className="text-sm text-purple-200">Chat with buyers, arrange a meetup on campus, and get paid.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: White Form Panel */}
        <div className="w-full md:w-3/5 p-8 sm:p-12 lg:p-16 flex flex-col justify-center overflow-y-auto">
          <div className="w-full">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">Create New Listing</h2>
            
            <div className="bg-purple-50 border-l-4 border-purple-400 text-purple-800 p-4 mb-8 rounded-r-lg" role="alert">
              <div className="flex">
                <div className="py-1"><ExclamationTriangleIcon className="h-6 w-6 text-purple-500 mr-3" /></div>
                <div>
                  <p className="font-bold">Important Notice</p>
                  <p className="text-sm">Once created, a listing **cannot be edited or refunded**. Please review all details carefully.</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="relative">
                  <PencilSquareIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" />
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} placeholder="Product Title (e.g., 'Used Engineering Graphics Textbook')" required className="pl-12 pr-4 py-3 text-base h-14" />
                </div>

                <div className="relative">
                  <textarea id="description" name="description" value={formData.description} onChange={handleChange} placeholder="Detailed description of your product..." required rows={5} className="w-full pl-4 pr-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <TagIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" />
                        <select 
                          id="category" 
                          name="category" 
                          value={formData.category} 
                          onChange={handleChange} 
                          required 
                          className="w-full pl-12 pr-4 py-3 text-base h-14 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                        >
                            <option value="" disabled>Select a Category</option>
                            {/* --- Map over the imported PRODUCT_CATEGORIES array --- */}
                            {PRODUCT_CATEGORIES.filter(c => c !== 'All').map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="relative">
                        <CurrencyRupeeIcon className="h-6 w-6 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2 z-10" />
                        <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} placeholder="Price (₹)" required className="pl-12 pr-4 py-3 text-base h-14" />
                    </div>
                </div>

                <div>
                  <label htmlFor="image-upload" className={`w-full flex items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition text-purple-700 font-medium ${isExplicit ? 'border-red-500 bg-red-50 hover:bg-red-100' : 'border-purple-300 bg-purple-50 hover:bg-purple-100'}`}>
                    <PhotoIcon className="h-6 w-6 mr-2" />
                    <span>{formData.image ? `Selected: ${formData.image.name}` : (imageReuploadNeeded ? 'Re-upload Image Required' : (isExplicit ? 'Upload a Different Image' : 'Upload Product Image'))}</span>
                    <input id="image-upload" type="file" accept="image/*" onChange={handleImageChange} required={!previewUrl} className="hidden" />
                  </label>
                  {previewUrl && (
                    <div className="mt-4 text-center">
                      <div className="relative w-40 h-40 mx-auto rounded-lg overflow-hidden shadow-lg border-2 border-purple-200">
                        <Image src={previewUrl} alt="Product Preview" layout="fill" objectFit="cover" />
                      </div>
                      {imageReuploadNeeded && (<p className="text-sm text-red-600 mt-2 font-medium">Please re-upload this image to proceed.</p>)}
                      {isExplicit && (<p className="text-sm text-red-600 mt-2 font-medium">This image was detected as explicit. Please upload a new image.</p>)}
                    </div>
                  )}
                </div>

                <Button type="submit" disabled={loading} className={`w-full flex items-center justify-center font-bold h-14 rounded-lg text-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500 transform hover:-translate-y-px'}`}>
                  {loading ? (<><ArrowPathIcon className="animate-spin h-6 w-6 mr-3" />Creating Listing...</>) : (<><PaperAirplaneIcon className="h-6 w-6 mr-3 -rotate-45" />Create Listing</>)}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}