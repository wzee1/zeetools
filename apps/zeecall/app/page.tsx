import JsonLd from "@zeetools/ui/components/brand/json-ld";
import ZeeCallApp from "@/components/views/ZeeCallApp";
import { toolJsonLd } from "@/content/about";

// A server component, so the tool's heading and the structured data are in the prerendered HTML. The About text and FAQ live on /faq.
export default function Home() {
  return (
    <>
      <ZeeCallApp />
      <JsonLd data={toolJsonLd} />
    </>
  );
}
