"use client";

import { ThemeMode } from "@/types";
import Cookies from "js-cookie";
import { createContext, useContext, useEffect, useState } from "react";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme: ThemeMode | undefined;
}

type ThemeContextType = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children, defaultTheme }: ThemeProviderProps) {
  const savedTheme = Cookies.get("theme") as ThemeMode;
  const [theme, setTheme] = useState<ThemeMode>(
    defaultTheme ?? savedTheme ?? "light"
  );

  useEffect(() => {
    const html = document.documentElement;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      Cookies.set("theme", theme, { expires: 365 }); // set initial default theme
    }

    if (savedTheme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
      html.style.colorScheme = "dark";
      html.setAttribute("data-theme", "dark"); // Set data-theme attribute
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
      html.style.colorScheme = "light";
      html.setAttribute("data-theme", "light"); // Set data-theme attribute
    }
  }, []);

  const handleSetTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    Cookies.set("theme", newTheme, { expires: 365 }); // Store for a year

    const html = document.documentElement;

    if (newTheme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
      html.style.colorScheme = "dark";
      html.setAttribute("data-theme", "dark"); // Set data-theme attribute
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
      html.style.colorScheme = "light";
      html.setAttribute("data-theme", "light"); // Set data-theme attribute
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
