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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NotificationProvider>
              <CurrencyProvider>
                <PermissionProvider>
                  {children}
                  <NotificationContainer />
                  <Toaster />
                </PermissionProvider>
              </CurrencyProvider>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
