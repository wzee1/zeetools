// The only file a new zee app needs to edit to rebrand the starter.
export const zee = {
  name: "zeecall",
  slug: "call", // served at call.wzee.dev
  description: "Zero-account, encrypted, browser-to-browser P2P video calling, 4K screen sharing, and direct WebRTC file dropping.",
  // The rest is for the list on wzee.dev/tools, which reads it from /zee.json (app/zee.json/route.ts).
  year: "2026",
  status: "live" as "live" | "beta" | "in-progress",
  // Hungarian name and description; whatever is left out shows in English.
  translations: {
    hu: { description: "Titkosított, böngészők közötti közvetlen videohívás, 4K képernyőmegosztás és fájlküldés - regisztráció nélkül." },
  } as { hu?: { name?: string; description?: string } },
  // This app's code, shown as a "Source" link on wzee.dev/tools; empty shows none.
  source: "https://github.com/wzee1/zeetools/tree/main/apps/zeecall" as string,
  hub: "https://wzee.dev",
  localOnly: true, // shows the privacy badge in the header
} as const;

export const appUrl = `https://${zee.slug}.wzee.dev`;
