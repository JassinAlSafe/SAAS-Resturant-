"use client";

import React, { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  Settings,
  Eye,
  MousePointerClick,
  KeyRound,
  Keyboard,
  RotateCcw,
} from "lucide-react";

const AccessibilityPanel: React.FC = () => {
  const { settings, updateSetting, resetSettings } = useAccessibility();
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={togglePanel}
        className="btn btn-circle btn-primary"
        aria-label="Accessibility Settings"
        title="Accessibility Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="card bg-base-100 shadow-xl absolute bottom-14 right-0 w-72 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">Accessibility</h3>
            <button
              onClick={togglePanel}
              className="btn btn-sm btn-circle"
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.highContrast}
                  onChange={(e) =>
                    updateSetting("highContrast", e.target.checked)
                  }
                />
                <span className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  High Contrast
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.reducedMotion}
                  onChange={(e) =>
                    updateSetting("reducedMotion", e.target.checked)
                  }
                />
                <span className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4" />
                  Reduce Motion
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.largeText}
                  onChange={(e) => updateSetting("largeText", e.target.checked)}
                />
                <span className="flex items-center gap-2">
                  <span className="text-lg font-bold">A</span>
                  Larger Text
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.keyboardFocus}
                  onChange={(e) =>
                    updateSetting("keyboardFocus", e.target.checked)
                  }
                />
                <span className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Keyboard Focus
                </span>
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={settings.screenReaderOptimized}
                  onChange={(e) =>
                    updateSetting("screenReaderOptimized", e.target.checked)
                  }
                />
                <span className="flex items-center gap-2">
                  <Keyboard className="w-4 h-4" />
                  Screen Reader
                </span>
              </label>
            </div>

            <div className="divider my-1"></div>

            <button
              onClick={resetSettings}
              className="btn btn-outline btn-sm w-full"
              aria-label="Reset accessibility settings"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;
