import type { ToolAboutContent } from "@zeetools/ui/lib/about";
import { buildFaqJsonLd, buildToolJsonLd } from "@zeetools/ui/lib/structured-data";
import { buildLlmsTxt } from "@zeetools/ui/lib/llms";
import { appUrl, zee } from "@/zee.config";

// The About section, the FAQ structured data and llms.txt all read this, so what a visitor sees is what a crawler gets.
export const about: ToolAboutContent = {
  heading: "About zeecall",
  intro:
    "zeecall is a free tool for video calls, screen sharing and file transfer straight between browsers. Create a room, share its link and talk: there is no account and nothing to install. Audio, video and files go directly between the people in the call.",
  points: [
    {
      title: "Peer to peer",
      body: "Calls use WebRTC. Audio, video and files travel directly between browsers and are encrypted in transit (DTLS-SRTP), without passing through a media server.",
    },
    {
      title: "What the server sees",
      body: "A small signaling server relays the connection handshake, so it sees the room ID, your display name and your IP address (from the connection and the network candidates it passes on). Google's STUN server also sees your IP address, as WebRTC needs.",
    },
    {
      title: "Screen share and files",
      body: "Share your screen with system audio, up to 4K at 60 fps where your browser and hardware allow. Drop a file into the call to send it directly to the other person.",
    },
    {
      title: "No account",
      body: "Rooms are made on the spot from a link. Your display name is kept for the browser tab only.",
    },
  ],
  faq: [
    {
      q: "How do I start a video call without an account?",
      a: "Open the page and press Create Private Room, or type your own room name. Allow the camera and microphone, join, and send the link in the address bar to the person you want to talk to. When they open it they land in the same room.",
    },
    {
      q: "Is the call private?",
      a: "Audio, video and files go directly between the browsers in the call over WebRTC, encrypted in transit, and do not pass through a server. To connect you, a signaling server relays the room ID, your display name and the network candidates that contain your IP address, and Google's STUN server sees your IP address too. No call content is stored. The rooms you open are listed in this browser's local storage, so you can find them in the sidebar; you can remove them there.",
    },
    {
      q: "Can I share my screen or send files?",
      a: "Yes. Screen sharing includes system audio and goes up to 4K at 60 fps where your browser and hardware allow it. Files are sent directly to the other person over a WebRTC data channel, in 64 KB chunks.",
    },
    {
      q: "Is it free, and do I need to install anything?",
      a: "It is free. There is no account, sign-up or install: it runs in a modern web browser.",
    },
    {
      q: "Does it work on my phone?",
      a: "It runs in modern mobile browsers that support WebRTC, and the page adapts to small screens. Screen sharing depends on what your phone's browser allows.",
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
  category: "CommunicationApplication",
  featureList: [
    "Browser-to-browser video calls over WebRTC",
    "Audio and video encrypted in transit, no media server",
    "Screen sharing with system audio, up to 4K at 60 fps where supported",
    "File transfer over a WebRTC data channel",
    "Shared notes with Markdown export",
    "No account or install",
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
    "Audio, video and files travel directly between browsers over WebRTC (DTLS-SRTP and SCTP), not through a media server.",
    "A signaling server relays the connection handshake (offer, answer and ICE candidates). It sees the room ID, a session peer ID, your display name and your IP address, both from the connection and from the ICE candidates, and keeps them in memory only.",
    "The rooms you open are listed in this browser's local storage (the sidebar's \"On this device\" list); you can remove them there.",
    "Google's public STUN server sees your IP address, as WebRTC needs to connect browsers.",
    "The room ID in the page URL is in the fragment (#room=...), which browsers do not send to the site's server.",
    "No account is needed. The display name is kept in session storage and cleared when the tab closes.",
  ],
  limits: [
    "Needs a modern browser with WebRTC, a camera and microphone for video.",
    "Screen sharing goes up to 4K at 60 fps where the browser and hardware allow it.",
    "Files are sent in 64 KB chunks over a WebRTC data channel.",
    "There is no relay (TURN) server, so a call may not connect when a strict firewall or network blocks direct connections between the two browsers.",
  ],
});

/** The FAQ page's structured data, from the same questions it shows. */
export const faqJsonLd = buildFaqJsonLd({ name: zee.name, url: appUrl, about });
