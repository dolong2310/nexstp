import * as React from "react";

export enum MediaQuerySizes {
  XS = 416,
  SM = 640,
  MD = 768,
  LG = 1024,
  XL = 1280,
  "2XL" = 1536,
}

export type Breakpoint =
  | "mobile"
  | "tablet"
  | "desktop"
  | "desktop-lg"
  | "desktop-xl";

interface BreakpointState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isDesktopLg: boolean;
  isDesktopXl: boolean;
  currentBreakpoint: Breakpoint;
}

/**
 * Custom hook to check current breakpoint
 * @returns {BreakpointState} Object containing breakpoint flags and current breakpoint name
 *
 * Breakpoint definitions:
 * - mobile: width < 768px (XS, SM)
 * - tablet: 768px <= width < 1024px (MD)
 * - desktop: 1024px <= width < 1280px (LG)
 * - desktop-lg: 1280px <= width < 1536px (XL)
 * - desktop-xl: width >= 1536px (2XL)
 */
export function useBreakpoints(): BreakpointState {
  const [breakpoints, setBreakpoints] = React.useState<BreakpointState>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isDesktopLg: false,
    isDesktopXl: false,
    currentBreakpoint: "mobile",
  });

  React.useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;

      const isMobile = width < MediaQuerySizes.MD;
      const isTablet =
        width >= MediaQuerySizes.MD && width < MediaQuerySizes.LG;
      const isDesktop =
        width >= MediaQuerySizes.LG && width < MediaQuerySizes.XL;
      const isDesktopLg =
        width >= MediaQuerySizes.XL && width < MediaQuerySizes["2XL"];
      const isDesktopXl = width >= MediaQuerySizes["2XL"];

      let currentBreakpoint: Breakpoint = "mobile";
      if (isDesktopXl) {
        currentBreakpoint = "desktop-xl";
      } else if (isDesktopLg) {
        currentBreakpoint = "desktop-lg";
      } else if (isDesktop) {
        currentBreakpoint = "desktop";
      } else if (isTablet) {
        currentBreakpoint = "tablet";
      }

      setBreakpoints({
        isMobile,
        isTablet,
        isDesktop,
        isDesktopLg,
        isDesktopXl,
        currentBreakpoint,
      });
    };

    // Initial check
    updateBreakpoints();

    // Listen for resize events
    window.addEventListener("resize", updateBreakpoints);

    return () => window.removeEventListener("resize", updateBreakpoints);
  }, []);

  return breakpoints;
}

/**
 * Check if current screen is mobile (width < 768px)
 */
export function useIsMobile() {
  const { isMobile } = useBreakpoints();
  return isMobile;
}

/**
 * Check if current screen is tablet (768px <= width < 1024px)
 */
export function useIsTablet() {
  const { isTablet } = useBreakpoints();
  return isTablet;
}

/**
 * Check if current screen is desktop or larger (width >= 1024px)
 */
export function useIsDesktop() {
  const { isDesktop, isDesktopLg, isDesktopXl } = useBreakpoints();
  return isDesktop || isDesktopLg || isDesktopXl;
}

/**
 * Check if current screen is large desktop or larger (width >= 1280px)
 */
export function useIsDesktopLg() {
  const { isDesktopLg, isDesktopXl } = useBreakpoints();
  return isDesktopLg || isDesktopXl;
}

/**
 * Check if current screen is extra large desktop (width >= 1536px)
 */
export function useIsDesktopXl() {
  const { isDesktopXl } = useBreakpoints();
  return isDesktopXl;
}

/**
 * Get the current breakpoint name
 */
export function useCurrentBreakpoint() {
  const { currentBreakpoint } = useBreakpoints();
  return currentBreakpoint;
}
