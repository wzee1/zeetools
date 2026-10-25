/** Copy for the privacy badge: a short label, the tooltip, and the label screen readers get on narrow screens. */
export interface ZeePrivacy {
  label: string;
  tooltip: string;
  srLabel?: string;
}

/** What the shared components need to know about the app they sit in. Each app fills it from its own zee.config. */
export interface ZeeInfo {
  /** The product name: shown in the sidebar and header, and the prefix of the persisted shell key. */
  name: string;
  /** The suite's home, such as https://wzee.dev. */
  hub: string;
  /** Shows the privacy badge in the header. */
  localOnly?: boolean;
  /** Overrides the privacy badge copy. */
  privacy?: ZeePrivacy;
}

export const DEFAULT_ZEE: ZeeInfo = { name: "zee", hub: "https://wzee.dev" };

export const DEFAULT_PRIVACY: ZeePrivacy = {
  label: "Runs in your browser",
  tooltip: "Everything runs on this device and nothing is uploaded. Click to view the Privacy & GDPR notice.",
  srLabel: "Runs in your browser",
};
