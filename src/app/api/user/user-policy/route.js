// /api/user/user-policy/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserPolicy from "@/lib/models/UserPolicy";
import Policy from "@/lib/models/Policy";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }
    
    const userPolicies = await UserPolicy.find({ userId }).sort({
      createdAt: -1,
    });
    
    return NextResponse.json({ success: true, data: userPolicies });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user policies" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const { userId, name, ipRange, limit, priority } = body;
    
    // Basic validation
    if (!userId || !name || !ipRange || !limit || !priority) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    if (limit <= 0) {
      return NextResponse.json(
        { success: false, error: "Limit must be greater than 0" },
        { status: 400 }
      );
    }
    
    // Get user's global policy limit
    const userGlobalPolicy = await Policy.findOne({ userId });
    if (!userGlobalPolicy) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No bandwidth allocation found for this user. Please contact administrator.",
        },
        { status: 403 }
      );
    }
    
    // Calculate current total allocated bandwidth
    const existingUserPolicies = await UserPolicy.find({ userId });
    const totalAllocated = existingUserPolicies.reduce(
      (sum, policy) => sum + policy.limit,
      0
    );
    
    // Check if new policy would exceed the global limit
    if (totalAllocated + limit > userGlobalPolicy.limit) {
      const remainingLimit = userGlobalPolicy.limit - totalAllocated;
      return NextResponse.json(
        {
          success: false,
          error: `Bandwidth limit exceeded. You have ${remainingLimit} Mbps remaining out of ${userGlobalPolicy.limit} Mbps total.`,
        },
        { status: 400 }
      );
    }
    
    // Create new user policy
    const userPolicy = new UserPolicy({
      userId,
      name,
      ipRange,
      limit,
      priority,
    });
    
    await userPolicy.save();
    
    return NextResponse.json(
      { success: true, data: userPolicy },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create user policy" },
      { status: 500 }
    );
  }
}