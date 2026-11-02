import type { MetadataRoute } from "next";
import { zee } from "@/zee.config";

// Prerendered at build time, so the Worker serves it as a static file.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: zee.name,
    short_name: zee.name,
    description: zee.seo.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0c",
    theme_color: "#0b0b0c",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      // The glyph sits well inside the safe zone, and this one is full-bleed so the OS mask never cuts into a transparent corner.
      { src: "/icon-maskable-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
