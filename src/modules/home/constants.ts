export const DEFAULT_BG_COLOR = { light: "#F5F5F5", dark: "#1A1A1A" } as const;
export type ThemeMode = keyof typeof DEFAULT_BG_COLOR;
