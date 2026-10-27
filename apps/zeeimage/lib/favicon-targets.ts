import type { FaviconPackageResult } from '@/lib/ico';
import type { ZipEntry } from '@/lib/zip';

/** Where the favicon bundle will be used: a plain site, a Next.js App Router app, or a React (Vite) app. */
export type FaviconTarget = 'html' | 'nextjs' | 'react';

export interface FaviconBundle {
  /** The files of the ZIP, with the folders they belong in. */
  entries: ZipEntry[];
  /** The code to paste: head tags, or app/manifest.ts for Next.js. */
  snippet: string;
}

function file(result: FaviconPackageResult, filename: string): Blob {
  const item = result.items.find((i) => i.filename === filename);
  if (!item) throw new Error(`Missing ${filename} in the favicon package`);
  return item.blob;
}

/**
 * Next.js reads favicon.ico, icon.png and apple-icon.png from app/ and writes the <head> tags itself
 * (file conventions in next/dist/docs: metadata/app-icons, metadata/manifest); the manifest becomes
 * app/manifest.ts, and its Android icons are served from public/.
 */
export function nextManifest(appName: string): string {
  const name = JSON.stringify(appName);
  return `import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ${name},
    short_name: ${name},
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };
}
`;
}

export function buildFaviconBundle(result: FaviconPackageResult, target: FaviconTarget, appName: string): FaviconBundle {
  const flat = result.items.map((item) => ({ name: item.filename, data: item.blob }));

  if (target === 'html') return { entries: flat, snippet: result.htmlSnippet };

  // Vite and Create React App serve public/ from the site root, so the head tags stay the same.
  if (target === 'react') {
    return { entries: flat.map((e) => ({ ...e, name: `public/${e.name}` })), snippet: result.htmlSnippet };
  }

  const manifest = nextManifest(appName);
  return {
    entries: [
      { name: 'app/favicon.ico', data: file(result, 'favicon.ico') },
      { name: 'app/icon.png', data: file(result, 'android-chrome-512x512.png') },
      { name: 'app/apple-icon.png', data: file(result, 'apple-touch-icon.png') },
      { name: 'app/manifest.ts', data: new Blob([manifest], { type: 'text/plain' }) },
      { name: 'public/android-chrome-192x192.png', data: file(result, 'android-chrome-192x192.png') },
      { name: 'public/android-chrome-512x512.png', data: file(result, 'android-chrome-512x512.png') },
    ],
    snippet: manifest,
  };
}
