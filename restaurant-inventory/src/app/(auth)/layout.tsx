import { GeistSans } from "geist/font/sans";
import { NotificationContainer } from "@/components/ui/notification";
import { AuthProvider } from "@/lib/services/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Restaurant Inventory Manager - Authentication",
  description: "Authentication for the restaurant inventory management system",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            GeistSans.className
          )}
        >
          {children}
          <NotificationContainer />
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}
