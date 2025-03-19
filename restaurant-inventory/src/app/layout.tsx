import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { NotificationContainer } from "@/components/ui/notification";
import { NotificationProvider } from "@/lib/notification-context";
import { StoreInitializer } from "@/components/StoreInitializer";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";
import { type ReactNode } from "react";
import { AuthProvider } from "@/lib/contexts/auth-context";
import TokenErrorBoundary from "@/components/auth/TokenErrorBoundary";

export const metadata: Metadata = {
  title: "Restaurant Inventory Management",
  description: "Manage your restaurant inventory efficiently",
  authors: [{ name: "ShelfWise" }],
  keywords: ["inventory management", "restaurant", "food business"],
  icons: {
    icon: "/favicon.ico",
  },
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          GeistSans.className
        )}
      >
        <Providers>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
              storageKey="shelfwise-theme"
            >
              <NotificationProvider>
                <TokenErrorBoundary>
                  <StoreInitializer />
                  {children}
                  <Toaster />
                  <NotificationContainer />
                </TokenErrorBoundary>
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
