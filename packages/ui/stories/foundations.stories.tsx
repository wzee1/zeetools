import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = { title: "Foundations" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const groups = [
  { name: "Surfaces", tokens: ["background", "surface", "surface-raised", "border", "border-strong"] },
  { name: "Text", tokens: ["foreground", "muted"] },
  { name: "Brand and actions", tokens: ["primary", "primary-hover", "primary-foreground", "primary-text", "brand", "ring"] },
  { name: "Status", tokens: ["success", "success-surface", "danger", "danger-solid", "danger-solid-hover"] },
];

export const Colors: Story = {
  render: () => (
    <div className="grid max-w-3xl gap-8">
      {groups.map((group) => (
        <section key={group.name}>
          <h2 className="mb-3 font-semibold">{group.name}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {group.tokens.map((token) => (
              <div key={token} className="flex items-center gap-3">
                <span className="size-10 shrink-0 rounded-control border border-border" style={{ background: `var(--${token})` }} />
                <code className="text-xs text-muted">--{token}</code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

const sizes = [
  ["text-2xl font-semibold tracking-tight", "Page title"],
  ["text-base font-semibold", "Dialog title"],
  ["text-sm font-semibold", "Section heading"],
  ["text-sm", "Body text for descriptions, tables and form fields."],
  ["text-sm text-muted", "Muted text for hints and secondary details."],
  ["text-xs font-medium text-muted", "Small labels and table headers"],
] as const;

export const Typography: Story = {
  render: () => (
    <div className="grid max-w-2xl gap-4">
      {sizes.map(([className, text]) => (
        <div key={className} className="grid gap-1 border-b border-border pb-4 last:border-0">
          <p className={className}>{text}</p>
          <code className="text-xs text-muted">{className}</code>
        </div>
      ))}
    </div>
  ),
};

const motionTokens = [
  ["--ease-out", "cubic-bezier(0.32, 0.72, 0, 1)", "Entrances, exits, hovers and color changes"],
  ["spring", "visualDuration 0.3, bounce 0", "Default movement (lib/motion.ts)"],
  ["springSnappy", "visualDuration 0.18, bounce 0", "Presses and highlights"],
  ["springIcon", "visualDuration 0.35, bounce 0.15", "Icon parts"],
  ["draw", "0.45s, --ease-out", "Strokes that redraw themselves"],
] as const;

export const Motion: Story = {
  render: () => (
    <table className="max-w-3xl text-left">
      <thead className="text-xs text-muted">
        <tr>
          <th className="py-2 pr-6 font-medium">Token</th>
          <th className="py-2 pr-6 font-medium">Value</th>
          <th className="py-2 font-medium">Used for</th>
        </tr>
      </thead>
      <tbody>
        {motionTokens.map(([name, value, use]) => (
          <tr key={name} className="border-t border-border">
            <td className="py-2.5 pr-6 font-medium">{name}</td>
            <td className="py-2.5 pr-6 text-muted">{value}</td>
            <td className="py-2.5">{use}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ),
};
