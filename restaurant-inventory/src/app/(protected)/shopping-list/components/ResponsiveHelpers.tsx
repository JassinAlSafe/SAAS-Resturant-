"use client";

import { useEffect, useState } from "react";
import { Smartphone, Tablet, Monitor, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/components/ui/accessibility-helpers";
import { announceToScreen } from "@/components/ui/accessibility-helpers";

export default function ResponsiveHelpers() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Detect device type
  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 640;
      const newIsTablet = window.innerWidth >= 640 && window.innerWidth < 1024;

      // Only update state if there's a change to prevent unnecessary rerenders
      if (newIsMobile !== isMobile) {
        setIsMobile(newIsMobile);
      }
      if (newIsTablet !== isTablet) {
        setIsTablet(newIsTablet);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Check if user has previously seen tips
    const savedDismissedTips = localStorage.getItem(
      "shopping-list-dismissed-tips"
    );
    if (savedDismissedTips) {
      setDismissedTips(JSON.parse(savedDismissedTips));
    }

    // Show tips for mobile/tablet users if not previously dismissed
    const deviceTipId = isMobile
      ? "mobile-tip"
      : isTablet
      ? "tablet-tip"
      : "desktop-tip";
    if (!savedDismissedTips?.includes(deviceTipId)) {
      setShowTips(true);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, isTablet]);

  const dismissTip = (tipId: string) => {
    const updatedDismissedTips = [...dismissedTips, tipId];
    setDismissedTips(updatedDismissedTips);
    localStorage.setItem(
      "shopping-list-dismissed-tips",
      JSON.stringify(updatedDismissedTips)
    );
    setShowTips(false);

    // Announce to screen readers that the tip has been dismissed
    announceToScreen("Tip dismissed");
  };

  // Get device-specific tip content
  const getTipContent = () => {
    if (isMobile) {
      return {
        id: "mobile-tip",
        icon: <Smartphone className="h-5 w-5" aria-hidden="true" />,
        title: "Mobile Tips",
        content:
          "Use landscape mode for a better view of your shopping list. Swipe horizontally to see all columns in tables.",
      };
    } else if (isTablet) {
      return {
        id: "tablet-tip",
        icon: <Tablet className="h-5 w-5" aria-hidden="true" />,
        title: "Tablet Tips",
        content:
          "Double tap on items for quick actions. The shopping wizard is optimized for your tablet screen.",
      };
    } else {
      return {
        id: "desktop-tip",
        icon: <Monitor className="h-5 w-5" aria-hidden="true" />,
        title: "Desktop Tips",
        content:
          "Use keyboard shortcuts for faster navigation. Press Alt+A to access accessibility options.",
      };
    }
  };

  // Apply device-specific optimizations
  useEffect(() => {
    if (!isMounted) return;

    if (isMobile) {
      // Optimize UI for mobile
      document.documentElement.classList.add("mobile-optimized");
      document.documentElement.classList.remove("tablet-optimized");
      announceToScreen("Mobile view activated");
    } else if (isTablet) {
      // Optimize UI for tablet
      document.documentElement.classList.add("tablet-optimized");
      document.documentElement.classList.remove("mobile-optimized");
      announceToScreen("Tablet view activated");
    } else {
      // Optimize for desktop (reset)
      document.documentElement.classList.remove("mobile-optimized");
      document.documentElement.classList.remove("tablet-optimized");
    }

    return () => {
      // Cleanup
      document.documentElement.classList.remove("mobile-optimized");
      document.documentElement.classList.remove("tablet-optimized");
    };
  }, [isMobile, isTablet, isMounted]);

  const tipInfo = getTipContent();

  if (!showTips || !isMounted) return null;

  // Animation variants for toast
  const toastVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
      };

  return (
    <AnimatePresence>
      {showTips && (
        <motion.div
          className="toast toast-top toast-end z-40"
          variants={toastVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
        >
          <div className="alert alert-info">
            <div className="flex gap-2">
              {tipInfo.icon}
              <div>
                <h3 className="font-bold text-sm">{tipInfo.title}</h3>
                <div className="text-xs">{tipInfo.content}</div>
              </div>
            </div>
            <button
              onClick={() => dismissTip(tipInfo.id)}
              className="btn btn-sm btn-ghost"
              aria-label={`Dismiss ${tipInfo.title}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
