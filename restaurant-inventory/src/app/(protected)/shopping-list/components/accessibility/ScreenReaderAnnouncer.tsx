"use client";

import { useEffect } from "react";
import { Announcer } from "@/components/ui/accessibility-helpers";
import { announceToScreen } from "@/components/ui/accessibility-helpers";

interface ScreenReaderAnnouncerProps {
  announcements?: string[];
  politeAnnouncements?: string[];
}

export default function ScreenReaderAnnouncer({
  announcements = [],
  politeAnnouncements = [],
}: ScreenReaderAnnouncerProps) {
  // Handle assertive announcements (important, interrupts)
  useEffect(() => {
    if (announcements.length > 0 && announcements[announcements.length - 1]) {
      const latestAnnouncement = announcements[announcements.length - 1];
      announceToScreen(latestAnnouncement, true); // priority=true for assertive announcements
    }
  }, [announcements]);

  // Handle polite announcements (wait until user is idle)
  useEffect(() => {
    if (
      politeAnnouncements.length > 0 &&
      politeAnnouncements[politeAnnouncements.length - 1]
    ) {
      const latestPoliteAnnouncement =
        politeAnnouncements[politeAnnouncements.length - 1];
      announceToScreen(latestPoliteAnnouncement, false); // priority=false for polite announcements
    }
  }, [politeAnnouncements]);

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
    </>
  );
}
