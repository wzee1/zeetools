import "cypress-real-events";
import { mount, type MountOptions } from "cypress/react";
import Providers from "../../src/components/providers";
import "./styles.css";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Mounts inside the app's providers (theme, tooltips, command menu, toasts). */
      mount(ui: React.ReactNode, options?: MountOptions): Chainable;
    }
  }
}

Cypress.Commands.add("mount", (ui: React.ReactNode, options?: MountOptions) =>
  mount(<Providers forcedTheme="light">{ui}</Providers>, options),
);

/** The native key behind the app's `mod` hotkeys: ⌘ on macOS, Ctrl elsewhere. Use with `cy.realPress`. */
export const mod = Cypress.platform === "darwin" ? "Meta" : "Control";
