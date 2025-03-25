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
        <h1 className="text-3xl font-bold text-gray-800 flex items-center">
          Inventory Management
          <div className="ml-3 px-2 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-medium rounded-md">
            Dashboard
          </div>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Track, manage, and optimize your restaurant inventory in real-time
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
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm flex items-center text-green-700 shadow-sm">
          <FiCheck className="mr-2 h-4 w-4 text-green-500" />
          <span className="font-medium">
            Real-time updates active. <span className="font-normal">Inventory changes will appear automatically.</span>
          </span>
        </div>
      )}
    </div>
  );
}
