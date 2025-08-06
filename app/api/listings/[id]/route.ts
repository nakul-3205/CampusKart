import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/connectToDB";
import Listing from "@/models/Listing";

export async function GET (req: Request, context: { params: { id: string } })  {
  try {
    await connectToDB();

    const { id } = await context.params;

    const listing = await Listing.findById(id).lean();
    // console.log(listing)//only for dev purposes

    if (!listing) {
      return NextResponse.json(
        { success: false, message: "Listing not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, listing }, { status: 200 });

  } catch (err) {
    console.error("[LISTING_GET_ERROR]", err);
    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
};
