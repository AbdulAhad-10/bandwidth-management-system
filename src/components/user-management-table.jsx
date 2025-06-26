"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Shield, UserIcon, Loader2, RefreshCw } from "lucide-react";
import { UsersIcon } from "lucide-react";

export default function UserManagementTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  // Function to get auth token
  const getAuthToken = () => {
    try {
      // Based on your login API, the token should be stored as 'token'
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No authentication token found in localStorage");
        return null;
      }

      // Verify token format (JWT tokens have 3 parts separated by dots)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid token format");
        return null;
      }

      return token;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return null;
    }
  };

  // Function to handle token expiration/invalid token
  const handleAuthError = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({
      title: "Session Expired",
      description: "Please log in again to continue",
      variant: "destructive",
    });
    // You might want to redirect to login page here
    // window.location.href = '/login';
  };

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();

      if (!token) {
        handleAuthError();
        return;
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        handleAuthError();
        return;
      }

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

  // Delete user via API
  const deleteUserFromAPI = async (userId) => {
    const token = getAuthToken();

    if (!token) {
      handleAuthError();
      throw new Error("Authentication required");
    }

    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 401) {
      handleAuthError();
      throw new Error("Session expired. Please log in again.");
    }

    if (!response.ok) {
      const errorData = await response.json();

      // Handle specific error cases
      if (response.status === 403) {
        throw new Error("Access denied. Admin role required.");
      } else if (response.status === 404) {
        throw new Error("User not found.");
      } else if (response.status === 400) {
        throw new Error(errorData.error || "Cannot delete this user.");
      }

      throw new Error(errorData.error || "Failed to delete user");
    }

    return response.json();
  };

  // Handle delete user
  const handleDeleteUser = async (userId, username) => {
    setDeletingUserId(userId);

    try {
      await deleteUserFromAPI(userId);
      // Remove user from local state
      setUsers((prev) => prev.filter((user) => user.id !== userId));

      toast({
        title: "Success",
        description: `User ${username} has been deleted`,
      });
    } catch (error) {
      console.error("Failed to delete user:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
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

  const formatDate = (date) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(dateObj);
  };

  const currentUsers = users;

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            <span className="ml-2 text-gray-500">Loading users...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Users</h2>
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
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            User Management ({currentUsers.length} users)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentUsers.length === 0 ? (
            <div className="py-8 text-center">
              <UserIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Bandwidth Limit</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.role === "admin" ? (
                            <Shield className="w-4 h-4 text-blue-600" />
                          ) : (
                            <UserIcon className="w-4 h-4 text-gray-400" />
                          )}
                          {user.username}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "secondary"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.bandwidthLimit
                          ? `${user.bandwidthLimit} Mbps`
                          : "Not assigned"}
                      </TableCell>
                      <TableCell>
                        {user.priority ? (
                          <Badge className={getPriorityColor(user.priority)}>
                            {user.priority}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {user.role !== "admin" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletingUserId === user.id}
                              >
                                {deletingUserId === user.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete user &quot;
                                  {user.username}&quot;? This action cannot be
                                  undone and will remove all associated data.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteUser(user.id, user.username)
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}