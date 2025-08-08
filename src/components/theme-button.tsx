"use client";

import React from "react";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const ThemeButton = () => {
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button variant="neutral" size="icon" onClick={handleToggleTheme}>
      <MoonIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <SunIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeButton;
