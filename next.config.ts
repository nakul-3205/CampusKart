import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   images: {
    // domains: ["img.clerk.com",'res.cloudinary.com'],
        // domains: ['res.cloudinary.com'],
        domains: ['res.cloudinary.com', 'img.clerk.com']

  },
};

export default nextConfig;
