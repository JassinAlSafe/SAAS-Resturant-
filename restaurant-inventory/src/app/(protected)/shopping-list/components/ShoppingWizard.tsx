"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingListItem } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  ShoppingCart,
  FilePlus,
  Filter,
  Share2,
  AlertTriangle,
  BellRing,
  CircleCheck,
  Package,
  BarChart3,
  MoreHorizontal,
  Wallet,
} from "lucide-react";
import { useCurrency } from "@/lib/currency";

interface ShoppingWizardProps {
  shoppingList: ShoppingListItem[];
  categories: string[];
  onAddItem: () => void;
  onGenerateList: () => Promise<void>;
  onMarkAllPurchased: () => Promise<void>;
  isGenerating: boolean;
  totalEstimatedCost: number;
  isPending: boolean;
}

const steps = [
  {
    id: "plan",
    title: "Plan Your List",
    icon: ClipboardList,
    description: "Create your shopping list before going to the store",
  },
  {
    id: "shop",
    title: "Shopping Time",
    icon: ShoppingCart,
    description: "Check off items as you shop",
  },
  {
    id: "complete",
    title: "Review & Complete",
    icon: CheckCircle,
    description: "Finalize your shopping trip",
  },
];

export default function ShoppingWizard({
  shoppingList,
  categories,
  onAddItem,
  onGenerateList,
  onMarkAllPurchased,
  isGenerating,
  totalEstimatedCost,
  isPending,
}: ShoppingWizardProps) {
  const [currentStep, setCurrentStep] = useState("plan");
  const { formatCurrency } = useCurrency();

  // Determine current shopping phase based on data
  const pendingItems = shoppingList.filter((item) => !item.isPurchased);
  const purchasedItems = shoppingList.filter((item) => item.isPurchased);

  // Auto-select the appropriate step based on data
  const determineActiveStep = () => {
    if (shoppingList.length === 0) return "plan";
    if (pendingItems.length === 0) return "complete";
    if (purchasedItems.length > 0) return "shop";
    return "plan";
  };

  // Update current step when data changes
  useEffect(() => {
    const recommendedStep = determineActiveStep();
    if (shoppingList.length > 0 && currentStep !== recommendedStep) {
      // Uncomment to auto-navigate to the recommended step
      // setCurrentStep(recommendedStep);
    }
  }, [shoppingList.length, pendingItems.length, purchasedItems.length]);

  // Compute list statistics
  const urgentCount = shoppingList.filter((item) => item.isUrgent).length;
  const completionPercentage =
    shoppingList.length > 0
      ? Math.round((purchasedItems.length / shoppingList.length) * 100)
      : 0;

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
        <div className="w-full py-2 mb-4">
          <div className="flex items-center justify-between relative">
            {steps.map((step, index) => {
              const isCompleted =
                (step.id === "plan" &&
                  ["shop", "complete"].includes(currentStep)) ||
                (step.id === "shop" && currentStep === "complete");
              const isCurrent = currentStep === step.id;

              return (
                <div
                  key={step.id}
                  className="flex flex-col items-center z-10 w-1/3"
                >
                  <div
                    className={`
                      tooltip tooltip-bottom w-full flex justify-center
                    `}
                    data-tip={step.description}
                  >
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className={`
                        btn btn-circle ${
                          isCompleted
                            ? "btn-primary btn-outline border-2"
                            : isCurrent
                            ? "btn-primary"
                            : "btn-ghost border border-base-300"
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CircleCheck className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <span
                    className={`
                    mt-2 text-sm font-medium ${
                      isCurrent
                        ? "text-primary"
                        : isCompleted
                        ? "text-primary/80"
                        : "text-base-content/60"
                    }
                  `}
                  >
                    {step.title}
                  </span>
                </div>
              );
            })}

            {/* Progress line */}
            <div className="absolute top-6 left-0 w-full h-[2px] bg-base-300 -z-0">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width:
                    currentStep === "plan"
                      ? "0%"
                      : currentStep === "shop"
                      ? "50%"
                      : "100%",
                }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="min-h-[280px]"
          >
            {currentStep === "plan" && (
              <div className="space-y-5">
                <div className="alert alert-info shadow-sm flex items-center gap-2">
                  <div>
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Planning Phase</h3>
                    <div className="text-xs">
                      Create your shopping list before going to the store
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card bg-base-200 hover:bg-base-300 transition-colors shadow-sm">
                    <div className="card-body">
                      <h3 className="font-semibold flex items-center gap-2 text-base">
                        <FilePlus className="h-5 w-5 text-primary" />
                        <span>Start Fresh</span>
                      </h3>
                      <p className="text-sm mb-3 text-base-content/70">
                        Add items to your shopping list manually
                      </p>
                      <div className="card-actions justify-center">
                        <button
                          onClick={onAddItem}
                          className="btn btn-primary w-full"
                        >
                          Add Items
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card bg-base-200 hover:bg-base-300 transition-colors shadow-sm">
                    <div className="card-body">
                      <h3 className="font-semibold flex items-center gap-2 text-base">
                        <Filter className="h-5 w-5 text-secondary" />
                        <span>Auto-Generate</span>
                      </h3>
                      <p className="text-sm mb-3 text-base-content/70">
                        Generate a list based on your inventory levels
                      </p>
                      <div className="card-actions justify-center">
                        <button
                          onClick={onGenerateList}
                          disabled={isGenerating}
                          className="btn btn-secondary w-full"
                        >
                          {isGenerating ? (
                            <>
                              <span className="loading loading-spinner loading-xs"></span>
                              <span>Generating...</span>
                            </>
                          ) : (
                            "Generate List"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="divider my-2"></div>

                <div className="stats stats-vertical md:stats-horizontal shadow bg-base-200 w-full">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <Package className="h-8 w-8" />
                    </div>
                    <div className="stat-title">Current List</div>
                    <div className="stat-value text-primary">
                      {shoppingList.length}
                    </div>
                    <div className="stat-desc">
                      {urgentCount > 0 && (
                        <div className="flex items-center mt-1">
                          <BellRing className="h-3.5 w-3.5 text-error mr-1" />
                          <span className="text-error font-medium">
                            {urgentCount} urgent
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-secondary">
                      <div className="dropdown dropdown-end">
                        <label
                          tabIndex={0}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          <BarChart3 className="h-5 w-5 text-secondary" />
                        </label>
                        {categories.length > 0 && (
                          <ul
                            tabIndex={0}
                            className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                          >
                            <li className="menu-title">Available Categories</li>
                            {categories.slice(0, 8).map((category) => (
                              <li key={category}>
                                <a className="flex justify-between">
                                  <span>{category}</span>
                                  <span className="text-base-content/60">
                                    {
                                      shoppingList.filter(
                                        (item) => item.category === category
                                      ).length
                                    }
                                  </span>
                                </a>
                              </li>
                            ))}
                            {categories.length > 8 && (
                              <li className="disabled">
                                <a>+ {categories.length - 8} more categories</a>
                              </li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>
                    <div className="stat-title">Estimated Cost</div>
                    <div className="stat-value text-secondary">
                      {formatCurrency(totalEstimatedCost)}
                    </div>
                    <div className="stat-desc">
                      For {shoppingList.length} items
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "shop" && (
              <div className="space-y-5">
                <div className="alert alert-warning shadow-sm flex items-center gap-2">
                  <div>
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Shopping Phase</h3>
                    <div className="text-xs">Check off items as you shop</div>
                  </div>
                </div>

                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body p-4">
                    <div className="flex justify-between mb-3">
                      <h3 className="font-medium flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-accent" />
                        Shopping Progress
                      </h3>
                      <span className="text-sm flex items-center gap-1">
                        <CircleCheck className="h-3.5 w-3.5 text-success" />
                        <span>{completionPercentage}% Complete</span>
                      </span>
                    </div>
                    <progress
                      className="progress progress-success w-full"
                      value={completionPercentage}
                      max="100"
                    ></progress>

                    <div className="flex justify-between text-xs mt-2">
                      <span className="badge badge-sm badge-success">
                        {purchasedItems.length} purchased
                      </span>
                      <span className="badge badge-sm badge-outline">
                        {pendingItems.length} remaining
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-lg shadow-sm">
                  <table className="table table-zebra table-sm border-separate border-spacing-0 w-full bg-base-100">
                    <thead className="bg-base-200">
                      <tr>
                        <th>Status</th>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Category</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingItems.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center h-20">
                            <div className="flex flex-col items-center justify-center">
                              <CheckCircle className="h-6 w-6 text-success mb-2" />
                              <span className="text-success">
                                All items purchased!
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        <>
                          {pendingItems.slice(0, 5).map((item) => (
                            <tr
                              key={item.id}
                              className={item.isUrgent ? "text-error" : ""}
                            >
                              <td>
                                <div
                                  className={`badge badge-sm ${
                                    item.isUrgent
                                      ? "badge-error"
                                      : "badge-outline"
                                  }`}
                                >
                                  {item.isUrgent ? "Urgent" : "Pending"}
                                </div>
                              </td>
                              <td className="font-medium">{item.name}</td>
                              <td className="whitespace-nowrap">
                                {item.quantity} {item.unit}
                              </td>
                              <td>{item.category}</td>
                            </tr>
                          ))}

                          {pendingItems.length > 5 && (
                            <tr>
                              <td
                                colSpan={4}
                                className="text-center text-sm opacity-70"
                              >
                                And {pendingItems.length - 5} more items...
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="alert alert-info shadow-sm">
                  <div className="flex gap-2 items-center">
                    <Share2 className="h-5 w-5" />
                    <span>
                      Tip: Use the main list page to mark items as purchased
                      while shopping
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentStep === "complete" && (
              <div className="space-y-5">
                <div className="alert alert-success shadow-sm flex items-center gap-2">
                  <div>
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">Review & Complete</h3>
                    <div className="text-xs">Finalize your shopping trip</div>
                  </div>
                </div>

                <div className="stats shadow w-full bg-base-200">
                  <div className="stat">
                    <div className="stat-figure text-primary">
                      <Package className="h-8 w-8" />
                    </div>
                    <div className="stat-title">Total Items</div>
                    <div className="stat-value text-primary">
                      {shoppingList.length}
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-success">
                      <CircleCheck className="h-8 w-8" />
                    </div>
                    <div className="stat-title">Purchased</div>
                    <div className="stat-value text-success">
                      {purchasedItems.length}
                    </div>
                    <div className="stat-desc">
                      {completionPercentage}% Complete
                    </div>
                  </div>

                  <div className="stat">
                    <div className="stat-figure text-warning">
                      <AlertTriangle className="h-8 w-8" />
                    </div>
                    <div className="stat-title">Remaining</div>
                    <div className="stat-value text-warning">
                      {pendingItems.length}
                    </div>
                  </div>
                </div>

                {pendingItems.length > 0 ? (
                  <div className="alert alert-warning shadow-sm">
                    <div className="flex w-full justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">
                          You still have {pendingItems.length} items to purchase
                        </span>
                      </div>
                      <button
                        onClick={onMarkAllPurchased}
                        disabled={isPending}
                        className="btn btn-sm btn-warning"
                      >
                        {isPending ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          "Mark All as Purchased"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card bg-success text-success-content shadow-sm">
                    <div className="card-body items-center text-center py-8">
                      <CheckCircle className="h-16 w-16 mb-2" />
                      <h3 className="card-title text-2xl mb-2">
                        Shopping Complete!
                      </h3>
                      <p className="opacity-90 mb-4">
                        All items have been purchased successfully
                      </p>
                      <div className="card-actions">
                        <button
                          className="btn btn-outline border-success-content"
                          onClick={onAddItem}
                        >
                          Start a New List
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            className="btn btn-outline btn-sm gap-1"
            onClick={handlePrevStep}
            disabled={currentStep === "plan"}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </button>

          <div>
            {determineActiveStep() !== currentStep && (
              <div className="dropdown dropdown-top">
                <label tabIndex={0} className="btn btn-ghost btn-sm gap-1">
                  <MoreHorizontal className="h-4 w-4" />
                  Options
                </label>
                <ul
                  tabIndex={0}
                  className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
                >
                  <li>
                    <a onClick={() => setCurrentStep(determineActiveStep())}>
                      Go to Recommended Step
                    </a>
                  </li>
                  <li>
                    <a onClick={onAddItem}>Add New Item</a>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            className="btn btn-primary btn-sm gap-1"
            onClick={handleNextStep}
            disabled={currentStep === "complete"}
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
