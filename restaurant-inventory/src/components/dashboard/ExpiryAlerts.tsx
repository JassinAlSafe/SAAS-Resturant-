"use client";

import { useState, useEffect } from "react";
import { FiAlertTriangle, FiInfo, FiX, FiRefreshCw } from "react-icons/fi";
import {
  differenceInDays,
  format,
  isAfter,
  isBefore,
  parseISO,
} from "date-fns";
import Card from "@/components/Card";
import { Button } from "@/components/ui/button";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/services/inventory-service";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

// Simple Badge component for this specific use case
interface BadgeProps {
  variant?: "default" | "destructive" | "warning";
  children: React.ReactNode;
}

const Badge = ({ variant = "default", children }: BadgeProps) => {
  const variantClasses = {
    default: "bg-primary text-primary-foreground",
    destructive: "bg-red-100 text-red-800",
    warning: "bg-yellow-100 text-yellow-800",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantClasses[variant]
      )}
    >
      {children}
    </span>
  );
};

export default function ExpiryAlerts() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const allItems = await inventoryService.getItems();
      // Filter items that have expiry date
      const itemsWithExpiry = allItems.filter((item) => item.expiryDate);
      setItems(itemsWithExpiry);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's date
  const today = new Date();

  // Expired items
  const expiredItems = items.filter(
    (item) => item.expiryDate && isBefore(parseISO(item.expiryDate), today)
  );

  // Items expiring soon (within 7 days)
  const expiringItems = items.filter((item) => {
    if (!item.expiryDate) return false;
    const expiryDate = parseISO(item.expiryDate);
    return (
      isAfter(expiryDate, today) && differenceInDays(expiryDate, today) <= 7
    );
  });

  // Sort by expiry date, closest first
  const sortedExpiringItems = [...expiringItems].sort((a, b) => {
    if (!a.expiryDate || !b.expiryDate) return 0;
    return parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime();
  });

  const handleItemClick = (item: InventoryItem) => {
    router.push(`/inventory?id=${item.id}`);
  };

  // Get severity class based on expiry date
  const getSeverityClass = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return "";

    const days = differenceInDays(parseISO(expiryDate), today);

    if (days < 0) return "bg-red-100 border-red-400 text-red-800"; // Expired
    if (days <= 3) return "bg-amber-100 border-amber-400 text-amber-800"; // Critical (0-3 days)
    if (days <= 7) return "bg-yellow-100 border-yellow-400 text-yellow-800"; // Warning (4-7 days)
    return "";
  };

  // Get status badge for an item
  const getStatusBadge = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return null;

    const days = differenceInDays(parseISO(expiryDate), today);

    if (days < 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (days <= 3) {
      return <Badge variant="destructive">Critical</Badge>;
    }
    if (days <= 7) {
      return <Badge variant="warning">Warning</Badge>;
    }
    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (expiredItems.length === 0 && expiringItems.length === 0) {
    return (
      <Card>
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-medium">Expiry Date Alerts</h3>
          <Button size="sm" variant="ghost" onClick={fetchItems}>
            <FiRefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 text-center text-gray-500">
          <FiInfo className="h-10 w-10 mx-auto mb-3 text-gray-400" />
          <p>No items are expired or expiring soon.</p>
          <p className="text-sm mt-1">
            All your inventory items appear to be fresh!
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-medium">Expiry Date Alerts</h3>
        <Button size="sm" variant="ghost" onClick={fetchItems}>
          <FiRefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {expiredItems.length > 0 && (
        <div className="p-4 border-b border-gray-100 bg-red-50">
          <h4 className="text-sm font-medium mb-3 flex items-center text-red-800">
            <FiAlertTriangle className="h-4 w-4 mr-1" />
            Expired Items ({expiredItems.length})
          </h4>

          <div className="space-y-2">
            {expiredItems.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-2 border rounded-md flex items-center justify-between cursor-pointer hover:bg-red-50 ${getSeverityClass(
                  item.expiryDate
                )}`}
                onClick={() => handleItemClick(item)}
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs">
                    Expired on{" "}
                    {item.expiryDate
                      ? format(parseISO(item.expiryDate), "MMM d, yyyy")
                      : "Unknown"}
                  </div>
                </div>
                <div className="flex items-center">
                  {getStatusBadge(item.expiryDate)}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 w-6 p-0"
                  >
                    <FiX className="h-4 w-4" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedExpiringItems.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center text-amber-800">
            <FiInfo className="h-4 w-4 mr-1" />
            Expiring Soon ({sortedExpiringItems.length})
          </h4>

          <div className="space-y-2">
            {sortedExpiringItems.map((item) => {
              const daysLeft = item.expiryDate
                ? differenceInDays(parseISO(item.expiryDate), today)
                : 0;

              return (
                <div
                  key={item.id}
                  className={`px-3 py-2 border rounded-md flex items-center justify-between cursor-pointer hover:bg-yellow-50 ${getSeverityClass(
                    item.expiryDate
                  )}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs">
                      Expires in {daysLeft} days (
                      {item.expiryDate
                        ? format(parseISO(item.expiryDate), "MMM d, yyyy")
                        : "Unknown"}
                      )
                    </div>
                  </div>
                  <div className="flex items-center">
                    {getStatusBadge(item.expiryDate)}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <FiX className="h-4 w-4" />
                      <span className="sr-only">Dismiss</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
