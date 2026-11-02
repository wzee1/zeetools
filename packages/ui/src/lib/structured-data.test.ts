import { describe, expect, it } from "vitest";
import { buildLlmsTxt } from "./llms";
import { buildToolJsonLd, serializeJsonLd } from "./structured-data";

const about = {
  heading: "About demo",
  intro: "A demo tool.",
  points: [{ title: "One", body: "First point." }],
  faq: [
    { q: "Is it free?", a: "Yes." },
    { q: "Does it use <script> tags?", a: "No & never." },
  ],
};

const input = {
  name: "demo",
  url: "https://demo.wzee.dev",
  description: "A demo tool.",
  category: "SecurityApplication" as const,
  featureList: ["One thing"],
  image: "https://demo.wzee.dev/og.png",
  source: "https://github.com/wzee1/zeetools/tree/main/apps/demo",
  about,
};

describe("buildToolJsonLd", () => {
  const graph = buildToolJsonLd(input)["@graph"];
  const app = graph[0] as Record<string, unknown>;

  it("describes the tool as a free WebApplication by the site's author", () => {
    expect(app).toMatchObject({
      "@type": "WebApplication",
      name: "demo",
      url: "https://demo.wzee.dev",
      applicationCategory: "SecurityApplication",
      operatingSystem: "Any (web browser)",
      isAccessibleForFree: true,
      offers: { price: "0", priceCurrency: "USD" },
      image: "https://demo.wzee.dev/og.png",
      screenshot: "https://demo.wzee.dev/og.png",
      inLanguage: "en",
      author: { "@id": "https://wzee.dev/#person", name: "Zoltán Farkas", url: "https://wzee.dev" },
      publisher: { "@id": "https://wzee.dev/#person" },
      isPartOf: { "@type": "WebSite", "@id": "https://wzee.dev/#website" },
      codeRepository: input.source,
      sameAs: [input.source],
    });
  });

  it("leaves the repository out when there is no source", () => {
    const bare = buildToolJsonLd({ ...input, source: "" })["@graph"][0] as Record<string, unknown>;
    expect(bare).not.toHaveProperty("codeRepository");
    expect(bare).not.toHaveProperty("sameAs");
  });

  it("builds the FAQPage from exactly the visible FAQ", () => {
    const faq = graph[1] as { "@type": string; mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(faq["@type"]).toBe("FAQPage");
    expect(faq.mainEntity.map((item) => ({ q: item.name, a: item.acceptedAnswer.text }))).toEqual(about.faq);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so no string can close the script tag, and round-trips", () => {
    const data = { text: "</script><img onerror=x>  " };
    const out = serializeJsonLd(data);
    expect(out).not.toContain("<");
    expect(out).not.toContain(" ");
    expect(JSON.parse(out)).toEqual(data);
  });
});

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt({ name: "demo", url: input.url, description: "A demo tool.", about, privacy: ["Stored: nothing."], limits: ["Small."], source: input.source });

  it("follows the llms.txt layout: title, summary, then sections", () => {
    expect(text.startsWith("# demo\n\n> A demo tool.\n\n## What it does")).toBe(true);
    for (const section of ["How it works", "Privacy and data", "Limits", "FAQ", "Links"]) expect(text).toContain(`## ${section}`);
  });

  it("carries every FAQ item and links the other tools but not itself", () => {
    for (const { q, a } of about.faq) expect(text).toContain(`Q: ${q}\nA: ${a}`);
    expect(text).toContain("https://pass.wzee.dev/llms.txt");
    expect(text).toContain("https://wzee.dev/privacy");
    expect(text).toContain(input.source);
  });
});
