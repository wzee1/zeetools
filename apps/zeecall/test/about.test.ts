import { describe, expect, it } from "vitest";
import { about, llmsTxt, toolJsonLd } from "@/content/about";
import { appUrl, zee } from "@/zee.config";

describe("zeecall About content", () => {
  it("has an intro, 3 to 4 points and 4 to 6 FAQ items, all filled in", () => {
    expect(about.heading).toContain(zee.name);
    expect(about.intro.length).toBeGreaterThan(40);
    expect(about.points.length).toBeGreaterThanOrEqual(3);
    expect(about.points.length).toBeLessThanOrEqual(4);
    expect(about.faq.length).toBeGreaterThanOrEqual(4);
    expect(about.faq.length).toBeLessThanOrEqual(6);
    for (const { q, a } of about.faq) {
      expect(q.endsWith("?")).toBe(true);
      expect(a.length).toBeGreaterThan(10);
    }
  });

  it("emits FAQ structured data that is exactly the visible FAQ", () => {
    const faq = toolJsonLd["@graph"][1] as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    expect(faq.mainEntity.map((item) => ({ q: item.name, a: item.acceptedAnswer.text }))).toEqual(about.faq);
  });

  it("describes the app with the site's own description and URL", () => {
    expect(toolJsonLd["@graph"][0]).toMatchObject({ "@type": "WebApplication", name: zee.name, url: appUrl, description: zee.seo.description });
  });

  it("writes llms.txt from the same FAQ", () => {
    expect(llmsTxt.startsWith(`# ${zee.name}`)).toBe(true);
    for (const { q, a } of about.faq) expect(llmsTxt).toContain(`Q: ${q}\nA: ${a}`);
  });
});
