"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
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
import { Download, FileDown, FileUp, Key, RefreshCw, Trash2 } from "lucide-react"

export default function DataSettings() {
  return (
    <Tabs defaultValue="export" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="export">Data Export & Backup</TabsTrigger>
        <TabsTrigger value="privacy">Privacy Settings</TabsTrigger>
        <TabsTrigger value="api">API Access</TabsTrigger>
      </TabsList>

      <TabsContent value="export" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Export your restaurant data for backup or analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Data to Export</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="inventory-data" defaultChecked />
                  <Label htmlFor="inventory-data">Inventory Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="sales-data" defaultChecked />
                  <Label htmlFor="sales-data">Sales Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="user-data" defaultChecked />
                  <Label htmlFor="user-data">User Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="supplier-data" defaultChecked />
                  <Label htmlFor="supplier-data">Supplier Data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="settings-data" defaultChecked />
                  <Label htmlFor="settings-data">Settings</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select defaultValue="csv">
                <SelectTrigger id="export-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select defaultValue="all">
                <SelectTrigger id="date-range">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="last-month">Last Month</SelectItem>
                  <SelectItem value="last-quarter">Last Quarter</SelectItem>
                  <SelectItem value="last-year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full">
              <FileDown className="mr-2 h-4 w-4" />
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Backups</CardTitle>
            <CardDescription>Configure automatic backups of your data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Automated Backups</Label>
                <div className="text-sm text-muted-foreground">Automatically backup your data on a schedule</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-retention">Backup Retention</Label>
              <Select defaultValue="30">
                <SelectTrigger id="backup-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How long backups will be stored before being automatically deleted.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Recent Backups</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Full Backup</p>
                    <p className="text-sm text-muted-foreground">Mar 14, 2025 - 10:30 PM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Full Backup</p>
                    <p className="text-sm text-muted-foreground">Mar 13, 2025 - 10:30 PM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Full Backup</p>
                    <p className="text-sm text-muted-foreground">Mar 12, 2025 - 10:30 PM</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Create Manual Backup
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Import Data</CardTitle>
            <CardDescription>Import data from external sources or restore from backup.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Import Options</Label>
              <div className="grid gap-2">
                <div className="flex items-center space-x-2">
                  <input type="radio" id="import-merge" name="import-option" defaultChecked />
                  <Label htmlFor="import-merge">Merge with existing data</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="radio" id="import-replace" name="import-option" />
                  <Label htmlFor="import-replace">Replace existing data</Label>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Warning: Replacing existing data will permanently delete current records.
              </p>
            </div>

            <Button variant="outline" className="w-full">
              <FileUp className="mr-2 h-4 w-4" />
              Select File to Import
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="privacy" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Retention</CardTitle>
            <CardDescription>Configure how long data is stored in the system.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sales-retention">Sales Data Retention</Label>
              <Select defaultValue="forever">
                <SelectTrigger id="sales-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="3-years">3 Years</SelectItem>
                  <SelectItem value="5-years">5 Years</SelectItem>
                  <SelectItem value="7-years">7 Years</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                How long sales data will be stored before being automatically deleted.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventory-retention">Inventory History Retention</Label>
              <Select defaultValue="3-years">
                <SelectTrigger id="inventory-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="3-years">3 Years</SelectItem>
                  <SelectItem value="5-years">5 Years</SelectItem>
                  <SelectItem value="7-years">7 Years</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-activity-retention">User Activity Logs</Label>
              <Select defaultValue="1-year">
                <SelectTrigger id="user-activity-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="90-days">90 Days</SelectItem>
                  <SelectItem value="6-months">6 Months</SelectItem>
                  <SelectItem value="1-year">1 Year</SelectItem>
                  <SelectItem value="3-years">3 Years</SelectItem>
                  <SelectItem value="forever">Forever</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Historical Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete historical data based on your retention
                    settings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground">
                    Delete Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GDPR Compliance</CardTitle>
            <CardDescription>Settings related to data privacy regulations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Processing Agreement</Label>
                <div className="text-sm text-muted-foreground">View and download your Data Processing Agreement</div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Right to be Forgotten</Label>
                <div className="text-sm text-muted-foreground">
                  Allow users to request deletion of their personal data
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Data Portability</Label>
                <div className="text-sm text-muted-foreground">Allow users to export their personal data</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Cookie Consent</Label>
                <div className="text-sm text-muted-foreground">Show cookie consent banner to users</div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="api" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>Manage API keys for external integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="api-key">Primary API Key</Label>
                <Button variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
              </div>
              <div className="flex gap-2">
                <Input id="api-key" value="" readOnly />
                <Button variant="outline">Show</Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This key provides full access to your API. Keep it secure and never share it publicly.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Additional API Keys</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Inventory Read-Only</p>
                    <p className="text-sm text-muted-foreground">Created Mar 10, 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div>
                    <p className="font-medium">Sales Analytics</p>
                    <p className="text-sm text-muted-foreground">Created Feb 15, 2025</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2">
                <Key className="mr-2 h-4 w-4" />
                Create New API Key
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Access Control</CardTitle>
            <CardDescription>Configure permissions for API access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Rate Limits</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate-limit" className="text-sm">
                    Requests per minute
                  </Label>
                  <Input id="rate-limit" type="number" defaultValue="60" min="10" max="1000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burst-limit" className="text-sm">
                    Burst limit
                  </Label>
                  <Input id="burst-limit" type="number" defaultValue="100" min="10" max="2000" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Limits the number of API requests that can be made in a given time period.
              </p>
            </div>

            <div className="space-y-2">
              <Label>API Permissions</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Inventory Access</Label>
                    <div className="text-xs text-muted-foreground">Allow API access to inventory data</div>
                  </div>
                  <Select defaultValue="read-write">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="read-only">Read Only</SelectItem>
                      <SelectItem value="read-write">Read & Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">Sales Access</Label>
                    <div className="text-xs text-muted-foreground">Allow API access to sales data</div>
                  </div>
                  <Select defaultValue="read-only">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="read-only">Read Only</SelectItem>
                      <SelectItem value="read-write">Read & Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm">User Access</Label>
                    <div className="text-xs text-muted-foreground">Allow API access to user data</div>
                  </div>
                  <Select defaultValue="none">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="read-only">Read Only</SelectItem>
                      <SelectItem value="read-write">Read & Write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>IP Restrictions</Label>
                <div className="text-sm text-muted-foreground">Restrict API access to specific IP addresses</div>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input id="webhook-url" placeholder="https://your-service.com/webhook" />
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
    </Tabs>
  )
}

