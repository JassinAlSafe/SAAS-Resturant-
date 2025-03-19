import "@/app/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { StoreInitializer } from "@/components/StoreInitializer";
import { GeistSans } from "geist/font/sans";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Restaurant Inventory Manager",
  description: "Manage your restaurant inventory efficiently",
  authors: [{ name: "ShelfWise" }],
  keywords: ["inventory management", "restaurant", "food business"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            storageKey="shelfwise-theme"
          >
            <StoreInitializer />
            {children}
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
