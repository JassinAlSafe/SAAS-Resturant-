"use client";

import { useState } from "react";
import { Lightbulb, KeyRound, Eye, Volume2 } from "lucide-react";

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

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"keyboard" | "visual" | "audio">(
    "keyboard"
  );

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 btn btn-circle btn-primary z-50"
        aria-label="Open accessibility panel"
      >
        <Eye className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 card bg-base-100 shadow-lg z-50 overflow-hidden">
      <div className="card-body p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-lg">Accessibility</h2>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="tabs mb-3">
          <button
            className={`tab tab-bordered ${
              activeTab === "keyboard" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("keyboard")}
          >
            <KeyRound className="h-4 w-4 mr-1" />
            Keyboard
          </button>
          <button
            className={`tab tab-bordered ${
              activeTab === "visual" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("visual")}
          >
            <Eye className="h-4 w-4 mr-1" />
            Visual
          </button>
          <button
            className={`tab tab-bordered ${
              activeTab === "audio" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("audio")}
          >
            <Volume2 className="h-4 w-4 mr-1" />
            Audio
          </button>
        </div>

        <div className="overflow-y-auto max-h-64">
          {activeTab === "keyboard" && (
            <>
              <AccessibilityTip
                title="Keyboard Shortcuts"
                description="Use Alt+A to add a new item, Alt+V to view details of the first item, Alt+P to purchase the first pending item."
                icon={<KeyRound className="h-5 w-5 text-blue-500" />}
              />
              <p className="text-sm mt-2">
                Tab navigation is fully supported throughout the application.
              </p>
            </>
          )}

          {activeTab === "visual" && (
            <>
              <AccessibilityTip
                title="Color Contrast"
                description="All UI elements meet WCAG AA standards for color contrast."
                icon={<Eye className="h-5 w-5 text-blue-500" />}
              />
              <p className="text-sm mt-2">
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
              <p className="text-sm mt-2">
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
