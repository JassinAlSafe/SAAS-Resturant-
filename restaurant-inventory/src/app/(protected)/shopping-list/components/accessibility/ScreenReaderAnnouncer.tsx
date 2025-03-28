"use client";

import { useEffect, useState } from "react";
import { Announcer } from "@/components/ui/accessibility-helpers";
import { announceToScreen } from "@/components/ui/accessibility-helpers";
import { AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ScreenReaderAnnouncerProps {
  announcements?: string[];
  politeAnnouncements?: string[];
  showVisualIndicators?: boolean; // For testing purposes only
}

export default function ScreenReaderAnnouncer({
  announcements = [],
  politeAnnouncements = [],
  showVisualIndicators = false, // Set to true only for testing
}: ScreenReaderAnnouncerProps) {
  const [visibleMessages, setVisibleMessages] = useState<{
    assertive: string | null;
    polite: string | null;
  }>({
    assertive: null,
    polite: null,
  });

  // Handle assertive announcements (important, interrupts)
  useEffect(() => {
    if (announcements.length > 0 && announcements[announcements.length - 1]) {
      const latestAnnouncement = announcements[announcements.length - 1];
      announceToScreen(latestAnnouncement, true); // priority=true for assertive announcements

      if (showVisualIndicators) {
        setVisibleMessages((prev) => ({
          ...prev,
          assertive: latestAnnouncement,
        }));

        // Clear after 3 seconds
        const timer = setTimeout(() => {
          setVisibleMessages((prev) => ({ ...prev, assertive: null }));
        }, 3000);

        return () => clearTimeout(timer);
      }
    }
  }, [announcements, showVisualIndicators]);

  // Handle polite announcements (wait until user is idle)
  useEffect(() => {
    if (
      politeAnnouncements.length > 0 &&
      politeAnnouncements[politeAnnouncements.length - 1]
    ) {
      const latestPoliteAnnouncement =
        politeAnnouncements[politeAnnouncements.length - 1];
      announceToScreen(latestPoliteAnnouncement, false); // priority=false for polite announcements

      if (showVisualIndicators) {
        setVisibleMessages((prev) => ({
          ...prev,
          polite: latestPoliteAnnouncement,
        }));

        // Clear after 5 seconds
        const timer = setTimeout(() => {
          setVisibleMessages((prev) => ({ ...prev, polite: null }));
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [politeAnnouncements, showVisualIndicators]);

  // Get the latest announcements for display
  const latestAssertiveMessage =
    announcements.length > 0 ? announcements[announcements.length - 1] : "";

  const latestPoliteMessage =
    politeAnnouncements.length > 0
      ? politeAnnouncements[politeAnnouncements.length - 1]
      : "";

  return (
    <>
      {/* Assertive announcer - for important updates that should interrupt */}
      <Announcer
        message={latestAssertiveMessage}
        assertive={true}
        clearAfter={3000}
      />

      {/* Polite announcer - for non-critical updates */}
      <Announcer
        message={latestPoliteMessage}
        assertive={false}
        clearAfter={5000}
      />

      {/* Visual indicators for testing - not visible to users in production */}
      {showVisualIndicators && (
        <div
          className="fixed bottom-4 right-4 z-50 space-y-2 w-full max-w-sm"
          aria-hidden="true"
        >
          <AnimatePresence>
            {visibleMessages.assertive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white border border-red-200 shadow-md rounded-lg p-3 flex items-center gap-3"
              >
                <div className="bg-red-100 text-red-500 p-2 rounded-full">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Assertive Announcement:
                  </div>
                  <div className="text-sm text-gray-700">
                    {visibleMessages.assertive}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {visibleMessages.polite && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-white border border-blue-200 shadow-md rounded-lg p-3 flex items-center gap-3"
              >
                <div className="bg-blue-100 text-blue-500 p-2 rounded-full">
                  <Info size={18} />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">
                    Polite Announcement:
                  </div>
                  <div className="text-sm text-gray-700">
                    {visibleMessages.polite}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
