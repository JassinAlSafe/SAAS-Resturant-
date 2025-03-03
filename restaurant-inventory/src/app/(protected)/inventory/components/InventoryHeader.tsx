"use client";

import { FiCheck } from "react-icons/fi";
import { ApiError } from "@/components/ui/api-error";

interface InventoryHeaderProps {
  categoriesError?: string;
  retryCategories?: () => void;
  subscriptionError?: string;
  retrySubscription?: () => void;
  isSubscribed?: boolean;
}

export default function InventoryHeader({
  categoriesError,
  retryCategories,
  subscriptionError,
  retrySubscription,
  isSubscribed,
}: InventoryHeaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Inventory Management
        </h1>
        <p className="text-sm text-muted-foreground">
          Track and manage your restaurant inventory
        </p>
      </div>

      {categoriesError && retryCategories && (
        <ApiError
          title="Categories Error"
          message={categoriesError}
          onRetry={retryCategories}
        />
      )}

      {subscriptionError && retrySubscription && (
        <ApiError
          title="Real-time Updates Error"
          message={subscriptionError}
          onRetry={retrySubscription}
        />
      )}

      {isSubscribed && (
        <div className="bg-green-50 border border-green-200 rounded-md px-4 py-2 text-sm flex items-center text-green-700">
          <FiCheck className="mr-2" />
          <span>
            Real-time updates active. Inventory changes will appear
            automatically.
          </span>
        </div>
      )}
    </div>
  );
}
