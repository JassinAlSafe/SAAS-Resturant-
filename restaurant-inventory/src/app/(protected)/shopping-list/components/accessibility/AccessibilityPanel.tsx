"use client";

import { useState } from "react";
import { Lightbulb, KeyRound, Eye, Volume2, Settings } from "lucide-react";
import { KeyboardShortcuts } from "../KeyboardShortcuts";

interface AccessibilityTipProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

function AccessibilityTip({
  title,
  description,
  icon = <Lightbulb className="h-5 w-5 text-amber-500" />,
}: AccessibilityTipProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 my-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div>
          <h3 className="font-medium text-blue-900 mb-1">{title}</h3>
          <p className="text-sm text-blue-700">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"keyboard" | "visual" | "audio" | "shortcuts">(
    "keyboard"
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-white shadow-md rounded-full p-3 border border-gray-200 hover:bg-gray-50 transition-colors"
        aria-label="Open accessibility options"
        title="Accessibility Options"
      >
        <Settings className="h-5 w-5 text-indigo-500" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg z-50 overflow-hidden border border-gray-100">
      <div className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-gray-800">Accessibility</h2>
          <button
            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700 transition-colors"
            onClick={() => setIsOpen(false)}
            aria-label="Close accessibility panel"
          >
            Close
          </button>
        </div>

        <div className="flex border-b border-gray-200 mb-3">
          <button
            className={`flex items-center py-2 px-3 text-sm ${
              activeTab === "keyboard" 
                ? "border-b-2 border-indigo-500 text-indigo-600 font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("keyboard")}
          >
            <KeyRound className="h-4 w-4 mr-1.5" />
            Tips
          </button>
          <button
            className={`flex items-center py-2 px-3 text-sm ${
              activeTab === "shortcuts" 
                ? "border-b-2 border-indigo-500 text-indigo-600 font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("shortcuts")}
          >
            <KeyRound className="h-4 w-4 mr-1.5" />
            Shortcuts
          </button>
          <button
            className={`flex items-center py-2 px-3 text-sm ${
              activeTab === "visual" 
                ? "border-b-2 border-indigo-500 text-indigo-600 font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("visual")}
          >
            <Eye className="h-4 w-4 mr-1.5" />
            Visual
          </button>
          <button
            className={`flex items-center py-2 px-3 text-sm ${
              activeTab === "audio" 
                ? "border-b-2 border-indigo-500 text-indigo-600 font-medium" 
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab("audio")}
          >
            <Volume2 className="h-4 w-4 mr-1.5" />
            Audio
          </button>
        </div>

        <div className="overflow-y-auto max-h-64 pr-2">
          {activeTab === "keyboard" && (
            <>
              <AccessibilityTip
                title="Keyboard Shortcuts"
                description="Press Alt+K to view all keyboard shortcuts. Basic shortcuts include Alt+A to add items and Alt+P to purchase items."
                icon={<KeyRound className="h-5 w-5 text-blue-500" />}
              />
              <p className="text-sm mt-2 text-gray-600">
                Tab navigation is fully supported throughout the application.
              </p>
            </>
          )}

          {activeTab === "shortcuts" && (
            <div className="mt-2">
              <KeyboardShortcuts />
            </div>
          )}

          {activeTab === "visual" && (
            <>
              <AccessibilityTip
                title="Color Contrast"
                description="All UI elements meet WCAG AA standards for color contrast."
                icon={<Eye className="h-5 w-5 text-blue-500" />}
              />
              <p className="text-sm mt-2 text-gray-600">
                The application respects your system&#39;s reduced motion and
                high contrast preferences.
              </p>
            </>
          )}

          {activeTab === "audio" && (
            <>
              <AccessibilityTip
                title="Screen Reader Support"
                description="All interactive elements have proper ARIA labels and announcements."
                icon={<Volume2 className="h-5 w-5 text-blue-500" />}
              />
              <p className="text-sm mt-2 text-gray-600">
                Status updates (like adding items or marking items as purchased)
                are announced to screen readers.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
