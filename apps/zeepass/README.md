# zeepass

Share a password, an API key or a `.env` file as a link that works once and then disappears. Part of the [wzee.dev](https://wzee.dev) suite, live at [pass.wzee.dev](https://pass.wzee.dev).

The secret is encrypted in your browser before it is sent, and the key never leaves your device: the server only ever stores ciphertext it cannot read.

## How it works

1. **Encrypted in the browser.** A random 256-bit AES-GCM key and a 96-bit IV are generated with the Web Crypto API (`crypto.subtle`). The plaintext is encrypted in memory and only the ciphertext is uploaded.
2. **The key stays in the URL fragment.** The link looks like `https://pass.wzee.dev/s/<id>#key=<base64url key>`. Browsers never send the part after `#` to a server, so the key does not appear in request lines, headers or CDN logs.
3. **Burn after reading.** Revealing a link is a Next.js Server Action (a POST), so link previews and crawlers cannot trigger it. With burn-on-read on, the ciphertext is deleted in the same atomic step that returns it. Each secret lives in its own [Durable Object](https://developers.cloudflare.com/durable-objects/) that runs and stores data only in the EU, so two quick opens can never both get it.
4. **Everything expires.** Each secret gets a lifetime of 5 minutes up to 7 days (the create form offers 1 hour, 24 hours and 7 days) and an alarm on the Durable Object deletes everything at expiry.
5. **No accounts, no tracking.** No cookies, analytics or IP logging.

### On this device

Links you create are listed in the sidebar so you can find them again. They are kept in this browser's `localStorage` (`zeepass:secrets`, the share link and its settings, never the plaintext) and drop off the list when they expire or when you remove them. The sidebar's width and visibility are saved under `zeepass:shell`.

## Run it

From the repository root:

```bash
pnpm install
pnpm --filter zeepass dev
```

Without the Durable Object binding (`next dev`, tests) secrets are kept in an in-memory map instead.

```bash
pnpm --filter zeepass test          # crypto, server actions, history
pnpm --filter zeepass lint
pnpm --filter zeepass typecheck
pnpm --filter zeepass build
```

## Deploy on Cloudflare Workers

zeepass is built for Cloudflare with [OpenNext](https://opennext.js.org/cloudflare).

```bash
pnpm --filter zeepass cf:build     # builds into apps/zeepass/.open-next
pnpm --filter zeepass cf:preview   # runs it locally
pnpm --filter zeepass cf:deploy
pnpm --filter zeepass run deploy      # cf:deploy, then refreshes wzee.dev/tools
```

`wrangler.jsonc` binds the `SecretVault` Durable Object class as `SECRETS` (one object per secret, EU jurisdiction) and points `main` at `worker.ts`, which re-exports the OpenNext worker and the class. There is nothing to create before deploying: the `v1` migration creates the class. The route and name in the file are the wzee.dev deployment; change them for your own.

## Where things are

- `app/`: the create page, the reveal page (`/s/[id]`) and the server actions.
- `lib/crypto`: AES-GCM encryption and key encoding.
- `lib/secret`: storage (the `SecretVault` Durable Object), validation, and the on-device history.
- `lib/scramble.ts`: the text scramble used while a secret decrypts.
- `components/secret`: the create form, the link card, the reveal card and the sidebar's nav and history.
- The shell around it (sidebar, tokens, buttons, motion) comes from [`@zeetools/ui`](../../packages/ui).

Privacy policy for all wzee.dev tools: [wzee.dev/privacy](https://wzee.dev/privacy).
