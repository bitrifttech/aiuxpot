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
    const root = window.document.documentElement;
    const initialTheme = localStorage.getItem(props.storageKey || "theme") || props.defaultTheme;
    
    if (initialTheme) {
      // Remove any existing theme classes
      root.classList.remove("light", "dark", "system");
      
      // If system theme, detect preferred color scheme
      if (initialTheme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(initialTheme);
      }
      
      // Store the theme
      localStorage.setItem(props.storageKey || "theme", initialTheme);
      console.log("Theme initialized:", initialTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (localStorage.getItem(props.storageKey || "theme") === "system") {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
        console.log("System theme changed:", e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [props.defaultTheme, props.storageKey]);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}