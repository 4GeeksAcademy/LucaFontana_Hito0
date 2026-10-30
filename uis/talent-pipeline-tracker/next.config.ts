import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/talent-pipeline-tracker",
  experimental: {
    externalDir: true,
  },
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

export default nextConfig;
