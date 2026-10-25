import type { Preview } from "@storybook/nextjs-vite";
import Providers from "../src/components/providers";
import "./storybook.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Color theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: "light" },
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i } },
  },
  decorators: [
    (Story, { globals, parameters }) => (
      <Providers forcedTheme={globals.theme === "dark" ? "dark" : "light"}>
        <div className={parameters.bare ? "min-h-screen bg-background" : "min-h-screen bg-background p-8"}>
          <Story />
        </div>
      </Providers>
    ),
  ],
};

export default preview;
