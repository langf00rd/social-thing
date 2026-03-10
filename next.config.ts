import withPWA from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {},
  images: {
    remotePatterns: [
      {
        hostname: "img.icons8.com",
      },
    ],
  },
};

const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWAConfig(nextConfig);
