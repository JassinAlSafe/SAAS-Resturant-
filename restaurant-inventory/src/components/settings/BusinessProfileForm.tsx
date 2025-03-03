"use client";

import { useState, useEffect, useRef } from "react";
import { BusinessProfile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { FiSave, FiUpload, FiClock, FiDollarSign } from "react-icons/fi";
import { useNotificationHelpers } from "@/lib/notification-context";
import { businessProfileService } from "@/lib/services/business-profile-service";
import { CURRENCIES, CurrencyCode, useCurrency } from "@/lib/currency-context";
import Image from "next/image";
import { useBusinessProfile } from "@/lib/business-profile-context";
import { SetupStorageBucket } from "./SetupStorageBucket";

interface BusinessProfileFormProps {
  userId: string;
}

// Business types with display names
const businessTypes = [
  { value: "cafe", label: "Café" },
  { value: "fast_food", label: "Fast Food" },
  { value: "fine_dining", label: "Fine Dining" },
  { value: "casual_dining", label: "Casual Dining" },
  { value: "bakery", label: "Bakery" },
  { value: "bar", label: "Bar" },
  { value: "other", label: "Other" },
];

export default function BusinessProfileForm({
  userId,
}: BusinessProfileFormProps) {
  const {
    success: showSuccess,
    error: showError,
    info: showInfo,
  } = useNotificationHelpers();
  const { setCurrency } = useCurrency();
  const { refreshProfile } = useBusinessProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState("");
  const [type, setType] = useState<BusinessProfile["type"]>("casual_dining");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [operatingHours, setOperatingHours] = useState<
    BusinessProfile["operatingHours"]
  >({
    monday: { open: "09:00", close: "17:00", closed: false },
    tuesday: { open: "09:00", close: "17:00", closed: false },
    wednesday: { open: "09:00", close: "17:00", closed: false },
    thursday: { open: "09:00", close: "17:00", closed: false },
    friday: { open: "09:00", close: "17:00", closed: false },
    saturday: { open: "10:00", close: "15:00", closed: false },
    sunday: { open: "10:00", close: "15:00", closed: true },
  });
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>("SEK");
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Fetch business profile
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      setIsLoading(true);
      try {
        const fetchedProfile = await businessProfileService.getBusinessProfile(
          userId
        );
        setProfile(fetchedProfile);

        // Set form state
        setName(fetchedProfile.name);
        setType(fetchedProfile.type);
        setAddress(fetchedProfile.address);
        setCity(fetchedProfile.city);
        setState(fetchedProfile.state);
        setZipCode(fetchedProfile.zipCode);
        setCountry(fetchedProfile.country);
        setPhone(fetchedProfile.phone);
        setEmail(fetchedProfile.email);
        setWebsite(fetchedProfile.website || "");
        setOperatingHours(fetchedProfile.operatingHours);

        if (fetchedProfile.defaultCurrency) {
          setDefaultCurrency(fetchedProfile.defaultCurrency as CurrencyCode);
        }

        if (fetchedProfile.logo) {
          setLogoPreview(fetchedProfile.logo);
        }
      } catch (error) {
        console.error("Error fetching business profile:", error);
        showError(
          "Failed to load profile",
          "There was an error loading your business profile."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchBusinessProfile();
    }
  }, [userId, showError]);

  // Handle basic profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Submitting profile update with:", {
        name,
        type,
        address,
        city,
        state,
        zipCode,
        country,
        phone,
        email,
        website,
      });

      const updatedProfile = await businessProfileService.updateBusinessProfile(
        userId,
        {
          name,
          type,
          address,
          city,
          state,
          zipCode,
          country,
          phone,
          email,
          website: website || undefined,
        }
      );

      setProfile(updatedProfile);
      showSuccess(
        "Profile Updated",
        "Your business profile has been updated successfully."
      );
    } catch (error) {
      console.error("Error updating business profile:", error);
      showError(
        "Update Failed",
        error instanceof Error
          ? `There was a problem updating your business profile: ${error.message}`
          : "There was a problem updating your business profile. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle operating hours update
  const handleHoursUpdate = async (
    day: keyof BusinessProfile["operatingHours"],
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    const currentHours = operatingHours[day];
    let updatedHours;

    if (field === "closed") {
      updatedHours = {
        ...currentHours,
        closed: value as boolean,
      };
    } else {
      updatedHours = {
        ...currentHours,
        [field]: value as string,
      };
    }

    // Update local state
    setOperatingHours({
      ...operatingHours,
      [day]: updatedHours,
    });

    try {
      const updatedProfile = await businessProfileService.updateOperatingHours(
        userId,
        day,
        updatedHours
      );
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating operating hours:", error);
      showError(
        "Update Failed",
        "There was a problem updating your operating hours."
      );
    }
  };

  // Handle currency update
  const handleCurrencyUpdate = async (currency: CurrencyCode) => {
    setDefaultCurrency(currency);

    try {
      const updatedProfile = await businessProfileService.updateDefaultCurrency(
        userId,
        currency
      );
      setProfile(updatedProfile);

      // Update the app-wide currency context
      setCurrency(CURRENCIES[currency]);

      showSuccess(
        "Currency Updated",
        `Your default currency has been set to ${CURRENCIES[currency].name}.`
      );
    } catch (error) {
      console.error("Error updating currency:", error);
      showError(
        "Update Failed",
        "There was a problem updating your default currency."
      );
    }
  };

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > 5) {
      showError("Upload Failed", "Image size must be less than 5MB.");
      return;
    }

    // Validate file type
    const validTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    if (!validTypes.includes(file.type)) {
      showError(
        "Invalid File Type",
        `File type "${file.type}" is not supported. Please use PNG, JPEG, GIF, WebP, or SVG.`
      );
      return;
    }

    setIsLoading(true);
    showInfo("Uploading...", "Please wait while we upload your logo.");

    // Check the bucket status first to ensure everything is set up
    try {
      // Check storage status first
      const statusResponse = await fetch("/api/check-storage-status");
      const statusData = await statusResponse.json();

      if (!statusData.bucketExists) {
        showInfo(
          "Setting up storage...",
          "Storage bucket not found. Setting up storage system..."
        );

        // Set up storage bucket with force=true to ensure policies are correct
        const setupResponse = await fetch(
          "/api/setup-storage-bucket?force=true"
        );
        if (!setupResponse.ok) {
          const setupError = await setupResponse.json();
          throw new Error(
            `Storage setup failed: ${
              setupError.error || setupError.message || "Unknown error"
            }`
          );
        }

        showInfo(
          "Storage setup complete",
          "Storage system is now ready. Proceeding with logo upload..."
        );
      }

      // Now try to upload the logo
      const updatedProfile = await businessProfileService.uploadLogo(
        userId,
        file
      );

      setProfile(updatedProfile);
      setLogoPreview(updatedProfile.logo || null);
      showSuccess(
        "Logo Updated",
        "Your restaurant logo has been updated and will now appear in the sidebar navigation."
      );

      // Refresh the profile context to update the sidebar
      await refreshProfile();
    } catch (error: unknown) {
      console.error("Error uploading logo:", error);

      // Check if it's a bucket-related error
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Extract more useful information from the error message
      const isStorageError =
        errorMessage.includes("bucket") || errorMessage.includes("storage");

      const isPermissionError =
        errorMessage.includes("row-level security policy") ||
        errorMessage.includes("Unauthorized") ||
        errorMessage.includes("permission");

      const isConnectionError =
        errorMessage.includes("network") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("Failed to fetch");

      // Show appropriate error message based on the error type
      if (isConnectionError) {
        showError(
          "Connection Error",
          "Could not connect to the server. Please check your internet connection and try again."
        );
      } else if (isPermissionError) {
        // Try to fix the permissions issue
        try {
          showInfo(
            "Fixing permissions...",
            "We're fixing storage permissions. This may take a moment..."
          );

          // Check policies
          const policiesResponse = await fetch("/api/check-storage-policies");
          if (!policiesResponse.ok) {
            console.error(
              "Failed to check policies:",
              await policiesResponse.text()
            );
          }

          // Force update the policies
          const setupResponse = await fetch(
            "/api/setup-storage-bucket?force=true"
          );
          if (!setupResponse.ok) {
            throw new Error("Failed to update storage policies");
          }

          showInfo(
            "Permissions updated",
            "Storage permissions have been updated. Trying to upload again..."
          );

          // Wait a bit for policies to take effect
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Try again with the upload
          const updatedProfile = await businessProfileService.uploadLogo(
            userId,
            file
          );

          setProfile(updatedProfile);
          setLogoPreview(updatedProfile.logo || null);
          showSuccess(
            "Logo Updated",
            "Your restaurant logo has been updated successfully!"
          );

          // Refresh the profile context to update the sidebar
          await refreshProfile();
          return;
        } catch (retryError) {
          console.error("Error fixing permissions:", retryError);
          showError(
            "Permission Error",
            "You don't have permission to upload files. This is likely an issue with the storage configuration. Please contact support."
          );
        }
      } else if (isStorageError) {
        showError(
          "Storage Error",
          "There was a problem with the storage system. Please try again later or contact support if the issue persists."
        );
      } else {
        showError(
          "Upload Failed",
          `There was a problem uploading your logo: ${errorMessage}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
        <TabsTrigger value="hours">Operating Hours</TabsTrigger>
        <TabsTrigger value="appearance">Appearance</TabsTrigger>
      </TabsList>

      {/* Basic Information */}
      <TabsContent value="basic">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Update your restaurant&apos;s basic information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your restaurant name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Business Type</Label>
                <Select
                  value={type}
                  onValueChange={(value: BusinessProfile["type"]) =>
                    setType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@restaurant.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (234) 567-8901"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourrestaurant.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Postal/ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="ZIP Code"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Country"
                  />
                </div>
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

      {/* Operating Hours */}
      <TabsContent value="hours">
        <Card>
          <CardHeader className="flex flex-row items-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
              <FiClock className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>Operating Hours</span>
              </CardTitle>
              <CardDescription>
                Set your restaurant&apos;s opening and closing times. Overnight
                hours (e.g., 22:00 to 02:00) are supported.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(operatingHours)
                .sort(([dayA], [dayB]) => {
                  // Define the order of days starting with Monday
                  const dayOrder = {
                    monday: 0,
                    tuesday: 1,
                    wednesday: 2,
                    thursday: 3,
                    friday: 4,
                    saturday: 5,
                    sunday: 6,
                  };
                  return (
                    dayOrder[dayA as keyof typeof dayOrder] -
                    dayOrder[dayB as keyof typeof dayOrder]
                  );
                })
                .map(([day, hours]) => (
                  <div
                    key={day}
                    className="grid grid-cols-12 items-center gap-4 py-2 border-b border-gray-100"
                  >
                    <div className="col-span-3 font-medium capitalize">
                      {day}
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`${day}-closed`}
                          checked={!hours.closed}
                          onCheckedChange={(checked) =>
                            handleHoursUpdate(
                              day as keyof BusinessProfile["operatingHours"],
                              "closed",
                              !checked
                            )
                          }
                        />
                        <Label htmlFor={`${day}-closed`}>
                          {hours.closed ? "Closed" : "Open"}
                        </Label>
                      </div>
                    </div>
                    <div className="col-span-6">
                      {!hours.closed && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor={`${day}-open`} className="sr-only">
                              Opening Time
                            </Label>
                            <Input
                              id={`${day}-open`}
                              type="time"
                              value={hours.open}
                              onChange={(e) =>
                                handleHoursUpdate(
                                  day as keyof BusinessProfile["operatingHours"],
                                  "open",
                                  e.target.value
                                )
                              }
                              disabled={hours.closed}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`${day}-close`} className="sr-only">
                              Closing Time
                            </Label>
                            <Input
                              id={`${day}-close`}
                              type="time"
                              value={hours.close}
                              onChange={(e) =>
                                handleHoursUpdate(
                                  day as keyof BusinessProfile["operatingHours"],
                                  "close",
                                  e.target.value
                                )
                              }
                              disabled={hours.closed}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Appearance */}
      <TabsContent value="appearance">
        <div className="space-y-6">
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
              <div className="space-y-4">
                <div className="border rounded-md p-4 flex justify-center items-center bg-gray-50 h-40">
                  {logoPreview ? (
                    <div className="relative h-full max-w-full max-h-full">
                      <Image
                        src={logoPreview}
                        alt="Restaurant Logo"
                        className="object-contain max-h-full"
                        width={150}
                        height={150}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center p-4">
                      No logo uploaded
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleLogoUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerFileInput}
                  className="flex items-center gap-1"
                >
                  <FiUpload className="h-4 w-4" />
                  <span>Upload Logo</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Storage Bucket Setup Card */}
          <SetupStorageBucket />

          {/* Currency Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FiDollarSign className="h-5 w-5" />
                <span>Default Currency</span>
              </CardTitle>
              <CardDescription>
                Set the default currency for your restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Select Currency</Label>
                  <Select
                    value={defaultCurrency}
                    onValueChange={(value: CurrencyCode) =>
                      handleCurrencyUpdate(value)
                    }
                  >
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CURRENCIES).map(([code, currency]) => (
                        <SelectItem key={code} value={code}>
                          <div className="flex items-center">
                            <span className="mr-2">{currency.symbol}</span>
                            <span>{currency.name}</span>
                            <span className="ml-1 text-gray-400">
                              ({currency.code})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    This will be the default currency used throughout the
                    application. You can still change the currency at any time
                    from the currency selector.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
