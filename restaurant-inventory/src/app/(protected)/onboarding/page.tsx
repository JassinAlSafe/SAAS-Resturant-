"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { gsap } from "gsap";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { 
  CheckCircle, 
  ArrowRight, 
  Store, 
  DollarSign, 
  MapPin,
  Phone,
  Globe,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Define the form schema with validation
const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  currency: z.string().min(1, "Please select a currency"),
  address: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Currency options
const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "SEK", label: "SEK - Swedish Krona" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
  { value: "JPY", label: "JPY - Japanese Yen" },
];

export default function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [businessId, setBusinessId] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      currency: "USD",
      address: "",
      phone: "",
      website: "",
      description: "",
    },
  });

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Fetch business profile if it exists
  useEffect(() => {
    const fetchBusinessProfile = async () => {
      if (!user) return;
      
      try {
        // First check if there are multiple business profiles and get the most recent one
        const { data: profiles, error: profilesError } = await supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (profilesError) {
          console.error("Error fetching business profiles:", profilesError);
          return;
        }
        
        // If multiple profiles exist, clean up duplicates
        if (profiles && profiles.length > 1) {
          console.log(`Found ${profiles.length} business profiles, using the most recent one`);
          const mostRecentProfile = profiles[0];
          setBusinessId(mostRecentProfile.id);
          
          // Delete the older duplicates
          const idsToDelete = profiles.slice(1).map(p => p.id);
          if (idsToDelete.length > 0) {
            const { error: deleteError } = await supabase
              .from('business_profiles')
              .delete()
              .in('id', idsToDelete);
              
            if (deleteError) {
              console.error("Error deleting duplicate profiles:", deleteError);
            } else {
              console.log(`Successfully deleted ${idsToDelete.length} duplicate profiles`);
            }
          }
          
          // Set form values from the most recent profile
          if (mostRecentProfile) {
            form.setValue("businessName", mostRecentProfile.name || "");
            form.setValue("currency", mostRecentProfile.default_currency || "USD");
            form.setValue("address", mostRecentProfile.address || "");
            form.setValue("phone", mostRecentProfile.phone || "");
            form.setValue("website", mostRecentProfile.website || "");
          }
        } 
        // If only one profile exists, use it
        else if (profiles && profiles.length === 1) {
          const profile = profiles[0];
          setBusinessId(profile.id);
          
          // Set form values
          form.setValue("businessName", profile.name || "");
          form.setValue("currency", profile.default_currency || "USD");
          form.setValue("address", profile.address || "");
          form.setValue("phone", profile.phone || "");
          form.setValue("website", profile.website || "");
        }
        // No profiles exist yet
        else {
          console.log("No business profile found, will create a new one");
        }
      } catch (error) {
        console.error("Error in fetchBusinessProfile:", error);
      }
    };

    fetchBusinessProfile();
  }, [user, form]);

  // Animation for step transitions
  useEffect(() => {
    const timeline = gsap.timeline();
    timeline.fromTo(
      ".onboarding-card",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 }
    );
  }, [step]);

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Create a simplified business profile with minimal fields to avoid RLS issues
      const businessData = {
        user_id: user.id,
        name: values.businessName,
        default_currency: values.currency,
        address: values.address || null,
        phone: values.phone || null,
        website: values.website || null,
        type: "restaurant", // Default type
      };

      // Use direct Supabase call with minimal fields
      let response;
      
      if (businessId) {
        // Update existing business profile
        response = await supabase
          .from("business_profiles")
          .update(businessData)
          .eq("id", businessId);
      } else {
        // Create new business profile
        response = await supabase
          .from("business_profiles")
          .insert(businessData);
      }

      if (response.error) {
        console.error("Error saving business profile:", response.error);
        toast({
          title: "Error",
          description: "Failed to save business profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update user profile to mark onboarding as completed
      await supabase
        .from("profiles")
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      toast({
        title: "Setup Complete",
        description: "Your business profile has been saved successfully.",
      });

      // Move to success step
      setStep(2);
    } catch (error) {
      console.error("Error saving business profile:", error);
      toast({
        title: "Error",
        description: "Failed to save your business profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If still loading auth, show loading indicator
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="onboarding-card w-full max-w-2xl">
        {step === 1 ? (
          <Card className="border-2 border-primary/10">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Complete Your Setup</CardTitle>
              <CardDescription>
                Let\'s set up your business profile to get started with inventory management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Store className="h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Your Restaurant Name" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-5 w-5 text-muted-foreground" />
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Currency" />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem
                                    key={currency.value}
                                    value={currency.value}
                                  >
                                    {currency.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Business Address" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (Optional)</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-5 w-5 text-muted-foreground" />
                              <Input placeholder="Contact Number" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website (Optional)</FormLabel>
                        <FormControl>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-5 w-5 text-muted-foreground" />
                            <Input placeholder="https://yourrestaurant.com" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your business"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Save and Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary/10">
            <CardHeader className="space-y-1">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-bold text-center">Setup Complete!</CardTitle>
              <CardDescription className="text-center">
                Your business profile has been set up successfully. You\'re now ready to start managing your inventory.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-center text-muted-foreground">
                You can always update your business details in the settings page.
              </p>
              <div className="flex flex-col w-full space-y-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full"
                  size="lg"
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push("/settings")}
                  className="w-full"
                >
                  Configure Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
