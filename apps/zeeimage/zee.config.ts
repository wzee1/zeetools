// The only file a new zee app needs to edit to rebrand the starter.
export const zee = {
  name: "zeeimage",
  slug: "image", // served at image.wzee.dev
  description: "A local-first, privacy-focused batch image processing suite.",
  // The rest is for the list on wzee.dev/tools, which reads it from /zee.json (app/zee.json/route.ts).
  year: "2026",
  status: "live" as "live" | "beta" | "in-progress",
  // Hungarian name and description; whatever is left out shows in English.
  translations: {
    hu: { description: "Biztonságos, közvetlenül a böngészőben futó tömeges képszerkesztő." },
  } as { hu?: { name?: string; description?: string } },
  // This app's code, shown as a "Source" link on wzee.dev/tools; empty shows none.
  source: "https://github.com/wzee1/zeetools/tree/main/apps/zeeimage" as string,
  hub: "https://wzee.dev",
  localOnly: true, // shows the privacy badge in the header
} as const;

export const appUrl = `https://${zee.slug}.wzee.dev`;
