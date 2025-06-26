// app/api/admin/users/[userId]/route.js
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/models/User";
import Policy from "@/lib/models/Policy";

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { userId } = params;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    
    // Check if user exists
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Prevent deleting admin users (optional - you can remove this if needed)
    if (userToDelete.role === "admin") {
      return NextResponse.json(
        { error: "Cannot delete admin users" },
        { status: 400 }
      );
    }
    
    // Delete user's policy first (if exists)
    await Policy.deleteMany({ userId: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    return NextResponse.json({
      message: "User deleted successfully",
      deletedUser: {
        id: userToDelete._id,
        username: userToDelete.username,
        email: userToDelete.email,
      },
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}