//this route handles displaying a particular users listing
import { auth } from "@clerk/nextjs/server";
import Listing from "@/models/Listing";
import { connectToDB } from "@/lib/connectToDB";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  await connectToDB();

  const { userId } = await auth();

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }
     const clerkuser=await currentUser()
     let name= clerkuser?.fullName
     let email= clerkuser?.emailAddresses[0]?.emailAddress
     let avatar=clerkuser?.imageUrl
  try {
    const userDetails = {
      name: name || "CampusKart User",
      email: email ||"",
      avatar: avatar|| "",
    };

    const listings = await Listing.find({sellerId: userId })
      .select("title description price image category status")
      .lean();

    return Response.json({ userDetails, listings });
  } catch (err) {
    return new Response("Something went wrong", { status: 500 });
  }
}
