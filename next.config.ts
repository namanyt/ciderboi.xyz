import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const devNextConfig = withBundleAnalyzer({});

// export default nextConfig;
export default devNextConfig;
