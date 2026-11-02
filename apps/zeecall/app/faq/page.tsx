import type { Metadata } from "next";
import JsonLd from "@zeetools/ui/components/brand/json-ld";
import ToolAbout from "@zeetools/ui/components/brand/tool-about";
import { about, faqJsonLd } from "@/content/about";
import { appUrl, zee } from "@/zee.config";

const title = `${zee.name} FAQ: how it works, privacy and limits`;
const image = { url: "/og.png", width: 2400, height: 1260, alt: zee.seo.title };

// Setting openGraph here replaces the layout's whole object, so the card is repeated in full.
export const metadata: Metadata = {
  title,
  description: about.intro,
  alternates: { canonical: "/faq" },
  openGraph: { type: "website", title, description: about.intro, url: `${appUrl}/faq`, siteName: "wzee.dev", locale: "en_US", images: [image] },
  twitter: { card: "summary_large_image", title, description: about.intro, images: [image] },
};

export default function FaqPage() {
  return (
    <>
      <ToolAbout {...about} source={zee.source} />
      <JsonLd data={faqJsonLd} />
    </>
  );
}
