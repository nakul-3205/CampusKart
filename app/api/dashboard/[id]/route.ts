import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Listing from "@/models/Listing";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";

// PATCH - Edit listing
export async function PATCH(req: NextRequest, context: { params: { id: string }}) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      console.log('patch hit')

    const { id } = context.params;
    await connectToDB();
    console.log('PATCH hit backend with ID:', id);

    const listing = await Listing.findById(id);
    console.log(listing)
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, price, image } = body;

    if (title) listing.title = title;
    if (description) listing.description = description;
    if (price) listing.price = price;

    if (image) {
      try {
        const imageUrl = await uploadImageToCloudinary(image);
        listing.image = imageUrl;
      } catch (err) {
        return NextResponse.json({ error: "Image upload failed" }, { status: 500 });
      }
    }

    await listing.save();
    return NextResponse.json(
      { message: "Listing updated successfully", listing },
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// PUT - Toggle listing status (sold <-> active)
export async function PUT(req: NextRequest, context: { params: { id: string }}) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = context.params;
    await connectToDB();

    const listing = await Listing.findById(id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (listing.sellerId !== userId) {
      return NextResponse.json({ error: "You do not own this listing" }, { status: 403 });
    }

    listing.status = listing.status === "sold" ? "active" : "sold";
    await listing.save();

    return NextResponse.json(
      {
        message: `Listing marked as ${listing.status}`,
        status: listing.status,
      },
      { status: 200 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}


export async function GET(req: NextRequest, context: { params: { id: string } }) {
  try {
    const id = await context.params.id;
    await connectToDB();

    const listing = await Listing.findById(id);
    console.log(listing)
    if (!listing) {
      return new Response(JSON.stringify({ success: false, message: "Listing not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true, listing }), { status: 200 });

  } catch (err) {
    console.error("Error fetching listing:", err);
    return new Response(JSON.stringify({ success: false, message: "Server error" }), {
      status: 500,
    });
  }
}

