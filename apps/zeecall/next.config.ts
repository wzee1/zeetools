import type { NextConfig } from "next";

// Static export: zee apps run entirely in the browser and deploy as plain files.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // @zeetools/ui ships TypeScript source.
  transpilePackages: ["@zeetools/ui"],
};

export default nextConfig;
