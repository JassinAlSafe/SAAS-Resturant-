import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { NotificationProvider } from "@/lib/notification-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { PermissionProvider } from "@/lib/permission-context";
import { NotificationContainer } from "@/components/ui/notification";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { BusinessProfileProvider } from "@/lib/business-profile-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShelfWise | Smart Inventory Management",
  description: "Smart inventory management for restaurants and food businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <BusinessProfileProvider>
              <CurrencyProvider>
                <NotificationProvider>
                  {children}
                  <NotificationContainer />
                  <Toaster />
                </NotificationProvider>
              </CurrencyProvider>
            </BusinessProfileProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
