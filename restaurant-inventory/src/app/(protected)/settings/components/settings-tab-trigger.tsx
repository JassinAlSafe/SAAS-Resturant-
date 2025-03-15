"use client";

import React from "react";
import { TabsTrigger } from "@/components/ui/tabs";
import { LucideIcon } from "lucide-react";

interface SettingsTabTriggerProps {
  value: string;
  icon: LucideIcon;
  label: string;
}

export function SettingsTabTrigger({
  value,
  icon: Icon,
  label,
}: SettingsTabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
    >
      <Icon className="h-5 w-5 mr-2" />
      <span>{label}</span>
    </TabsTrigger>
  );
}
