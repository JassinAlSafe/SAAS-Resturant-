"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Moon } from "lucide-react";

export function ThemeTest() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 border rounded-md mb-4 flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Theme Test</h2>
      <p>Current theme: {theme}</p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={() => setTheme("bumblebee")}
          className="flex items-center gap-2"
        >
          <span className="h-4 w-4 flex items-center justify-center text-yellow-400">
            🐝
          </span>
          Light
        </Button>
        <Button
          variant="outline"
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark
        </Button>
        <Button variant="outline" onClick={() => setTheme("system")}>
          System
        </Button>
      </div>
    </div>
  );
}
