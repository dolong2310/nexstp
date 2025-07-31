export const DEFAULT_LIMIT = 8;
export const TABLE_LIMIT = 20;
export const PLATFORM_FEE_PERCENTAGE = 10;
export const THROTTLE_INTERVAL_MS = 8; // 8ms to match 120fps

export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

export const defaultConfigTopLoader = {
  color: "#fb64b6",
  initialPosition: 0.08,
  crawlSpeed: 200,
  height: 3,
  crawl: true,
  showSpinner: false,
  easing: "ease",
  speed: 200,
  shadow: "none", // "0 0 10px #fb64b6,0 0 5px #fb64b6",
  template:
    '<div class="bar" role="bar"><div class="peg"></div></div> <div class="spinner" role="spinner"><div class="spinner-icon"></div></div>',
  zIndex: 1600,
  showAtBottom: false,
};
