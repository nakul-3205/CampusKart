//the route fetches all the listings for the feed page 
import { connectToDB } from "@/lib/connectToDB";
import ListingModel from "@/models/Listing";
import { NextResponse } from "next/server";

export async function GET ()  {
  try {
    await connectToDB();

    const listings = await ListingModel.find({status:'active'})
      .select("title price image category") 
      .lean(); 
    
    

    return NextResponse.json({ success: true, data: listings });
  } catch (err) {
    console.error("Failed to fetch listings:", err);
    return NextResponse.json({ success: false, message: "Error fetching listings" }, { status: 500 });
  }
};
