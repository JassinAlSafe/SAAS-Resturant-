import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { cabinetGrotesk, satoshi } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "ShelfWise | Smart Inventory Management",
  description: "Smart inventory management for restaurants and food businesses",
  authors: [{ name: "ShelfWise" }],
  keywords: ["inventory management", "restaurant", "food business"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zooming for accessibility
  minimumScale: 1,
  userScalable: true, // Enable zooming for accessibility
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#020817" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(cabinetGrotesk.variable, satoshi.variable)}
      suppressHydrationWarning
    >
      <head />
      <body className="min-h-screen bg-base-100 font-sans antialiased">
        <ThemeProvider>
          <Providers>
            {children}
            <Sonner />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
