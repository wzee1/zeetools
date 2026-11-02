import type { ToolAboutContent } from "./about";

/** The author of the zee tools. The @id is shared with the person node on wzee.dev, so the pages link up as one entity; name and url stay here so a crawler reading only this page still gets them. */
const PERSON = { "@type": "Person", "@id": "https://wzee.dev/#person", name: "Zoltán Farkas", url: "https://wzee.dev" } as const;
const WEBSITE = { "@type": "WebSite", "@id": "https://wzee.dev/#website", name: "wzee.dev", url: "https://wzee.dev" } as const;

export type ToolCategory = "SecurityApplication" | "MultimediaApplication" | "CommunicationApplication";

export interface ToolJsonLdInput {
  name: string;
  /** The tool's own address, such as https://pass.wzee.dev. */
  url: string;
  description: string;
  category: ToolCategory;
  /** A few short strings naming what the tool does. */
  featureList: string[];
  /** The preview card as an absolute URL. */
  image: string;
  /** The code on GitHub; left out of the markup when empty. */
  source?: string;
  /** Only the FAQ page reads it. */
  about: Pick<ToolAboutContent, "faq">;
}

/** The home page's graph: the WebApplication, and its source code as a SoftwareSourceCode node when there is one. */
export function buildToolJsonLd(input: ToolJsonLdInput) {
  const { name, url, description, category, featureList, image, source } = input;
  const app = {
    "@type": "WebApplication",
    "@id": `${url}/#app`,
    name,
    url,
    description,
    applicationCategory: category,
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires a modern web browser with JavaScript enabled",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    image,
    featureList,
    inLanguage: "en",
    author: PERSON,
    publisher: PERSON,
    isPartOf: WEBSITE,
  };
  // codeRepository belongs to SoftwareSourceCode, not to WebApplication, so the repo is its own node pointing at the app.
  const code = source && {
    "@type": "SoftwareSourceCode",
    "@id": `${url}/#source`,
    name: `${name} source code`,
    codeRepository: source,
    programmingLanguage: "TypeScript",
    license: "https://opensource.org/licenses/MIT",
    author: PERSON,
    targetProduct: { "@id": app["@id"] },
  };
  return { "@context": "https://schema.org", "@graph": code ? [app, code] : [app] };
}

/** The FAQ page's graph: a FAQPage built from the same data as the visible questions, about the tool's app node. */
export function buildFaqJsonLd({ name, url, about }: Pick<ToolJsonLdInput, "name" | "url" | "about">) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}/faq#faq`,
    url: `${url}/faq`,
    name: `${name} FAQ`,
    inLanguage: "en",
    about: { "@id": `${url}/#app` },
    isPartOf: WEBSITE,
    mainEntity: about.faq.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
}

/** JSON for a script tag. `<` is escaped so no string can close the tag, and the two line separators JavaScript treats as newlines. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`);
}
