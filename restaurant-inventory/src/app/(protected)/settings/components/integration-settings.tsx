"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { CreditCard, FileText, Plus, RefreshCw, ShoppingCart, Trash2, Truck, Zap } from "lucide-react"

// Mock data for integrations
const integrations = [
  {
    id: "pos",
    name: "Toast POS",
    description: "Point of Sale system integration",
    status: "connected",
    lastSync: "10 minutes ago",
    icon: <CreditCard className="h-8 w-8" />,
  },
  {
    id: "accounting",
    name: "QuickBooks",
    description: "Accounting software integration",
    status: "connected",
    lastSync: "1 hour ago",
    icon: <FileText className="h-8 w-8" />,
  },
  {
    id: "supplier",
    name: "Sysco",
    description: "Supplier ordering system",
    status: "disconnected",
    lastSync: "Never",
    icon: <Truck className="h-8 w-8" />,
  },
  {
    id: "ecommerce",
    name: "Shopify",
    description: "Online ordering integration",
    status: "connected",
    lastSync: "3 hours ago",
    icon: <ShoppingCart className="h-8 w-8" />,
  },
]

// Mock data for automation rules
const automationRules = [
  {
    id: "1",
    name: "Low Stock Alert",
    description: "Send notification when items reach low stock threshold",
    status: "active",
    trigger: "Inventory below threshold",
    action: "Send email notification",
  },
  {
    id: "2",
    name: "Auto Purchase Order",
    description: "Generate purchase orders for critical stock items",
    status: "active",
    trigger: "Inventory below critical threshold",
    action: "Create purchase order",
  },
  {
    id: "3",
    name: "Weekly Inventory Report",
    description: "Generate and email weekly inventory report",
    status: "active",
    trigger: "Every Monday at 8:00 AM",
    action: "Generate report and email",
  },
  {
    id: "4",
    name: "Sales Anomaly Detection",
    description: "Alert when sales patterns show significant deviation",
    status: "inactive",
    trigger: "Sales deviation > 20%",
    action: "Send notification to managers",
  },
]

export default function IntegrationSettings() {
  return (
    <Tabs defaultValue="integrations" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="integrations">Third-Party Integrations</TabsTrigger>
        <TabsTrigger value="automation">Automation Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="integrations" className="mt-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Connected Services</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Integration
          </Button>
        </div>

        <div className="grid gap-4">
          {integrations.map((integration) => (
            <Card key={integration.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted">
                    {integration.icon}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold">{integration.name}</h4>
                      <Badge variant={integration.status === "connected" ? "success" : "secondary"}>
                        {integration.status === "connected" ? "Connected" : "Disconnected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                    {integration.status === "connected" && (
                      <p className="text-sm text-muted-foreground">Last synced: {integration.lastSync}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {integration.status === "connected" ? (
                      <>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Sync Now
                        </Button>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Disconnect Integration</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to disconnect {integration.name}? This will stop all data
                                synchronization.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground">
                                Disconnect
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    ) : (
                      <Button>Connect</Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Access</CardTitle>
            <CardDescription>Manage API keys and access for custom integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="flex gap-2">
                <Input id="api-key" value="" readOnly />
                <Button variant="outline">Show</Button>
                <Button variant="outline">Regenerate</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This key provides access to your restaurant\'s data. Keep it secure.
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Access Control</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Read Access</Label>
                    <div className="text-xs text-muted-foreground">Allow reading inventory and sales data</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Write Access</Label>
                    <div className="text-xs text-muted-foreground">Allow creating and updating inventory</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">User Management Access</Label>
                    <div className="text-xs text-muted-foreground">Allow managing users and permissions</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <Input placeholder="https://your-service.com/webhook" />
              <p className="text-sm text-muted-foreground">
                We\'ll send real-time updates to this URL when data changes.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="automation" className="mt-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Automation Rules</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Rule
          </Button>
        </div>

        <div className="grid gap-4">
          {automationRules.map((rule) => (
            <Card key={rule.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rule.name}</h4>
                      <Badge variant={rule.status === "active" ? "outline" : "secondary"}>
                        {rule.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rule.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Trigger:</span>
                        <span>{rule.trigger}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Action:</span>
                        <span>{rule.action}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Switch checked={rule.status === "active"} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Shopping List Automation</CardTitle>
            <CardDescription>Configure automatic shopping list generation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Shopping Lists</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically create shopping lists based on low stock items
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Critical Items Only</Label>
                <div className="text-sm text-muted-foreground">Only include items below critical threshold</div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Group by Supplier</Label>
                <div className="text-sm text-muted-foreground">Organize shopping lists by supplier</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-send to Suppliers</Label>
                <div className="text-sm text-muted-foreground">Automatically email shopping lists to suppliers</div>
              </div>
              <Switch />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Configure automated inventory alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <div className="text-sm text-muted-foreground">Send alerts when items reach low stock threshold</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Expiration Alerts</Label>
                <div className="text-sm text-muted-foreground">Send alerts for items approaching expiration</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Price Change Alerts</Label>
                <div className="text-sm text-muted-foreground">
                  Send alerts when supplier prices change significantly
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delivery Confirmation</Label>
                <div className="text-sm text-muted-foreground">
                  Send alerts when deliveries are expected or received
                </div>
              </div>
              <Switch />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

