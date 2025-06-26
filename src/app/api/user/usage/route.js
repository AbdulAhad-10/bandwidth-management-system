// /api/user/usage/route.js
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
    
    // Get user's global policy limit
    const userGlobalPolicy = await Policy.findOne({ userId });
    if (!userGlobalPolicy) {
      return NextResponse.json(
        {
          success: false,
          error: "No bandwidth allocation found for this user",
        },
        { status: 404 }
      );
    }
    
    // Get all user policies to calculate current usage
    const userPolicies = await UserPolicy.find({ userId });
    const totalAllocated = userPolicies.reduce(
      (sum, policy) => sum + policy.limit,
      0
    );
    
    // Calculate usage as the total allocated bandwidth from user policies
    // This represents how much bandwidth the user has allocated through their policies
    const currentUsage = totalAllocated;
    const availableBandwidth = userGlobalPolicy.limit - totalAllocated;
    
    const usageData = {
      current: Math.round(currentUsage * 10) / 10, // Round to 1 decimal
      limit: userGlobalPolicy.limit,
      allocated: totalAllocated,
      available: Math.round(availableBandwidth * 10) / 10,
      unit: "Mbps",
      lastUpdated: new Date().toISOString(),
      policies: userPolicies.length,
      utilizationRate:
        userPolicies.length > 0
          ? Math.round((totalAllocated / userGlobalPolicy.limit) * 100 * 10) /
            10
          : 0,
    };
    
    return NextResponse.json({
      success: true,
      data: usageData,
    });
  } catch (error) {
    console.error("Usage fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}