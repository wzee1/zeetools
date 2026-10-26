// The class strings of the one card every view is built from.

/** The card itself, filling the free height: the flex-1 element of the no-scroll chain on desktop, with its own container for column breakpoints. `data-dragging` turns the border green. */
export const CARD =
  "@container flex flex-col overflow-hidden transition-colors duration-200 ease-out shell:min-h-0 shell:flex-1 data-dragging:border-ring";

/** A card that is only as tall as its content and shrinks (its body scrolls) when the viewport is shorter. */
export const CARD_FIT = "@container flex flex-col overflow-hidden transition-colors duration-200 ease-out shell:min-h-0";

/** A section of the card: the same padding everywhere. */
export const SECTION = "px-5 py-6 sm:px-8 sm:py-7";

/** The footer row: hints on the left, the actions on the right. */
export const FOOTER =
  "flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border px-5 py-5 sm:px-8 @min-[34rem]:flex-row @min-[34rem]:items-center";

/** The part of a view that takes the free height and scrolls itself, so the page never does. */
export const BODY = "shell:min-h-0 shell:flex-1 shell:overflow-y-auto";
