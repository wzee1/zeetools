// The class strings of the one card every view is built from (the same sections as zeepass's create form).

/** The card itself: the flex-1 element of the no-scroll chain on desktop, with its own container for column breakpoints. */
export const CARD =
  "@container flex flex-col overflow-hidden transition-colors duration-200 ease-out shell:min-h-0 shell:flex-1 has-[[data-dropzone]:focus-visible]:border-ring has-[[data-dropzone][data-dragging]]:border-ring";

/** A section of the card: the same padding everywhere. */
export const SECTION = "px-5 py-6 sm:px-8 sm:py-7";

/** The footer row: hints on the left, the actions on the right. */
export const FOOTER =
  "flex flex-col-reverse items-stretch justify-between gap-4 border-t border-border px-5 py-5 sm:px-8 @min-[34rem]:flex-row @min-[34rem]:items-center";

/** The part of a step that takes the free height and scrolls itself, so the page never does. */
export const BODY = "shell:min-h-0 shell:flex-1 shell:overflow-y-auto";

/** A list or grid that scrolls inside the card: capped on phones (the page scrolls there), free on desktop. */
export const SCROLLER = "max-h-[60vh] overflow-auto shell:max-h-none shell:min-h-0 shell:flex-1";
