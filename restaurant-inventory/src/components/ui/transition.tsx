"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TransitionType = "login" | "logout" | "signup" | "default";

type TransitionContextType = {
  isTransitioning: boolean;
  startTransition: (callback: () => void, type?: TransitionType) => void;
};

const TransitionContext = React.createContext<
  TransitionContextType | undefined
>(undefined);

export function useTransition() {
  const context = React.useContext(TransitionContext);
  if (context === undefined) {
    throw new Error("useTransition must be used within a TransitionProvider");
  }
  return context;
}

export function TransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [callback, setCallback] = useState<(() => void) | null>(null);
  const [transitionType, setTransitionType] =
    useState<TransitionType>("default");

  // Handle the transition completion
  useEffect(() => {
    if (!isTransitioning && callback) {
      callback();
      setCallback(null);
    }
  }, [isTransitioning, callback]);

  const startTransition = (
    cb: () => void,
    type: TransitionType = "default"
  ) => {
    setIsTransitioning(true);
    setTransitionType(type);
    setCallback(() => cb);

    // Automatically end the transition after 1.5 seconds
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1500);
  };

  const getTransitionMessage = () => {
    switch (transitionType) {
      case "login":
        return "Loading your dashboard...";
      case "logout":
        return "Logging you out...";
      case "signup":
        return "Preparing your account...";
      default:
        return "Loading...";
    }
  };

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
      {children}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
          >
            <div className="text-center">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-md">
                  <span className="text-2xl font-bold">S</span>
                </div>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  className="h-1 bg-primary rounded-full w-48"
                />
                <p className="text-lg font-medium text-foreground">
                  {getTransitionMessage()}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
