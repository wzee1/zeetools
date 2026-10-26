# zeetools

The free, open-source tools of [wzee.dev](https://wzee.dev), and the UI package they share.

| Tool | What it does | Live |
| --- | --- | --- |
| [zeepass](apps/zeepass) | Share a secret as a link that works once. Encrypted in your browser; the key never reaches the server. | [pass.wzee.dev](https://pass.wzee.dev) |
| [zeeimage](apps/zeeimage) | Resize, compress and convert images in batch. Runs in Web Workers on your device. | [image.wzee.dev](https://image.wzee.dev) |
| [zeecall](apps/zeecall) | Video calls, screen sharing and file transfer peer to peer, with no account. | [call.wzee.dev](https://call.wzee.dev) |

## The privacy promise

These tools do the work on your device. No accounts, no cookies, no analytics. What little a server does is spelled out in each tool's README, and the policy for the whole suite lives at [wzee.dev/privacy](https://wzee.dev/privacy).

## Layout

```
packages/
  ui/        @zeetools/ui: the app shell, tokens, components, motion and commands
apps/
  zeepass/   Next.js on Cloudflare Workers (OpenNext)
  zeeimage/  Next.js static export
  zeecall/   Next.js static export, plus a signaling Worker
```

This is a pnpm workspace (`pnpm-workspace.yaml`). The apps depend on `@zeetools/ui` as `workspace:*`, so they use the local `packages/ui`, never the published package.

## Run it

You need Node.js 22 or newer.

```bash
pnpm install
pnpm --filter zeepass dev     # or zeeimage, zeecall
```

From the root, `pnpm run lint`, `typecheck`, `test`, `test:ct` and `build` run in every workspace that has the script. `pnpm install` also sets up the git hooks (Husky).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT, see [LICENSE](LICENSE). More at [wzee.dev](https://wzee.dev).
