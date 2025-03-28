"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Keyboard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ShortcutProps {
  keys: string[];
  description: string;
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className="flex justify-between items-center py-2.5 text-sm hover:bg-gray-50 px-2 rounded-md -mx-2">
      <span className="text-gray-700">{description}</span>
      <div className="flex gap-1 items-center">
        {keys.map((key, index) => (
          <span key={index}>
            {index > 0 && <span className="text-gray-400 px-1">+</span>}
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-md shadow-sm">
              {key}
            </kbd>
          </span>
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcuts() {
  const [isExpanded, setIsExpanded] = useState(false);

  const basicShortcuts = [
    { keys: ["Alt", "A"], description: "Add new item" },
    { keys: ["Alt", "V"], description: "View first item details" },
    { keys: ["Alt", "P"], description: "Purchase first pending item" },
  ];

  const advancedShortcuts = [
    { keys: ["Tab"], description: "Navigate through interactive elements" },
    { keys: ["Space"], description: "Select/toggle checkboxes" },
    { keys: ["Enter"], description: "Activate buttons or confirm actions" },
    { keys: ["Esc"], description: "Close any modal or dialog" },
    { keys: ["↑", "↓"], description: "Navigate through list items" },
  ];

  return (
    <Card className="bg-white shadow-md rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="bg-blue-50 rounded-full p-1.5">
          <Keyboard className="h-4 w-4 text-blue-500" />
        </div>
        <h3 className="text-sm font-medium text-gray-800">
          Keyboard Shortcuts
        </h3>
      </div>

      <div className="divide-y divide-gray-100">
        {basicShortcuts.map((shortcut, i) => (
          <Shortcut
            key={i}
            keys={shortcut.keys}
            description={shortcut.description}
          />
        ))}
      </div>

      {isExpanded && (
        <div className="divide-y divide-gray-100 mt-2 pt-2 border-t border-gray-100">
          {advancedShortcuts.map((shortcut, i) => (
            <Shortcut
              key={i}
              keys={shortcut.keys}
              description={shortcut.description}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1.5 w-full justify-center mt-3 py-2 rounded-md text-sm font-medium",
          "bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
        )}
      >
        {isExpanded ? (
          <>
            <span>Show less</span>
            <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            <span>Show more</span>
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>
    </Card>
  );
}
