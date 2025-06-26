"use client";

import React from "react";

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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function BandwidthPolicyForm() {
  const [formData, setFormData] = useState({
    name: "",
    ipRange: "",
    limit: "",
    priority: "Medium",
  });

  const [policies, setPolicies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const { toast } = useToast();

  // Get user from localStorage and fetch policies on component mount
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchUserPolicies(parsedUser.id);
    } else {
      setError("User not found. Please login again.");
      setIsLoading(false);
    }
  }, []);

  const fetchUserPolicies = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/user-policy?userId=${userId}`);
      const result = await response.json();

      if (result.success) {
        setPolicies(result.data);
      } else {
        setError(result.error || "Failed to fetch policies");
      }
    } catch (err) {
      setError("Failed to fetch policies");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/user/user-policy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          name: formData.name,
          ipRange: formData.ipRange,
          limit: Number.parseFloat(formData.limit),
          priority: formData.priority,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Add new policy to the list
        setPolicies((prev) => [result.data, ...prev]);

        // Reset form
        setFormData({
          name: "",
          ipRange: "",
          limit: "",
          priority: "Medium",
        });
      } else {
        setError(result.error || "Failed to create policy");
      }
    } catch (err) {
      setError("Failed to create policy");
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

  const handlePriorityChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      priority: value,
    }));
  };

  const handleDeletePolicy = async (id) => {
    try {
      const response = await fetch(`/api/user/user-policy/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Remove from state only after successful deletion
        setPolicies((prev) => prev.filter((policy) => policy._id !== id));

        // Show success toast
        toast({
          title: "Success",
          description: "Policy deleted successfully",
        });
      } else {
        setError(result.error || "Failed to delete policy");
      }
    } catch (err) {
      setError("Failed to delete policy");
    }
  };

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Create Bandwidth Policy
        </h2>
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-gray-500">Loading policies...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        Create Bandwidth Policy
      </h2>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="destructive"
          className="flex items-center justify-between p-4 rounded-lg shadow-md bg-red-50 border border-red-200"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-sm font-medium text-red-800">
              {error}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Policy Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Policy Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Policy Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter policy name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* IP Range */}
            <div className="space-y-2">
              <Label htmlFor="ipRange">IP Range</Label>
              <Input
                id="ipRange"
                name="ipRange"
                type="text"
                placeholder="e.g., 192.168.1.1"
                value={formData.ipRange}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Bandwidth Limit */}
            <div className="space-y-2">
              <Label htmlFor="limit">Limit (Mbps)</Label>
              <Input
                id="limit"
                name="limit"
                type="number"
                placeholder="e.g., 5"
                value={formData.limit}
                onChange={handleInputChange}
                required
                min="0"
                step="0.1"
                disabled={isSubmitting}
              />
            </div>

            {/* Priority Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={handlePriorityChange}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding Policy..." : "Add Policy"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Policies List */}
      <Card>
        <CardHeader>
          <CardTitle>Active Policies ({policies.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {policies.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No policies created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {policies.map((policy) => (
                <div
                  key={policy._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{policy.name}</span>
                      <Badge className={getPriorityColor(policy.priority)}>
                        {policy.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {policy.ipRange} - {policy.limit} Mbps
                    </p>
                    <p className="text-xs text-gray-400">
                      Created: {new Date(policy.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePolicy(policy._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}