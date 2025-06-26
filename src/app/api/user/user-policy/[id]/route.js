// /api/user/user-policy/[id]/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import UserPolicy from "@/lib/models/UserPolicy";

export async function DELETE(request, { params }) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Policy ID is required" },
        { status: 400 }
      );
    }
    
    // Find and delete the user policy
    const deletedPolicy = await UserPolicy.findByIdAndDelete(id);
    
    if (!deletedPolicy) {
      return NextResponse.json(
        { success: false, error: "Policy not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: "Policy deleted successfully",
        data: deletedPolicy,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete policy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete policy" },
      { status: 500 }
    );
  }
}