"use client";

import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBusinessProfileForm } from "./useBusinessProfileForm";
import { BasicInfoForm } from "./BasicInfoForm";
import { AddressForm } from "./AddressForm";
import { OperatingHoursForm } from "./OperatingHoursForm";
import { LogoUpload } from "./LogoUpload";
import { TaxSettings } from "./TaxSettings";
import { CurrencySettings } from "./CurrencySettings";
import { RestaurantIconsSetup } from "./RestaurantIconsSetup";

interface BusinessProfileTabsProps {
  userId: string;
}

export function BusinessProfileTabs({ userId }: BusinessProfileTabsProps) {
  const {
    isLoading,
    profile,
    name,
    setName,
    type,
    setType,
    address,
    setAddress,
    city,
    setCity,
    state,
    setState,
    zipCode,
    setZipCode,
    country,
    setCountry,
    phone,
    setPhone,
    email,
    setEmail,
    website,
    setWebsite,
    operatingHours,
    defaultCurrency,
    logoPreview,
    taxRate,
    taxEnabled,
    taxName,
    handleProfileUpdate,
    handleHoursUpdate,
    handleCurrencyUpdate,
    handleTaxUpdate,
    handleLogoUpload,
  } = useBusinessProfileForm(userId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTaxSettingsUpdate = (settings: {
    taxRate: number;
    taxEnabled: boolean;
    taxName: string;
  }) => {
    Object.entries(settings).forEach(([field, value]) => {
      handleTaxUpdate(field as "taxRate" | "taxEnabled" | "taxName", value);
    });
  };

  // Loading state
  if (isLoading && !profile) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="address">Address</TabsTrigger>
        <TabsTrigger value="hours">Operating Hours</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
      </TabsList>

      {/* Basic Information */}
      <TabsContent value="basic">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your restaurant\'s basic information
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
              onSubmit={handleProfileUpdate}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Address Information */}
      <TabsContent value="address">
        <Card>
          <CardHeader>
            <CardTitle>Address Information</CardTitle>
            <CardDescription>
              Update your restaurant\'s physical location
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
              onSubmit={handleProfileUpdate}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Operating Hours */}
      <TabsContent value="hours">
        <Card>
          <CardHeader>
            <CardTitle>Operating Hours</CardTitle>
            <CardDescription>
              Set your restaurant\'s regular business hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OperatingHoursForm
              operatingHours={operatingHours}
              isLoading={isLoading}
              onUpdate={handleHoursUpdate}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appearance */}
      <TabsContent value="appearance">
        <div className="space-y-6">
          {/* Restaurant Icons Storage Setup */}
          <RestaurantIconsSetup />

          {/* Logo Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Logo</CardTitle>
              <CardDescription>
                Upload your restaurant logo to display in the sidebar and
                reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUpload
                logoPreview={logoPreview}
                isLoading={isLoading}
                onUpload={handleLogoUpload}
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleLogoUpload(e.target.files[0]);
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Financial Settings */}
      <TabsContent value="financial">
        <div className="space-y-6">
          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Set your restaurant\'s default currency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurrencySettings
                defaultCurrency={defaultCurrency}
                isLoading={isLoading}
                onUpdate={handleCurrencyUpdate}
              />
            </CardContent>
          </Card>

          {/* Tax Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Tax Settings</CardTitle>
              <CardDescription>
                Configure tax rates for your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaxSettings
                taxRate={taxRate}
                taxEnabled={taxEnabled}
                taxName={taxName}
                isLoading={isLoading}
                onUpdate={handleTaxSettingsUpdate}
              />
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
