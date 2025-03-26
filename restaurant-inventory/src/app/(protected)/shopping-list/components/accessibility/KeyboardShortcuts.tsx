"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Keyboard } from "lucide-react";

interface ShortcutProps {
  keys: string[];
  description: string;
}

function Shortcut({ keys, description }: ShortcutProps) {
  return (
    <div className="flex justify-between items-center py-2 text-sm">
      <span className="text-gray-700">{description}</span>
      <div className="flex gap-1 items-center">
        {keys.map((key, index) => (
          <span key={index}>
            {index > 0 && <span className="text-gray-400 px-1">+</span>}
            <kbd className="kbd kbd-sm">{key}</kbd>
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
    <div className="card bg-base-100 shadow-lg p-3">
      <div className="flex items-center gap-2 mb-1">
        <Keyboard className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-medium">Keyboard Shortcuts</h3>
      </div>

      <div className="divide-y">
        {basicShortcuts.map((shortcut, i) => (
          <Shortcut
            key={i}
            keys={shortcut.keys}
            description={shortcut.description}
          />
        ))}
      </div>

      {isExpanded && (
        <div className="divide-y mt-2 pt-2 border-t">
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
        className="flex items-center gap-1 text-primary text-sm mt-2 w-full justify-center"
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
    </div>
  );
}
