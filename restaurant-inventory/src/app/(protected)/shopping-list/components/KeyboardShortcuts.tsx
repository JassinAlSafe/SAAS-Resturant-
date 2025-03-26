"use client";

import React, { useEffect, useState } from "react";
import { KeyRound } from "lucide-react";

// Define our keyboard shortcuts
const shortcuts = [
  { key: "/", description: "Search" },
  { key: "Shift+Tab", description: "Navigate between sections" },
  { key: "Alt+1-5", description: "Switch tabs" },
  { key: "Ctrl+S", description: "Save" },
  { key: "Esc", description: "Close modal/popup" },
  { key: "Alt+A", description: "Open accessibility panel" },
  { key: "Ctrl+P", description: "Print shopping list" },
  { key: "Alt+N", description: "Create new item" },
  { key: "Alt+E", description: "Edit selected item" },
  { key: "Alt+D", description: "Delete selected item" },
];

const KeyboardShortcuts: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Register global keyboard shortcut to show the shortcuts modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // '?' key typically shows keyboard shortcuts in many applications
      if (e.key === "?" && e.shiftKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }

      // Implement Alt+A to open the accessibility panel
      if (e.key === "a" && e.altKey) {
        e.preventDefault();
        // Find the accessibility settings button and click it
        const accessibilityButton = document.querySelector(
          '[aria-label="Accessibility Settings"]'
        ) as HTMLButtonElement;
        if (accessibilityButton) {
          accessibilityButton.click();
        }
      }

      // Add tab navigation with shift+tab
      if (e.key === "Tab" && e.shiftKey) {
        // Allow the browser's default behavior for tab navigation
        // But we could enhance this by adding visual indicators
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          // Add a temporary highlight class
          activeElement.classList.add("keyboard-nav-highlight");
          setTimeout(() => {
            activeElement.classList.remove("keyboard-nav-highlight");
          }, 500);
        }
      }

      // Implement Alt+1-5 for tab switching
      if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key)) {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabButtons = document.querySelectorAll('[role="tab"]');
        if (tabButtons && tabButtons[tabIndex]) {
          (tabButtons[tabIndex] as HTMLButtonElement).click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <button
        onClick={() => setShowShortcuts(true)}
        className="btn btn-ghost btn-sm"
        aria-label="Show keyboard shortcuts"
        title="Keyboard Shortcuts"
      >
        <KeyRound className="w-5 h-5" />
      </button>

      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Keyboard Shortcuts</h3>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Shortcut</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {shortcuts.map((shortcut, index) => (
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
            <div className="modal-action">
              <button onClick={() => setShowShortcuts(false)} className="btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcuts;
