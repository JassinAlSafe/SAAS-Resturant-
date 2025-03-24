"use client";

import { useState, useEffect, useRef } from "react";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";
import { differenceInDays, format, isBefore } from "date-fns";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Extended InventoryItem type to include the expiryDate property returned by the service
interface ExtendedInventoryItem extends InventoryItem {
  expiryDate?: string | null;
  reorderLevel?: number;
}

// Simple Badge component for this specific use case
interface BadgeProps {
  variant?: "default" | "destructive" | "warning";
  children: React.ReactNode;
  className?: string;
}

const ExpiryBadge = ({
  variant = "default",
  children,
  className,
}: BadgeProps) => {
  const variantClasses = {
    default: "badge-info badge-outline",
    destructive: "badge-error",
    warning: "badge-warning",
  };

  return (
    <span className={cn("badge text-xs", variantClasses[variant], className)}>
      {children}
    </span>
  );
};

// Cache for expiring items
interface Cache {
  items: ExtendedInventoryItem[];
  timestamp: number;
}

// Cache TTL in milliseconds (30 seconds)
const CACHE_TTL = 30 * 1000;
let expiringItemsCache: Cache | null = null;

export default function ExpiryAlerts({
  compact = false,
}: {
  compact?: boolean;
}) {
  const router = useRouter();
  const [items, setItems] = useState<ExtendedInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const fetchExpiringItems = async () => {
    try {
      // Check if we have valid cached data
      const now = Date.now();
      if (
        expiringItemsCache &&
        now - expiringItemsCache.timestamp < CACHE_TTL
      ) {
        console.log("Using cached expiring items data");
        setItems(expiringItemsCache.items);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      const expiringItems =
        (await inventoryService.getSoonToExpireItems()) as ExtendedInventoryItem[];

      // Only update state if component is still mounted
      if (isMounted.current) {
        setItems(expiringItems);
        setIsLoading(false);

        // Update cache
        expiringItemsCache = {
          items: expiringItems,
          timestamp: Date.now(),
        };
      }
    } catch (err) {
      console.error("Error fetching expiring items:", err);
      // Only update state if component is still mounted
      if (isMounted.current) {
        setError("Failed to load expiry data");
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    // Set isMounted to true when component mounts
    isMounted.current = true;

    fetchExpiringItems();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleViewInventory = () => {
    router.push("/inventory");
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
    if (compact) {
      return (
        <div className="p-2">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Expiry Alerts</h2>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (compact) {
      return (
        <div className="p-2 text-center text-error">
          <p className="text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-1"
            onClick={fetchExpiringItems}
          >
            Retry
          </Button>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body">
          <h2 className="card-title text-lg">Expiry Alerts</h2>
          <div className="alert alert-error">
            <p>{error}</p>
            <div className="card-actions justify-end mt-2">
              <Button variant="outline" size="sm" onClick={fetchExpiringItems}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    if (compact) {
      return (
        <div className="p-2 text-center">
          <div className="avatar placeholder">
            <div className="bg-success/20 text-success rounded-full w-8 h-8">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="text-xs text-base-content/60">
            No items are expiring soon.
          </p>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body items-center text-center">
          <div className="avatar placeholder">
            <div className="bg-success/20 text-success rounded-full w-12 h-12">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
          <h3 className="text-base font-medium mb-1">All Good!</h3>
          <p className="text-sm text-base-content/60 mb-4">
            No items are expiring soon.
          </p>
          <div className="card-actions">
            <Button variant="outline" size="sm" onClick={handleViewInventory}>
              View Inventory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Compact layout for dashboard
  if (compact) {
    return (
      <div className="p-2">
        <div className="space-y-2">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-base-100 rounded-md border border-base-200"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <ExpiryBadge variant={getExpiryStatus(item.expiryDate)}>
                {item.expiryDate
                  ? format(new Date(item.expiryDate), "MMM d")
                  : "No date"}
              </ExpiryBadge>
            </div>
          ))}
          {items.length > 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-primary"
              onClick={handleViewInventory}
            >
              View All ({items.length})
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-lg">Expiry Alerts</h2>
          <ExpiryBadge className="font-normal">
            {items.length} {items.length === 1 ? "item" : "items"}
          </ExpiryBadge>
        </div>

        <div className="space-y-3">
          {items.map((item) => {
            const expiryStatus = getExpiryStatus(item.expiryDate);
            const expiryDate = item.expiryDate
              ? new Date(item.expiryDate)
              : null;
            const daysUntilExpiry = expiryDate
              ? differenceInDays(expiryDate, new Date())
              : null;

            return (
              <div
                key={item.id}
                className="p-3 border border-base-200 rounded-lg flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center">
                    {expiryStatus === "destructive" ? (
                      <AlertTriangle className="h-4 w-4 text-error mr-2" />
                    ) : (
                      <Clock className="h-4 w-4 text-warning mr-2" />
                    )}
                    <h3 className="font-medium text-base">{item.name}</h3>
                  </div>
                  <p className="text-xs text-base-content/60 mt-1">
                    {item.category && `Category: ${item.category}`}
                    {item.quantity !== undefined && `, Qty: ${item.quantity}`}
                  </p>
                </div>

                <div className="text-right">
                  <ExpiryBadge variant={expiryStatus}>
                    {!expiryDate
                      ? "No date"
                      : daysUntilExpiry && daysUntilExpiry < 0
                      ? `Expired ${Math.abs(daysUntilExpiry)} days ago`
                      : daysUntilExpiry === 0
                      ? "Expires today"
                      : `Expires in ${daysUntilExpiry} days`}
                  </ExpiryBadge>
                  <p className="text-xs text-base-content/60 mt-1">
                    {expiryDate && format(expiryDate, "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card-actions justify-end mt-4">
          <Button onClick={handleViewInventory}>View All Inventory</Button>
        </div>
      </div>
    </div>
  );
}
