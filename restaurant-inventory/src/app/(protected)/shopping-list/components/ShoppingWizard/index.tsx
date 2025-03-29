"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { ShoppingWizardProps } from "./types";
import WizardSteps from "./WizardSteps";
import StepContent from "./StepContent";

export default function ShoppingWizard({
  shoppingList = [],
  onAddItem,
  onGenerateList,
  isGenerating,
  totalEstimatedCost,
  isPending,
}: ShoppingWizardProps) {
  const [currentStep, setCurrentStep] = useState("plan");

  // Determine current shopping phase based on data
  const pendingItems = shoppingList?.filter((item) => !item.isPurchased) || [];
  const purchasedItems = shoppingList?.filter((item) => item.isPurchased) || [];

  // Calculate completion percentage
  const completionPercentage =
    shoppingList && shoppingList.length > 0
      ? Math.round((purchasedItems.length / shoppingList.length) * 100)
      : 0;

  // Auto-select the appropriate step based on data
  const determineActiveStep = useCallback(() => {
    if (!shoppingList || shoppingList.length === 0) return "plan";
    if (pendingItems.length === 0) return "complete";
    if (purchasedItems.length > 0) return "shop";
    return "plan";
  }, [shoppingList, pendingItems.length, purchasedItems.length]);

  // Update current step when data changes
  useEffect(() => {
    const recommendedStep = determineActiveStep();
    if (shoppingList?.length > 0 && currentStep !== recommendedStep) {
      // Uncomment to auto-navigate to the recommended step
      // setCurrentStep(recommendedStep);
    }
  }, [shoppingList, currentStep, determineActiveStep]);

  const handleNextStep = () => {
    if (currentStep === "plan") setCurrentStep("shop");
    else if (currentStep === "shop") setCurrentStep("complete");
  };

  const handlePrevStep = () => {
    if (currentStep === "complete") setCurrentStep("shop");
    else if (currentStep === "shop") setCurrentStep("plan");
  };

  return (
    <div className="card bg-base-100 shadow-lg">
      <div className="card-body p-5">
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-xl flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <span>Shopping Wizard</span>
          </h2>
          <div className="badge badge-primary badge-lg gap-2 p-3">
            <span className="font-semibold">{completionPercentage}%</span>
            <span>Complete</span>
          </div>
        </div>

        <p className="text-sm text-base-content/70 mb-4">
          Follow these steps to manage your shopping trip efficiently
        </p>

        {/* Wizard Steps */}
        <WizardSteps
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />

        {/* Step Content */}
        <StepContent
          currentStep={currentStep}
          shoppingList={shoppingList}
          onAddItem={onAddItem}
          onGenerateList={onGenerateList}
          isGenerating={isGenerating}
          isPending={isPending}
          totalEstimatedCost={totalEstimatedCost}
          handleNextStep={handleNextStep}
          handlePrevStep={handlePrevStep}
        />
      </div>
    </div>
  );
}
