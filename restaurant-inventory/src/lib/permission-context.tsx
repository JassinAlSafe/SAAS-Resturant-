"use client";

import { createContext, useContext } from "react";
import { useAuth } from "./services/auth-context";
import { Permission, ROLE_PERMISSIONS } from "./services/user-service";

type PermissionContextType = {
  hasPermission: (permission: Permission) => boolean;
  userRole: string | undefined;
};

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    if (!profile || !profile.role) return false;

    // Get permissions for the user's role
    const permissions = ROLE_PERMISSIONS[profile.role];

    // Check if the permission is included in the user's role permissions
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider
      value={{ hasPermission, userRole: profile?.role }}
    >
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
