import JsonLd from "@zeetools/ui/components/brand/json-ld";
import HomeView from "@/components/shared/HomeView";
import { toolJsonLd } from "@/content/about";

// A server component, so the tool's heading and the structured data are in the prerendered HTML. The About text and FAQ live on /faq.
export default function Home() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-4xl flex-col px-5 py-10 selection:bg-primary/25 sm:px-10 sm:py-12 shell:min-h-0 shell:flex-1">
        <HomeView />
      </main>
      <JsonLd data={toolJsonLd} />
    </>
  );
}
