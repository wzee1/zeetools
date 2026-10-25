import react from "@vitejs/plugin-react";
import { defineConfig } from "cypress";

// Component tests run in a real browser: focus, hover animations, popper positioning,
// drag and drop and computed styles that jsdom (Vitest) can't check.
export default defineConfig({
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
      viteConfig: {
        plugins: [react()],
      },
    },
    specPattern: "cypress/component/**/*.cy.tsx",
    viewportWidth: 1000,
    viewportHeight: 700,
  },
  video: false,
});
