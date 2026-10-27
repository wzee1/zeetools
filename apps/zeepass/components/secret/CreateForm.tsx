"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import LockIcon from "@zeetools/ui/components/icons/status/lock-icon";
import PageHeader from "@zeetools/ui/components/brand/page-header";
import Stagger from "@zeetools/ui/components/motion/stagger";
import StaggerItem from "@zeetools/ui/components/motion/stagger-item";
import { Card } from "@zeetools/ui/components/ui/display/card";
import Label from "@zeetools/ui/components/ui/forms/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@zeetools/ui/components/ui/forms/select";
import Switch from "@zeetools/ui/components/ui/forms/switch";
import ZeeButton from "@/components/zee-ui/ZeeButton";
import ZeeKbd from "@/components/zee-ui/ZeeKbd";
import { computeKeyVerifier, encryptSecret, exportKeyToBase64, generateSecretKey } from "@/lib/crypto/engine";
import { useSecretHistory } from "@/hooks/use-secret-history";
import { createSecretAction } from "@/lib/secret/actions";
import { cn } from "@zeetools/ui/lib/utils";
import { toast } from "sonner";

const ease = [0.32, 0.72, 0, 1] as const;
const MAX_BYTES = 256 * 1024; // 256 KB

interface CreateFormProps {
  onSecretCreated: (data: {
    id: string;
    shareUrl: string;
    burnOnRead: boolean;
    ttlSeconds: number;
  }) => void;
}

export default function CreateForm({ onSecretCreated }: CreateFormProps) {
  const { add: remember } = useSecretHistory();
  const [plaintext, setPlaintext] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState(86400); // 24 hours default
  const [burnOnRead, setBurnOnRead] = useState(true);
  const [loading, setLoading] = useState(false);

  const textareaId = useId();
  const ttlId = useId();
  const burnId = useId();

  const byteCount = useMemo(() => {
    return new TextEncoder().encode(plaintext).length;
  }, [plaintext]);

  const isOversized = byteCount > MAX_BYTES;

  const handleEncryptAndSubmit = async () => {
    if (!plaintext.trim()) {
      toast.error("Please enter a secret to encrypt.");
      return;
    }

    if (isOversized) {
      toast.error("Secret exceeds maximum allowed size of 256 KB.");
      return;
    }

    setLoading(true);

    try {
      // 1. Generate local 256-bit AES-GCM key in browser memory
      const key = await generateSecretKey();
      const rawKeyBase64 = await exportKeyToBase64(key);

      // 2. Encrypt locally in browser RAM
      const encrypted = await encryptSecret(plaintext, key);

      // 3. Send ciphertext, IV and a one-way key verifier to the Server Action (zero plaintext, zero key)
      const res = await createSecretAction({
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        verifier: await computeKeyVerifier(rawKeyBase64),
        ttlSeconds,
        burnOnRead,
      });

      if (!res.ok) {
        toast.error(res.error || "Failed to store encrypted secret.");
        return;
      }

      // 4. Construct shareable link with #key in hash fragment strictly
      const shareUrl = `${window.location.origin}/s/${res.id}#key=${rawKeyBase64}`;

      // 5. Clear plaintext from React state immediately
      setPlaintext("");

      // 6. Remember the link on this device only, so it can be found again from the sidebar
      remember({ id: res.id, shareUrl, burnOnRead, ttlSeconds, createdAt: Date.now() });

      toast.success("Secret encrypted and link generated!");
      onSecretCreated({
        id: res.id,
        shareUrl,
        burnOnRead,
        ttlSeconds,
      });
    } catch (err) {
      console.error("Encryption error:", err);
      toast.error("Failed to encrypt secret. Please check browser crypto support.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleEncryptAndSubmit();
    } else if (e.key === "Escape") {
      setPlaintext("");
    }
  };

  const sizeLabel = (byteCount / 1024).toFixed(1);

  return (
    <Stagger className="flex flex-col gap-10 shell:min-h-0 shell:flex-1">
      <PageHeader
        title="Encrypt & Share Secret"
        aside={
          <span className="inline-flex h-7 items-center rounded-control border border-border px-2.5 font-mono text-xs text-muted">
            AES-GCM-256
          </span>
        }
      >
        Paste credentials, passwords, or <code className="font-mono text-foreground">.env</code> files. They are encrypted in your browser before anything is sent: the server stores only the encrypted text, until it is opened or expires, and the key stays in the link, so it can’t be read there.
      </PageHeader>

      {/* One panel split by hairlines. The textarea is its writing surface, so focus rings the panel. */}
      <StaggerItem className="flex flex-col shell:min-h-0 shell:flex-1">
        <Card className="flex flex-col overflow-hidden transition-colors duration-200 ease-out shell:min-h-0 shell:flex-1 has-[textarea:focus-visible]:border-ring">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 px-5 pt-6 sm:px-8 sm:pt-7">
            <Label htmlFor={textareaId} className="text-base font-normal">Secret Content</Label>
            <span
              className={cn(
                "inline-flex items-center gap-2 font-mono text-xs tabular-nums",
                isOversized ? "font-semibold text-danger" : "text-muted",
              )}
            >
              <span aria-hidden className={cn("size-2.5 rounded-full border-2", isOversized ? "border-danger" : "border-primary-text")} />
              <span className="inline-flex">
                <motion.span
                  key={sizeLabel}
                  initial={{ opacity: 0.4, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, ease }}
                >
                  {sizeLabel}
                </motion.span>
                <span className="whitespace-pre"> KB / 256 KB</span>
              </span>
            </span>
          </div>
          <textarea
            id={textareaId}
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste passwords, API tokens, or .env files here..."
            rows={10}
            spellCheck={false}
            className="block min-h-60 w-full resize-y bg-transparent px-5 pt-4 pb-6 font-mono text-sm leading-relaxed text-foreground outline-none selection:bg-primary/25 placeholder:text-muted/60 sm:px-8 shell:min-h-28 shell:flex-1 shell:resize-none"
          />

          <div className="grid border-t border-border sm:grid-cols-2">
            <div className="space-y-4 px-5 py-6 sm:px-8 sm:py-7">
              <div className="space-y-1">
                <Label htmlFor={ttlId} className="text-base font-normal">Expiration Lifetime</Label>
                <p className="text-sm leading-relaxed text-muted">Deleted from the server when it expires.</p>
              </div>
              <Select value={String(ttlSeconds)} onValueChange={(v) => setTtlSeconds(Number(v))}>
                <SelectTrigger id={ttlId} className="h-10 w-full tabular-nums">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3600">1 Hour</SelectItem>
                  <SelectItem value="86400">24 Hours (Default)</SelectItem>
                  <SelectItem value="604800">7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 border-t border-border px-5 py-6 sm:border-t-0 sm:border-l sm:px-8 sm:py-7">
              <div className="space-y-1">
                <p className="text-base text-foreground">Destruction Policy</p>
                <p className="text-sm leading-relaxed text-muted">Permanently deleted on server at the moment of first retrieval.</p>
              </div>
              <div className="flex h-10 items-center justify-between gap-4">
                <Label htmlFor={burnId} className="text-sm font-normal">Burn after 1st read</Label>
                <Switch id={burnId} checked={burnOnRead} onCheckedChange={setBurnOnRead} />
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border px-5 py-5 sm:flex-row sm:items-center sm:px-8">
            <div className="flex items-center gap-1.5 text-xs text-muted max-sm:hidden pointer-coarse:hidden">
              <span>Submit:</span>
              <ZeeKbd hotkey="mod+enter" />
              <span aria-hidden>·</span>
              <span>Clear:</span>
              <ZeeKbd hotkey="esc" />
            </div>

            <ZeeButton
              variant="primary"
              onClick={handleEncryptAndSubmit}
              loading={loading}
              loadingText="Encrypting in RAM…"
              disabled={!plaintext.trim() || isOversized}
              className="h-10 px-4 sm:w-auto"
            >
              <LockIcon className="size-4" />
              <span>Encrypt & Generate Link</span>
              <ZeeKbd hotkey="mod+enter" className="hidden sm:inline-flex" />
            </ZeeButton>
          </div>
        </Card>
      </StaggerItem>
    </Stagger>
  );
}
