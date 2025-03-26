"use client";

import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

// Define the type for our announcer messages
type AnnouncementMessage = {
  id: string;
  message: string;
  type: "assertive" | "polite";
  timeout?: number;
};

// Create a singleton announcer service
class AnnouncerService {
  private static instance: AnnouncerService;
  private listeners: Array<(message: AnnouncementMessage) => void> = [];

  private constructor() {}

  public static getInstance(): AnnouncerService {
    if (!AnnouncerService.instance) {
      AnnouncerService.instance = new AnnouncerService();
    }
    return AnnouncerService.instance;
  }

  public announce(
    message: string,
    type: "assertive" | "polite" = "polite",
    timeout: number = 5000
  ): void {
    const announcementMessage: AnnouncementMessage = {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type,
      timeout,
    };

    this.listeners.forEach((listener) => listener(announcementMessage));
  }

  public subscribe(
    listener: (message: AnnouncementMessage) => void
  ): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

// Export the announcer service for use in other components
export const announcer = AnnouncerService.getInstance();

const ScreenReaderAnnouncer: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementMessage[]>([]);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to the announcer service
    const unsubscribe = announcer.subscribe((message) => {
      setAnnouncements((prev) => [...prev, message]);

      // Remove the announcement after the timeout
      setTimeout(() => {
        setAnnouncements((prev) => prev.filter((m) => m.id !== message.id));
      }, message.timeout || 5000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Get the messages for each type
  const politeMessages = announcements.filter((a) => a.type === "polite");
  const assertiveMessages = announcements.filter((a) => a.type === "assertive");

  return (
    <>
      <div
        ref={assertiveRef}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        data-testid="screen-reader-announcer-assertive"
      >
        {assertiveMessages.map((announcement) => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>

      <div
        ref={politeRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        data-testid="screen-reader-announcer-polite"
      >
        {politeMessages.map((announcement) => (
          <div key={announcement.id}>{announcement.message}</div>
        ))}
      </div>
    </>
  );
};

// Function to mount the announcer if it's not already in the DOM
export function mountAnnouncer() {
  if (typeof window !== "undefined") {
    let announcerContainer = document.getElementById("screen-reader-announcer");

    if (!announcerContainer) {
      announcerContainer = document.createElement("div");
      announcerContainer.id = "screen-reader-announcer";
      document.body.appendChild(announcerContainer);

      const root = createRoot(announcerContainer);
      root.render(<ScreenReaderAnnouncer />);
    }
  }
}

export default ScreenReaderAnnouncer;
