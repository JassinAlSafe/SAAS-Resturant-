import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiSave } from "react-icons/fi";

interface AddressFormProps {
  address: string;
  setAddress: (value: string) => void;
  city: string;
  setCity: (value: string) => void;
  state: string;
  setState: (value: string) => void;
  zipCode: string;
  setZipCode: (value: string) => void;
  country: string;
  setCountry: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function AddressForm({
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
  isLoading,
  onSubmit,
}: AddressFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
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
          <Label htmlFor="zipCode">Zip/Postal Code</Label>
          <Input
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="12345"
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

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          "Saving..."
        ) : (
          <>
            <FiSave className="mr-2 h-4 w-4" />
            Save Address
          </>
        )}
      </Button>
    </form>
  );
}
