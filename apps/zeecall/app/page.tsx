import JsonLd from "@zeetools/ui/components/brand/json-ld";
import ToolAbout from "@zeetools/ui/components/brand/tool-about";
import ZeeCallApp from "@/components/views/ZeeCallApp";
import { about, toolJsonLd } from "@/content/about";
import { zee } from "@/zee.config";

// A server component, so the tool's heading, the About section and the structured data are in the prerendered HTML.
// The About section goes into the client app as a prop, which lets the call view leave it out.
export default function Home() {
  return (
    <>
      <ZeeCallApp about={<ToolAbout {...about} source={zee.source} />} />
      <JsonLd data={toolJsonLd} />
    </>
  );
}
