"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSidebarStore } from "@/lib/stores/sidebar-store";
import { cn } from "@/lib/utils";
import useSafeMediaQueries from "@/hooks/use-media-query";
import { useRouter } from "next/navigation";

export function HeaderSearch() {
  const { isOpen } = useSidebarStore();
  const { isMobile, isTablet } = useSafeMediaQueries();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle keyboard shortcut for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <form
      onSubmit={handleSearch}
      className={cn(
        "px-3 py-2",
        !isOpen && !isMobile && !isTablet && "flex justify-center"
      )}
    >
      <div className="relative">
        {isOpen || isMobile || isTablet ? (
          <>
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search..."
              className={cn(
                "pl-8 h-8 bg-muted/40 border-muted",
                "w-full text-sm",
                "placeholder:text-muted-foreground/50"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.focus()}
            className="h-8 w-8 rounded-md bg-muted/40 flex items-center justify-center"
            aria-label="Search (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground/50" />
          </button>
        )}
      </div>
    </form>
  );
}
