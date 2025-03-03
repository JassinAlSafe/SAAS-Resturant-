import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FiClock } from "react-icons/fi";
import { BusinessProfile } from "@/lib/types";

interface OperatingHoursFormProps {
  operatingHours: BusinessProfile["operatingHours"];
  isLoading: boolean;
  onUpdate: (
    day: keyof BusinessProfile["operatingHours"],
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => void;
}

export function OperatingHoursForm({
  operatingHours,
  isLoading,
  onUpdate,
}: OperatingHoursFormProps) {
  // Format day names for display
  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Days of the week
  const daysOfWeek = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FiClock className="mr-2 h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-medium">Operating Hours</h3>
      </div>

      <div className="space-y-4">
        {daysOfWeek.map((day) => (
          <div key={day} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-3">
              <Label>{formatDayName(day)}</Label>
            </div>
            <div className="col-span-3">
              <Input
                type="time"
                value={operatingHours[day].open}
                onChange={(e) => onUpdate(day, "open", e.target.value)}
                disabled={operatingHours[day].closed || isLoading}
              />
            </div>
            <div className="col-span-1 text-center">to</div>
            <div className="col-span-3">
              <Input
                type="time"
                value={operatingHours[day].close}
                onChange={(e) => onUpdate(day, "close", e.target.value)}
                disabled={operatingHours[day].closed || isLoading}
              />
            </div>
            <div className="col-span-2 flex items-center justify-end space-x-2">
              <Label htmlFor={`closed-${day}`} className="text-sm">
                Closed
              </Label>
              <Switch
                id={`closed-${day}`}
                checked={operatingHours[day].closed}
                onCheckedChange={(checked) => onUpdate(day, "closed", checked)}
                disabled={isLoading}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
