import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Providers from "../src/components/providers";

/** Renders inside the app's providers (theme, tooltips, command menu, toasts) and returns a user-event instance. */
export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: ({ children }) => <Providers forcedTheme="light">{children}</Providers>, ...options }),
  };
}
