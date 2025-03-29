"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [tooltipText, setTooltipText] = useState("Toggle theme");
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after component mounts on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only update tooltip text after component has mounted on client
  useEffect(() => {
    // Update tooltip text based on current theme
    if (theme === "bumblebee") {
      setTooltipText("Switch to dark mode");
    } else {
      setTooltipText("Switch to light mode");
    }
  }, [theme]);

  // Function to toggle between themes
  const toggleTheme = () => {
    setTheme(theme === "bumblebee" ? "dark" : "bumblebee");
  };

  // Render a placeholder with same dimensions during server-side rendering
  // This prevents hydration mismatch by waiting for client-side rendering before showing actual content
  if (!mounted) {
    return (
      <div className="h-8 w-8">
        <div className="relative h-5 w-5"></div>
      </div>
    );
  }

  return (
    <Tooltip content={tooltipText} position="bottom">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleTheme}
        className="h-8 w-8 rounded-md hover:bg-primary/10 hover:text-foreground text-muted-foreground relative p-0"
      >
        <div className="relative h-5 w-5">
          <span
            className={`h-full w-5 absolute inset-0 flex items-center justify-center transition-all ${
              theme === "bumblebee" ? "rotate-0 scale-100" : "rotate-90 scale-0"
            }`}
          >
            🐝
          </span>
          <Moon
            className={`h-full w-full absolute inset-0 transition-all ${
              theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
            }`}
          />
        </div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </Tooltip>
  );
}
