"use client"

import { useState } from "react"
import { Building, Users, ShoppingCart, Cog, Bell, CreditCard, Shield, Palette, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BusinessSettings from "./business-settings"
import UserSettings from "./user-settings"
import InventorySettings from "./inventory-settings"
import IntegrationSettings from "./integration-settings"
import NotificationSettings from "./notification-settings"
import BillingSettings from "./billing-settings"
import DataSettings from "./data-settings"
import AppearanceSettings from "./appearance-settings"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SettingsLayoutProps {
  defaultTab?: string
}

export default function SettingsLayout({ defaultTab = "business" }: SettingsLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const tabs = [
    {
      id: "business",
      label: "Business Profile",
      icon: <Building className="h-5 w-5" />,
      content: <BusinessSettings />,
    },
    {
      id: "users",
      label: "User Management",
      icon: <Users className="h-5 w-5" />,
      content: <UserSettings />,
    },
    {
      id: "inventory",
      label: "Inventory & Sales",
      icon: <ShoppingCart className="h-5 w-5" />,
      content: <InventorySettings />,
    },
    {
      id: "integrations",
      label: "Integration & Automation",
      icon: <Cog className="h-5 w-5" />,
      content: <IntegrationSettings />,
    },
    {
      id: "notifications",
      label: "Notifications & Alerts",
      icon: <Bell className="h-5 w-5" />,
      content: <NotificationSettings />,
    },
    {
      id: "billing",
      label: "Billing & Subscription",
      icon: <CreditCard className="h-5 w-5" />,
      content: <BillingSettings />,
    },
    {
      id: "data",
      label: "Data & Security",
      icon: <Shield className="h-5 w-5" />,
      content: <DataSettings />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Palette className="h-5 w-5" />,
      content: <AppearanceSettings />,
    },
  ]

  if (isMobile) {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 h-auto mb-4">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2 py-2">
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="border rounded-lg p-4">
            <div className="flex items-center mb-4">
              {tab.icon}
              <h2 className="text-xl font-semibold ml-2">{tab.label}</h2>
            </div>
            <div>{tab.content}</div>
          </TabsContent>
        ))}
      </Tabs>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="md:w-1/4 lg:w-1/5">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="flex flex-col gap-1 pr-4">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className={cn("justify-start gap-2 px-3", activeTab === tab.id && "bg-muted font-medium")}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.icon}
                <span>{tab.label}</span>
                <ChevronRight
                  className={cn("ml-auto h-4 w-4 transition-transform", activeTab === tab.id && "rotate-90")}
                />
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
      <Separator orientation="vertical" className="hidden md:block" />
      <div className="flex-1 md:max-w-3xl">
        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="pr-4 pb-8">{tabs.find((tab) => tab.id === activeTab)?.content}</div>
        </ScrollArea>
      </div>
    </div>
  )
}

