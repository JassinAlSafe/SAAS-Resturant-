"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { testSupabaseConnection } from "@/lib/utils/supabase-utils";
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
import { Loader2, InfoIcon, MoreVertical } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useBusinessProfileUserStore } from "@/lib/stores/business-profile-user-store";
import { BusinessType, CurrencyCode } from "@/lib/types/business-profile";
import { defaultBusinessProfile } from "@/lib/utils/business-profile-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle } from "lucide-react";
import { withConnectionCheck } from "@/lib/utils/api-utils";

const STEPS = [
  "Basic Information",
  "Contact Details",
  "Business Settings",
  "Tax Settings",
];

// Helper function to save form state to localStorage
const saveToLocalStorage = <T extends Record<string, unknown>>(
  key: string,
  data: T
): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

// Helper function to get form state from localStorage
const getFromLocalStorage = <T extends Record<string, unknown>>(
  key: string,
  defaultValue: T
): T => {
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

// Updated function to clear and reset onboarding data
const resetOnboardingData = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("onboarding_basic");
    localStorage.removeItem("onboarding_contact");
    localStorage.removeItem("onboarding_business");
    localStorage.removeItem("onboarding_tax");
  }
};

function OnboardingContent() {
  const { toast } = useToast();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { createProfileWithUser, checkAccess, hasBusinessProfileAccess } =
    useBusinessProfileUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

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
    const checkProfile = async () => {
      try {
        // If not authenticated, redirect to login (should be handled by AuthGuard already, but just in case)
        if (!isAuthenticated || !user?.id) {
          router.push("/login");
          return;
        }

        // Test Supabase connection before proceeding
        const connectionResult = await testSupabaseConnection();
        if (!connectionResult) {
          console.error("Supabase connection test failed before profile check");
          toast({
            title: "Connection Error",
            description: "Unable to connect to the database. Please try again.",
            variant: "destructive",
          });
          return;
        }

        // Check if user already has a business profile
        await checkAccess(user.id);

        if (hasBusinessProfileAccess) {
          // User already has a profile, skip onboarding
          clearOnboardingData();
          router.push("/dashboard");
        }
      } catch (error) {
        // More detailed error logging
        console.error("Error in profile check:", {
          error,
          message: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          type: error?.constructor?.name,
        });

        toast({
          title: "Error",
          description:
            error instanceof Error
              ? `Unexpected error: ${error.message}`
              : "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    };

    checkProfile();
  }, [
    isAuthenticated,
    user,
    router,
    toast,
    checkAccess,
    hasBusinessProfileAccess,
  ]);

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
      // Show confirmation dialog instead of immediate submission
      setShowConfirmation(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setShowConfirmation(false);

    try {
      // Use the withConnectionCheck wrapper to ensure database connectivity
      await withConnectionCheck(async () => {
        if (!user?.id) {
          throw new Error("Authentication error, please try again");
        }

        // Prepare the business profile data
        const profileData = {
          name: basicInfo.name,
          type: basicInfo.type,
          operating_hours: defaultBusinessProfile.operatingHours,
          default_currency: businessSettings.defaultCurrency,
          tax_enabled: taxSettings.taxEnabled,
          tax_rate: taxSettings.taxRate,
          tax_name: taxSettings.taxName,
        };

        console.log("Creating business profile for user:", user.id);

        // Use our business profile user store to create the profile
        const profileId = await createProfileWithUser(user.id, profileData);

        if (!profileId) {
          throw new Error("Failed to create business profile");
        }

        console.log("Business profile created successfully:", profileId);

        // Update the profile with additional information if needed
        const additionalUpdates = {
          phone: contactInfo.phone,
          website: contactInfo.website,
        };

        const { error: updateError } = await supabase
          .from("business_profiles")
          .update(additionalUpdates)
          .eq("id", profileId);

        if (updateError) {
          console.warn("Error updating additional profile details:", {
            message: updateError?.message || "No message",
            code: updateError?.code,
            details: updateError?.details,
            profileId,
          });
          // Non-fatal, continue with the flow
        }

        // Show success message
        toast({
          title: "Onboarding Complete",
          description:
            "Welcome to your restaurant dashboard! You're all set to start managing your business.",
        });

        // Clear onboarding data from localStorage
        clearOnboardingData();

        // Redirect to dashboard
        router.push("/dashboard");
      });
    } catch (error) {
      console.error("Error in profile update:", {
        error,
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        type: error?.constructor?.name,
      });

      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    resetOnboardingData();
    setBasicInfo({
      name: "",
      type: BusinessType.CASUAL_DINING,
    });
    setContactInfo({
      phone: "",
      website: "",
    });
    setBusinessSettings({
      defaultCurrency: CurrencyCode.USD,
    });
    setTaxSettings({
      taxEnabled: false,
      taxRate: 0,
      taxName: "Sales Tax",
    });
    setCurrentStep(0);
    setShowResetConfirmation(false);

    toast({
      title: "Information Reset",
      description: "Your onboarding information has been reset.",
    });
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
                      <InfoIcon className="h-4 w-4 ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Enter your restaurant&apos;s website URL if you have one
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
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Set Up Your Restaurant
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setShowResetConfirmation(true)}
                >
                  Reset Information
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Restaurant Setup</DialogTitle>
            <DialogDescription>
              Are you sure you want to complete the setup with the current
              information? You can modify most settings later, but your
              restaurant type and currency may be harder to change.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmation(false)}
            >
              Review Information
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="sm:min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Confirm Setup"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={showResetConfirmation}
        onOpenChange={setShowResetConfirmation}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Reset Your Information
            </DialogTitle>
            <DialogDescription>
              This will clear all the information you&apos;ve entered. This
              action cannot be undone. Are you sure you want to start over?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetConfirmation(false)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleReset}>
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <AuthGuard requireAuth={true}>
      <OnboardingContent />
    </AuthGuard>
  );
}
