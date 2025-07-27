import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Listing from "@/models/Listing";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";

export const PATCH = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price,image } = body;

    // Update fields if provided
    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = price;
    if (image){
           try {
              let imageUrl = await uploadImageToCloudinary(image);
              listing.image=imageUrl
            } catch (err) {
              return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
            }
        
    }

    await listing.save();
    return NextResponse.json({ message: "Listing updated successfully", listing }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};

export const PUT = async (req: Request, { params }: { params: { id: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDB();

    const listing = await Listing.findById(params.id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    
    listing.status = listing.status === "sold" ? "active" : "sold";

    await listing.save();
    return NextResponse.json({
      message: `Listing marked as ${listing.status}`,
      status: listing.status,
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
};
