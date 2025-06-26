"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Zap, TrendingUp, Loader2, RefreshCw } from "lucide-react";

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = "/api/admin/stats";
      console.log("Fetching from:", url); // Debug log

      const response = await fetch(url);

      console.log("Response status:", response.status); // Debug log
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      ); // Debug log

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText); // Debug log
        throw new Error(
          `Failed to fetch stats: ${response.status} - ${errorText}`
        );
      }

      const statsData = await response.json();
      console.log("Stats data received:", statsData); // Debug log
      setData(statsData);
    } catch (err) {
      console.error("Error fetching admin stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStats();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading admin statistics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="mb-4 text-red-600">Error loading statistics</p>
              <p className="mb-4 text-sm text-gray-600">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-white transition-colors bg-blue-600 rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-600">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Overview</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active users in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Bandwidth
            </CardTitle>
            <Zap className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.totalBandwidthAllocated} Mbps
            </div>
            <p className="text-xs text-muted-foreground">
              Total allocated bandwidth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Average per User
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.averageBandwidthPerUser.toFixed(1)} Mbps
            </div>
            <p className="text-xs text-muted-foreground">
              Average bandwidth allocation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Summaries */}
      <Card>
        <CardHeader>
          <CardTitle>User Bandwidth Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {data.userSummaries.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No users with bandwidth assignments yet.
            </div>
          ) : (
            <div className="space-y-4">
              {data.userSummaries.map((user, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-medium">{user.username}</span>
                    <Badge className={getPriorityColor(user.priority)}>
                      {user.priority}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold">{user.limit} Mbps</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}