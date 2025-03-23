import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiSave } from "react-icons/fi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BusinessProfile } from "@/lib/types";

// Business types with display names
const businessTypes = [
  { value: "cafe", label: "Caf" },
  { value: "fast_food", label: "Fast Food" },
  { value: "fine_dining", label: "Fine Dining" },
  { value: "casual_dining", label: "Casual Dining" },
  { value: "bakery", label: "Bakery" },
  { value: "bar", label: "Bar" },
  { value: "other", label: "Other" },
];

interface BasicInfoFormProps {
  name: string;
  setName: (value: string) => void;
  type: BusinessProfile["type"];
  setType: (value: BusinessProfile["type"]) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  website: string;
  setWebsite: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function BasicInfoForm({
  name,
  setName,
  type,
  setType,
  email,
  setEmail,
  phone,
  setPhone,
  website,
  setWebsite,
  isLoading,
  onSubmit,
}: BasicInfoFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Business Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Restaurant Name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Business Type</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as BusinessProfile["type"])}
        >
          <SelectTrigger id="type">
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="contact@yourrestaurant.com"
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          "Saving..."
        ) : (
          <>
            <FiSave className="mr-2 h-4 w-4" />
            Save Basic Information
          </>
        )}
      </Button>
    </form>
  );
}
