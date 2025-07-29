import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Listing from "@/models/Listing";
import User from "@/models/User";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { auth, currentUser } from "@clerk/nextjs/server";
import { scanImageNSFW } from "@/lib/scanImage";
import { scanHive } from "@/lib/scanHive";   

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const clerkuser = await currentUser();

    const name = clerkuser?.fullName;
    const email = clerkuser?.primaryEmailAddress?.emailAddress;

    await connectToDB();
    const body = await req.json();
    const { title, description, category, price, image } = body;

    if (!title || !description || !category || !price || !image || !userId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Permissions
    if (!user.hasUsedFreeListing) {
      user.hasUsedFreeListing = true;
    } else if (!user.canListNext) {
      return NextResponse.json({ redirect: "/payments" }, { status: 402 });
    }

    let imageUrl;
    try {
      imageUrl = await uploadImageToCloudinary(image);
    } catch {
      return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
    }

    try {
      const { safe: safeSight, reason: reasonSight } = await scanImageNSFW(imageUrl);
      if (!safeSight) {
                console.log('failing at sightenginge',safeSight,reasonSight)

        return NextResponse.json({ error: `Sightengine flagged: ${reasonSight}` }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Sightengine scan failed" }, { status: 500 });
    }

    try {
      const { safe: safeHive, reason: reasonHive } = await scanHive(imageUrl);
      if (!safeHive) {
        console.log('failing at hive',safeHive,reasonHive)
        return NextResponse.json({ error: `Hive flagged: ${reasonHive}` }, { status: 409 });
      }
    } catch {
      return NextResponse.json({ error: "Hive scan failed" }, { status: 500 });
    }

    const newListing = await Listing.create({
      title,
      description,
      price,
      sellerId: userId,
      sellerName: name,
      sellerEmail: email,
      image: imageUrl,
    });

    user.listingsCount += 1;
    if (user.canListNext) user.canListNext = false;
    await user.save();

    return NextResponse.json({ message: "Listing created", listing: newListing }, { status: 201 });
  } catch (err) {
    console.error("Error in /api/sell:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
