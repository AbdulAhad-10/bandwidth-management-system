// app/api/admin/stats/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";

export async function GET(request) {
  try {
    await connectToDatabase();

    // Get total users (excluding admins)
    const totalUsers = await User.countDocuments({ role: { $ne: "admin" } });

    // Get total policies
    const policies = await Policy.find({}).lean();

    // Calculate total bandwidth allocated
    const totalBandwidthAllocated = policies.reduce(
      (sum, policy) => sum + policy.limit,
      0
    );

    // Calculate average bandwidth per user with policy
    const averageBandwidthPerUser =
      policies.length > 0 ? totalBandwidthAllocated / policies.length : 0;

    // Get user summaries
    const userSummaries = await Promise.all(
      policies.map(async (policy) => {
        const user = await User.findById(policy.userId)
          .select("username")
          .lean();
        return {
          username: user?.username || "Unknown User",
          limit: policy.limit,
          priority: policy.priority,
        };
      })
    );

    return NextResponse.json({
      totalUsers,
      totalBandwidthAllocated,
      averageBandwidthPerUser,
      userSummaries,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}