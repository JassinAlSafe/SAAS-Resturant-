
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "@/components/theme-provider";
import { NotificationContainer } from "@/components/ui/notification";
import { NotificationProvider } from "@/lib/notification-context";
import type { Metadata } from "next";
import { cn } from "@/lib/utils";

// IMPORTANT: Removed the AuthGuard from this layout
// Each individual auth page should decide if it needs AuthGuard

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
          {/* The children will be rendered directly without AuthGuard */}
          {children}
          <NotificationContainer />
        </div>
      </NotificationProvider>
    </ThemeProvider>
  );
}
