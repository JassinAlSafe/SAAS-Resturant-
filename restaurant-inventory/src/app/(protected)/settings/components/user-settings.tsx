"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MoreHorizontal, Plus, UserPlus, Mail, Shield, Key } from "lucide-react"

// Mock data for users
const users = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@example.com",
    role: "Admin",
    status: "Active",
    lastActive: "2 hours ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "maria.garcia@example.com",
    role: "Manager",
    status: "Active",
    lastActive: "1 day ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "David Lee",
    email: "david.lee@example.com",
    role: "Staff",
    status: "Active",
    lastActive: "3 days ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.com",
    role: "Staff",
    status: "Inactive",
    lastActive: "2 weeks ago",
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael.brown@example.com",
    role: "Manager",
    status: "Pending",
    lastActive: "Never",
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Mock data for roles
const roles = [
  {
    id: "admin",
    name: "Admin",
    description: "Full access to all settings and features",
    permissions: ["Manage users", "Manage inventory", "View reports", "Manage settings", "Manage billing"],
  },
  {
    id: "manager",
    name: "Manager",
    description: "Access to most features except billing and user management",
    permissions: ["Manage inventory", "View reports", "View settings"],
  },
  {
    id: "staff",
    name: "Staff",
    description: "Limited access to inventory and sales",
    permissions: ["View inventory", "Record sales"],
  },
]

// Mock data for pending invitations
const pendingInvitations = [
  {
    id: "1",
    email: "alex.wong@example.com",
    role: "Manager",
    sentAt: "2 days ago",
    expires: "5 days",
  },
  {
    id: "2",
    email: "jennifer.patel@example.com",
    role: "Staff",
    sentAt: "1 day ago",
    expires: "6 days",
  },
  {
    id: "3",
    email: "robert.kim@example.com",
    role: "Staff",
    sentAt: "4 hours ago",
    expires: "6 days",
  },
]

export default function UserSettings() {
  const [activeTab, setActiveTab] = useState("users")
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="users">User List</TabsTrigger>
        <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
        <TabsTrigger value="security">Security Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Manage Users</h3>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>Send an invitation to join your restaurant management system.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" placeholder="Enter email address" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select defaultValue="staff">
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Input id="message" placeholder="Add a personal message" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setInviteDialogOpen(false)}>Send Invitation</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Manage users and their access to the system.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "Admin" ? "default" : user.role === "Manager" ? "outline" : "secondary"}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "Active" ? "success" : user.status === "Inactive" ? "secondary" : "outline"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Edit user</DropdownMenuItem>
                          <DropdownMenuItem>Change role</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Deactivate user</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Manage pending user invitations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell>{invitation.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invitation.role}</Badge>
                    </TableCell>
                    <TableCell>{invitation.sentAt}</TableCell>
                    <TableCell>{invitation.expires}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline">
                          <Mail className="mr-2 h-4 w-4" />
                          Resend
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive">
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="roles" className="mt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Roles & Permissions</h3>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </div>

        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Role
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <h4 className="text-sm font-medium mb-2">Permissions:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {role.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>{permission}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="security" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Password Policy</CardTitle>
            <CardDescription>Configure password requirements for all users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Minimum Password Length</Label>
                <div className="text-sm text-muted-foreground">Require at least 8 characters</div>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" className="w-16" min={6} max={32} defaultValue={8} />
                <span className="text-sm text-muted-foreground">characters</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Special Characters</Label>
                <div className="text-sm text-muted-foreground">Passwords must include special characters</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Numbers</Label>
                <div className="text-sm text-muted-foreground">Passwords must include at least one number</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Password Expiration</Label>
                <div className="text-sm text-muted-foreground">Force password reset after a certain period</div>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="90">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multi-Factor Authentication</CardTitle>
            <CardDescription>Enhance security with multi-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require MFA for All Users</Label>
                <div className="text-sm text-muted-foreground">All users must set up MFA to access the system</div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require MFA for Admins Only</Label>
                <div className="text-sm text-muted-foreground">Only admin users must set up MFA</div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>MFA Methods</Label>
                <div className="text-sm text-muted-foreground">Select allowed MFA methods</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch defaultChecked id="mfa-app" />
                  <Label htmlFor="mfa-app">Authenticator App</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch defaultChecked id="mfa-sms" />
                  <Label htmlFor="mfa-sms">SMS</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="mfa-email" />
                  <Label htmlFor="mfa-email">Email</Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Management</CardTitle>
            <CardDescription>Configure session timeout and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <div className="text-sm text-muted-foreground">Automatically log out inactive users</div>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="30">
                  <SelectTrigger className="w-24">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 min</SelectItem>
                    <SelectItem value="30">30 min</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="240">4 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Remember Me Option</Label>
                <div className="text-sm text-muted-foreground">Allow users to stay logged in</div>
              </div>
              <Switch defaultChecked />
            </div>

            <Button variant="outline" className="w-full">
              <Key className="mr-2 h-4 w-4" />
              Log Out All Active Sessions
            </Button>
          </CardContent>
          <CardFooter>
            <Button className="ml-auto">Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

