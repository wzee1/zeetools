import { describe, expect, it } from 'vitest';
import type { FaviconPackageResult } from './ico';
import { buildFaviconBundle, nextManifest } from './favicon-targets';

const names = [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'android-chrome-192x192.png',
  'android-chrome-512x512.png',
  'site.webmanifest',
];

const pkg: FaviconPackageResult = {
  items: names.map((filename) => ({ filename, blob: new Blob([filename]), mimeType: 'application/octet-stream' })),
  manifestJson: '{}',
  htmlSnippet: '<link rel="icon" href="/favicon.ico" sizes="any">',
};

const text = (blob: Uint8Array | Blob) => (blob as Blob).text();

describe('buildFaviconBundle', () => {
  it('keeps the flat package and the head tags for plain HTML', () => {
    const bundle = buildFaviconBundle(pkg, 'html', 'App');
    expect(bundle.entries.map((e) => e.name)).toEqual(names);
    expect(bundle.snippet).toBe(pkg.htmlSnippet);
  });

  it('puts every file in public/ for React, with the same head tags', () => {
    const bundle = buildFaviconBundle(pkg, 'react', 'App');
    expect(bundle.entries.map((e) => e.name)).toEqual(names.map((n) => `public/${n}`));
    expect(bundle.snippet).toBe(pkg.htmlSnippet);
  });

  it('uses the Next.js app/ file conventions and a manifest.ts', async () => {
    const bundle = buildFaviconBundle(pkg, 'nextjs', 'App');
    const byName = new Map(bundle.entries.map((e) => [e.name, e.data]));
    expect([...byName.keys()]).toEqual([
      'app/favicon.ico',
      'app/icon.png',
      'app/apple-icon.png',
      'app/manifest.ts',
      'public/android-chrome-192x192.png',
      'public/android-chrome-512x512.png',
    ]);
    expect(await text(byName.get('app/icon.png')!)).toBe('android-chrome-512x512.png');
    expect(await text(byName.get('app/apple-icon.png')!)).toBe('apple-touch-icon.png');
    expect(await text(byName.get('app/manifest.ts')!)).toBe(bundle.snippet);
    expect(bundle.snippet).toContain("import type { MetadataRoute } from 'next';");
  });
});

describe('nextManifest', () => {
  it('quotes the app name safely', () => {
    expect(nextManifest('Bob\'s "App"')).toContain('name: "Bob\'s \\"App\\"",');
  });
});
