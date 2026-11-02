import type { ToolAboutContent } from "@zeetools/ui/lib/about";
import { buildFaqJsonLd, buildToolJsonLd } from "@zeetools/ui/lib/structured-data";
import { buildLlmsTxt } from "@zeetools/ui/lib/llms";
import { appUrl, zee } from "@/zee.config";

// The About section, the FAQ structured data and llms.txt all read this, so what a visitor sees is what a crawler gets.
export const about: ToolAboutContent = {
  heading: "About zeepass",
  intro:
    "zeepass is a free tool for sending a password, an API key or a .env file to someone as a link that works once. Your browser encrypts the text with AES-GCM-256 before it leaves your device, and the key stays in the part of the link that browsers never send to a server.",
  points: [
    {
      title: "Encrypted in your browser",
      body: "A random 256-bit key is made on your device and the text is encrypted there. Only the encrypted text is sent to the server.",
    },
    {
      title: "The key stays in the link",
      body: "The key sits after the # in the link. Browsers do not send that part to a server, so the server stores data it cannot decrypt.",
    },
    {
      title: "Gone after one read",
      body: "With burn after first read on (the default), the stored copy is deleted the moment the recipient reveals it. Opening the link alone, or a chat app’s link preview, does not reveal it. Otherwise it is deleted when it expires: after 1 hour, 24 hours or 7 days.",
    },
    {
      title: "No account needed",
      body: "Paste, encrypt, copy the link. There is nothing to sign up for, and the person you send it to only needs a browser.",
    },
  ],
  faq: [
    {
      q: "How do I share a password securely?",
      a: "Paste the password, API key or .env file into the box, choose how long the link should last and press Encrypt & Generate Link. Send the link to the person who needs it. When they open it and press reveal, the text is decrypted in their browser, and by default the stored copy is deleted at that moment.",
    },
    {
      q: "Is my secret stored on your server?",
      a: "Only in encrypted form. The server keeps the encrypted text, its initialization vector and a one-way hash of the key (used to check the key before the text is released), in storage pinned to the EU, until the secret is opened or expires. It never receives the plaintext or the key. This browser also remembers the links you created, in local storage on your device, so you can find them again in the sidebar. You can remove them there.",
    },
    {
      q: "Can anyone else read it, including the server?",
      a: "Not without the full link. The key is in the part of the link after the #, which browsers do not send to servers, so the server holds data it cannot decrypt. Anyone who has the full link can read the secret, so send it only to the person it is meant for and keep burn after first read on.",
    },
    {
      q: "Is it free, and do I need an account?",
      a: "It is free and needs no account or sign-up. A secret can be up to 256 KB. Requests are rate limited per visitor to prevent abuse.",
    },
    {
      q: "Does it work on my phone?",
      a: "Yes. It runs in any modern browser that supports the Web Crypto API, on phones, tablets and desktops. The person who receives the link only needs a browser.",
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
  category: "SecurityApplication",
  featureList: [
    "AES-GCM 256-bit encryption in the browser",
    "Decryption key kept in the URL fragment, never sent to the server",
    "Optional burn after first read, on by default",
    "Expiry after 1 hour, 24 hours or 7 days",
    "Shares passwords, API keys and .env files up to 256 KB",
    "No account or sign-up",
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
    "The text is encrypted in the browser with AES-GCM-256. The server never receives the plaintext or the key.",
    "The key is in the URL fragment (after #) of the share link, which browsers do not send to servers.",
    "The server stores the ciphertext, its initialization vector and a one-way hash of the key, in EU-pinned storage, until the secret is opened (burn after first read, on by default) or expires.",
    "This browser keeps a list of the links you created in local storage on your device; you can remove them from the sidebar.",
    "Anyone with the full link can read the secret.",
  ],
  limits: [
    "Up to 256 KB per secret.",
    "Expiry is 1 hour, 24 hours (default) or 7 days.",
    "Requests are rate limited per visitor.",
    "Needs a modern browser with the Web Crypto API.",
  ],
});

/** The FAQ page's structured data, from the same questions it shows. */
export const faqJsonLd = buildFaqJsonLd({ name: zee.name, url: appUrl, about });
