import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { unoptimized: true },
  // @zeetools/ui ships TypeScript source.
  transpilePackages: ["@zeetools/ui"],
  // The other tools get this header from Cloudflare Pages; zeepass is a Worker, so it sets it itself.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }],
      },
    ];
  },
};

export default nextConfig;
