// The app's identity: the name and links the shared components read through <ZeeProvider>, and the
// listing wzee.dev shows for it.
export const zee = {
  name: "zeepass",
  slug: "pass", // served at pass.wzee.dev
  description: "Ephemeral, self-destructing credential and .env secret sharing with client-side AES-GCM 256-bit encryption.",
  // The rest is for the list on wzee.dev/tools, which reads it from /zee.json (app/zee.json/route.ts).
  year: "2026",
  status: "live" as "live" | "beta" | "in-progress",
  // Hungarian name and description; whatever is left out shows in English.
  translations: {
    hu: { description: "Önmegsemmisítő belépési adatok és .env fájlok biztonságos megosztása, kliensoldali 256 bites AES-GCM titkosítással." },
  } as { hu?: { name?: string; description?: string } },
  // This app's code, shown as a "Source" link on wzee.dev/tools; empty shows none.
  source: "https://github.com/wzee1/zeetools/tree/main/apps/zeepass" as string,
  hub: "https://wzee.dev",
  localOnly: true, // shows the privacy badge in the header
  privacy: {
    label: "Zero-Knowledge",
    tooltip: "Zero-Knowledge: Encrypted in your browser with AES-GCM-256. Click to view Privacy & GDPR notice.",
    srLabel: "Zero-Knowledge Privacy",
  },
} as const;

export const appUrl = `https://${zee.slug}.wzee.dev`;
