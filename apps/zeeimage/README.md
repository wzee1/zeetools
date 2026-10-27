# zeeimage

Resize, compress and convert images in your browser. Nothing is uploaded: every file is processed on your device in Web Workers. Part of the [wzee.dev](https://wzee.dev) suite, live at [image.wzee.dev](https://image.wzee.dev).

## What it does

A four-step flow. The modes are rows in the sidebar, and the mode is in the URL (`/` is the batch pipeline, `/?mode=favicon` and `/?mode=social` are the other two):

1. **Ingest.** Drop, paste or pick images (PNG, JPEG, WebP, GIF, SVG, BMP, ICO, and HEIC/HEIF where the browser can decode it, i.e. Safari).
2. **Configure.** Scale by percentage, width, height or exact size; pick PNG, JPEG, WebP or AVIF (where the browser supports it); set quality or lossless; strip or keep metadata; name the output with a pattern.
3. **Process.** Images are processed in parallel by a pool of Web Workers (`OffscreenCanvas`), with progress, size savings and a before/after comparison.
4. **Export.** Download single files or everything as a `.zip` built in memory.

Other modes: a **favicon generator** (a multi-size `.ico`, Apple touch icon and manifest icons from one image) and **social safe zones** (overlays that show where platform UI covers an image).

### Keyboard

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + O` | Open the file picker |
| `Ctrl/Cmd + Enter` | Confirm the settings and process |
| `Ctrl/Cmd + S` | Download everything as a `.zip` |
| `Esc` | Close the open overlay or reset the selection |
| `1` to `4` | Jump to a step you have completed |
| `Space` | Toggle before/after on the selected image |

## Run it

From the repository root:

```bash
pnpm install
pnpm --filter zeeimage dev
```

```bash
pnpm --filter zeeimage test
pnpm --filter zeeimage lint
pnpm --filter zeeimage typecheck
pnpm --filter zeeimage build     # static export into apps/zeeimage/out
```

The build is a plain static site (`output: "export"`), so it can be hosted anywhere that serves files.

`pnpm --filter zeeimage run deploy` builds it and serves `out` from the `zeeimage` Worker with static assets (`wrangler.jsonc`), then refreshes wzee.dev/tools. The first deploy creates the Worker and, through its `image.wzee.dev` custom domain, the DNS record, so the subdomain never exists without the app behind it. (New Cloudflare Pages projects now become Workers, which is why it doesn't use `wrangler pages deploy` like zeecall.)

## Where things are

- `app/page.tsx`: the stepper that ties the steps together.
- `components/steps`, `components/modes`, `components/shared`: the four steps, the two extra modes, and shared pieces (the sidebar's mode rows, comparison viewer). `lib/modes.ts` maps the URL to a mode.
- `hooks/use-image-pipeline.ts`: the worker pool and the batch state.
- `lib/processors`: the processing strategy, dimension and encode helpers, and the worker client.
- `lib/workers`: the Web Worker that resizes and encodes.
- `lib/zip.ts`, `lib/ico.ts`, `lib/heic.ts`, `lib/svg.ts`: the in-memory ZIP writer, the ICO encoder, the HEIC support check and the SVG rasteriser.
- Buttons, dialogs, tokens and motion come from [`@zeetools/ui`](../../packages/ui).

Privacy policy for all wzee.dev tools: [wzee.dev/privacy](https://wzee.dev/privacy).
