import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationContainer } from "@/components/ui/notification";
import { NotificationProvider } from "@/lib/notification-context";
import { AuthGuard } from "@/components/auth/AuthGuard";
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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NotificationProvider>
        <div
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            GeistSans.className
          )}
        >
          <AuthGuard requireAuth={false} publicOnly={true}>
            {children}
          </AuthGuard>
          <NotificationContainer />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}
