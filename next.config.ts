import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.ciderboi.xyz" }],
        destination: "https://ciderboi.xyz/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [60, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.amuse.io",
        pathname: "/**",
      },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
