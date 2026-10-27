/**
 * Multi-resolution Windows ICO Binary Encoder & Favicon Package Generator.
 * Encodes multiple PNG streams into a standard Windows .ico container entirely in memory.
 */
import { isSvgFile, rasterizeSvg } from '@/lib/svg';

export interface IcoImageLayer {
  width: number;
  height: number;
  pngData: Uint8Array;
}

/**
 * Encodes an array of PNG images into a standard Windows .ico binary buffer.
 */
export function encodeIco(layers: IcoImageLayer[]): Uint8Array {
  const count = layers.length;
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * count;

  let totalSize = offset;
  for (const layer of layers) {
    totalSize += layer.pngData.byteLength;
  }

  const buffer = new Uint8Array(totalSize);
  const view = new DataView(buffer.buffer);

  // ICONDIR header
  view.setUint16(0, 0, true); // Reserved (0)
  view.setUint16(2, 1, true); // Type 1 = ICO
  view.setUint16(4, count, true); // Image count

  // Write Directory Entries
  for (let i = 0; i < count; i++) {
    const layer = layers[i];
    const entryOffset = headerSize + i * entrySize;
    const widthByte = layer.width >= 256 ? 0 : layer.width;
    const heightByte = layer.height >= 256 ? 0 : layer.height;

    view.setUint8(entryOffset + 0, widthByte);
    view.setUint8(entryOffset + 1, heightByte);
    view.setUint8(entryOffset + 2, 0); // Color palette count (0 for 32bpp)
    view.setUint8(entryOffset + 3, 0); // Reserved
    view.setUint16(entryOffset + 4, 1, true); // Color planes
    view.setUint16(entryOffset + 6, 32, true); // Bits per pixel
    view.setUint32(entryOffset + 8, layer.pngData.byteLength, true); // Byte size
    view.setUint32(entryOffset + 12, offset, true); // Image data offset

    // Copy PNG data into body
    buffer.set(layer.pngData, offset);
    offset += layer.pngData.byteLength;
  }

  return buffer;
}

/**
 * Renders an image source to a specific width/height PNG Uint8Array.
 */
async function renderPngLayer(
  imageSource: CanvasImageSource,
  width: number,
  height: number
): Promise<Uint8Array> {
  const canvas =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : Object.assign(document.createElement('canvas'), { width, height });

  const ctx = canvas.getContext('2d') as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;

  if (!ctx) throw new Error('Could not get 2D rendering context');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(imageSource, 0, 0, width, height);

  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' });
  } else {
    blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Canvas export failed'))), 'image/png');
    });
  }

  const arrayBuffer = await blob.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

interface FaviconPackageItem {
  filename: string;
  blob: Blob;
  mimeType: string;
}

export interface FaviconPackageResult {
  items: FaviconPackageItem[];
  manifestJson: string;
  htmlSnippet: string;
}

export async function generateFaviconPackage(
  file: File,
  appName: string = 'My Web App'
): Promise<FaviconPackageResult> {
  // An SVG is drawn at the largest target size so every smaller layer stays crisp.
  const bitmap: CanvasImageSource = isSvgFile(file) ? await rasterizeSvg(file, 512) : await createImageBitmap(file);

  // Generate multi-res layers for .ico
  const [png16, png32, png48, png180, png192, png512] = await Promise.all([
    renderPngLayer(bitmap, 16, 16),
    renderPngLayer(bitmap, 32, 32),
    renderPngLayer(bitmap, 48, 48),
    renderPngLayer(bitmap, 180, 180),
    renderPngLayer(bitmap, 192, 192),
    renderPngLayer(bitmap, 512, 512),
  ]);

  const icoBuffer = encodeIco([
    { width: 16, height: 16, pngData: png16 },
    { width: 32, height: 32, pngData: png32 },
    { width: 48, height: 48, pngData: png48 },
  ]);

  const manifest = {
    name: appName,
    short_name: appName,
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  };

  const manifestJson = JSON.stringify(manifest, null, 2);

  const htmlSnippet = `<!-- Favicon & App Icons -->
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  const items: FaviconPackageItem[] = [
    { filename: 'favicon.ico', blob: new Blob([icoBuffer as Uint8Array<ArrayBuffer>], { type: 'image/x-icon' }), mimeType: 'image/x-icon' },
    { filename: 'favicon-16x16.png', blob: new Blob([png16 as Uint8Array<ArrayBuffer>], { type: 'image/png' }), mimeType: 'image/png' },
    { filename: 'favicon-32x32.png', blob: new Blob([png32 as Uint8Array<ArrayBuffer>], { type: 'image/png' }), mimeType: 'image/png' },
    { filename: 'apple-touch-icon.png', blob: new Blob([png180 as Uint8Array<ArrayBuffer>], { type: 'image/png' }), mimeType: 'image/png' },
    { filename: 'android-chrome-192x192.png', blob: new Blob([png192 as Uint8Array<ArrayBuffer>], { type: 'image/png' }), mimeType: 'image/png' },
    { filename: 'android-chrome-512x512.png', blob: new Blob([png512 as Uint8Array<ArrayBuffer>], { type: 'image/png' }), mimeType: 'image/png' },
    { filename: 'site.webmanifest', blob: new Blob([manifestJson], { type: 'application/manifest+json' }), mimeType: 'application/manifest+json' },
  ];

  return {
    items,
    manifestJson,
    htmlSnippet,
  };
}
