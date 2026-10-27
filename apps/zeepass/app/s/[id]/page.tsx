import RevealCard from "@/components/secret/RevealCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reveal Secret — zeepass",
  description: "Zero-knowledge ephemeral secret recipient portal.",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SecretPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col px-5 py-10 selection:bg-primary/25 sm:px-10 sm:py-12 shell:min-h-0 shell:flex-1">
      <RevealCard id={id} />
    </main>
  );
}
