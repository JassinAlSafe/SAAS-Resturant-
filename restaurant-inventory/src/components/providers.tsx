"use client";

import { AuthProvider } from "@/lib/contexts/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { CurrencyProvider } from "@/lib/currency";
import { PermissionProvider } from "@/lib/permission-context";
import { Toaster } from "@/components/ui/toaster";
import { BusinessProfileProvider } from "@/lib/business-profile-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <AuthProvider>
          <PermissionProvider>
            <BusinessProfileProvider>
              <CurrencyProvider>
                {children}
                <Toaster />
              </CurrencyProvider>
            </BusinessProfileProvider>
          </PermissionProvider>
        </AuthProvider>
      </NotificationProvider>
    </QueryClientProvider>
  );
}
