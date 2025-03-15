"use client"

import { SelectItem } from "@/components/ui/select"

import { SelectContent } from "@/components/ui/select"

import { SelectValue } from "@/components/ui/select"

import { SelectTrigger } from "@/components/ui/select"

import { Select } from "@/components/ui/select"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme()
  const [fontSize, setFontSize] = useState("medium")

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Customize the appearance of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Color Theme</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center gap-2 p-4 ${theme === "light" ? "border-primary" : ""}`}
                onClick={() => setTheme("light")}
              >
                <Sun className="h-6 w-6" />
                <span>Light</span>
              </Button>
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center gap-2 p-4 ${theme === "dark" ? "border-primary" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-6 w-6" />
                <span>Dark</span>
              </Button>
              <Button
                variant="outline"
                className={`flex flex-col items-center justify-center gap-2 p-4 ${theme === "system" ? "border-primary" : ""}`}
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
            <RadioGroup value={fontSize} onValueChange={setFontSize} className="grid grid-cols-3 gap-2">
              <Label
                htmlFor="font-small"
                className={`flex cursor-pointer items-center justify-center rounded-md border p-4 ${
                  fontSize === "small" ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem value="small" id="font-small" className="sr-only" />
                <span className="text-sm">Small</span>
              </Label>
              <Label
                htmlFor="font-medium"
                className={`flex cursor-pointer items-center justify-center rounded-md border p-4 ${
                  fontSize === "medium" ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem value="medium" id="font-medium" className="sr-only" />
                <span>Medium</span>
              </Label>
              <Label
                htmlFor="font-large"
                className={`flex cursor-pointer items-center justify-center rounded-md border p-4 ${
                  fontSize === "large" ? "border-primary" : ""
                }`}
              >
                <RadioGroupItem value="large" id="font-large" className="sr-only" />
                <span className="text-lg">Large</span>
              </Label>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="grid grid-cols-6 gap-2">
              {["slate", "red", "orange", "green", "blue", "purple"].map((color) => (
                <div
                  key={color}
                  className={`h-10 cursor-pointer rounded-md border ${color === "blue" ? "ring-2 ring-primary ring-offset-2" : ""}`}
                  style={{
                    backgroundColor:
                      color === "slate"
                        ? "#64748b"
                        : color === "red"
                          ? "#ef4444"
                          : color === "orange"
                            ? "#f97316"
                            : color === "green"
                              ? "#22c55e"
                              : color === "blue"
                                ? "#3b82f6"
                                : "#a855f7",
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto">Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Layout Preferences</CardTitle>
          <CardDescription>Customize the layout of the application.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Compact Mode</Label>
              <div className="text-sm text-muted-foreground">Reduce spacing and padding throughout the interface</div>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sticky Header</Label>
              <div className="text-sm text-muted-foreground">Keep the header visible when scrolling</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Quick Actions</Label>
              <div className="text-sm text-muted-foreground">Display quick action buttons in the header</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animations</Label>
              <div className="text-sm text-muted-foreground">Enable animations throughout the interface</div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto">Save Changes</Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Branding</CardTitle>
          <CardDescription>Customize the branding of your restaurant.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Use Custom Branding</Label>
              <div className="text-sm text-muted-foreground">Apply your restaurant&apos;s branding to the interface</div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-primary" />
              <Input type="color" value="#3b82f6" className="h-10 w-20" />
              <Input value="#3b82f6" className="w-32" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-md bg-secondary" />
              <Input type="color" value="#f3f4f6" className="h-10 w-20" />
              <Input value="#f3f4f6" className="w-32" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Fonts</Label>
            <Select defaultValue="inter">
              <SelectTrigger>
                <SelectValue placeholder="Select font" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inter">Inter</SelectItem>
                <SelectItem value="roboto">Roboto</SelectItem>
                <SelectItem value="open-sans">Open Sans</SelectItem>
                <SelectItem value="lato">Lato</SelectItem>
                <SelectItem value="montserrat">Montserrat</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto">Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

