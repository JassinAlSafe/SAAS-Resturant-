"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/components/ui/accessibility-helpers";
import { ScreenReaderOnly } from "@/components/ui/accessibility-helpers";

export default function ShoppingListLoading() {
  const prefersReducedMotion = useReducedMotion();

  // Define animation variants with reduced motion support
  const containerVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
      }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      };

  const pulseAnimation = prefersReducedMotion
    ? {}
    : {
        opacity: [0.4, 0.7, 0.4],
        transition: {
          repeat: Infinity,
          duration: 1.5,
          ease: "easeInOut",
        },
      };

  return (
    <div className="space-y-6">
      <ScreenReaderOnly>
        Loading your shopping list. Please wait.
      </ScreenReaderOnly>

      {/* Shimmer effect for stats cards */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        aria-hidden="true"
      >
        {[1, 2, 3].map((item) => (
          <motion.div
            key={item}
            animate={pulseAnimation}
            className="skeleton h-24 rounded-lg"
          />
        ))}
      </motion.div>

      {/* Shimmer effect for filter controls */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-4"
        aria-hidden="true"
      >
        <motion.div
          animate={pulseAnimation}
          className="skeleton h-10 w-40 rounded"
        />
        <motion.div
          animate={pulseAnimation}
          className="skeleton h-10 w-32 rounded"
        />
        <motion.div
          animate={pulseAnimation}
          className="skeleton h-10 w-36 rounded"
        />
      </motion.div>

      {/* Shimmer effect for table */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        transition={{ duration: 0.4, delay: 0.2 }}
        className="card overflow-hidden bg-base-100"
        aria-hidden="true"
      >
        {/* Table header */}
        <div className="bg-base-200 border-b border-base-300">
          <div className="grid grid-cols-10 gap-3 p-4">
            <motion.div
              animate={pulseAnimation}
              className="col-span-1 h-6 skeleton rounded"
            />
            <motion.div
              animate={pulseAnimation}
              className="col-span-4 h-6 skeleton rounded"
            />
            <motion.div
              animate={pulseAnimation}
              className="col-span-2 h-6 skeleton rounded"
            />
            <motion.div
              animate={pulseAnimation}
              className="col-span-1 h-6 skeleton rounded"
            />
            <motion.div
              animate={pulseAnimation}
              className="col-span-2 h-6 skeleton rounded"
            />
          </div>
        </div>

        {/* Table rows */}
        <div className="divide-y divide-base-200">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="p-4">
              <div className="grid grid-cols-10 gap-3">
                <motion.div
                  animate={pulseAnimation}
                  className="col-span-1 h-6 skeleton rounded"
                />
                <motion.div
                  animate={pulseAnimation}
                  className="col-span-4 h-6 skeleton rounded"
                />
                <motion.div
                  animate={pulseAnimation}
                  className="col-span-2 h-6 skeleton rounded"
                />
                <motion.div
                  animate={pulseAnimation}
                  className="col-span-1 h-6 skeleton rounded"
                />
                <motion.div
                  animate={pulseAnimation}
                  className="col-span-2 h-6 skeleton rounded"
                />
              </div>
              <div className="mt-2 ml-10">
                <motion.div
                  animate={pulseAnimation}
                  className="h-4 w-3/4 skeleton rounded-full"
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="sr-only" aria-live="polite" role="status">
        Loading your shopping list. This may take a moment.
      </div>
    </div>
  );
}
