"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useAuth } from "./auth-context";

// Define the permission types
type UserRole = "admin" | "manager" | "staff" | "guest";

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface UserPermission {
  role: UserRole;
  permissions: Permission[];
}

// Define the permission context type
interface PermissionContextType {
  userRole: UserRole;
  permissions: Permission[];
  isAdmin: boolean;
  isManager: boolean;
  hasPermission: (permissionName: string) => boolean;
  isLoading: boolean;
  error: string | null;
  refreshPermissions: () => Promise<void>;
}

// Create the context with default values
const PermissionContext = createContext<PermissionContextType>({
  userRole: "guest",
  permissions: [],
  isAdmin: false,
  isManager: false,
  hasPermission: () => false,
  isLoading: true,
  error: null,
  refreshPermissions: async () => {},
});

interface PermissionProviderProps {
  children: ReactNode;
}

// Create a provider component
export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>("guest");
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Computed properties
  const isAdmin = userRole === "admin";
  const isManager = userRole === "manager" || isAdmin;

  // Function to check if user has a specific permission
  const hasPermission = useCallback(
    (permissionName: string): boolean => {
      if (isAdmin) return true; // Admins have all permissions
      return permissions.some((permission) => permission.name === permissionName);
    },
    [permissions, isAdmin]
  );

  // Fetch user permissions
  const fetchUserPermissions = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch the user\'s permissions from the API
      const response = await fetch(`/api/permissions/${user.id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch permissions: ${response.statusText}`);
      }

      const data: UserPermission = await response.json();
      setUserRole(data.role || "guest");
      setPermissions(data.permissions || []);
    } catch (err) {
      console.error("Error fetching permissions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch permissions");
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Fetch permissions when the user changes
  useEffect(() => {
    fetchUserPermissions();
  }, [user?.id, fetchUserPermissions]);

  // Function to refresh permissions
  const refreshPermissions = async () => {
    await fetchUserPermissions();
  };

  const value = {
    userRole,
    permissions,
    isAdmin,
    isManager,
    hasPermission,
    isLoading,
    error,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// Create a hook to use the permission context
export function usePermission() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
}
