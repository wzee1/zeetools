import { motion } from "motion/react";
import { useRef, useState } from "react";
import UploadIcon from "../icons/actions/upload-icon";
import { spring, springSnappy } from "../../lib/motion";
import { cn } from "../../lib/utils";

type DropZoneProps = {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  hint?: string;
  className?: string;
};

/** File input that accepts drag and drop, click to browse, and paste from the clipboard. */
export default function DropZone({ onFiles, accept, multiple = true, hint, className }: DropZoneProps) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [flash, setFlash] = useState(false);

  function take(list: FileList | null | undefined) {
    const files = [...(list ?? [])];
    if (!files.length) return;
    onFiles(multiple ? files : files.slice(0, 1));
    setFlash(true);
  }

  return (
    <motion.div
      initial="rest"
      animate={dragging ? "drag" : "rest"}
      whileHover={dragging ? undefined : "hover"}
      whileTap="tap"
      role="button"
      tabIndex={0}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), input.current?.click())}
      onPaste={(e) => take(e.clipboardData.files)}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        take(e.dataTransfer.files);
      }}
      onAnimationEnd={(e) => e.animationName === "drop-flash" && setFlash(false)}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-border-strong bg-surface px-6 py-12 text-center transition-[border-color,background-color] duration-300 ease-out hover:border-primary/60",
        flash && "animate-[drop-flash_700ms_var(--ease-out)]",
        dragging && "border-primary bg-primary/5",
        className,
      )}
    >
      <motion.span
        variants={{ rest: { y: 0, scale: 1 }, hover: { y: -2, scale: 1 }, drag: { y: -4, scale: 1.08 }, tap: { y: 0, scale: 0.94 } }}
        transition={{ ...spring, scale: springSnappy }}
        className={cn(
          "flex size-10 items-center justify-center rounded-full border border-border bg-surface-raised text-muted transition-[border-color,color,box-shadow] duration-300 ease-out group-hover:text-foreground",
          dragging && "border-primary/50 text-primary-text shadow-[0_6px_16px_-6px_color-mix(in_oklab,var(--primary)_45%,transparent)] group-hover:text-primary-text",
        )}
      >
        <UploadIcon className="size-4" />
      </motion.span>
      <div className="grid">
        {/* Both messages share one cell and crossfade, so the layout never shifts. */}
        <motion.p
          className="col-start-1 row-start-1 font-medium"
          initial={false}
          animate={dragging ? { opacity: 0, y: -5, filter: "blur(2px)" } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={spring}
        >
          Drop {multiple ? "files" : "a file"} here or <span className="text-primary-text">browse</span>
        </motion.p>
        <motion.p
          aria-hidden={!dragging}
          className="col-start-1 row-start-1 font-medium text-primary-text"
          initial={false}
          animate={dragging ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 5, filter: "blur(2px)" }}
          transition={spring}
        >
          Release to add
        </motion.p>
        {hint && <p className="mt-1 text-muted">{hint}</p>}
      </div>
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden onChange={(e) => take(e.target.files)} />
    </motion.div>
  );
}
