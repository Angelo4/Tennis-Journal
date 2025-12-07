import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for Azure App Service deployment
};

export default nextConfig;
