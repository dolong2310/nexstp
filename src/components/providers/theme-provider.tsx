import { ThemeProvider as Provider } from "@/contexts/ThemeContext";
import { ThemeMode } from "@/types";
import { cookies } from "next/headers";
import React from "react";

const ThemeProvider = async ({ children }: { children: React.ReactNode }) => {
  const getTheme = async () => {
    const cookieStore = await cookies();
    return cookieStore.get("theme")?.value as ThemeMode | undefined;
  };
  const defaultTheme = await getTheme();

  return <Provider defaultTheme={defaultTheme}>{children}</Provider>;
};

export default ThemeProvider;
