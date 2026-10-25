import { motion } from "motion/react";
import CopyIcon from "../../icons/actions/copy-icon";
import { spring } from "../../../lib/motion";
import Button from "./button";

/** `offset` is where the label sits while hidden: the old label leaves upward, the new one rises in. */
function Label({ show, offset, children }: { show: boolean; offset: number; children: React.ReactNode }) {
  return (
    <motion.span
      className="col-start-1 row-start-1"
      aria-hidden={!show}
      initial={false}
      animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: offset, filter: "blur(2px)" }}
      transition={spring}
    >
      {children}
    </motion.span>
  );
}

/** The button without the clipboard logic, for callers that copy by their own means and track `copied` themselves. */
export default function CopyButtonView({
  copied,
  onClick,
  label = "Copy",
  copiedLabel = "Copied",
  disabled,
  className,
  children,
  variant,
  size,
}: {
  copied: boolean;
  onClick: () => void;
  label?: string;
  copiedLabel?: string;
  disabled?: boolean;
  className?: string;
  /** Trailing content, such as a shortcut hint. */
  children?: React.ReactNode;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}) {
  return (
    <Button onClick={onClick} disabled={disabled} className={className} variant={variant} size={size}>
      <CopyIcon copied={copied} className={copied ? "text-success" : undefined} />
      {/* Both labels share one grid cell, so the button keeps the wider width and never jumps. */}
      <span className="grid">
        <Label show={!copied} offset={-5}>
          {label}
        </Label>
        <Label show={copied} offset={5}>
          {copiedLabel}
        </Label>
      </span>
      {children}
    </Button>
  );
}
