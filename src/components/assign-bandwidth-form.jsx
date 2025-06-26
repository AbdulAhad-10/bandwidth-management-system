"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, UserIcon } from "lucide-react";

export default function AssignBandwidthForm() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    limit: "",
    priority: "Medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Assign policy via API
  const assignPolicy = async (data) => {
    const response = await fetch("/api/admin/policies", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: data.userId,
        limit: Number(data.limit),
        priority: data.priority,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 404) {
        throw new Error("User not found.");
      } else if (response.status === 400) {
        throw new Error(errorData.error || "Invalid request data.");
      }

      throw new Error(errorData.error || "Failed to assign policy");
    }

    return response.json();
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers();
    } finally {
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter out admin users
  const availableUsers = users.filter((user) => user.role !== "admin");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.userId) {
      toast({
        title: "Error",
        description: "Please select a user",
        variant: "destructive",
      });
      return;
    }

    if (!formData.limit || Number(formData.limit) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid bandwidth limit",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await assignPolicy(formData);

      // Get the username for the success message
      const selectedUser = users.find((user) => user.id === formData.userId);
      const username = selectedUser?.username || "user";

      // Reset form
      setFormData({
        userId: "",
        limit: "",
        priority: "Medium",
      });

      toast({
        title: "Success",
        description: `${result.message} for ${username}`,
      });

      // Refresh users list to update any bandwidth assignments shown elsewhere
      await fetchUsers();
    } catch (error) {
      console.error("Error assigning policy:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to assign policy",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      userId: value,
    }));
  };

  const handlePriorityChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      priority: value,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Assign Bandwidth</h2>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading users...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Assign Bandwidth</h2>
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

      <Card>
        <CardHeader>
          <CardTitle>Assign Bandwidth Policy to User</CardTitle>
        </CardHeader>
        <CardContent>
          {availableUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No users available for bandwidth assignment
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Only non-admin users can be assigned bandwidth policies
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="user">User</Label>
                <Select
                  value={formData.userId}
                  onValueChange={handleUserChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username} ({user.email})
                        {user.bandwidthLimit && (
                          <span className="text-sm text-gray-500 ml-2">
                            - Current: {user.bandwidthLimit} Mbps
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bandwidth Limit */}
              <div className="space-y-2">
                <Label htmlFor="limit">Bandwidth Limit (Mbps)</Label>
                <Input
                  id="limit"
                  name="limit"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.limit}
                  onChange={handleInputChange}
                  required
                  min="0.1"
                  step="0.1"
                />
                <p className="text-sm text-gray-500">
                  Enter the maximum bandwidth limit in Mbps
                </p>
              </div>

              {/* Priority Selection */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level</Label>
                <Select
                  value={formData.priority}
                  onValueChange={handlePriorityChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High Priority</SelectItem>
                    <SelectItem value="Medium">Medium Priority</SelectItem>
                    <SelectItem value="Low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500">
                  Higher priority users get better bandwidth allocation during
                  congestion
                </p>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Assigning Policy...
                  </>
                ) : (
                  "Assign Bandwidth Policy"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}