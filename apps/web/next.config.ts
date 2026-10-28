import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: (process.env.DEV_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean),
};

export default nextConfig;
