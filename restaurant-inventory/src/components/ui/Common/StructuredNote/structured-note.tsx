"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { ChevronUp, Calendar, MoreVertical } from "lucide-react";

export interface StructuredNoteProps {
  title: string;
  authorName?: string;
  date?: Date | string;
  content: React.ReactNode;
  isCollapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  onMoreClick?: () => void;
  renderActions?: () => React.ReactNode;
}

const StructuredNote = React.forwardRef<HTMLDivElement, StructuredNoteProps>(
  (
    {
      title,
      authorName,
      date,
      content,
      isCollapsible = false,
      defaultCollapsed = false,
      className,
      onMoreClick,
      renderActions,
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

    const toggleCollapse = () => {
      if (isCollapsible) {
        setIsCollapsed(!isCollapsed);
      }
    };

    const formattedDate = date
      ? typeof date === "string"
        ? date
        : new Intl.DateTimeFormat("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }).format(date)
      : null;

    return (
      <div
        ref={ref}
        className={cn(
          "bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden rounded-lg",
          className
        )}
      >
        {/* Header with author and date */}
        <div className="flex items-center justify-between p-4 pb-4 border-b border-gray-200">
          <div className="flex items-center">
            {isCollapsible && (
              <button
                onClick={toggleCollapse}
                className="flex items-center justify-center mr-2"
                aria-label={isCollapsed ? "Expand note" : "Collapse note"}
              >
                <ChevronUp
                  className={cn(
                    "h-6 w-6 text-gray-600 transition-transform",
                    isCollapsed && "rotate-180"
                  )}
                  strokeWidth={1.5}
                />
              </button>
            )}
            <div className="flex items-center">
              <span className="text-gray-600 text-base font-normal">
                Note by
              </span>
              {authorName && (
                <span
                  className={cn(
                    "ml-2 text-base px-3 py-1 rounded-md font-medium",
                    className?.includes("author-tag-orange")
                      ? "bg-orange-500 text-white"
                      : "bg-purple-600 bg-opacity-10 text-purple-700"
                  )}
                >
                  {authorName}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {formattedDate && (
              <div className="flex items-center text-base text-gray-500">
                <Calendar className="w-5 h-5 mr-2" strokeWidth={1.5} />
                <span>{formattedDate}</span>
              </div>
            )}

            {onMoreClick && (
              <button
                onClick={onMoreClick}
                className="flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 transition-colors"
                aria-label="More options"
              >
                <MoreVertical
                  className="h-6 w-6 text-gray-500"
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>
        </div>

        {/* Note content - conditionally collapsed */}
        <div
          className={cn(
            "transition-all duration-300",
            isCollapsed ? "max-h-0 overflow-hidden p-0" : "p-4"
          )}
        >
          {/* Title */}
          {title && (
            <div className="mb-2">
              <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
            </div>
          )}

          {/* Content */}
          <div className="text-gray-600 space-y-4">
            {typeof content === "string" ? (
              <div className="whitespace-pre-line text-lg leading-relaxed">
                {content}
              </div>
            ) : (
              content
            )}
          </div>

          {/* Actions */}
          {renderActions && <div className="mt-4">{renderActions()}</div>}
        </div>
      </div>
    );
  }
);

StructuredNote.displayName = "StructuredNote";

export { StructuredNote };
