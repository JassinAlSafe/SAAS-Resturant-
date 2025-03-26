"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";

export function SidebarThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [tooltipText, setTooltipText] = useState("Toggle theme");

  // Only update tooltip text after component has mounted on client
  useEffect(() => {
    // Update tooltip text based on current theme
    setTooltipText(
      theme === "light" ? "Switch to dark mode" : "Switch to light mode"
    );
  }, [theme]);

  return (
    <Tooltip content={tooltipText} position="bottom">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="h-8 w-8 rounded-md hover:bg-primary/10 hover:text-foreground text-muted-foreground relative p-0"
      >
        <div className="relative h-5 w-5">
          <Sun className="h-full w-full absolute inset-0 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="h-full w-full absolute inset-0 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </div>
        <span className="sr-only">Toggle theme</span>
      </Button>
    </Tooltip>
  );
}
