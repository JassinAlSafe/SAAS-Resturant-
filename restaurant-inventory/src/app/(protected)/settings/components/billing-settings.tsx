"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Check, Calendar, Building } from "lucide-react"

// Mock data for billing history
const billingHistory = [
  {
    id: "INV-001",
    date: "Mar 1, 2025",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "INV-002",
    date: "Feb 1, 2025",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "INV-003",
    date: "Jan 1, 2025",
    amount: "$49.00",
    status: "Paid",
  },
  {
    id: "INV-004",
    date: "Dec 1, 2024",
    amount: "$49.00",
    status: "Paid",
  },
]

// Mock data for subscription plans
const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    description: "For small restaurants just getting started",
    price: "$29",
    features: ["Up to 3 users", "Basic inventory management", "Sales tracking", "Email support"],
    current: false,
  },
  {
    id: "professional",
    name: "Professional",
    description: "For growing restaurants with more needs",
    price: "$49",
    features: [
      "Up to 10 users",
      "Advanced inventory management",
      "Sales forecasting",
      "Supplier integrations",
      "Priority email support",
    ],
    current: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large restaurants or chains",
    price: "$99",
    features: [
      "Unlimited users",
      "Multi-location support",
      "Advanced analytics",
      "Custom integrations",
      "API access",
      "Dedicated support",
    ],
    current: false,
  },
]

export default function BillingSettings() {
  return (
    <Tabs defaultValue="subscription" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="subscription">Subscription</TabsTrigger>
        <TabsTrigger value="payment">Payment Methods</TabsTrigger>
        <TabsTrigger value="history">Billing History</TabsTrigger>
      </TabsList>

      <TabsContent value="subscription" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Manage your subscription plan and billing cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-lg">Professional Plan</h3>
                  <Badge>Current Plan</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Billed monthly at $49.00</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline">Change Plan</Button>
                <Button variant="outline" className="text-destructive border-destructive/50 hover:bg-destructive/10">
                  Cancel Subscription
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Subscription Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Next billing date</p>
                  <p className="text-sm text-muted-foreground">April 1, 2025</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Billing cycle</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Payment method</p>
                  <p className="text-sm text-muted-foreground">Visa ending in 4242</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">User limit</p>
                  <p className="text-sm text-muted-foreground">7 of 10 users</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Available Plans</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={plan.current ? "border-primary" : ""}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    {plan.price}
                    <span className="text-sm font-normal text-muted-foreground"> /month</span>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  {plan.current ? (
                    <Button className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full">
                      {plan.id === "starter" ? "Downgrade" : "Upgrade"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="payment" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your payment methods and billing information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium">Saved Payment Methods</h3>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Visa ending in 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 04/2026</p>
                  </div>
                </div>
                <Badge>Default</Badge>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Mastercard ending in 5678</p>
                    <p className="text-sm text-muted-foreground">Expires 08/2025</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Make Default
                </Button>
              </div>

              <Button variant="outline" className="mt-2">
                <CreditCard className="mr-2 h-4 w-4" />
                Add Payment Method
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-medium">Billing Information</h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Label>Billing Address</Label>
                </div>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="First name" defaultValue="John" />
                    <Input placeholder="Last name" defaultValue="Smith" />
                  </div>
                  <Input placeholder="Company name (optional)" defaultValue="Bella Cucina Restaurant" />
                  <Input placeholder="Address" defaultValue="123 Main Street" />
                  <Input placeholder="Apartment, suite, etc. (optional)" />
                  <div className="grid grid-cols-3 gap-2">
                    <Input placeholder="City" defaultValue="Anytown" />
                    <Input placeholder="State/Province" defaultValue="CA" />
                    <Input placeholder="ZIP/Postal code" defaultValue="12345" />
                  </div>
                  <Input placeholder="Country" defaultValue="United States" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label>Billing Cycle</Label>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input type="radio" id="monthly" name="billing-cycle" defaultChecked />
                    <Label htmlFor="monthly">Monthly</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="radio" id="annually" name="billing-cycle" />
                    <Label htmlFor="annually">Annually (Save 10%)</Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="history" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>View and download your past invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingHistory.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Export All</Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

