"use client";

import {
  Plus,
  RefreshCw,
  ShoppingBag,
  ArrowRight,
  Check,
  Info,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/components/ui/accessibility-helpers";
import { useState, useEffect } from "react";
import { announceToScreen } from "@/components/ui/accessibility-helpers";
import { ScreenReaderOnly } from "@/components/ui/accessibility-helpers";
import { KeyboardShortcut } from "@/components/ui/accessibility-helpers";

interface EmptyShoppingListProps {
  onAddClick: () => void;
  onRefreshClick: () => void;
}

export default function EmptyShoppingList({
  onAddClick,
  onRefreshClick,
}: EmptyShoppingListProps) {
  const prefersReducedMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);

  // Announce to screen readers when component mounts
  useEffect(() => {
    setIsVisible(true);
    announceToScreen(
      "Your shopping list is empty. You can add items manually or generate a list from inventory."
    );

    return () => {
      setIsVisible(false);
    };
  }, []);

  // Define animation variants with reduced motion support
  const containerVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
      };

  const itemVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      }
    : {
        initial: { y: 10, opacity: 0 },
        animate: { y: 0, opacity: 1 },
      };

  const pulseVariants = prefersReducedMotion
    ? { animate: {} }
    : {
        animate: {
          scale: [1, 1.1, 1],
          opacity: [0.7, 1, 0.7],
        },
      };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={containerVariants}
          transition={{ duration: 0.5 }}
          className="card bg-base-100 shadow-sm"
          role="region"
          aria-label="Empty shopping list"
        >
          <ScreenReaderOnly>
            Your shopping list is empty. You can add items or generate a list
            from inventory.
          </ScreenReaderOnly>

          <div className="items-center text-center py-12 md:py-16 px-6">
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="mb-2">
                <div className="bg-primary/10 text-primary rounded-full w-24 h-24 flex items-center justify-center mx-auto">
                  <ShoppingBag className="h-12 w-12" aria-hidden="true" />
                </div>
              </div>
              <motion.div
                variants={pulseVariants}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut",
                }}
                className="absolute -bottom-4 -right-4 bg-base-100 shadow-md p-2 rounded-full"
                aria-hidden="true"
              >
                <Plus className="h-5 w-5 text-primary" />
              </motion.div>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-2xl font-bold mb-3 text-base-content"
              tabIndex={0}
            >
              Your Shopping List is Empty
            </motion.h2>

            <motion.p
              variants={itemVariants}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base-content/70 max-w-md mx-auto mb-8 leading-relaxed"
            >
              Start by adding items you need to purchase. Your shopping list
              helps you track inventory needs and streamline the purchasing
              process.
            </motion.p>

            {/* Getting Started Guide */}
            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="max-w-md mx-auto mb-8 bg-info/10 rounded-lg p-4 text-left"
            >
              <h3 className="font-medium text-info mb-2 flex items-center gap-2">
                <Info className="h-4 w-4" aria-hidden="true" />
                Getting Started
              </h3>
              <ul
                className="space-y-3 mt-2 text-sm text-info-content"
                aria-label="Getting started steps"
              >
                <li className="flex items-start gap-2">
                  <div className="min-w-5 mt-0.5">
                    <Check
                      className="h-4 w-4 text-success"
                      aria-hidden="true"
                    />
                  </div>
                  <p>
                    <span className="font-medium">Add items manually</span> for
                    one-off purchases or special requirements
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="min-w-5 mt-0.5">
                    <Check
                      className="h-4 w-4 text-success"
                      aria-hidden="true"
                    />
                  </div>
                  <p>
                    <span className="font-medium">Generate from inventory</span>{" "}
                    to create a list based on low stock items
                  </p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="min-w-5 mt-0.5">
                    <Check
                      className="h-4 w-4 text-success"
                      aria-hidden="true"
                    />
                  </div>
                  <p>
                    <span className="font-medium">Mark items as purchased</span>{" "}
                    as you shop to track your progress
                  </p>
                </li>
              </ul>
            </motion.div>

            <div className="flex justify-center flex-wrap gap-4">
              <motion.button
                variants={itemVariants}
                transition={{ delay: 0.5, duration: 0.5 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                onClick={() => {
                  onAddClick();
                  announceToScreen("Opening add item dialog");
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Item
              </motion.button>

              <motion.button
                variants={itemVariants}
                transition={{ delay: 0.55, duration: 0.5 }}
                whileHover={prefersReducedMotion ? {} : { scale: 1.05 }}
                whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                onClick={() => {
                  onRefreshClick();
                  announceToScreen("Generating shopping list from inventory");
                }}
                className="btn btn-outline"
              >
                <RefreshCw className="h-4 w-4 mr-1" aria-hidden="true" />
                Generate from Inventory
              </motion.button>
            </div>

            <motion.div
              variants={itemVariants}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-10 text-xs text-base-content/60 flex items-center justify-center"
            >
              <Clock className="h-3 w-3 mr-1" aria-hidden="true" />
              <span>
                Tip: Use keyboard shortcuts
                <KeyboardShortcut keys={["A"]} className="mx-1" />
                to add items quickly
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
