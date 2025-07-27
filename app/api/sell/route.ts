//the route handles the sell logic and temproary payments logic using the payments button instead of stripe

import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB"; 
import Listing from "@/models/Listing";
import User from "@/models/User";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { auth,currentUser } from "@clerk/nextjs/server";
// import { clerkClient } from "@clerk/nextjs/server";
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
     const clerkuser = await currentUser()

  const name = clerkuser?.fullName
  const email = clerkuser?.primaryEmailAddress
    await connectToDB();

    const body = await req.json();
    const { title, description, category, price, image } = body;

    if (!title || !description || !category || !price || !image || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    //  Listing Permission Check
    if (!user.hasUsedFreeListing) {
      
      user.hasUsedFreeListing = true;
    } else if (!user.canListNext) {
    
      return NextResponse.json({ redirect: "/payments" }, { status: 402 });
    }

    //  Upload image
    let imageUrl;
    try {
      imageUrl = await uploadImageToCloudinary(image);
    } catch (err) {
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }

    const newListing = await Listing.create({
      title,
      description,
      price,
      sellerId:userId,
      sellerName:name,
      sellerEmail:email,
      imageUrl,
      createdBy: userId,
    });

    user.listingsCount += 1;

    
    if (user.canListNext) {
      user.canListNext = false;
    }

    await user.save();

    return NextResponse.json(
      { message: "Listing created", listing: newListing },
      { status: 201 }
    );

  } catch (err) {
    console.error("Error in /api/sell:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
