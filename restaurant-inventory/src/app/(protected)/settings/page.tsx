"use client";

import React, { useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { SettingsTabs } from "./components/settings-tabs";
import { ProfileSection } from "./components/profile-section";
import { SecuritySection } from "./components/security-section";
import { BusinessSettings } from "./components/business-settings-combined";
import { ThemeSection } from "./components/theme-section";
import NotificationSettings from "./components/notification-settings";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HardDrive } from "lucide-react";
import { useAuth } from "@/lib/services/auth-context";
import { cn } from "@/lib/utils";

// Skeleton loader component for content loading states
const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={cn("space-y-3", className)}>
    <div className="h-4 w-3/4 rounded-md bg-muted animate-pulse"></div>
    <div className="h-4 w-1/2 rounded-md bg-muted animate-pulse"></div>
    <div className="h-4 w-5/6 rounded-md bg-muted animate-pulse"></div>
    <div className="h-4 w-2/3 rounded-md bg-muted animate-pulse"></div>
  </div>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("profile");

  // Handle tab change for accessibility announcements
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Announce tab change to screen readers
    const announcement = document.getElementById("tab-change-announcement");
    if (announcement) {
      announcement.textContent = `${value} tab selected`;
    }
  };

  // Handle scroll for back-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      const backToTopButton = document.getElementById("back-to-top-button");
      if (backToTopButton) {
        if (window.scrollY > 300) {
          backToTopButton.classList.remove("opacity-0");
          backToTopButton.classList.add("opacity-100");
        } else {
          backToTopButton.classList.remove("opacity-100");
          backToTopButton.classList.add("opacity-0");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      {/* Visually hidden announcement for screen readers */}
      <div
        id="tab-change-announcement"
        className="sr-only"
        aria-live="polite"
      ></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground max-w-3xl">
            Manage your account settings, configure your restaurant preferences,
            and control your system settings.
          </p>
          <Separator className="my-2" />
        </div>

        <Tabs
          defaultValue="profile"
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full space-y-8"
        >
          {/* Sticky tabs navigation with enhanced styling */}
          <div className="sticky top-0 z-10 bg-background pt-2 pb-4 border-b">
            <SettingsTabs />
          </div>

          {/* Enhanced tab content with better visual hierarchy */}
          <TabsContent
            value="profile"
            className="mt-6 space-y-8 transition-all duration-200 ease-in-out"
          >
            <div className="bg-card/40 rounded-lg p-6 shadow-sm border">
              <ProfileSection />
            </div>
          </TabsContent>

          <TabsContent
            value="security"
            className="mt-6 space-y-8 transition-all duration-200 ease-in-out"
          >
            <div className="bg-card/40 rounded-lg p-6 shadow-sm border">
              <SecuritySection />
            </div>
          </TabsContent>

          <TabsContent
            value="business"
            className="mt-6 transition-all duration-200 ease-in-out"
          >
            <div className="bg-card/40 rounded-lg p-6 shadow-sm border">
              <BusinessSettings />
            </div>
          </TabsContent>

          <TabsContent
            value="appearance"
            className="mt-6 transition-all duration-200 ease-in-out"
          >
            <div className="bg-card/40 rounded-lg p-6 shadow-sm border">
              <ThemeSection />
            </div>
          </TabsContent>

          <TabsContent
            value="notifications"
            className="mt-6 transition-all duration-200 ease-in-out"
          >
            <div className="bg-card/40 rounded-lg p-6 shadow-sm border">
              <NotificationSettings />
            </div>
          </TabsContent>

          <TabsContent
            value="data"
            className="mt-6 transition-all duration-200 ease-in-out"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    Data Management
                  </CardTitle>
                  <CardDescription>
                    Manage your data and exports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Data management settings will be implemented in a future
                    update.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent
            value="storage"
            className="mt-6 transition-all duration-200 ease-in-out"
          >
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-primary" />
                    Storage Usage
                  </CardTitle>
                  <CardDescription>
                    Monitor and manage your storage usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!user ? (
                    <div className="flex flex-col space-y-4 py-4">
                      <SkeletonLoader />
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-muted-foreground/30 w-2/3 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Storage usage information will be loaded from your
                        account.
                      </p>
                      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary w-0 transition-all duration-700 ease-in-out"></div>
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>0 GB</span>
                        <span>10 GB</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to top button - appears when scrolled down */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 bg-primary text-primary-foreground p-3 rounded-full shadow-lg opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-200 ease-in-out"
          aria-label="Back to top"
          id="back-to-top-button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-up"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
