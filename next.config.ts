import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "nexstp.store",
        port: "",
        pathname: "/api/**",
        search: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/api/**",
        search: "",
      },
    ],
  },
};

export default withPayload(nextConfig);
