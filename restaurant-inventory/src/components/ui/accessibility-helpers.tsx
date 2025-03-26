"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface AnnouncerProps {
  message: string;
  assertive?: boolean;
  clearAfter?: number;
}

export const Announcer = ({
  message,
  assertive = false,
  clearAfter = 3000,
}: AnnouncerProps) => {
  const previousMessage = useRef<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear previous timeout on new message
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (message && message !== previousMessage.current) {
      previousMessage.current = message;

      if (clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          previousMessage.current = "";
        }, clearAfter);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  return (
    <div
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
};

export function useAnnouncer() {
  const [announcement, setAnnouncement] = React.useState("");
  const [assertive, setAssertive] = React.useState(false);

  const announce = useCallback((message: string, isAssertive = false) => {
    setAnnouncement(message);
    setAssertive(isAssertive);
  }, []);

  return { announce, announcement, assertive };
}

interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export const ScreenReaderOnly = ({ children }: ScreenReaderOnlyProps) => {
  return <span className="sr-only">{children}</span>;
};

interface KeyboardShortcutProps {
  shortcut: string;
  description: string;
}

export const KeyboardShortcut = ({
  shortcut,
  description,
}: KeyboardShortcutProps) => {
  const formattedShortcut = shortcut
    .split("+")
    .map((key) => key.trim())
    .join(" + ");

  return (
    <div className="sr-only">
      {description}: {formattedShortcut}
    </div>
  );
};

interface KeyboardNavigationHintProps {
  content: string;
}

export const KeyboardNavigationHint = ({
  content,
}: KeyboardNavigationHintProps) => {
  return <div className="sr-only">{content}</div>;
};

// Unified announcer for the app
let announceQueue: string[] = [];
let isProcessingQueue = false;

const processQueue = () => {
  if (isProcessingQueue || announceQueue.length === 0) return;
  isProcessingQueue = true;

  const message = announceQueue.shift();
  if (message) {
    // Update the live region
    const liveRegion = document.getElementById("global-announcer");
    if (liveRegion) {
      liveRegion.textContent = message;
    }

    // Clear it after a delay
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = "";
      }
      isProcessingQueue = false;
      processQueue(); // Process next in queue if any
    }, 3000);
  } else {
    isProcessingQueue = false;
  }
};

export const announceToScreen = (message: string, priority = false) => {
  if (priority) {
    announceQueue.unshift(message);
  } else {
    announceQueue.push(message);
  }
  processQueue();
};

export const GlobalAnnouncer = () => {
  useEffect(() => {
    if (!document.getElementById("global-announcer")) {
      const announcer = document.createElement("div");
      announcer.id = "global-announcer";
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.className = "sr-only";
      document.body.appendChild(announcer);
    }

    return () => {
      const announcer = document.getElementById("global-announcer");
      if (announcer && announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    };
  }, []);

  return null;
};

// Helper for accessible animations
export const REDUCED_MOTION_SETTINGS = {
  initial: {},
  animate: {},
  exit: {},
  transition: { duration: 0 },
};

export const useReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const onChange = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener("change", onChange);
    return () => {
      mediaQuery.removeEventListener("change", onChange);
    };
  }, []);

  return prefersReducedMotion;
};

export const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  return Array.from(
    container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
  ) as HTMLElement[];
};

export const useFocusTrap = (
  containerRef: React.RefObject<HTMLElement>,
  isActive = true
) => {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = getFocusableElements(container);

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);
    firstElement.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [containerRef, isActive]);
};
