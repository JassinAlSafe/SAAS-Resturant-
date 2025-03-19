"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/contexts/auth-context";
import { RestaurantIconsSetup } from "./business-profile/RestaurantIconsSetup";
import { BusinessProfileTabs } from "./business-profile/BusinessProfileTabs";

/**
 * Combined Business Settings Component
 *
 * This component integrates the best features from both the simple business-settings
 * and the more detailed business-profile components.
 */
export function BusinessSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  // If there's no user, show a message
  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Profile</CardTitle>
          <CardDescription>
            Please sign in to manage your restaurant settings.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Tabs
      defaultValue="profile"
      className="w-full"
      onValueChange={setActiveTab}
      value={activeTab}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">Restaurant Details</TabsTrigger>
        <TabsTrigger value="preferences">Business Settings</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-6 space-y-6">
        {/* Business Profile Tabs */}
        <BusinessProfileTabs userId={user.id} />
      </TabsContent>

      <TabsContent value="preferences" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>
              Configure your restaurant&apos;s preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-4 text-center">
              <span className="text-sm text-muted-foreground">
                Loading preferences...
              </span>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="advanced" className="mt-6 space-y-6">
        {/* Restaurant Icons Setup */}
        <RestaurantIconsSetup />
      </TabsContent>
    </Tabs>
  );
}
