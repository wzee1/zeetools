import type { ToolAboutContent } from "./about";

// The three free tools, for the links section of each llms.txt.
const TOOLS = [
  { name: "zeepass", url: "https://pass.wzee.dev", blurb: "share a password or .env file as a one-time, encrypted link" },
  { name: "zeeimage", url: "https://image.wzee.dev", blurb: "resize, convert and compress images in bulk in the browser" },
  { name: "zeecall", url: "https://call.wzee.dev", blurb: "peer-to-peer video calls, screen sharing and file transfer without an account" },
];

export interface LlmsInput {
  name: string;
  url: string;
  /** The one-paragraph summary shown under the title. */
  description: string;
  about: ToolAboutContent;
  /** What happens to the user's data, one plain sentence each. */
  privacy: string[];
  /** Size, time and browser limits, one plain sentence each. */
  limits: string[];
  source?: string;
}

/** The tool's llms.txt (llmstxt.org): a title, a summary and plain sections, generated from the same copy as the About section. */
export function buildLlmsTxt(input: LlmsInput): string {
  const { name, url, description, about, privacy, limits, source } = input;
  const links = [
    `- [${name}](${url}): the tool`,
    `- [FAQ](${url}/faq): about ${name} and the questions people ask`,
    ...(source ? [`- [Source code](${source}): open source on GitHub`] : []),
    "- [Privacy notice](https://wzee.dev/privacy): the privacy policy for all wzee.dev tools",
    "- [Zoltán Farkas, wzee.dev](https://wzee.dev): the author",
    ...TOOLS.filter((tool) => tool.url !== url).map((tool) => `- [${tool.name}](${tool.url}/llms.txt): ${tool.blurb}`),
  ];
  return [
    `# ${name}`,
    `> ${description}`,
    `## What it does\n\n${about.intro}`,
    `## How it works\n\n${about.points.map((point) => `- ${point.title}: ${point.body}`).join("\n")}`,
    `## Privacy and data\n\n${privacy.map((line) => `- ${line}`).join("\n")}`,
    `## Limits\n\n${limits.map((line) => `- ${line}`).join("\n")}`,
    `## FAQ\n\n${about.faq.map(({ q, a }) => `Q: ${q}\nA: ${a}`).join("\n\n")}`,
    `## Links\n\n${links.join("\n")}`,
  ].join("\n\n") + "\n";
}
