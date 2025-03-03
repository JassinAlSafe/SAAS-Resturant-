import { Metadata } from "next";
import { BusinessProfileContent } from "@/components/settings/business-profile/BusinessProfileContent";
import { CurrencyCode } from "@/lib/currency-context";

export const metadata: Metadata = {
  title: "Business Profile | Restaurant Inventory Manager",
  description: "Manage your restaurant's business profile settings",
};

// Mock data for demonstration purposes
const mockBusinessData = {
  basicInfo: {
    name: "Delicious Bites",
    email: "contact@deliciousbites.com",
    phone: "(555) 123-4567",
    website: "https://deliciousbites.com",
    type: "casual_dining" as const,
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
  currency: "USD" as CurrencyCode,
  tax: {
    enabled: true,
    name: "Sales Tax",
    rate: 8.5,
  },
};

export default function BusinessProfilePage() {
  return <BusinessProfileContent businessData={mockBusinessData} />;
}
