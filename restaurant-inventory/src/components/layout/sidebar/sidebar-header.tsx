"use client";

import * as React from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MonitorIcon,
  TabletIcon,
  BookOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

export function SidebarHeader() {
  const { isOpen, toggle } = useSidebarStore();
  const [condensed, setCondensed] = React.useState(false);
  const [currentDate] = React.useState(
    new Date().toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  );

  const toggleDensity = () => {
    setCondensed(!condensed);
    // Here you would apply density changes to the entire sidebar
    document.documentElement.style.setProperty(
      "--sidebar-item-height",
      !condensed ? "2.5rem" : "3rem"
    );
  };

  return (
    <div className="relative flex items-center justify-between border-b px-4 py-2">
      <div className="flex items-center gap-2">
        {isOpen ? (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <BookOpenIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">ShelfWise</span>
              <span className="text-xs text-muted-foreground">
                {currentDate}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpenIcon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {isOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDensity}
            className="h-8 w-8"
          >
            {condensed ? (
              <MonitorIcon className="h-4 w-4" />
            ) : (
              <TabletIcon className="h-4 w-4" />
            )}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8"
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? (
            <ChevronLeftIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
