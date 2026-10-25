import { useRef, useState } from "react";
import { toast } from "sonner";
import { copyText } from "../../../lib/export";
import CopyButtonView from "./copy-button-view";

export default function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy() {
    try {
      await copyText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Clipboard access was blocked. Select the text and copy it manually.");
    }
  }

  return <CopyButtonView copied={copied} onClick={copy} label={label} disabled={!text} />;
}
