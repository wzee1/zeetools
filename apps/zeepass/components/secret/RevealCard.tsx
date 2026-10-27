"use client";

import { useCallback, useEffect, useState } from "react";
import AlertIcon from "@zeetools/ui/components/icons/status/alert-icon";
import TrashIcon from "@zeetools/ui/components/icons/actions/trash-icon";
import EyeIcon from "@zeetools/ui/components/icons/media/eye-icon";
import CodeViewer from "@/components/zee-ui/CodeViewer";
import ZeeButton from "@/components/zee-ui/ZeeButton";
import ZeeKbd from "@/components/zee-ui/ZeeKbd";
import CreateAnotherLink from "@/components/secret/CreateAnotherLink";
import PageHeader from "@zeetools/ui/components/brand/page-header";
import Stagger from "@zeetools/ui/components/motion/stagger";
import DrawCheck from "@/components/secret/DrawCheck";
import PlusIcon from "@zeetools/ui/components/icons/actions/plus-icon";
import LockIcon from "@zeetools/ui/components/icons/status/lock-icon";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import { Card } from "@zeetools/ui/components/ui/display/card";
import StatusCard from "@/components/secret/StatusCard";
import { decryptSecret } from "@/lib/crypto/engine";
import { revealSecretAction } from "@/lib/secret/actions";
import Link from "next/link";
import { toast } from "sonner";

interface RevealCardProps {
  id: string;
}

type RevealState =
  | { status: "missing_key" }
  | { status: "interstitial"; keyBase64: string }
  | { status: "revealing" }
  | { status: "burned_or_expired" }
  | { status: "decryption_failed"; error: string }
  | { status: "revealed"; plaintext: string; wasBurned: boolean };

function parseHashKey(): RevealState {
  const hash = window.location.hash;
  const match = hash.match(/^#key=([A-Za-z0-9_-]+)$/);
  if (!match || !match[1]) {
    return { status: "missing_key" };
  }
  return { status: "interstitial", keyBase64: match[1] };
}

export default function RevealCard({ id }: RevealCardProps) {
  // The URL hash is unknown during SSR, so the first render must not depend on it.
  // It is read after hydration; "revealing" is the neutral placeholder both sides render.
  const [state, setState] = useState<RevealState>({ status: "revealing" });

  // Read the key from the URL hash once mounted, and keep it in sync if the hash changes
  useEffect(() => {
    const handleHashChange = () => {
      setState(parseHashKey());
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const handleReveal = useCallback(async () => {
    if (state.status !== "interstitial") return;
    const { keyBase64 } = state;

    setState({ status: "revealing" });

    try {
      // Call Server Action to retrieve ciphertext & trigger atomic destruction on KV
      const result = await revealSecretAction(id);

      if (!result.ok) {
        if (result.error === "burned_or_expired") {
          setState({ status: "burned_or_expired" });
        } else {
          setState({
            status: "decryption_failed",
            error: "Unable to retrieve secret from server.",
          });
        }
        return;
      }

      // Decrypt locally in browser RAM using Web Crypto API
      try {
        const decrypted = await decryptSecret({
          ciphertext: result.ciphertext,
          iv: result.iv,
          rawKeyBase64: keyBase64,
        });

        setState({
          status: "revealed",
          plaintext: decrypted,
          wasBurned: result.burned,
        });

        toast.success(
          result.burned
            ? "Secret decrypted! Erased permanently from server."
            : "Secret decrypted successfully!"
        );
      } catch (cryptoErr) {
        console.error("Local decryption failed:", cryptoErr);
        setState({
          status: "decryption_failed",
          error:
            "Decryption failed. The secret ciphertext or key may be corrupted or tampered with.",
        });
      }
    } catch (err) {
      console.error("Reveal action error:", err);
      setState({
        status: "decryption_failed",
        error: "An unexpected error occurred while revealing the secret.",
      });
    }
  }, [id, state]);

  // Keyboard shortcut: Space or Enter on interstitial to reveal
  useEffect(() => {
    if (state.status !== "interstitial") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        // Only trigger if not typing into an active input
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          handleReveal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReveal, state.status]);

  // Missing Key State
  if (state.status === "missing_key") {
    return (
      <StatusCard
        icon={<AlertIcon />}
        title="Decryption Key Missing"
        action={<CreateAnotherLink />}
      >
        The URL hash fragment containing the decryption key (<code className="font-mono text-foreground">#key=...</code>) is missing. Make sure the entire link was copied and opened.
      </StatusCard>
    );
  }

  // Burned or Expired State
  if (state.status === "burned_or_expired") {
    return (
      <StatusCard icon={<TrashIcon />} title="Secret Burned or Expired" tone="danger" action={<CreateAnotherLink />}>
        This secret is no longer available. It was either viewed and destroyed (burn-on-read) or reached its expiration lifetime.
      </StatusCard>
    );
  }

  // Decryption Failed State
  if (state.status === "decryption_failed") {
    return (
      <StatusCard
        icon={<AlertIcon />}
        title="Decryption Failed"
        tone="danger"
        action={
          <Link href="/" className="inline-block">
            <ZeeButton variant="secondary" className="h-10 px-4">
              <span>Return to Home</span>
            </ZeeButton>
          </Link>
        }
      >
        {state.error}
      </StatusCard>
    );
  }

  // Pre-Reveal Interstitial Screen
  if (state.status === "interstitial" || state.status === "revealing") {
    return (
      <Stagger key="interstitial" className="flex flex-col gap-10">
        <PageHeader
          title="Encrypted Secret Received"
          leading={
            <span className="flex size-9 items-center justify-center rounded-control border border-border-strong bg-surface text-muted">
              <LockIcon className="size-4" />
            </span>
          }
        >
          This secret may be configured to self-destruct immediately upon viewing. Clicking below will retrieve the ciphertext and decrypt it locally in your browser.
        </PageHeader>

        <StaggerItem>
          <Card className="overflow-hidden">
            {/* The warning is a section of the card, not a box inside it. */}
            <div className="flex gap-4 px-5 py-6 sm:px-8 sm:py-7">
              <AlertIcon className="mt-0.5 size-4 shrink-0 text-[#b58900] dark:text-[#f0c040]" />
              <p className="text-[0.9375rem] leading-relaxed text-foreground">
                If burn-on-read is active, this secret will be permanently destroyed on the server. If you refresh or close this tab, it cannot be recovered.
              </p>
            </div>

            <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:px-8">
              <p className="text-xs text-muted">
                Press <ZeeKbd hotkey="space" /> or <ZeeKbd hotkey="enter" /> to reveal
              </p>
              <ZeeButton
                variant="primary"
                onClick={handleReveal}
                loading={state.status === "revealing"}
                loadingText="Decrypting locally…"
                className="h-10 px-4"
              >
                <EyeIcon className="size-4" />
                <span>Reveal Secret</span>
                <ZeeKbd hotkey="enter" className="hidden sm:inline-flex" />
              </ZeeButton>
            </div>
          </Card>
        </StaggerItem>
      </Stagger>
    );
  }

  // Revealed Plaintext Screen: the status is the page header, the plaintext fills the card under it.
  return (
    <Stagger key="revealed" className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader
        title={state.wasBurned ? "Secret permanently destroyed on server." : "Decrypted locally in browser RAM via AES-GCM-256."}
        leading={
          state.wasBurned ? (
            <span className="flex size-9 items-center justify-center rounded-control border border-danger/40 bg-danger/10 text-danger">
              <TrashIcon className="size-4" />
            </span>
          ) : (
            <DrawCheck />
          )
        }
        aside={
          <Link href="/" className="inline-block">
            <ZeeButton variant="secondary" className="h-10 px-4">
              <PlusIcon className="size-4" />
              <span>Create New</span>
            </ZeeButton>
          </Link>
        }
      >
        {state.wasBurned ? "If you refresh or navigate away, it is gone forever." : undefined}
      </PageHeader>

      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <CodeViewer content={state.plaintext} filename="secret.env" className="shell:min-h-0 shell:flex-1" />
      </StaggerItem>
    </Stagger>
  );
}
