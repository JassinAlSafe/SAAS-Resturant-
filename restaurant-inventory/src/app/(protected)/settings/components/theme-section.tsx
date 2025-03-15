"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Monitor, Sliders, Loader2 } from "lucide-react";
import { useThemeSettings } from "../hooks/useThemeSettings";

export function ThemeSection() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    compactMode,
    setCompactMode,
    stickyHeader,
    setStickyHeader,
    animations,
    setAnimations,
    mounted,
    saveSettings,
    isLoading,
    isSaving,
  } = useThemeSettings();

  // If still loading, show loading state
  if (isLoading || !mounted) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Theme
            </CardTitle>
            <CardDescription>
              Customize the appearance of the application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[200px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  Loading theme settings...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Theme
          </CardTitle>
          <CardDescription>
            Customize the appearance of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center gap-2 p-4 ${
                  theme === "light" ? "border-primary" : ""
                }`}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                <span>Light</span>
              </Button>
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center gap-2 p-4 ${
                  theme === "dark" ? "border-primary" : ""
                }`}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                <span>Dark</span>
              </Button>
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center gap-2 p-4 ${
                  theme === "system" ? "border-primary" : ""
                }`}
                onClick={() => setTheme("system")}
              >
                <Monitor className="h-6 w-6" />
                <span>System</span>
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Font Size</Label>
            <RadioGroup
              value={fontSize}
              onValueChange={setFontSize}
              className="grid grid-cols-3 gap-2"
            >
              <Label
                htmlFor="font-small"
                className={`flex cursor-pointer items-center justify-center rounded-md border p-4 ${
                  fontSize === "small" ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem
                  value="small"
                  id="font-small"
                  className="sr-only"
                />
                <span className="text-sm">Small</span>
              </Label>
              <Label
                htmlFor="font-medium"
                className={`flex cursor-pointer items-center justify-center rounded-md border p-4 ${
                  fontSize === "medium" ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem
                  value="medium"
                  id="font-medium"
                  className="sr-only"
                />
                <span>Medium</span>
              </Label>
              <Label
                htmlFor="font-large"
                className={`flex cursor-pointer items-center justify-center rounded-md border p-4 ${
                  fontSize === "large" ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem
                  value="large"
                  id="font-large"
                  className="sr-only"
                />
                <span className="text-lg">Large</span>
              </Label>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="ml-auto"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sliders className="h-5 w-5 text-primary" />
            Layout Preferences
          </CardTitle>
          <CardDescription>
            Customize the layout of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode" className="font-medium">
                Compact Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Reduce spacing and padding throughout the interface
              </p>
            </div>
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sticky-header" className="font-medium">
                Sticky Header
              </Label>
              <p className="text-sm text-muted-foreground">
                Keep the header visible when scrolling
              </p>
            </div>
            <Switch
              id="sticky-header"
              checked={stickyHeader}
              onCheckedChange={setStickyHeader}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="animations" className="font-medium">
                Interface Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable animations throughout the interface
              </p>
            </div>
            <Switch
              id="animations"
              checked={animations}
              onCheckedChange={setAnimations}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="ml-auto"
            onClick={saveSettings}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
