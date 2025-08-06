import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Listing from "@/models/Listing";
// import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";



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

