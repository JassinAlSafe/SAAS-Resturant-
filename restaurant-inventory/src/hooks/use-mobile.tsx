"use client";

import * as React from "react";

// Breakpoints aligned with Tailwind's default breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

/**
 * Hook to detect if the current viewport is mobile-sized
 * @returns boolean indicating if the viewport is mobile-sized
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Set initial value
    setIsMobile(window.innerWidth < BREAKPOINTS.md);

    // Add event listener for window resize
    const handleResize = () => {
      setIsMobile(window.innerWidth < BREAKPOINTS.md);
    };

    window.addEventListener("resize", handleResize);

    // Clean up event listener
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

/**
 * Hook to detect the current viewport size based on breakpoints
 * @returns object with boolean values for each breakpoint
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = React.useState({
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
  });

  React.useEffect(() => {
    // Function to update breakpoints
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoint({
        isSm: width >= BREAKPOINTS.sm,
        isMd: width >= BREAKPOINTS.md,
        isLg: width >= BREAKPOINTS.lg,
        isXl: width >= BREAKPOINTS.xl,
        is2xl: width >= BREAKPOINTS["2xl"],
      });
    };

    // Set initial values
    updateBreakpoints();

    // Add event listener for window resize
    window.addEventListener("resize", updateBreakpoints);

    // Clean up event listener
    return () => window.removeEventListener("resize", updateBreakpoints);
  }, []);

  return breakpoint;
}
