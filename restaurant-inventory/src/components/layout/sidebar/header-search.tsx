"use client";

import * as React from "react";
import { SearchIcon, X, ClockIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function HeaderSearch() {
  const [focused, setFocused] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [recentSearches] = React.useState([
    "Chicken inventory",
    "Chocolate recipe",
    "Monthly sales report",
  ]);

  // Focus the input when the search icon is clicked
  const handleSearchClick = () => {
    if (!focused) {
      setFocused(true);
      // Use setTimeout to ensure the DOM has updated
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  // Clear the search when the X is clicked
  const handleClear = () => {
    setQuery("");
    setFocused(false);
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", query);
    // Hide dropdown after submit
    setFocused(false);
  };

  // Handle selecting a recent search
  const handleSelectRecent = (search: string) => {
    setQuery(search);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative rounded-md mr-2 transition-all duration-300",
        focused ? "w-56 md:w-72" : "w-9"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-md h-9 transition-all duration-300",
          focused ? "px-3" : "w-9 justify-center"
        )}
      >
        <SearchIcon
          size={16}
          className={cn(
            "text-gray-500 dark:text-gray-400 flex-shrink-0 cursor-pointer",
            focused && "text-primary"
          )}
          onClick={handleSearchClick}
        />

        {focused && (
          <>
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              placeholder="Search inventory, recipes..."
              className="h-9 px-0 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400"
              onBlur={() =>
                query === "" && setTimeout(() => setFocused(false), 100)
              }
            />
            {query && (
              <X
                size={14}
                className="text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                onClick={handleClear}
              />
            )}
          </>
        )}
      </div>

      {/* Recent searches dropdown */}
      {focused && query && (
        <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-950 rounded-md shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden z-10">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 p-2 border-b border-gray-200 dark:border-gray-800">
            Recent Searches
          </div>
          <div className="max-h-48 overflow-y-auto">
            {recentSearches
              .filter((search) =>
                search.toLowerCase().includes(query.toLowerCase())
              )
              .map((search, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex items-center w-full p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 text-left"
                  onClick={() => handleSelectRecent(search)}
                >
                  <ClockIcon size={14} className="mr-2 text-gray-500" />
                  <span>{search}</span>
                </button>
              ))}
            {recentSearches.filter((search) =>
              search.toLowerCase().includes(query.toLowerCase())
            ).length === 0 && (
              <div className="p-2 text-sm text-gray-500">
                No recent searches found
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
