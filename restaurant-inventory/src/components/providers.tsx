"use client";

import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { PermissionProvider } from "@/lib/permission-context";
import { NotificationContainer } from "@/components/ui/notification";
import { Toaster } from "@/components/ui/toaster";
import { BusinessProfileProvider } from "@/lib/business-profile-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PermissionProvider>
        <BusinessProfileProvider>
          <CurrencyProvider defaultCurrency="USD">
            <NotificationProvider>
              {children}
              <NotificationContainer />
              <Toaster />
            </NotificationProvider>
          </CurrencyProvider>
        </BusinessProfileProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}
