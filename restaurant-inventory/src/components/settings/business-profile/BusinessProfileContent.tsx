"use client";

import React, { useState } from "react";
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
import { CurrencyProvider } from "@/lib/currency-provider";
import { CurrencyCode } from "@/lib/currency-context";
import { BusinessProfile } from "@/lib/types";

interface BusinessData {
  basicInfo: {
    name: string;
    email: string;
    phone: string;
    website: string;
    type: BusinessProfile["type"];
  };
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  operatingHours: {
    monday: { open: string; close: string; closed: boolean };
    tuesday: { open: string; close: string; closed: boolean };
    wednesday: { open: string; close: string; closed: boolean };
    thursday: { open: string; close: string; closed: boolean };
    friday: { open: string; close: string; closed: boolean };
    saturday: { open: string; close: string; closed: boolean };
    sunday: { open: string; close: string; closed: boolean };
  };
  logoUrl: string;
  currency: CurrencyCode;
  tax: {
    enabled: boolean;
    name: string;
    rate: number;
  };
}

interface BusinessProfileContentProps {
  businessData: BusinessData;
}

export function BusinessProfileContent({
  businessData,
}: BusinessProfileContentProps) {
  // State for form values
  const [name, setName] = useState(businessData.basicInfo.name);
  const [type, setType] = useState<BusinessProfile["type"]>(
    businessData.basicInfo.type
  );
  const [email, setEmail] = useState(businessData.basicInfo.email);
  const [phone, setPhone] = useState(businessData.basicInfo.phone);
  const [website, setWebsite] = useState(businessData.basicInfo.website);

  const [address, setAddress] = useState(businessData.address.street);
  const [city, setCity] = useState(businessData.address.city);
  const [state, setState] = useState(businessData.address.state);
  const [zipCode, setZipCode] = useState(businessData.address.postalCode);
  const [country, setCountry] = useState(businessData.address.country);

  const [operatingHours, setOperatingHours] = useState(
    businessData.operatingHours
  );

  const [currency, setCurrency] = useState<CurrencyCode>(businessData.currency);

  const [taxEnabled, setTaxEnabled] = useState(businessData.tax.enabled);
  const [taxName, setTaxName] = useState(businessData.tax.name);
  const [taxRate, setTaxRate] = useState(businessData.tax.rate);

  // In a real application, these would be state variables with actual API calls
  const isLoading = false;

  const handleBasicInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating basic info:", { name, type, email, phone, website });
    // API call would go here
  };

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating address:", {
      address,
      city,
      state,
      zipCode,
      country,
    });
    // API call would go here
  };

  const handleOperatingHoursUpdate = (
    day:
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday",
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    const updatedHours = { ...operatingHours };
    if (field === "open" || field === "close") {
      updatedHours[day][field] = value as string;
    } else if (field === "closed") {
      updatedHours[day][field] = value as boolean;
    }
    setOperatingHours(updatedHours);
    console.log("Updating operating hours:", updatedHours);
    // API call would go here
  };

  const handleLogoUpload = (file: File) => {
    console.log("Uploading logo:", file.name);
    // API call would go here
  };

  const handleCurrencyUpdate = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    console.log("Updating currency:", newCurrency);
    // API call would go here
  };

  const handleTaxUpdate = (taxSettings: {
    taxRate: number;
    taxEnabled: boolean;
    taxName: string;
  }) => {
    setTaxRate(taxSettings.taxRate);
    setTaxEnabled(taxSettings.taxEnabled);
    setTaxName(taxSettings.taxName);
    console.log("Updating tax settings:", taxSettings);
    // API call would go here
  };

  return (
    <CurrencyProvider defaultCurrency={currency}>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Business Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your restaurant&apos;s business information and settings.
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
                  Update your restaurant&apos;s basic contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BasicInfoForm
                  name={name}
                  setName={setName}
                  type={type}
                  setType={setType}
                  email={email}
                  setEmail={setEmail}
                  phone={phone}
                  setPhone={setPhone}
                  website={website}
                  setWebsite={setWebsite}
                  isLoading={isLoading}
                  onSubmit={handleBasicInfoSubmit}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Restaurant Logo</CardTitle>
                <CardDescription>
                  Upload your restaurant&apos;s logo for receipts and digital
                  menus.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LogoUpload
                  logoPreview={businessData.logoUrl}
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
                  Update your restaurant&apos;s physical location.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressForm
                  address={address}
                  setAddress={setAddress}
                  city={city}
                  setCity={setCity}
                  state={state}
                  setState={setState}
                  zipCode={zipCode}
                  setZipCode={setZipCode}
                  country={country}
                  setCountry={setCountry}
                  isLoading={isLoading}
                  onSubmit={handleAddressSubmit}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
                <CardDescription>
                  Set your restaurant&apos;s regular business hours.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OperatingHoursForm
                  operatingHours={operatingHours}
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
                  defaultCurrency={currency}
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
                  taxRate={taxRate}
                  taxEnabled={taxEnabled}
                  taxName={taxName}
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
