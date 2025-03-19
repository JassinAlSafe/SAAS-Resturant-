"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
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
import { Stepper } from "@/components/ui/stepper";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, InfoIcon } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { businessProfileService } from "@/lib/services/business-profile-service";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { BusinessType, CurrencyCode } from "@/lib/types/business-profile";

const STEPS = [
  "Basic Information",
  "Contact Details",
  "Business Settings",
  "Tax Settings",
];

// Helper function to save form state to localStorage
const saveToLocalStorage = (key: string, data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Helper function to get form state from localStorage
const getFromLocalStorage = (key: string, defaultValue: any) => {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  }
  return defaultValue;
};

// Helper function to clear onboarding data from localStorage
const clearOnboardingData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("onboarding_basic");
    localStorage.removeItem("onboarding_contact");
    localStorage.removeItem("onboarding_business");
    localStorage.removeItem("onboarding_tax");
  }
};

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form state with localStorage persistence
  const [basicInfo, setBasicInfo] = useState(() =>
    getFromLocalStorage("onboarding_basic", {
      name: "",
      type: BusinessType.CASUAL_DINING,
    })
  );

  const [contactInfo, setContactInfo] = useState(() =>
    getFromLocalStorage("onboarding_contact", {
      phone: "",
      website: "",
    })
  );

  const [businessSettings, setBusinessSettings] = useState(() =>
    getFromLocalStorage("onboarding_business", {
      defaultCurrency: CurrencyCode.USD,
    })
  );

  const [taxSettings, setTaxSettings] = useState(() =>
    getFromLocalStorage("onboarding_tax", {
      taxEnabled: false,
      taxRate: 0,
      taxName: "Sales Tax",
    })
  );

  // Update localStorage when form state changes
  useEffect(() => {
    saveToLocalStorage("onboarding_basic", basicInfo);
  }, [basicInfo]);

  useEffect(() => {
    saveToLocalStorage("onboarding_contact", contactInfo);
  }, [contactInfo]);

  useEffect(() => {
    saveToLocalStorage("onboarding_business", businessSettings);
  }, [businessSettings]);

  useEffect(() => {
    saveToLocalStorage("onboarding_tax", taxSettings);
  }, [taxSettings]);

  useEffect(() => {
    const isInitialized = status !== "initializing";
    if (!isInitialized) return;

    const checkAuthAndProfile = async () => {
      try {
        // If not authenticated, redirect to login
        if (!isAuthenticated) {
          router.push("/login");
          return;
        }

        // Always use getUser() rather than getSession() for security
        const { data, error } = await supabase.auth.getUser();
        if (error || !data.user) {
          console.error("Error validating user:", error);
          router.push("/login");
          return;
        }

        // Check if user already has a profile
        const { data: profiles, error: profileError } = await supabase
          .from("business_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .limit(1);

        if (profileError) {
          console.error("Error checking business profile:", profileError);
          toast({
            title: "Error",
            description: "Failed to check business profile. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (profiles && profiles.length > 0) {
          // User already has a profile, skip onboarding
          clearOnboardingData();
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error in auth/profile check:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    checkAuthAndProfile();
  }, [isAuthenticated, router, toast, status]);

  const validateCurrentStep = () => {
    if (currentStep === 0) {
      if (!basicInfo.name.trim()) {
        toast({
          title: "Required Field",
          description: "Please enter your restaurant name to continue.",
          variant: "destructive",
        });
        return false;
      }
      if (!basicInfo.type) {
        toast({
          title: "Required Field",
          description: "Please select a restaurant type to continue.",
          variant: "destructive",
        });
        return false;
      }
    } else if (currentStep === 1) {
      if (!contactInfo.phone.trim()) {
        toast({
          title: "Required Field",
          description: "Please provide a phone number to continue.",
          variant: "destructive",
        });
        return false;
      }
      // Basic phone number validation
      const phoneRegex =
        /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
      if (!phoneRegex.test(contactInfo.phone.trim())) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number format.",
          variant: "destructive",
        });
        return false;
      }
      // Website validation if provided
      if (
        contactInfo.website &&
        !contactInfo.website.trim().startsWith("http")
      ) {
        setContactInfo({
          ...contactInfo,
          website: `https://${contactInfo.website.trim()}`,
        });
      }
    } else if (currentStep === 3) {
      if (
        taxSettings.taxEnabled &&
        (taxSettings.taxRate < 0 || taxSettings.taxRate > 100)
      ) {
        toast({
          title: "Invalid Tax Rate",
          description: "Tax rate must be between 0% and 100%.",
          variant: "destructive",
        });
        return false;
      }
      if (taxSettings.taxEnabled && !taxSettings.taxName.trim()) {
        toast({
          title: "Required Field",
          description: "Please provide a tax name for enabled taxes.",
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        throw new Error("Authentication validation failed");
      }

      // Prepare operating hours with better defaults
      const operatingHours = {
        monday: { open: "09:00", close: "22:00", closed: false },
        tuesday: { open: "09:00", close: "22:00", closed: false },
        wednesday: { open: "09:00", close: "22:00", closed: false },
        thursday: { open: "09:00", close: "22:00", closed: false },
        friday: { open: "09:00", close: "23:00", closed: false },
        saturday: { open: "10:00", close: "23:00", closed: false },
        sunday: {
          open: "10:00",
          close: "21:00",
          closed: taxSettings.taxEnabled ? false : true,
        },
      };

      // Use businessProfileService to create profile
      const newProfile = await businessProfileService.createBusinessProfile(
        data.user.id
      );

      // Update the newly created profile with user's selections
      await businessProfileService.updateBusinessProfile(newProfile.id, {
        name: basicInfo.name.trim(),
        type: basicInfo.type,
        phone: contactInfo.phone.trim(),
        website: contactInfo.website.trim(),
        operatingHours,
        defaultCurrency: businessSettings.defaultCurrency,
        taxEnabled: taxSettings.taxEnabled,
        taxRate: taxSettings.taxEnabled ? taxSettings.taxRate : 0,
        taxName: taxSettings.taxEnabled
          ? taxSettings.taxName.trim()
          : "Sales Tax",
      });

      // Show success message
      toast({
        title: "Profile Created Successfully",
        description:
          "Welcome to your restaurant dashboard! You're all set to start managing your business.",
      });

      // Clear onboarding data from localStorage
      clearOnboardingData();

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error in profile creation:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    const fadeIn = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.5 } },
    };

    switch (currentStep) {
      case 0:
        return (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Restaurant Name{" "}
                <Badge variant="destructive" className="ml-1">
                  Required
                </Badge>
              </Label>
              <Input
                id="name"
                placeholder="Enter your restaurant name"
                value={basicInfo.name}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, name: e.target.value })
                }
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type" className="text-sm font-medium">
                Restaurant Type{" "}
                <Badge variant="destructive" className="ml-1">
                  Required
                </Badge>
              </Label>
              <Select
                value={basicInfo.type}
                onValueChange={(value) =>
                  setBasicInfo({ ...basicInfo, type: value as BusinessType })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select restaurant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={BusinessType.CASUAL_DINING}>
                    Casual Dining
                  </SelectItem>
                  <SelectItem value={BusinessType.FINE_DINING}>
                    Fine Dining
                  </SelectItem>
                  <SelectItem value={BusinessType.FAST_FOOD}>
                    Fast Food
                  </SelectItem>
                  <SelectItem value={BusinessType.CAFE}>Café</SelectItem>
                  <SelectItem value={BusinessType.BAR}>Bar & Grill</SelectItem>
                  <SelectItem value={BusinessType.FOOD_TRUCK}>
                    Food Truck
                  </SelectItem>
                  <SelectItem value={BusinessType.GHOST_KITCHEN}>
                    Ghost Kitchen
                  </SelectItem>
                  <SelectItem value={BusinessType.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number{" "}
                <Badge variant="destructive" className="ml-1">
                  Required
                </Badge>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter phone number (e.g., 555-123-4567)"
                value={contactInfo.phone}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, phone: e.target.value })
                }
                className="focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-muted-foreground">
                This number will be used for customer inquiries and account
                verification
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="website" className="text-sm font-medium">
                  Website
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-4 w-4 ml-2 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="w-[200px]">
                        Enter your restaurant's website URL if you have one
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="website"
                type="url"
                placeholder="https://yourrestaurant.com"
                value={contactInfo.website}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, website: e.target.value })
                }
                className="focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">
                Default Currency{" "}
                <Badge variant="destructive" className="ml-1">
                  Required
                </Badge>
              </Label>
              <Select
                value={businessSettings.defaultCurrency}
                onValueChange={(value) =>
                  setBusinessSettings({
                    ...businessSettings,
                    defaultCurrency: value as CurrencyCode,
                  })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CurrencyCode.USD}>USD ($)</SelectItem>
                  <SelectItem value={CurrencyCode.EUR}>EUR (€)</SelectItem>
                  <SelectItem value={CurrencyCode.GBP}>GBP (£)</SelectItem>
                  <SelectItem value={CurrencyCode.CAD}>CAD ($)</SelectItem>
                  <SelectItem value={CurrencyCode.AUD}>AUD ($)</SelectItem>
                  <SelectItem value={CurrencyCode.JPY}>JPY (¥)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This will be used for all financial calculations and reports
              </p>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div
            className="space-y-5"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fadeIn}
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tax-enabled"
                  checked={taxSettings.taxEnabled}
                  onCheckedChange={(checked) =>
                    setTaxSettings({
                      ...taxSettings,
                      taxEnabled: checked === true,
                    })
                  }
                />
                <Label
                  htmlFor="tax-enabled"
                  className="font-medium cursor-pointer"
                >
                  Enable Tax Calculation
                </Label>
              </div>

              {taxSettings.taxEnabled && (
                <div className="space-y-4 pl-6 border-l-2 border-primary/20">
                  <div className="space-y-2">
                    <Label htmlFor="tax-name" className="text-sm font-medium">
                      Tax Name{" "}
                      <Badge variant="destructive" className="ml-1">
                        Required
                      </Badge>
                    </Label>
                    <Input
                      id="tax-name"
                      placeholder="e.g., Sales Tax, VAT, GST"
                      value={taxSettings.taxName}
                      onChange={(e) =>
                        setTaxSettings({
                          ...taxSettings,
                          taxName: e.target.value,
                        })
                      }
                      className="focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-rate" className="text-sm font-medium">
                      Tax Rate (%){" "}
                      <Badge variant="destructive" className="ml-1">
                        Required
                      </Badge>
                    </Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="Enter tax rate (e.g., 8.25)"
                      value={taxSettings.taxRate}
                      onChange={(e) =>
                        setTaxSettings({
                          ...taxSettings,
                          taxRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the percentage rate (0-100) that applies to your
                      location
                    </p>
                  </div>
                </div>
              )}

              {!taxSettings.taxEnabled && (
                <p className="text-sm text-muted-foreground italic">
                  You can enable tax calculation and configure tax settings
                  later in your profile settings.
                </p>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold">
            Set Up Your Restaurant
          </CardTitle>
          <CardDescription className="text-base">
            Let&apos;s create your restaurant&apos;s business profile. This will
            be your main workspace for managing your restaurant.
          </CardDescription>
        </CardHeader>

        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          className="px-6 mb-6"
        />

        <CardContent>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {renderStepContent()}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0 || isLoading}
            className="min-w-[100px]"
          >
            Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
            className="min-w-[140px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : currentStep === STEPS.length - 1 ? (
              "Complete Setup"
            ) : (
              "Continue"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
