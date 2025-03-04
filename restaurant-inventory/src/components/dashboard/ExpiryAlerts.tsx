"use client";

import { useState, useEffect } from "react";
import {
  FiAlertTriangle,
  FiInfo,
  FiX,
  FiRefreshCw,
  FiClock,
  FiChevronRight,
} from "react-icons/fi";
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
    default: "bg-primary/10 text-primary",
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

    if (days < 0) return "bg-red-50 border-red-200"; // Expired
    if (days <= 3) return "bg-amber-50 border-amber-200"; // Critical (0-3 days)
    if (days <= 7) return "bg-yellow-50 border-yellow-200"; // Warning (4-7 days)
    return "";
  };

  // Get text color class based on expiry date
  const getSeverityTextClass = (expiryDate: string | null | undefined) => {
    if (!expiryDate) return "";

    const days = differenceInDays(parseISO(expiryDate), today);

    if (days < 0) return "text-red-800"; // Expired
    if (days <= 3) return "text-amber-800"; // Critical (0-3 days)
    if (days <= 7) return "text-yellow-800"; // Warning (4-7 days)
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
      <div className="p-4">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-3">
              <div className="flex items-center">
                <Skeleton className="h-10 w-10 rounded-full mr-3" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (expiredItems.length === 0 && expiringItems.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center mx-auto mb-4">
          <FiInfo className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg font-medium mb-2">All Items Fresh</h3>
        <p className="text-sm text-muted-foreground mb-4">
          No items are expired or expiring soon.
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={fetchItems}
          className="mx-auto flex items-center gap-2"
        >
          <FiRefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/70">
      {expiredItems.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center text-red-800">
            <FiAlertTriangle className="h-4 w-4 mr-1.5" />
            Expired Items ({expiredItems.length})
          </h4>

          <div className="space-y-2.5">
            {expiredItems.map((item) => (
              <div
                key={item.id}
                className={`px-3 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${getSeverityClass(
                  item.expiryDate
                )} hover:shadow-sm`}
                onClick={() => handleItemClick(item)}
              >
                <div>
                  <div
                    className={`font-medium mb-0.5 ${getSeverityTextClass(
                      item.expiryDate
                    )}`}
                  >
                    {item.name}
                  </div>
                  <div className="text-xs flex items-center text-muted-foreground">
                    <FiClock className="mr-1 h-3 w-3" />
                    Expired{" "}
                    {item.expiryDate
                      ? format(parseISO(item.expiryDate), "MMM d, yyyy")
                      : "Unknown"}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {getStatusBadge(item.expiryDate)}
                  <FiChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedExpiringItems.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center text-amber-800">
            <FiInfo className="h-4 w-4 mr-1.5" />
            Expiring Soon ({sortedExpiringItems.length})
          </h4>

          <div className="space-y-2.5">
            {sortedExpiringItems.map((item) => {
              const daysLeft = item.expiryDate
                ? differenceInDays(parseISO(item.expiryDate), today)
                : 0;

              return (
                <div
                  key={item.id}
                  className={`px-3 py-2.5 border rounded-lg flex items-center justify-between cursor-pointer transition-all ${getSeverityClass(
                    item.expiryDate
                  )} hover:shadow-sm`}
                  onClick={() => handleItemClick(item)}
                >
                  <div>
                    <div
                      className={`font-medium mb-0.5 ${getSeverityTextClass(
                        item.expiryDate
                      )}`}
                    >
                      {item.name}
                    </div>
                    <div className="text-xs flex items-center text-muted-foreground">
                      <FiClock className="mr-1 h-3 w-3" />
                      {daysLeft === 1 ? "Tomorrow" : `${daysLeft} days left`} (
                      {item.expiryDate
                        ? format(parseISO(item.expiryDate), "MMM d, yyyy")
                        : "Unknown"}
                      )
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getStatusBadge(item.expiryDate)}
                    <FiChevronRight className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="p-3 bg-muted/30">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground"
          onClick={() => router.push("/inventory?filter=expiring")}
        >
          View All Expiry Dates
          <FiChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
