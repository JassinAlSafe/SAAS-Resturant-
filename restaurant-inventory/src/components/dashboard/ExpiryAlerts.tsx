"use client";

import { useState, useEffect, useRef } from "react";
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
      if (expiringItemsCache && now - expiringItemsCache.timestamp < CACHE_TTL) {
        console.log('Using cached expiring items data');
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
          timestamp: Date.now()
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
    if (compact) {
      return (
        <div className="p-2 text-center text-red-600">
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
    if (compact) {
      return (
        <div className="p-2 text-center">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-green-100 mb-1">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-xs text-muted-foreground">
            No items are expiring soon.
          </p>
        </div>
      );
    }

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

  // Compact layout for dashboard
  if (compact) {
    return (
      <div className="p-2">
        <div className="space-y-2">
          {items.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-white rounded-md border"
            >
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium truncate max-w-[120px]">
                  {item.name}
                </span>
              </div>
              <ExpiryBadge
                variant={getExpiryStatus(item.expiryDate)}
              >
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
              className="w-full text-xs"
              onClick={handleViewInventory}
            >
              View all ({items.length})
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Full layout
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Expiry Alerts</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
          >
            <div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="font-medium">{item.name}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {item.quantity} {item.unit} remaining
              </p>
            </div>
            <div className="text-right">
              <ExpiryBadge
                variant={getExpiryStatus(item.expiryDate)}
              >
                <Clock className="h-3 w-3 mr-1 inline" />
                {item.expiryDate
                  ? format(new Date(item.expiryDate), "MMM d, yyyy")
                  : "No expiry date"}
              </ExpiryBadge>
              <p className="text-xs text-gray-500 mt-1">
                {item.expiryDate
                  ? differenceInDays(
                      new Date(item.expiryDate),
                      new Date()
                    ) <= 0
                    ? "Expired"
                    : `Expires in ${differenceInDays(
                        new Date(item.expiryDate),
                        new Date()
                      )} days`
                  : ""}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <Button variant="outline" size="sm" onClick={handleViewInventory}>
          View All Inventory
        </Button>
      </div>
    </div>
  );
}
