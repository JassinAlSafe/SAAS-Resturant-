"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./contexts/auth-context";
import { Permission, ROLE_PERMISSIONS } from "./services/user-service";

type Role = keyof typeof ROLE_PERMISSIONS;

type PermissionContextType = {
  hasPermission: (permission: Permission) => boolean;
  userRole: Role | undefined;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<Role | undefined>(undefined);

  // Get user role from metadata when user changes
  useEffect(() => {
    if (user && user.user_metadata?.role) {
      const role = user.user_metadata.role as Role;
      setUserRole(role);
    } else {
      setUserRole(undefined);
    }
  }, [user]);

  const hasPermission = (permission: Permission): boolean => {
    // Early return if no role
    if (!userRole) return false;

    // Get permissions for the user's role
    const permissions = ROLE_PERMISSIONS[userRole];

    // Check if the permission is included in the user's role permissions
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider value={{ hasPermission, userRole }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);

  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }

  return context;
}
