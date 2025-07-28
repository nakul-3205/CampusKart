import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { connectToDB } from "@/lib/connectToDB";
import User from "@/models/User";

export async function POST() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDB();

    const user = await User.findOne({ clerkId: userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    //  Allow 1 more listing
    user.canListNext = true;
    await user.save();

    return NextResponse.json({ message: "Listing permission unlocked!" }, { status: 200 });

  } catch (err) {
    console.error("Error in /api/payments/unlock:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
