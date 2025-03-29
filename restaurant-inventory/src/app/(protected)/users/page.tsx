"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/services/auth-context";
import { usePermission } from "@/lib/permission-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { User } from "@/lib/types";
import { userService } from "@/lib/services/user-service";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiMail,
  FiCalendar,
  FiShield,
  FiBriefcase,
  FiLock,
} from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AccessDenied } from "@/components/ui/access-denied";
import { format } from "date-fns";

export default function UsersPage() {
  const { profile } = useAuth();
  const { hasPermission } = usePermission();
  const { success, error } = useNotificationHelpers();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite user dialog state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState<User["role"]>("staff");
  const [inviteDepartment, setInviteDepartment] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  // Edit role dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState<User["role"]>("staff");
  const [isEditing, setIsEditing] = useState(false);

  // Delete user dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user has permission to manage users
  const canManageUsers = hasPermission("manage:users");

  // Fetch users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const fetchedUsers = await userService.getUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      error(
        "Failed to load users",
        "There was an error loading the user list."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle inviting a new user
  const handleInviteUser = async () => {
    if (!inviteEmail || !inviteName || !inviteRole) {
      error("Missing Information", "Please fill in all required fields.");
      return;
    }

    setIsInviting(true);
    try {
      const result = await userService.inviteUser(
        inviteEmail,
        inviteName,
        inviteRole,
        inviteDepartment
      );

      if (result.success) {
        success("User Invited", result.message);
        setIsInviteDialogOpen(false);
        setInviteEmail("");
        setInviteName("");
        setInviteRole("staff");
        setInviteDepartment("");
        fetchUsers();
      } else {
        error("Invitation Failed", result.message);
      }
    } catch (err) {
      console.error("Error inviting user:", err);
      error("Invitation Failed", "There was an error sending the invitation.");
    } finally {
      setIsInviting(false);
    }
  };

  // Handle updating a user's role
  const handleUpdateRole = async () => {
    if (!selectedUser?.id || !editRole) {
      error("Missing Information", "Please select a role.");
      return;
    }

    setIsEditing(true);
    try {
      await userService.updateUserRole(selectedUser.id, editRole);
      success(
        "Role Updated",
        `${selectedUser.name}'s role has been updated to ${editRole}.`
      );
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error("Error updating role:", err);
      error("Update Failed", "There was an error updating the user's role.");
    } finally {
      setIsEditing(false);
    }
  };

  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!userToDelete?.id) {
      error("Missing Information", "No user selected for deletion.");
      return;
    }

    setIsDeleting(true);
    try {
      const deleteSuccess = await userService.removeUser(userToDelete.id);

      if (deleteSuccess) {
        success("User Removed", `${userToDelete.name} has been removed.`);
        setIsDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } else {
        error("Removal Failed", "There was an error removing the user.");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      error("Removal Failed", "There was an error removing the user.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open edit dialog
  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditRole(user.role);
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user: User) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // If user doesn't have permission to manage users
  if (!canManageUsers) {
    return (
      <AccessDenied
        icon={<FiUsers className="h-12 w-12 text-red-600 dark:text-red-400" />}
        message="You don't have permission to access the user management page. Please contact your administrator for assistance."
      />
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-36 mt-4 md:mt-0" />
        </div>

        <Card>
          <div className="p-4">
            <Skeleton className="h-8 w-full mb-4" />
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full mb-2" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage team members and their permissions
          </p>
        </div>

        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <FiPlus className="mr-2" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {users.length} {users.length === 1 ? "user" : "users"} in your
            restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No users found. Invite team members to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </span>
                            </div>
                          )}
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin"
                              ? "destructive"
                              : user.role === "manager"
                              ? "default"
                              : "secondary"
                          }
                          className="flex w-fit items-center gap-1"
                        >
                          <FiShield className="h-3 w-3" />
                          {user.role &&
                            user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.department ? (
                          <div className="flex items-center gap-1">
                            <FiBriefcase className="h-3 w-3" />
                            {user.department}
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.status === "active"
                              ? "default"
                              : user.status === "pending"
                              ? "warning"
                              : "destructive"
                          }
                        >
                          {user.status &&
                            user.status.charAt(0).toUpperCase() +
                              user.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login ? (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <FiCalendar className="h-3 w-3" />
                            {format(new Date(user.last_login), "MMM d, yyyy")}
                          </div>
                        ) : (
                          "Never"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.mfa_enabled ? "default" : "secondary"}
                          className="flex w-fit items-center gap-1"
                        >
                          <FiLock className="h-3 w-3" />
                          {user.mfa_enabled ? "Enabled" : "Disabled"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => openEditDialog(user)}
                            title="Edit role"
                            disabled={user.id === profile?.id}
                          >
                            <FiEdit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => openDeleteDialog(user)}
                            title="Remove user"
                            disabled={user.id === profile?.id}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invite User Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your restaurant team.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center">
                <FiMail className="mr-2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="colleague@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                placeholder="Kitchen, Service, etc."
                value={inviteDepartment}
                onChange={(e) => setInviteDepartment(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteRole}
                onValueChange={(value) => setInviteRole(value as User["role"])}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {inviteRole === "admin"
                  ? "Admins have full access to all features and can manage users."
                  : inviteRole === "manager"
                  ? "Managers can manage inventory, sales, and dishes, but cannot manage users."
                  : "Staff can view and edit inventory, but have limited access to other features."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
              disabled={isInviting}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={isInviting}>
              {isInviting ? "Sending..." : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role and permissions for {selectedUser?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editRole}
                onValueChange={(value) => setEditRole(value as User["role"])}
              >
                <SelectTrigger id="edit-role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {editRole === "admin"
                  ? "Admins have full access to all features and can manage users."
                  : editRole === "manager"
                  ? "Managers can manage inventory, sales, and dishes, but cannot manage users."
                  : "Staff can view and edit inventory, but have limited access to other features."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isEditing}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRole} disabled={isEditing}>
              {isEditing ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {userToDelete?.name} from your
              team? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? "Removing..." : "Remove User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
