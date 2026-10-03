import type { NextConfig } from "next";
const config: NextConfig = {
  output: "export",
  assetPrefix: process.env.NODE_ENV === "production" ? "/assets/v0.2.1" : undefined,
  allowedDevOrigins: ["terminal.local"],
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
};
export default config;
