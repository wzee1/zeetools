import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { unoptimized: true },
  // @zeetools/ui ships TypeScript source.
  transpilePackages: ["@zeetools/ui"],
};

export default nextConfig;
