import JsonLd from "@zeetools/ui/components/brand/json-ld";
import ToolAbout from "@zeetools/ui/components/brand/tool-about";
import HomeView from "@/components/shared/HomeView";
import { about, toolJsonLd } from "@/content/about";
import { zee } from "@/zee.config";

// A server component, so the tool's heading, the About section and the structured data are in the prerendered HTML.
export default function Home() {
  return (
    <>
      {/* On wide screens the panel scrolls: the tool fills at least its height and the About section sits below it. */}
      <main className="mx-auto flex w-full max-w-4xl flex-col px-5 py-10 selection:bg-primary/25 sm:px-10 sm:py-12 shell:min-h-full shell:flex-none">
        <HomeView />
      </main>
      <ToolAbout {...about} source={zee.source} />
      <JsonLd data={toolJsonLd} />
    </>
  );
}
