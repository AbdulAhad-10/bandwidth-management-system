"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardOverview from "@/components/dashboard-overview";
import BandwidthPolicyForm from "@/components/bandwidth-policy-form";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Mock bandwidth usage data
  const [bandwidthUsage] = useState({
    current: 2.5,
    limit: 5.0,
    unit: "Mbps",
  });

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">
              Bandwidth Management System
            </h1>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Dashboard Overview Section */}
          <DashboardOverview usage={bandwidthUsage} />

          {/* Bandwidth Policy Form Section */}
          <BandwidthPolicyForm />
        </div>
      </main>
    </div>
  );
}