import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadImageToCloudinary = async (imageData: string) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: "marketplace_listings",
    });

    return uploadResponse.secure_url;
  } catch (error) {
    console.error("Cloudinary upload failed", error);
    throw new Error("Image upload failed");
  }
};
