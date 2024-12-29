"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    // Force a re-render on mount to ensure theme is applied
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem(props.storageKey || "theme") || props.defaultTheme;
    if (initialTheme) {
      root.classList.remove("light", "dark");
      root.classList.add(initialTheme);
    }
  }, [props.defaultTheme, props.storageKey]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}