"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { CustomCheckbox } from "@/components/ui/custom-checkbox";
import { Bell, Mail, Smartphone, Loader2, Clock } from "lucide-react";
import { useNotificationSettings } from "../hooks/useNotificationSettings";

export default function NotificationSettings() {
  const {
    preferences,
    updatePreference,
    schedule,
    updateSchedule,
    savePreferences,
    saveSchedule,
    isLoading,
    isSaving,
  } = useNotificationSettings();

  // If still loading preferences, show loading state
  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading notification preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) =>
                updatePreference("emailNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-base">In-App Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications within the application
                </p>
              </div>
            </div>
            <Switch
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) =>
                updatePreference("pushNotifications", checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <Label className="text-base">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via text message
                </p>
              </div>
            </div>
            <Switch
              checked={false}
              disabled
              title="SMS notifications coming soon"
            />
          </div>

          <div className="pt-2">
            <Label htmlFor="phone">Phone Number for SMS</Label>
            <Input
              id="phone"
              placeholder="Enter phone number"
              className="mt-1"
              disabled
            />
            <p className="mt-1 text-xs text-muted-foreground">
              SMS notifications coming soon
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="ml-auto"
            onClick={savePreferences}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="low-stock"
                    checked={preferences.inventoryAlerts}
                    onCheckedChange={(checked) =>
                      updatePreference("inventoryAlerts", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="low-stock" className="text-sm font-medium">
                      Low Stock Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when inventory items reach low stock threshold
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="critical-stock"
                    checked={preferences.inventoryAlerts}
                    onCheckedChange={(checked) =>
                      updatePreference("inventoryAlerts", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="critical-stock"
                      className="text-sm font-medium"
                    >
                      Critical Stock Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when inventory items reach critical stock threshold
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="expiring-items"
                    checked={preferences.inventoryAlerts}
                    onCheckedChange={(checked) =>
                      updatePreference("inventoryAlerts", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="expiring-items"
                      className="text-sm font-medium"
                    >
                      Expiring Items
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when items are approaching expiration date
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox id="price-changes" checked={false} disabled />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="price-changes"
                      className="text-sm font-medium"
                    >
                      Price Changes
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when supplier prices change significantly
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="delivery-notifications"
                    checked={preferences.orderUpdates}
                    onCheckedChange={(checked) =>
                      updatePreference("orderUpdates", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="delivery-notifications"
                      className="text-sm font-medium"
                    >
                      Delivery Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when deliveries are scheduled or received
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sales" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="daily-summary"
                    checked={preferences.orderUpdates}
                    onCheckedChange={(checked) =>
                      updatePreference("orderUpdates", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="daily-summary"
                      className="text-sm font-medium"
                    >
                      Daily Sales Summary
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a daily summary of sales
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="weekly-report"
                    checked={preferences.orderUpdates}
                    onCheckedChange={(checked) =>
                      updatePreference("orderUpdates", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="weekly-report"
                      className="text-sm font-medium"
                    >
                      Weekly Sales Report
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly detailed sales report
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox id="sales-targets" checked={false} disabled />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="sales-targets"
                      className="text-sm font-medium"
                    >
                      Sales Target Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when sales targets are met or missed
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="sales-anomalies"
                    checked={preferences.orderUpdates}
                    onCheckedChange={(checked) =>
                      updatePreference("orderUpdates", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="sales-anomalies"
                      className="text-sm font-medium"
                    >
                      Sales Anomalies
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when sales patterns show significant deviation
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="system" className="mt-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="marketing-emails"
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) =>
                      updatePreference("marketingEmails", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="marketing-emails"
                      className="text-sm font-medium"
                    >
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive promotional emails and product updates
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="system-updates"
                    checked={preferences.securityAlerts}
                    onCheckedChange={(checked) =>
                      updatePreference("securityAlerts", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="system-updates"
                      className="text-sm font-medium"
                    >
                      System Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify when system updates are available
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="billing-notifications"
                    checked={preferences.billingNotifications}
                    onCheckedChange={(checked) =>
                      updatePreference("billingNotifications", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="billing-notifications"
                      className="text-sm font-medium"
                    >
                      Billing Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify about upcoming payments and billing changes
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CustomCheckbox
                    id="security-alerts"
                    checked={preferences.securityAlerts}
                    onCheckedChange={(checked) =>
                      updatePreference("securityAlerts", checked === true)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor="security-alerts"
                      className="text-sm font-medium"
                    >
                      Security Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notify about suspicious login attempts or security issues
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button
            className="ml-auto"
            onClick={savePreferences}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Notification Schedule
          </CardTitle>
          <CardDescription>
            Configure when notifications are sent.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Quiet Hours</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="text-sm">
                  Start Time
                </Label>
                <Select
                  value={schedule.quietHoursStart}
                  onValueChange={(value) =>
                    updateSchedule("quietHoursStart", value)
                  }
                >
                  <SelectTrigger id="quiet-start">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20:00">8:00 PM</SelectItem>
                    <SelectItem value="21:00">9:00 PM</SelectItem>
                    <SelectItem value="22:00">10:00 PM</SelectItem>
                    <SelectItem value="23:00">11:00 PM</SelectItem>
                    <SelectItem value="00:00">12:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="text-sm">
                  End Time
                </Label>
                <Select
                  value={schedule.quietHoursEnd}
                  onValueChange={(value) =>
                    updateSchedule("quietHoursEnd", value)
                  }
                >
                  <SelectTrigger id="quiet-end">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="05:00">5:00 AM</SelectItem>
                    <SelectItem value="06:00">6:00 AM</SelectItem>
                    <SelectItem value="07:00">7:00 AM</SelectItem>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Only critical notifications will be sent during quiet hours.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Notification Frequency</Label>
            <Select
              value={schedule.frequency}
              onValueChange={(value) =>
                updateSchedule(
                  "frequency",
                  value as "immediate" | "hourly" | "daily"
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="hourly">Hourly Digest</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              How often non-critical notifications should be grouped and sent.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Daily Digest Time</Label>
            <Select
              value={schedule.digestTime}
              onValueChange={(value) => updateSchedule("digestTime", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="08:00">8:00 AM</SelectItem>
                <SelectItem value="09:00">9:00 AM</SelectItem>
                <SelectItem value="10:00">10:00 AM</SelectItem>
                <SelectItem value="17:00">5:00 PM</SelectItem>
                <SelectItem value="18:00">6:00 PM</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              When daily digest notifications should be sent.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="ml-auto"
            disabled={isSaving}
            onClick={saveSchedule}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Schedule
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
