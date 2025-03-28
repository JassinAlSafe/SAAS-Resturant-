"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="bumblebee"
      enableSystem={true}
      themes={["bumblebee", "dark"]}
    >
      {children}
    </NextThemesProvider>
  );
}
