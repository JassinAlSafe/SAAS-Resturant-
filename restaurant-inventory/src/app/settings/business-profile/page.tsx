import React from "react";
import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BasicInfoForm } from "@/components/settings/business-profile/BasicInfoForm";
import { AddressForm } from "@/components/settings/business-profile/AddressForm";
import { OperatingHoursForm } from "@/components/settings/business-profile/OperatingHoursForm";
import { LogoUpload } from "@/components/settings/business-profile/LogoUpload";
import { CurrencySettings } from "@/components/settings/business-profile/CurrencySettings";
import { TaxSettings } from "@/components/settings/business-profile/TaxSettings";
import { CurrencyProvider } from "@/lib/currency-context";

export const metadata: Metadata = {
  title: "Business Profile | Restaurant Inventory Manager",
  description: "Manage your restaurant's business profile settings",
};

// Mock data for demonstration purposes
const mockBusinessData = {
  basicInfo: {
    name: "Delicious Bites",
    email: "contact@deliciousbites.com",
    phone: "+1 (555) 123-4567",
    website: "https://deliciousbites.com",
  },
  address: {
    street: "123 Main Street",
    city: "Foodville",
    state: "CA",
    postalCode: "12345",
    country: "United States",
  },
  operatingHours: {
    monday: { open: "09:00", close: "22:00", closed: false },
    tuesday: { open: "09:00", close: "22:00", closed: false },
    wednesday: { open: "09:00", close: "22:00", closed: false },
    thursday: { open: "09:00", close: "22:00", closed: false },
    friday: { open: "09:00", close: "23:00", closed: false },
    saturday: { open: "10:00", close: "23:00", closed: false },
    sunday: { open: "10:00", close: "21:00", closed: false },
  },
  logoUrl: "/placeholder-logo.png",
  currency: "USD",
  tax: {
    enabled: true,
    name: "Sales Tax",
    rate: 8.5,
  },
};

export default function BusinessProfilePage() {
  // In a real application, these would be state variables with actual API calls
  const isLoading = false;

  const handleBasicInfoUpdate = (data: any) => {
    console.log("Updating basic info:", data);
    // API call would go here
  };

  const handleAddressUpdate = (data: any) => {
    console.log("Updating address:", data);
    // API call would go here
  };

  const handleOperatingHoursUpdate = (data: any) => {
    console.log("Updating operating hours:", data);
    // API call would go here
  };

  const handleLogoUpload = (file: File) => {
    console.log("Uploading logo:", file.name);
    // API call would go here
  };

  const handleCurrencyUpdate = (currency: any) => {
    console.log("Updating currency:", currency);
    // API call would go here
  };

  const handleTaxUpdate = (taxSettings: any) => {
    console.log("Updating tax settings:", taxSettings);
    // API call would go here
  };

  return (
    <CurrencyProvider defaultCurrency={mockBusinessData.currency}>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Business Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your restaurant's business information and settings.
          </p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="hours">Hours</TabsTrigger>
            <TabsTrigger value="financial">Financial</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Update your restaurant's basic contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoForm
                  businessName={mockBusinessData.basicInfo.name}
                  email={mockBusinessData.basicInfo.email}
                  phone={mockBusinessData.basicInfo.phone}
                  website={mockBusinessData.basicInfo.website}
                  isLoading={isLoading}
                  onUpdate={handleBasicInfoUpdate}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restaurant Logo</CardTitle>
                <CardDescription>
                  Upload your restaurant's logo for receipts and digital menus.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogoUpload
                  logoPreview={mockBusinessData.logoUrl}
                  isLoading={isLoading}
                  onUpload={handleLogoUpload}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Address Information</CardTitle>
                <CardDescription>
                  Update your restaurant's physical location.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressForm
                  street={mockBusinessData.address.street}
                  city={mockBusinessData.address.city}
                  state={mockBusinessData.address.state}
                  postalCode={mockBusinessData.address.postalCode}
                  country={mockBusinessData.address.country}
                  isLoading={isLoading}
                  onUpdate={handleAddressUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>
                  Set your restaurant's regular business hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperatingHoursForm
                  operatingHours={mockBusinessData.operatingHours}
                  isLoading={isLoading}
                  onUpdate={handleOperatingHoursUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Currency Settings</CardTitle>
                <CardDescription>
                  Set your default currency for inventory and sales.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CurrencySettings
                  defaultCurrency={mockBusinessData.currency}
                  isLoading={isLoading}
                  onUpdate={handleCurrencyUpdate}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tax Settings</CardTitle>
                <CardDescription>
                  Configure tax calculations for your business.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaxSettings
                  taxRate={mockBusinessData.tax.rate}
                  taxEnabled={mockBusinessData.tax.enabled}
                  taxName={mockBusinessData.tax.name}
                  isLoading={isLoading}
                  onUpdate={handleTaxUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CurrencyProvider>
  );
}
