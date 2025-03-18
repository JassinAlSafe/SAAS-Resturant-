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
import { Loader2 } from "lucide-react";
import { User } from "@supabase/supabase-js";

const STEPS = ["Basic Information", "Contact Details", "Business Settings"];

export default function OnboardingPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form state
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    type: "",
  });

  const [contactInfo, setContactInfo] = useState({
    phone: "",
    website: "",
  });

  const [businessSettings, setBusinessSettings] = useState({
    defaultCurrency: "USD",
    taxEnabled: false,
    taxRate: 0,
    taxName: "Sales Tax",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      setUser(session.user);

      // Check if user already has a profile
      const { data: profiles } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .limit(1);

      if (profiles && profiles.length > 0) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      // Validate current step
      if (currentStep === 0 && (!basicInfo.name || !basicInfo.type)) {
        toast({
          title: "Required Fields",
          description: "Please fill in all required fields to continue.",
          variant: "destructive",
        });
        return;
      }
      if (currentStep === 1 && !contactInfo.phone) {
        toast({
          title: "Required Fields",
          description: "Please provide at least a phone number to continue.",
          variant: "destructive",
        });
        return;
      }
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
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a business profile.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check for existing profiles first
      const { data: existingProfiles, error: checkError } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (checkError) throw checkError;

      const profileData = {
        user_id: user.id,
        name: basicInfo.name,
        type: basicInfo.type,
        email: user.email,
        phone: contactInfo.phone,
        website: contactInfo.website,
        address: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
        operatingHours: {
          monday: { open: "09:00", close: "17:00", closed: false },
          tuesday: { open: "09:00", close: "17:00", closed: false },
          wednesday: { open: "09:00", close: "17:00", closed: false },
          thursday: { open: "09:00", close: "17:00", closed: false },
          friday: { open: "09:00", close: "17:00", closed: false },
          saturday: { open: "09:00", close: "17:00", closed: false },
          sunday: { open: "09:00", close: "17:00", closed: true },
        },
        ...businessSettings,
      };

      if (existingProfiles && existingProfiles.length > 0) {
        const profileId = existingProfiles[0].id;
        const { error: updateError } = await supabase
          .from("business_profiles")
          .update(profileData)
          .eq("id", profileId);

        if (updateError) throw updateError;

        toast({
          title: "Profile Updated",
          description: "Your restaurant profile has been updated successfully!",
        });
      } else {
        const { data: profile, error: profileError } = await supabase
          .from("business_profiles")
          .insert([profileData])
          .select()
          .single();

        if (profileError) throw profileError;

        if (profile) {
          const { error: relationError } = await supabase
            .from("business_profile_users")
            .insert([
              {
                user_id: user.id,
                business_profile_id: profile.id,
                role: "owner",
              },
            ]);

          if (relationError) {
            console.error(
              "Error creating profile relationship:",
              relationError
            );
          }
        }

        toast({
          title: "Profile Created",
          description: "Your restaurant profile has been created successfully!",
        });
      }

      router.push("/dashboard");
    } catch (error) {
      console.error("Error creating business profile:", error);
      toast({
        title: "Error",
        description:
          "Failed to create your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                placeholder="Enter your restaurant name"
                value={basicInfo.name}
                onChange={(e) =>
                  setBasicInfo({ ...basicInfo, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Restaurant Type</Label>
              <Select
                value={basicInfo.type}
                onValueChange={(value) =>
                  setBasicInfo({ ...basicInfo, type: value })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select restaurant type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Dining</SelectItem>
                  <SelectItem value="fine">Fine Dining</SelectItem>
                  <SelectItem value="fast-food">Fast Food</SelectItem>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="bar">Bar & Grill</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={contactInfo.phone}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, phone: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                placeholder="Enter website URL"
                value={contactInfo.website}
                onChange={(e) =>
                  setContactInfo({ ...contactInfo, website: e.target.value })
                }
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Select
                value={businessSettings.defaultCurrency}
                onValueChange={(value) =>
                  setBusinessSettings({
                    ...businessSettings,
                    defaultCurrency: value,
                  })
                }
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Set Up Your Restaurant</CardTitle>
          <CardDescription>
            Let&apos;s create your restaurant&apos;s business profile. This will
            be your main workspace for managing your restaurant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            <Stepper steps={STEPS} currentStep={currentStep} className="mb-8" />

            <form onSubmit={(e) => e.preventDefault()}>
              {renderStepContent()}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isLoading}
                >
                  Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : currentStep === STEPS.length - 1 ? (
                    "Complete Setup"
                  ) : (
                    "Next Step"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
