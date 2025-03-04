"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { differenceInDays, format, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

// Extended InventoryItem type to include the expiryDate property returned by the service
interface ExtendedInventoryItem extends InventoryItem {
  expiryDate?: string | null;
  reorderLevel?: number;
}

// Simple Badge component for this specific use case
interface BadgeProps {
  variant?: "default" | "destructive" | "warning";
  children: React.ReactNode;
}

const ExpiryBadge = ({ variant = "default", children }: BadgeProps) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800",
    destructive: "bg-red-100 text-red-800",
    warning: "bg-amber-100 text-amber-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
};

export default function ExpiryAlerts() {
  const router = useRouter();
  const [items, setItems] = useState<ExtendedInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpiringItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const expiringItems =
        (await inventoryService.getSoonToExpireItems()) as ExtendedInventoryItem[];
      setItems(expiringItems);
    } catch (err) {
      console.error("Error fetching expiring items:", err);
      setError("Failed to load expiry data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiringItems();
  }, []);

  const handleViewInventory = () => {
    router.push("/inventory");
  };

  const getSeverityClass = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return "bg-blue-100 text-blue-800"; // No expiry date

    const today = new Date();
    const expiry = new Date(expiryDate);

    const daysUntilExpiry = differenceInDays(expiry, today);

    if (isBefore(expiry, today)) return "bg-red-100 text-red-800"; // Already expired
    if (daysUntilExpiry <= 3) return "bg-red-100 text-red-800"; // Critical
    if (daysUntilExpiry <= 7) return "bg-amber-100 text-amber-800"; // Warning
    return "bg-blue-100 text-blue-800"; // Approaching
  };

  const getExpiryStatus = (
    expiryDate: string | null | undefined
  ): "default" | "destructive" | "warning" => {
    if (!expiryDate) return "default";

    const today = new Date();
    const expiry = new Date(expiryDate);

    if (isBefore(expiry, today)) return "destructive"; // Already expired

    // Within 7 days
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    if (isBefore(expiry, sevenDaysFromNow)) return "warning";

    return "default";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Expiry Alerts</h2>
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Expiry Alerts</h2>
        <div className="p-4 text-center text-red-600">
          <p>{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchExpiringItems}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Expiry Alerts</h2>
        <div className="p-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h3 className="text-base font-medium mb-1">All Good!</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No items are expiring soon.
          </p>
          <Button variant="outline" size="sm" onClick={handleViewInventory}>
            View Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Expiry Alerts</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center p-3 rounded-md border"
          >
            <div
              className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-3 ${getSeverityClass(
                item.expiryDate
              )}`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              <p className="text-xs text-muted-foreground flex items-center mt-0.5">
                <Clock className="h-3 w-3 mr-1 inline" />
                {item.expiryDate
                  ? format(new Date(item.expiryDate), "MMM d, yyyy")
                  : "No expiry date"}
              </p>
            </div>
            <div className="ml-2">
              <ExpiryBadge variant={getExpiryStatus(item.expiryDate)}>
                {item.expiryDate &&
                differenceInDays(new Date(item.expiryDate), new Date()) < 0
                  ? "Expired"
                  : item.expiryDate
                  ? `${Math.max(
                      0,
                      differenceInDays(new Date(item.expiryDate), new Date())
                    )} days left`
                  : "No expiry"}
              </ExpiryBadge>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-right">
        <Button variant="outline" size="sm" onClick={handleViewInventory}>
          View All
        </Button>
      </div>
    </div>
  );
}
