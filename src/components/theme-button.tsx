"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/contexts/ThemeContext";
import { MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "./ui/button";

const ThemeButton = () => {
  const t = useTranslations();
  const { theme, setTheme } = useTheme();

  const handleToggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="neutral" size="icon" onClick={handleToggleTheme}>
          <MoonIcon className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <SunIcon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">{t("Toggle theme")}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{theme === "dark" ? t("Light mode") : t("Dark mode")}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ThemeButton;
