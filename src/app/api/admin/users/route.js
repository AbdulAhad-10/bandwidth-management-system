// app/api/admin/users/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";

export async function GET(request) {
  try {
    await connectToDatabase();
    
    // Get all users with their policies
    const users = await User.find({}).select("-password").lean();
    
    // Get all policies
    const policies = await Policy.find({}).lean();
    
    // Combine user data with policy data
    const usersWithPolicies = users.map((user) => {
      const userPolicy = policies.find((p) => p.userId === user._id.toString());
      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt || new Date(),
        bandwidthLimit: userPolicy?.limit,
        priority: userPolicy?.priority,
        assignedBy: userPolicy?.assignedBy,
      };
    });
    
    return NextResponse.json({ users: usersWithPolicies });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
