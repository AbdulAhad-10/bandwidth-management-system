// app/api/admin/policies/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { userId, limit, priority } = body;

    if (!userId || !limit || !priority) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is not admin (optional - you can remove this check if needed)
    if (user.role === "admin") {
      return NextResponse.json(
        { error: "Cannot assign policy to admin users" },
        { status: 400 }
      );
    }

    // Check if policy already exists for this user
    const existingPolicy = await Policy.findOne({ userId });
    if (existingPolicy) {
      // Update existing policy
      const updatedPolicy = await Policy.findOneAndUpdate(
        { userId },
        {
          limit: Number(limit),
          priority,
          // Remove assignedBy since we don't have admin user ID
          // assignedBy: adminUserId,
        },
        { new: true }
      );

      return NextResponse.json({
        message: "Policy updated successfully",
        policy: updatedPolicy,
      });
    } else {
      // Create new policy
      const newPolicy = await Policy.create({
        userId,
        limit: Number(limit),
        priority,
        // Remove assignedBy since we don't have admin user ID
        // assignedBy: adminUserId,
      });

      return NextResponse.json({
        message: "Policy created successfully",
        policy: newPolicy,
      });
    }
  } catch (error) {
    console.error("Create/Update policy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectToDatabase();
    const policies = await Policy.find({}).lean();

    // Get user details for each policy
    const policiesWithUsers = await Promise.all(
      policies.map(async (policy) => {
        const user = await User.findById(policy.userId)
          .select("username email")
          .lean();
        return {
          id: policy._id,
          userId: policy.userId,
          username: user?.username || "Unknown User",
          email: user?.email || "Unknown Email",
          limit: policy.limit,
          priority: policy.priority,
          createdAt: policy.createdAt || new Date(),
        };
      })
    );

    return NextResponse.json({ policies: policiesWithUsers });
  } catch (error) {
    console.error("Get policies error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}