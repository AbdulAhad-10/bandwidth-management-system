"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wifi, RefreshCw } from "lucide-react";

export default function DashboardOverview() {
  const [usage, setUsage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Get user from localStorage and fetch usage on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUsageData(parsedUser.id);
    } else {
      setError("User not found. Please login again.");
      setIsLoading(false);
    }
  }, []);

  const fetchUsageData = async (userId) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/user/usage?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setUsage(result.data);
      } else {
        setError(result.error || "Failed to fetch usage data");
      }
    } catch (err) {
      setError("Failed to fetch usage data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    if (!user) return;

    setIsRetrying(true);
    await fetchUsageData(user.id);
    setIsRetrying(false);
  };

  const handleRefresh = async () => {
    if (!user) return;
    await fetchUsageData(user.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">Loading usage data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !usage) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <Card>
          <CardContent className="py-8">
            <div className="text-center space-y-4">
              <p className="text-red-500">
                {error || "No usage data available"}
              </p>
              <Button onClick={handleRetry} disabled={isRetrying}>
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverLimit = usage.current > usage.limit;
  const usagePercentage = (usage.current / usage.limit) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Bandwidth Usage Card */}
      <Card>
        <CardHeader className="flex flex-row items-center space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            Current Bandwidth Usage
          </CardTitle>
          <Wifi className="h-5 w-5 ml-auto text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Usage Display */}
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">
                {usage.current} {usage.unit}
              </span>
              <span className="text-sm text-gray-500">
                / {usage.limit} {usage.unit}
              </span>
            </div>

            {/* Usage Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  isOverLimit
                    ? "bg-red-500"
                    : usagePercentage > 80
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>

            {/* Usage Percentage and Stats */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {usagePercentage.toFixed(1)}% of limit used
              </p>
              <p className="text-xs text-gray-500">
                {usage.policies} active policies
              </p>
            </div>

            {/* Last Updated */}
            <p className="text-xs text-gray-400">
              Last updated: {new Date(usage.lastUpdated).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert - Only show if over limit */}
      {isOverLimit && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              Usage exceeded {usage.limit} {usage.unit} limit. Contact admin.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying}
              className="ml-4"
            >
              {isRetrying ? "Retrying..." : "Retry"}
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}