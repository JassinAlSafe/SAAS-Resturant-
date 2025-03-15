"use client";

import React from "react";
import { TabsList } from "@/components/ui/tabs";
import {
  UserCircle,
  ShieldCheck,
  Building,
  Database,
  Bell,
  Sliders,
  HardDrive,
} from "lucide-react";
import { SettingsTabTrigger } from "./settings-tab-trigger";

export function SettingsTabs() {
  return (
    <div className="bg-background sticky top-0 z-10 pb-4 border-b">
      <div className="overflow-x-auto">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground w-auto">
          <SettingsTabTrigger
            value="profile"
            icon={UserCircle}
            label="Profile"
          />
          <SettingsTabTrigger
            value="security"
            icon={ShieldCheck}
            label="Security"
          />
          <SettingsTabTrigger
            value="business"
            icon={Building}
            label="Business"
          />
          <SettingsTabTrigger
            value="appearance"
            icon={Sliders}
            label="Appearance"
          />
          <SettingsTabTrigger
            value="notifications"
            icon={Bell}
            label="Notifications"
          />
          <SettingsTabTrigger
            value="data"
            icon={Database}
            label="Data Management"
          />
          <SettingsTabTrigger
            value="storage"
            icon={HardDrive}
            label="Storage"
          />
        </TabsList>
      </div>
    </div>
  );
}
