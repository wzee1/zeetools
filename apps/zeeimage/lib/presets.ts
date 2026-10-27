import { ProcessOptions } from './processors/strategy';

export interface Preset {
  id: string;
  name: string;
  category: 'web' | 'social' | 'icons';
  description: string;
  options: Partial<ProcessOptions>;
}

export const PRESETS: Preset[] = [
  {
    id: 'web-optimized',
    name: 'Web Optimized (1920w)',
    category: 'web',
    description: 'Max 1920px width, aspect ratio locked, WebP @ 82% quality.',
    options: {
      scaleMode: 'fit-width',
      width: 1920,
      maintainAspectRatio: true,
      format: 'image/webp',
      quality: 82,
      stripMetadata: true,
      filenameTemplate: '[name]-optimized.[ext]',
    },
  },
  {
    id: 'social-story',
    name: 'Story / Reels (1080×1920)',
    category: 'social',
    description: '9:16 vertical ratio tailored for Instagram Reels, TikTok, and Stories.',
    options: {
      scaleMode: 'exact',
      width: 1080,
      height: 1920,
      maintainAspectRatio: false,
      format: 'image/jpeg',
      quality: 85,
      stripMetadata: true,
      filenameTemplate: '[name]-story.[ext]',
    },
  },
  {
    id: 'avatar-square',
    name: 'Avatar / Square (1080×1080)',
    category: 'social',
    description: '1:1 square ratio for profile avatars and feed carousels.',
    options: {
      scaleMode: 'exact',
      width: 1080,
      height: 1080,
      maintainAspectRatio: false,
      format: 'image/webp',
      quality: 85,
      stripMetadata: true,
      filenameTemplate: '[name]-square.[ext]',
    },
  },
  {
    id: 'web-retina',
    name: 'Desktop Retina (2560w)',
    category: 'web',
    description: 'High-density display hero images, WebP 85%.',
    options: {
      scaleMode: 'fit-width',
      width: 2560,
      maintainAspectRatio: true,
      format: 'image/webp',
      quality: 85,
      stripMetadata: true,
      filenameTemplate: '[name]-2560w.[ext]',
    },
  },
  {
    id: 'thumbnail-preview',
    name: 'Compact Thumbnail (480w)',
    category: 'web',
    description: 'Ultra-fast loading preview thumbnail.',
    options: {
      scaleMode: 'fit-width',
      width: 480,
      maintainAspectRatio: true,
      format: 'image/webp',
      quality: 75,
      stripMetadata: true,
      filenameTemplate: '[name]-thumb.[ext]',
    },
  },
  {
    id: 'lossless-archive',
    name: 'Lossless Archive (PNG)',
    category: 'web',
    description: 'Pixel-perfect lossless conversion retaining maximum fidelity.',
    options: {
      scaleMode: 'percentage',
      scale: 1.0,
      format: 'image/png',
      quality: 100,
      lossless: true,
      stripMetadata: false,
      filenameTemplate: '[name]-lossless.[ext]',
    },
  },
];

export const DEFAULT_PROCESS_OPTIONS: ProcessOptions = {
  scaleMode: 'percentage',
  scale: 1.0,
  maintainAspectRatio: true,
  format: 'image/webp',
  quality: 82,
  lossless: false,
  stripMetadata: true,
  filenameTemplate: '[name]-[width]x[height].[ext]',
};
