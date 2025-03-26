"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the shape of our accessibility settings
type AccessibilitySettings = {
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  keyboardFocus: boolean;
  screenReaderOptimized: boolean;
};

// Define the context shape
type AccessibilityContextType = {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  resetSettings: () => void;
};

// Create the context with default values
const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

// Default settings
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  keyboardFocus: true,
  screenReaderOptimized: false,
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] =
    useState<AccessibilitySettings>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("accessibilitySettings");
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error("Failed to parse accessibility settings:", error);
        // Fall back to defaults if there's an error
        setSettings(defaultSettings);
      }
    }

    // Check if user prefers reduced motion from their OS settings
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) {
      setSettings((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Apply settings to the document whenever they change
  useEffect(() => {
    // Save to localStorage
    localStorage.setItem("accessibilitySettings", JSON.stringify(settings));

    // Apply high contrast mode
    if (settings.highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }

    // Apply large text
    if (settings.largeText) {
      document.documentElement.style.fontSize = "120%";
    } else {
      document.documentElement.style.fontSize = "";
    }

    // Apply keyboard focus styles
    if (settings.keyboardFocus) {
      document.documentElement.classList.add("keyboard-focus-visible");
    } else {
      document.documentElement.classList.remove("keyboard-focus-visible");
    }

    // Apply screen reader optimizations
    if (settings.screenReaderOptimized) {
      document.documentElement.setAttribute("role", "application");
    } else {
      document.documentElement.removeAttribute("role");
    }
  }, [settings]);

  // Function to update a single setting
  const updateSetting = (key: keyof AccessibilitySettings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Function to reset all settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{ settings, updateSetting, resetSettings }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

// Custom hook to use the accessibility context
export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
};
