"use client";

import { ShoppingListItem } from "@/lib/types";
import { useCurrency } from "@/lib/currency";
import { AlertTriangle, BellRing, BarChart3, Wallet } from "lucide-react";
import WizardStats from "./WizardStats";

interface StepContentProps {
  currentStep: string;
  shoppingList: ShoppingListItem[];
  onAddItem: () => void;
  onGenerateList: () => Promise<void>;
  isGenerating: boolean;
  isPending: boolean;
  totalEstimatedCost: number;
  handleNextStep: () => void;
  handlePrevStep: () => void;
}

export default function StepContent({
  currentStep,
  shoppingList,
  onAddItem,
  onGenerateList,
  isGenerating,
  isPending,
  totalEstimatedCost,
  handleNextStep,
  handlePrevStep,
}: StepContentProps) {
  const { formatCurrency } = useCurrency();

  // Calculate stats
  const pendingItems = shoppingList.filter((item) => !item.isPurchased);
  const purchasedItems = shoppingList.filter((item) => item.isPurchased);

  switch (currentStep) {
    case "plan":
      return (
        <div className="space-y-4">
          <div className="alert alert-info">
            <div>
              <p className="font-medium">Planning Phase</p>
              <p className="text-sm">
                Add items to your shopping list before your trip
              </p>
            </div>
          </div>

          {shoppingList.length > 0 && (
            <WizardStats
              shoppingList={shoppingList}
              totalEstimatedCost={totalEstimatedCost}
              currentStep={currentStep}
            />
          )}

          <div className="flex flex-col gap-3">
            <button className="btn btn-primary w-full" onClick={onAddItem}>
              Add Item Manually
            </button>

            <button
              className={`btn btn-outline w-full ${
                isGenerating ? "loading" : ""
              }`}
              onClick={onGenerateList}
              disabled={isGenerating || isPending}
            >
              Generate from Inventory
            </button>
          </div>
        </div>
      );

    case "shop":
      return (
        <div className="space-y-4">
          <div className="alert alert-warning">
            <div>
              <p className="font-medium">Shopping Phase</p>
              <p className="text-sm">Check off items as you shop</p>
            </div>
          </div>

          <WizardStats
            shoppingList={shoppingList}
            totalEstimatedCost={totalEstimatedCost}
            currentStep={currentStep}
          />

          <div className="flex justify-between items-center">
            <p className="text-sm">
              <span className="font-medium">{pendingItems.length}</span> items
              remaining
            </p>

            <div className="flex gap-2">
              <button className="btn btn-sm btn-ghost" onClick={handlePrevStep}>
                Back
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={handleNextStep}
                disabled={pendingItems.length > 0}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      );

    case "complete":
      return (
        <div className="space-y-4">
          <div className="alert alert-success">
            <div>
              <p className="font-medium">Trip Complete!</p>
              <p className="text-sm">Review your shopping trip results</p>
            </div>
          </div>

          <WizardStats
            shoppingList={shoppingList}
            totalEstimatedCost={totalEstimatedCost}
            currentStep={currentStep}
          />

          <div className="flex justify-end mt-4">
            <button className="btn btn-sm btn-ghost" onClick={handlePrevStep}>
              Back to Shopping
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
