import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // The defaults plus 1280, so the 640px PDP gallery on 2x screens doesn't jump to 1920
    deviceSizes: [640, 750, 828, 1080, 1200, 1280, 1920, 2048, 3840],
    // commercetools sample data images
    remotePatterns: [new URL("https://storage.googleapis.com/**")],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
