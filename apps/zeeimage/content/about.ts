import type { ToolAboutContent } from "@zeetools/ui/lib/about";
import { buildToolJsonLd } from "@zeetools/ui/lib/structured-data";
import { buildLlmsTxt } from "@zeetools/ui/lib/llms";
import { appUrl, zee } from "@/zee.config";

// The About section, the FAQ structured data and llms.txt all read this, so what a visitor sees is what a crawler gets.
export const about: ToolAboutContent = {
  heading: "About zeeimage",
  intro:
    "zeeimage is a free batch image tool that runs in your browser. Drop in a set of images, resize, convert and compress them to WebP, PNG or JPEG, and download the results as a ZIP. The work is done on your device, so your images are never uploaded.",
  points: [
    {
      title: "Processed on your device",
      body: "Resizing and encoding run in Web Workers inside your browser, several images at a time. No image is sent to a server.",
    },
    {
      title: "Batch pipeline",
      body: "Ingest, configure, process, export. Scale by percentage, width, height or exact size, pick the format and quality, strip or keep metadata, and name the files with a pattern.",
    },
    {
      title: "Favicon studio",
      body: "Make a multi-size .ico, an Apple touch icon and manifest icons from a single image.",
    },
    {
      title: "Social safe zones",
      body: "See where each platform's interface covers your image before you post it.",
    },
  ],
  faq: [
    {
      q: "How do I resize or convert many images at once?",
      a: "Drop the images onto the page, choose a scale, an output format and a quality, and start the batch. When it finishes, download the files one by one or all together as a ZIP. You can compare each result with the original before you download it.",
    },
    {
      q: "Are my images uploaded anywhere?",
      a: "No. Everything runs in your browser, in Web Workers, and the files never leave your device. The page is a static site, so there is no server step that receives your images.",
    },
    {
      q: "Which formats does it support?",
      a: "You can open PNG, JPEG, WebP, AVIF, SVG, BMP and ICO files, and HEIC where your browser can decode it (Safari). It saves WebP, PNG and JPEG, and AVIF only where your browser can encode it.",
    },
    {
      q: "Is it free, and do I need an account?",
      a: "It is free and needs no account or sign-up.",
    },
    {
      q: "Does it work on my phone?",
      a: "Yes, in a modern mobile browser. Large batches of big photos depend on your phone's memory and processing power, since all the work happens on the device.",
    },
    {
      q: "Is it open source?",
      a: `Yes. The code is MIT licensed and published on GitHub: ${zee.source}`,
    },
  ],
};

export const toolJsonLd = buildToolJsonLd({
  name: zee.name,
  url: appUrl,
  description: zee.seo.description,
  category: "MultimediaApplication",
  featureList: [
    "Batch resize, convert and compress images",
    "Outputs WebP, PNG and JPEG, and AVIF where the browser can encode it",
    "Runs in Web Workers in the browser, no upload",
    "Strip or keep EXIF metadata",
    "ZIP download",
    "Favicon studio: multi-size .ico, Apple touch icon, manifest icons",
    "Social safe-zone overlays",
  ],
  image: `${appUrl}/og.png`,
  source: zee.source,
  about,
});

export const llmsTxt = buildLlmsTxt({
  name: zee.name,
  url: appUrl,
  description: zee.seo.description,
  about,
  source: zee.source,
  privacy: [
    "Images are processed in the browser, in Web Workers. They are not uploaded.",
    "The site is a static export: there is no server step that receives your files.",
    "ZIP files are built in memory on your device.",
  ],
  limits: [
    "Input: PNG, JPEG, WebP, AVIF, SVG, BMP, ICO, and HEIC/HEIF where the browser can decode it (Safari).",
    "Output: WebP, PNG and JPEG, and AVIF only where the browser can encode it.",
    "Large batches are limited by the memory and processing power of your device.",
  ],
});
