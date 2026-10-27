"use client";

import type { ComponentProps } from "react";
import Button from "@zeetools/ui/components/ui/actions/button";
import ZeeKbd from "./ZeeKbd";
import type { Hotkey } from "@zeetools/ui/hooks/use-hotkeys";
import { cn } from "@zeetools/ui/lib/utils";

type ButtonBaseProps = ComponentProps<typeof Button>;

export interface ZeeButtonProps extends Omit<ButtonBaseProps, "children"> {
  children?: React.ReactNode;
  loading?: boolean;
  hotkey?: Hotkey;
  loadingText?: string;
}

export default function ZeeButton({
  children,
  loading = false,
  disabled,
  hotkey,
  loadingText,
  className,
  ...props
}: ZeeButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn("gap-2 select-none", className)}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="size-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {children}
          {hotkey && <ZeeKbd hotkey={hotkey} className="ml-1" />}
        </>
      )}
    </Button>
  );
}
