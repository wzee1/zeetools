import { serializeJsonLd } from "../../lib/structured-data";

/** A schema.org block for crawlers. It is data, not script, so a strict script-src leaves it alone. */
export default function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
