"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useNotificationHelpers } from "@/lib/notification-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FiSave,
  FiLock,
  FiHome,
  FiDownload,
  FiTrash2,
  FiUpload,
  FiShield,
  FiDatabase,
} from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import BusinessProfileForm from "@/components/settings/BusinessProfileForm";
import { Switch } from "@/components/ui/switch";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
  exportToExcel,
  formatInventoryForExport,
  formatSuppliersForExport,
  formatShoppingListForExport,
} from "@/lib/utils/export";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import TwoFactorSetupDialog from "@/components/settings/TwoFactorSetupDialog";
import { createBackup, restoreFromBackup } from "@/lib/utils/backup";
import BackupFileUpload from "@/components/settings/BackupFileUpload";
import { deleteAccount } from "@/lib/utils/account";
import { useRouter } from "next/navigation";
import { SetupStorageBucket } from "@/components/settings/SetupStorageBucket";
import { TestStorageUpload } from "@/components/settings/TestStorageUpload";

export default function SettingsPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { success: showSuccess, error: showError } = useNotificationHelpers();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [accountDeletionConfirmation, setAccountDeletionConfirmation] =
    useState("");
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [selectedBackupData, setSelectedBackupData] = useState<any>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
    }
  }, [profile]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update({ name, updated_at: new Date().toISOString() })
        .eq("id", user.id);

      if (error) throw error;

      showSuccess(
        "Profile Updated",
        "Your profile information has been updated successfully."
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(
        "Update Failed",
        "There was a problem updating your profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!user) throw new Error("User not authenticated");

      if (newPassword !== confirmPassword) {
        showError(
          "Password Mismatch",
          "New password and confirmation do not match."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      showSuccess(
        "Password Updated",
        "Your password has been changed successfully."
      );
    } catch (error) {
      console.error("Error changing password:", error);
      showError(
        "Update Failed",
        "There was a problem changing your password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data for export
  const fetchInventoryForExport = async () => {
    setIsFetchingData(true);
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching inventory:", error);
      showError(
        "Data Fetch Failed",
        "There was a problem fetching inventory data. Please try again."
      );
      return [];
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchSuppliersForExport = async () => {
    setIsFetchingData(true);
    try {
      const { data, error } = await supabase.from("suppliers").select("*");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      showError(
        "Data Fetch Failed",
        "There was a problem fetching supplier data. Please try again."
      );
      return [];
    } finally {
      setIsFetchingData(false);
    }
  };

  const fetchShoppingListForExport = async () => {
    setIsFetchingData(true);
    try {
      const { data, error } = await supabase.from("shopping_list").select("*");

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error fetching shopping list:", error);
      showError(
        "Data Fetch Failed",
        "There was a problem fetching shopping list data. Please try again."
      );
      return [];
    } finally {
      setIsFetchingData(false);
    }
  };

  // Handle export actions
  const handleExportInventory = async () => {
    try {
      const inventoryData = await fetchInventoryForExport();
      if (inventoryData.length > 0) {
        const formattedData = formatInventoryForExport(inventoryData);
        exportToExcel(formattedData, "inventory-data");
        showSuccess(
          "Export Successful",
          "Your inventory data has been exported successfully."
        );
      } else {
        showError("Export Failed", "No inventory data available to export.");
      }
    } catch (error) {
      console.error("Error exporting inventory data:", error);
      showError(
        "Export Failed",
        "There was a problem exporting your data. Please try again."
      );
    }
  };

  const handleExportSuppliers = async () => {
    try {
      const suppliersData = await fetchSuppliersForExport();
      if (suppliersData.length > 0) {
        const formattedData = formatSuppliersForExport(suppliersData);
        exportToExcel(formattedData, "suppliers-data");
        showSuccess(
          "Export Successful",
          "Your suppliers data has been exported successfully."
        );
      } else {
        showError("Export Failed", "No suppliers data available to export.");
      }
    } catch (error) {
      console.error("Error exporting suppliers data:", error);
      showError(
        "Export Failed",
        "There was a problem exporting your data. Please try again."
      );
    }
  };

  const handleExportShoppingList = async () => {
    try {
      const shoppingListData = await fetchShoppingListForExport();
      if (shoppingListData.length > 0) {
        const formattedData = formatShoppingListForExport(shoppingListData);
        exportToExcel(formattedData, "shopping-list-data");
        showSuccess(
          "Export Successful",
          "Your shopping list data has been exported successfully."
        );
      } else {
        showError(
          "Export Failed",
          "No shopping list data available to export."
        );
      }
    } catch (error) {
      console.error("Error exporting shopping list data:", error);
      showError(
        "Export Failed",
        "There was a problem exporting your data. Please try again."
      );
    }
  };

  // Handle export actions
  const handleExportAllData = async () => {
    try {
      // Fetch all data types
      const [inventoryData, suppliersData, shoppingListData] =
        await Promise.all([
          fetchInventoryForExport(),
          fetchSuppliersForExport(),
          fetchShoppingListForExport(),
        ]);

      // Format each data type
      const formattedInventory = formatInventoryForExport(inventoryData);
      const formattedSuppliers = formatSuppliersForExport(suppliersData);
      const formattedShoppingList =
        formatShoppingListForExport(shoppingListData);

      // Export each sheet
      const wb = XLSX.utils.book_new();

      // Add each dataset as a separate sheet if data exists
      if (formattedInventory.length > 0) {
        const inventoryWS = XLSX.utils.json_to_sheet(formattedInventory);
        XLSX.utils.book_append_sheet(wb, inventoryWS, "Inventory");
      }

      if (formattedSuppliers.length > 0) {
        const suppliersWS = XLSX.utils.json_to_sheet(formattedSuppliers);
        XLSX.utils.book_append_sheet(wb, suppliersWS, "Suppliers");
      }

      if (formattedShoppingList.length > 0) {
        const shoppingListWS = XLSX.utils.json_to_sheet(formattedShoppingList);
        XLSX.utils.book_append_sheet(wb, shoppingListWS, "Shopping List");
      }

      // Generate file and trigger download
      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Add timestamp to filename for uniqueness
      const timestamp = format(new Date(), "yyyy-MM-dd-HHmm");
      saveAs(blob, `restaurant-data-export_${timestamp}.xlsx`);

      showSuccess(
        "Export Successful",
        "All your data has been exported successfully."
      );
    } catch (error) {
      console.error("Error exporting all data:", error);
      showError(
        "Export Failed",
        "There was a problem exporting your data. Please try again."
      );
    }
  };

  // Handle 2FA toggle
  const handleToggle2FA = async () => {
    try {
      setIsLoading(true);
      // If we're enabling 2FA, show the setup dialog
      if (!is2FAEnabled) {
        setShow2FADialog(true);
        setIsLoading(false);
        return;
      }

      // If we're disabling 2FA
      setIs2FAEnabled(false);

      // For a real implementation, you'd update the user's 2FA settings in your auth provider
      // Example: await supabase.auth.update2FASettings({ enabled: false });

      showSuccess(
        "2FA Disabled",
        "Two-factor authentication has been disabled."
      );
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      showError(
        "Update Failed",
        "There was a problem updating your 2FA settings. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle 2FA confirmation
  const handle2FAConfirm = async (
    verificationCode: string
  ): Promise<boolean> => {
    try {
      // In a real implementation, this would verify the code with your auth provider
      // and enable 2FA if valid

      // For demo purposes, always succeed
      setIs2FAEnabled(true);

      return true;
    } catch (error) {
      console.error("Error confirming 2FA:", error);
      return false;
    }
  };

  // Handle data backup
  const handleBackupData = async () => {
    if (!user) return;

    try {
      setBackupInProgress(true);

      // Create and download backup
      await createBackup(user.id);

      showSuccess(
        "Backup Successful",
        "Your data has been backed up successfully."
      );
    } catch (error) {
      console.error("Error backing up data:", error);
      showError(
        "Backup Failed",
        "There was a problem backing up your data. Please try again."
      );
    } finally {
      setBackupInProgress(false);
    }
  };

  // Handle data restore
  const handleRestoreData = async () => {
    if (!user || !selectedBackupData) return;

    try {
      setRestoreInProgress(true);

      // Restore from backup
      await restoreFromBackup(selectedBackupData, user.id);

      // Reset selected backup
      setSelectedBackupData(null);

      showSuccess(
        "Restore Successful",
        "Your data has been restored successfully."
      );
    } catch (error) {
      console.error("Error restoring data:", error);
      showError(
        "Restore Failed",
        "There was a problem restoring your data. Please try again."
      );
    } finally {
      setRestoreInProgress(false);
    }
  };

  // Handle backup file selection
  const handleBackupFileSelected = (backupData: any) => {
    setSelectedBackupData(backupData);
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;

    if (accountDeletionConfirmation !== user.email) {
      showError(
        "Confirmation Failed",
        "Please enter your email address correctly to confirm account deletion."
      );
      return;
    }

    setIsLoading(true);
    try {
      // Delete user data and account
      await deleteAccount(user.id);

      // Clear confirmation field
      setAccountDeletionConfirmation("");

      showSuccess(
        "Account Deleted",
        "Your account has been successfully deleted. You will be signed out shortly."
      );

      // Sign out the user
      await supabase.auth.signOut();

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error("Error deleting account:", error);
      showError(
        "Deletion Failed",
        "There was a problem deleting your account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
        <p className="text-slate-600">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="data">Data & Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and profile settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-slate-50"
                  />
                  <p className="text-xs text-slate-500">
                    Your email address is associated with your account and
                    cannot be changed.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  <FiSave className="h-4 w-4" />
                  <span>Save Changes</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                  />
                </div>

                <Button
                  type="submit"
                  className="flex items-center gap-1"
                  disabled={isLoading}
                >
                  <FiLock className="h-4 w-4" />
                  <span>Change Password</span>
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <div className="mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FiHome className="h-5 w-5" />
              <span>Business Profile & Preferences</span>
            </h2>
            <p className="text-muted-foreground">
              Configure your restaurant's details and customize your experience
            </p>
          </div>
          {user && <BusinessProfileForm userId={user.id} />}
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiDownload className="h-5 w-5" />
                  <span>Export Data</span>
                </CardTitle>
                <CardDescription>
                  Export your restaurant data for backup or reporting purposes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">
                    Choose the data you want to export. Files will be downloaded
                    as Excel format (.xlsx).
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleExportInventory}
                      disabled={isFetchingData}
                      className="justify-start"
                    >
                      <FiDownload className="h-4 w-4 mr-2" />
                      Export Inventory
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleExportSuppliers}
                      disabled={isFetchingData}
                      className="justify-start"
                    >
                      <FiDownload className="h-4 w-4 mr-2" />
                      Export Suppliers
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleExportShoppingList}
                      disabled={isFetchingData}
                      className="justify-start"
                    >
                      <FiDownload className="h-4 w-4 mr-2" />
                      Export Shopping List
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleExportAllData}
                      disabled={isFetchingData}
                      className="justify-start"
                    >
                      <FiDownload className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiShield className="h-5 w-5" />
                  <span>Two-Factor Authentication (2FA)</span>
                </CardTitle>
                <CardDescription>
                  Add an extra layer of security to your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">2FA Authentication</p>
                    <p className="text-sm text-slate-500">
                      Protect your account with an additional verification step
                      when logging in
                    </p>
                  </div>
                  <Switch
                    checked={is2FAEnabled}
                    onCheckedChange={handleToggle2FA}
                    disabled={isLoading}
                  />
                </div>

                {is2FAEnabled && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-md">
                    <p className="text-sm font-medium">2FA is enabled</p>
                    <p className="text-sm text-slate-500 mt-1">
                      When you log in, you will need to enter a verification
                      code sent to your phone or generated by an authenticator
                      app.
                    </p>
                    <Dialog
                      open={show2FADialog}
                      onOpenChange={setShow2FADialog}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          Setup Authentication App
                        </Button>
                      </DialogTrigger>
                      <TwoFactorSetupDialog
                        onClose={() => setShow2FADialog(false)}
                        onConfirm={handle2FAConfirm}
                      />
                    </Dialog>
                  </div>
                )}

                {/* Show 2FA setup dialog when enabling */}
                {!is2FAEnabled && show2FADialog && (
                  <Dialog open={show2FADialog} onOpenChange={setShow2FADialog}>
                    <TwoFactorSetupDialog
                      onClose={() => setShow2FADialog(false)}
                      onConfirm={handle2FAConfirm}
                    />
                  </Dialog>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FiUpload className="h-5 w-5" />
                  <span>Data Backup & Restore</span>
                </CardTitle>
                <CardDescription>
                  Create backups of your data and restore when needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Data Backup</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBackupData}
                        disabled={backupInProgress}
                      >
                        {backupInProgress ? "Backing up..." : "Create Backup"}
                      </Button>
                    </div>
                    <p className="text-sm text-slate-500">
                      Create a complete backup of all your restaurant data. This
                      includes inventory, suppliers, and settings.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Data Restore</p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Restore Data
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Restore Data</DialogTitle>
                            <DialogDescription>
                              Restoring data will replace your current data with
                              the selected backup. This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <BackupFileUpload
                              onFileSelected={handleBackupFileSelected}
                              isLoading={restoreInProgress}
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedBackupData(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleRestoreData}
                              disabled={
                                restoreInProgress || !selectedBackupData
                              }
                            >
                              {restoreInProgress
                                ? "Restoring..."
                                : "Restore Backup"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <p className="text-sm text-slate-500">
                      Restore your data from a previous backup. This will
                      replace all current data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <FiTrash2 className="h-5 w-5" />
                  <span>Delete Account</span>
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500 mb-4">
                  This action is irreversible and will permanently delete your
                  account, all your data, and revoke your access to the system.
                </p>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-1"
                    >
                      <FiTrash2 className="h-4 w-4" />
                      <span>Delete My Account</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600">
                        Delete Account Permanently
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. It will permanently delete
                        your account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4">
                      <p className="text-sm font-medium mb-2">
                        To confirm, please type your email address:
                      </p>
                      <Input
                        value={accountDeletionConfirmation}
                        onChange={(e) =>
                          setAccountDeletionConfirmation(e.target.value)
                        }
                        placeholder={user?.email}
                        className="mb-4"
                      />
                      <p className="text-xs text-slate-500">
                        By deleting your account, you are releasing all
                        associated data in compliance with GDPR and data privacy
                        regulations.
                      </p>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        disabled={
                          isLoading ||
                          accountDeletionConfirmation !== user?.email
                        }
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 py-8">
                Notification settings coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>User Preferences</CardTitle>
              <CardDescription>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-slate-500 py-8">
                User preferences settings coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="md:col-span-2 lg:col-span-3">
              <h2 className="text-2xl font-bold tracking-tight">
                Storage Settings
              </h2>
              <p className="text-muted-foreground">
                Storage functionality is currently using placeholder images due
                to permission issues with the storage bucket. We're working on
                resolving these issues to enable real file uploads.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SetupStorageBucket />
            <TestStorageUpload />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
