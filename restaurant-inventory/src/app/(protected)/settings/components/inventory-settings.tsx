"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export default function InventorySettings() {
  return (
    <Tabs defaultValue="inventory" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="inventory">Inventory Preferences</TabsTrigger>
        <TabsTrigger value="sales">Sales Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Inventory Thresholds</CardTitle>
            <CardDescription>Configure when to alert for low stock and reordering.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="low-stock">Default Low Stock Threshold</Label>
                <span className="text-sm font-medium">20%</span>
              </div>
              <Slider id="low-stock" defaultValue={[20]} max={50} step={5} />
              <p className="text-sm text-muted-foreground">
                Items below this percentage of their maximum quantity will be flagged as low stock.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="critical-stock">Critical Stock Threshold</Label>
                <span className="text-sm font-medium">10%</span>
              </div>
              <Slider id="critical-stock" defaultValue={[10]} max={30} step={5} />
              <p className="text-sm text-muted-foreground">
                Items below this percentage will trigger urgent notifications.
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Purchase Orders</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically create purchase orders for low stock items
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unit Conversions</CardTitle>
            <CardDescription>Configure default unit conversions for inventory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weight Conversions</Label>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Input defaultValue="1" className="text-center" />
                  <span className="text-center text-sm">kg =</span>
                  <Input defaultValue="1000" className="text-center" />
                  <span className="text-center text-sm">g</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Input defaultValue="1" className="text-center" />
                  <span className="text-center text-sm">lb =</span>
                  <Input defaultValue="16" className="text-center" />
                  <span className="text-center text-sm">oz</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Input defaultValue="1" className="text-center" />
                  <span className="text-center text-sm">kg =</span>
                  <Input defaultValue="2.20462" className="text-center" />
                  <span className="text-center text-sm">lb</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Volume Conversions</Label>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Input defaultValue="1" className="text-center" />
                  <span className="text-center text-sm">L =</span>
                  <Input defaultValue="1000" className="text-center" />
                  <span className="text-center text-sm">mL</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Input defaultValue="1" className="text-center" />
                  <span className="text-center text-sm">gal =</span>
                  <Input defaultValue="128" className="text-center" />
                  <span className="text-center text-sm">fl oz</span>
                </div>
                <div className="grid grid-cols-3 gap-2 items-center">
                  <Input defaultValue="1" className="text-center" />
                  <span className="text-center text-sm">L =</span>
                  <Input defaultValue="0.264172" className="text-center" />
                  <span className="text-center text-sm">gal</span>
                </div>
              </div>
            </div>

            <Button variant="outline" size="sm">
              Add Custom Conversion
            </Button>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Behavior</CardTitle>
            <CardDescription>Configure how inventory is tracked and managed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-deduct from Inventory</Label>
                <div className="text-sm text-muted-foreground">
                  Automatically reduce inventory when sales are recorded
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Inventory by Location</Label>
                <div className="text-sm text-muted-foreground">
                  Maintain separate inventory counts for different locations
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Allow Negative Inventory</Label>
                <div className="text-sm text-muted-foreground">Allow inventory to go below zero (not recommended)</div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Inventory Costs</Label>
                <div className="text-sm text-muted-foreground">Track cost basis for inventory items</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost-method">Inventory Cost Method</Label>
              <Select defaultValue="fifo">
                <SelectTrigger id="cost-method">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fifo">FIFO (First In, First Out)</SelectItem>
                  <SelectItem value="lifo">LIFO (Last In, First Out)</SelectItem>
                  <SelectItem value="avg">Average Cost</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Determines how costs are calculated when inventory is used.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="sales" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Entry Settings</CardTitle>
            <CardDescription>Configure how sales are recorded and processed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Quick Sales Entry</Label>
                <div className="text-sm text-muted-foreground">Enable simplified sales entry for faster recording</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Sales Categories</Label>
                <div className="text-sm text-muted-foreground">Force categorization of all sales entries</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-sales-view">Default Sales View</Label>
              <Select defaultValue="daily">
                <SelectTrigger id="default-sales-view">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-shift">Default Shift</Label>
              <Select defaultValue="dinner">
                <SelectTrigger id="default-shift">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="all-day">All Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Templates</CardTitle>
            <CardDescription>Configure templates for common sales patterns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Sales Templates</Label>
                <div className="text-sm text-muted-foreground">Use predefined templates for common sales patterns</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Available Templates</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <h4 className="font-medium">Weekend Dinner</h4>
                    <p className="text-sm text-muted-foreground">Common items sold during weekend dinners</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <h4 className="font-medium">Weekday Lunch</h4>
                    <p className="text-sm text-muted-foreground">Common items sold during weekday lunches</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
                <div className="flex items-center justify-between border p-3 rounded-md">
                  <div>
                    <h4 className="font-medium">Happy Hour</h4>
                    <p className="text-sm text-muted-foreground">Common items sold during happy hour</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                Create New Template
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Analysis</CardTitle>
            <CardDescription>Configure sales analysis and reporting settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Sales Forecasting</Label>
                <div className="text-sm text-muted-foreground">Use historical data to predict future sales</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Sales by Server/Employee</Label>
                <div className="text-sm text-muted-foreground">Associate sales with specific staff members</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Sales by Table/Section</Label>
                <div className="text-sm text-muted-foreground">Associate sales with specific tables or sections</div>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="default-report">Default Sales Report</Label>
              <Select defaultValue="summary">
                <SelectTrigger id="default-report">
                  <SelectValue placeholder="Select report" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="detailed">Detailed Report</SelectItem>
                  <SelectItem value="category">Category Breakdown</SelectItem>
                  <SelectItem value="comparison">Year-over-Year Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Weekly Reports</Label>
                <div className="text-sm text-muted-foreground">Automatically create and email weekly sales reports</div>
              </div>
              <Switch defaultChecked />
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

