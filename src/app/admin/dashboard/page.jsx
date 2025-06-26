"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import AdminOverview from "@/components/admin-overview";
import AssignBandwidthForm from "@/components/assign-bandwidth-form";
import UserManagementTable from "@/components/user-management-table";
import { LogOut, Shield } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Mock data - In a real app, this would come from your API
  const [users, setUsers] = useState([
    {
      id: "1",
      username: "admin",
      email: "admin@example.com",
      role: "admin",
      createdAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      username: "john_doe",
      email: "john@example.com",
      role: "user",
      bandwidthLimit: 10,
      priority: "High",
      createdAt: new Date("2024-01-15"),
      lastActive: new Date("2024-01-20"),
    },
    {
      id: "3",
      username: "jane_smith",
      email: "jane@example.com",
      role: "user",
      bandwidthLimit: 5,
      priority: "Medium",
      createdAt: new Date("2024-01-10"),
      lastActive: new Date("2024-01-19"),
    },
    {
      id: "4",
      username: "bob_wilson",
      email: "bob@example.com",
      role: "user",
      createdAt: new Date("2024-01-12"),
    },
  ]);

  const [adminOverviewData, setAdminOverviewData] = useState({
    totalUsers: 0,
    totalBandwidthAllocated: 0,
    averageBandwidthPerUser: 0,
    userSummaries: [],
  });

  // Calculate admin overview data
  useEffect(() => {
    const regularUsers = users.filter((user) => user.role !== "admin");
    const usersWithBandwidth = regularUsers.filter(
      (user) => user.bandwidthLimit
    );
    const totalBandwidth = usersWithBandwidth.reduce(
      (sum, user) => sum + (user.bandwidthLimit || 0),
      0
    );
    const averageBandwidth =
      usersWithBandwidth.length > 0
        ? totalBandwidth / usersWithBandwidth.length
        : 0;

    setAdminOverviewData({
      totalUsers: regularUsers.length,
      totalBandwidthAllocated: totalBandwidth,
      averageBandwidthPerUser: averageBandwidth,
      userSummaries: usersWithBandwidth.map((user) => ({
        username: user.username,
        limit: user.bandwidthLimit || 0,
        priority: user.priority || "Medium",
      })),
    });
  }, [users]);

  const handleLogout = () => {
    try {
      // Clear authentication data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Show logout success message
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Something went wrong during logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">
                Bandwidth Management System
              </h1>
              <span className="px-2 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                Admin
              </span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Admin Overview Section */}
          <AdminOverview />

          {/* Assign Bandwidth Form Section */}
          <AssignBandwidthForm />

          {/* User Management Table Section */}
          <UserManagementTable />
        </div>
      </main>

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}