"use client";

import { useEffect, useState } from "react";
import { ShoppingListItem } from "@/lib/types";
import { AccessibilityIcon, Keyboard, Search, Monitor } from "lucide-react";
import AccessibilityPointer from "./AccessibilityPointer";

interface AccessibilityHelpersProps {
  items: ShoppingListItem[];
  onItemSelect: (item: ShoppingListItem) => void;
  onItemPurchase: (params: {
    id: string;
    isPurchased: boolean;
  }) => Promise<ShoppingListItem | void>;
}

export default function AccessibilityHelpers({
  items,
  onItemSelect,
  onItemPurchase,
}: AccessibilityHelpersProps) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);
  const [announcements, setAnnouncements] = useState<string[]>([]);
  const [activeElementId, setActiveElementId] = useState<string | undefined>(
    undefined
  );
  const [activeElementText, setActiveElementText] = useState<
    string | undefined
  >(undefined);
  const [fontSize, setFontSize] = useState(100); // percentage of default font size
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Apply accessibility settings
  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;

    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }

    return () => {
      // Reset when component unmounts
      document.documentElement.style.fontSize = "";
      document.documentElement.classList.remove("high-contrast");
      document.documentElement.classList.remove("reduce-motion");
    };
  }, [fontSize, highContrast, reduceMotion]);

  // Add keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect if user is navigating with keyboard
      if (e.key === "Tab") {
        setIsKeyboardMode(true);

        // Check if focused element has an ID, use it for the pointer
        const activeElement = document.activeElement;
        if (activeElement && activeElement.id) {
          setActiveElementId(activeElement.id);
          setActiveElementText(
            activeElement.textContent ||
              activeElement.getAttribute("aria-label") ||
              undefined
          );
        }
      }

      // Alt+A to toggle accessibility menu
      if (e.altKey && e.key.toLowerCase() === "a") {
        setIsHelpOpen((prev) => !prev);
        announce((prev) =>
          prev ? "Accessibility menu closed" : "Accessibility menu opened"
        );
        e.preventDefault();
      }

      // Alt+F to increase font size
      if (e.altKey && e.key.toLowerCase() === "f") {
        setFontSize((prev) => Math.min(prev + 10, 150));
        announce(`Font size increased to ${fontSize + 10}%`);
        e.preventDefault();
      }

      // Alt+G to decrease font size
      if (e.altKey && e.key.toLowerCase() === "g") {
        setFontSize((prev) => Math.max(prev - 10, 80));
        announce(`Font size decreased to ${fontSize - 10}%`);
        e.preventDefault();
      }

      // Alt+C to toggle high contrast
      if (e.altKey && e.key.toLowerCase() === "c") {
        setHighContrast((prev) => !prev);
        announce((prev) =>
          prev ? "High contrast mode disabled" : "High contrast mode enabled"
        );
        e.preventDefault();
      }

      // Alt+M to toggle reduced motion
      if (e.altKey && e.key.toLowerCase() === "m") {
        setReduceMotion((prev) => !prev);
        announce((prev) =>
          prev ? "Reduced motion disabled" : "Reduced motion enabled"
        );
        e.preventDefault();
      }

      // Keyboard shortcuts for item navigation when in keyboard mode
      if (isKeyboardMode && items.length > 0) {
        // Arrow down to move focus to next item
        if (e.key === "ArrowDown") {
          const newIndex = (focusedItemIndex + 1) % items.length;
          setFocusedItemIndex(newIndex);

          // Set ID for the focused item if it exists
          const itemElement = document.getElementById(
            `item-${items[newIndex]?.id}`
          );
          if (itemElement) {
            setActiveElementId(`item-${items[newIndex]?.id}`);
            setActiveElementText(items[newIndex]?.name);
          }

          e.preventDefault();
          announce(`Focused on ${items[newIndex]?.name}`);
        }

        // Arrow up to move focus to previous item
        if (e.key === "ArrowUp") {
          const newIndex = (focusedItemIndex - 1 + items.length) % items.length;
          setFocusedItemIndex(newIndex);

          // Set ID for the focused item if it exists
          const itemElement = document.getElementById(
            `item-${items[newIndex]?.id}`
          );
          if (itemElement) {
            setActiveElementId(`item-${items[newIndex]?.id}`);
            setActiveElementText(items[newIndex]?.name);
          }

          e.preventDefault();
          announce(`Focused on ${items[newIndex]?.name}`);
        }

        // Enter to select focused item
        if (e.key === "Enter" && focusedItemIndex >= 0) {
          onItemSelect(items[focusedItemIndex]);
          e.preventDefault();
          announce(`Selected ${items[focusedItemIndex]?.name}`);
        }

        // Space to toggle purchase status
        if (e.key === " " && focusedItemIndex >= 0) {
          const item = items[focusedItemIndex];
          onItemPurchase({ id: item.id, isPurchased: !item.isPurchased });
          e.preventDefault();
          announce(
            `${item.isPurchased ? "Unmarked" : "Marked"} ${
              item.name
            } as purchased`
          );
        }
      }
    };

    // Mouse movement disables keyboard mode
    const handleMouseMove = () => {
      if (isKeyboardMode) {
        setIsKeyboardMode(false);
        setActiveElementId(undefined);
        setActiveElementText(undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    isKeyboardMode,
    items,
    focusedItemIndex,
    onItemSelect,
    onItemPurchase,
    fontSize,
    highContrast,
    reduceMotion,
  ]);

  // Function to announce messages to screen readers
  const announce = (messageOrFn: string | ((prev: string) => string)) => {
    setAnnouncements((prev) => {
      const message =
        typeof messageOrFn === "function"
          ? messageOrFn(prev[prev.length - 1] || "")
          : messageOrFn;

      return [...prev, message].slice(-5);
    });
  };

  // Keyboard navigation help
  const keyboardShortcuts = [
    { key: "Tab", description: "Navigate between elements" },
    { key: "Arrow Up/Down", description: "Navigate between shopping items" },
    { key: "Enter", description: "Select focused item" },
    { key: "Space", description: "Toggle purchase status" },
    { key: "Alt+A", description: "Open accessibility menu" },
    { key: "Alt+F", description: "Increase font size" },
    { key: "Alt+G", description: "Decrease font size" },
    { key: "Alt+C", description: "Toggle high contrast" },
    { key: "Alt+M", description: "Toggle reduced motion" },
    { key: "Esc", description: "Close dialogs" },
  ];

  return (
    <>
      {/* Screen reader announcements (visually hidden) */}
      <div
        role="status"
        aria-live="polite"
        className="sr-only"
        aria-atomic="true"
      >
        {announcements[announcements.length - 1]}
      </div>

      {/* Accessibility Pointer for keyboard navigation */}
      <AccessibilityPointer
        isKeyboardMode={isKeyboardMode}
        activeElementId={activeElementId}
        activeElementText={activeElementText}
      />

      {/* Accessibility button */}
      <button
        aria-label="Accessibility options"
        className="fixed bottom-4 right-4 btn btn-circle btn-primary"
        onClick={() => setIsHelpOpen(true)}
      >
        <AccessibilityIcon className="h-5 w-5" />
      </button>

      {/* Accessibility Help Dialog */}
      {isHelpOpen && (
        <div
          className="modal modal-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="accessibility-dialog-title"
        >
          <div className="modal-box">
            <h3
              id="accessibility-dialog-title"
              className="font-bold text-lg flex items-center gap-2"
            >
              <AccessibilityIcon className="h-5 w-5" />
              Accessibility Options
            </h3>

            <div className="py-4 space-y-6">
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Keyboard className="h-4 w-4" />
                  Keyboard Shortcuts
                </h4>
                <div className="overflow-x-auto">
                  <table
                    className="table table-zebra w-full"
                    aria-label="Keyboard shortcuts"
                  >
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keyboardShortcuts.map((shortcut, index) => (
                        <tr key={index}>
                          <td>
                            <kbd className="kbd">{shortcut.key}</kbd>
                          </td>
                          <td>{shortcut.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-3">
                  <Monitor className="h-4 w-4" />
                  Display Settings
                </h4>

                <div className="space-y-4">
                  <div>
                    <label className="font-medium mb-2 block">
                      Font Size: {fontSize}%
                    </label>
                    <input
                      type="range"
                      min="80"
                      max="150"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="range range-primary range-sm"
                      aria-label="Font size adjustment"
                    />
                    <div className="flex justify-between text-xs px-1">
                      <span>Smaller</span>
                      <span>Default</span>
                      <span>Larger</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label justify-start gap-2">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={highContrast}
                        onChange={(e) => setHighContrast(e.target.checked)}
                        aria-label="High contrast mode"
                      />
                      <span className="label-text">High Contrast Mode</span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="cursor-pointer label justify-start gap-2">
                      <input
                        type="checkbox"
                        className="toggle toggle-primary"
                        checked={reduceMotion}
                        onChange={(e) => setReduceMotion(e.target.checked)}
                        aria-label="Reduce motion"
                      />
                      <span className="label-text">Reduce Motion</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Search className="h-4 w-4" />
                  Screen Reader Support
                </h4>
                <p className="text-sm">
                  This page is optimized for screen readers. All actions will be
                  announced, and you can navigate through items using standard
                  keyboard controls.
                </p>
                <p className="text-sm mt-2">
                  Current mode:{" "}
                  {isKeyboardMode ? "Keyboard navigation" : "Mouse navigation"}
                </p>
              </div>

              <div className="form-control">
                <label className="cursor-pointer label justify-start gap-2">
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={isKeyboardMode}
                    onChange={(e) => setIsKeyboardMode(e.target.checked)}
                    aria-label="Enable keyboard navigation mode"
                  />
                  <span className="label-text">
                    Enable keyboard navigation mode
                  </span>
                </label>
              </div>
            </div>

            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setIsHelpOpen(false)}
                aria-label="Close accessibility options"
              >
                Close
              </button>
            </div>
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setIsHelpOpen(false)}
          ></div>
        </div>
      )}

      {/* Focus indicator (only shown in keyboard mode) */}
      {isKeyboardMode && focusedItemIndex >= 0 && (
        <div
          className="fixed left-0 right-0 bottom-8 z-50 flex justify-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="bg-primary text-primary-content px-4 py-2 rounded-full shadow-lg">
            <span className="font-medium">
              Focused: {items[focusedItemIndex]?.name}
            </span>
          </div>
        </div>
      )}

      {/* Add styles for high contrast mode */}
      <style jsx global>{`
        .high-contrast {
          --bg-base-100: #000000;
          --bg-base-200: #333333;
          --bg-base-300: #444444;
          --color-base-content: #ffffff;
          --color-primary: #ffff00;
          --color-primary-content: #000000;
          --color-secondary: #00ffff;
          --color-secondary-content: #000000;
          --color-accent: #ff00ff;
          --color-accent-content: #000000;
        }

        .high-contrast * {
          border-color: #ffffff !important;
        }

        .reduce-motion * {
          transition: none !important;
          animation: none !important;
        }
      `}</style>
    </>
  );
}
