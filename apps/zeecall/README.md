# zeecall

Video calls, screen sharing and file transfer straight between browsers, with no account. Part of the [wzee.dev](https://wzee.dev) suite, live at [call.wzee.dev](https://call.wzee.dev).

## What it does

- **No accounts.** Start a room in one click and share its link.
- **Peer to peer.** Audio, video and files travel directly between the participants' browsers over WebRTC (DTLS-SRTP and SCTP). No media or file passes through a server.
- **Screen sharing** with system audio, up to 4K at 60 fps where the browser and the hardware allow it.
- **File drop.** Files are sent over a WebRTC data channel in 64 KB chunks.
- **Shared scratchpad** that syncs over the data channel, with a Markdown export.
- **Keyboard controls.** `M` mic, `V` camera, `S` screen share, `Space` push to talk, `F` fullscreen, `Ctrl/Cmd + C` copy the invite, `Ctrl/Cmd + D` file drop, `Esc` leave.

### What the server sees

To connect two browsers, a small Cloudflare Worker (`worker/signaling-worker.ts`) forwards the handshake messages (session descriptions and network candidates) between the peers in a room. It keeps them in memory only, logs nothing and stores nothing, and forgets a room when its sockets close. In the page URL the room id lives in the fragment (`#room=...`), which browsers do not send to the site's server. To join a room, though, the browser does send the room id, its peer id and your display name to the signaling worker, in the WebSocket connection URL. The worker uses them only to pair the peers, but Cloudflare's own request logs for the worker may record that URL. A public STUN server is asked for the browser's public address, as WebRTC needs. TURN credentials, if you add your own, are kept in `localStorage`; the session peer id and display name live in `sessionStorage` and are cleared when the tab closes.

## Run it

From the repository root:

```bash
npm install
npm run dev --workspace zeecall
```

```bash
npm test --workspace zeecall
npm run lint --workspace zeecall
npm run typecheck --workspace zeecall
npm run build --workspace zeecall     # static export into apps/zeecall/out
```

The app is a static export (`output: "export"`); the signaling worker is deployed separately.

## Where things are

- `app/page.tsx`: the home, lobby and in-call states.
- `components/call`: the video grid, tiles, screen share view, controls dock, file drop and notes.
- `components/lobby`: device selection and the pre-call preview.
- `hooks/use-webrtc.ts`, `use-media-stream.ts`, `use-data-channel.ts`, `use-keyboard-controls.ts`: the peer connections, media, data channel and hotkeys.
- `lib/webrtc`: ICE configuration, media constraints, file transfer and connection stats.
- `lib/signaling`: the signaling client.
- `worker/signaling-worker.ts`: the signaling relay.
- Buttons, dialogs, tokens and motion come from [`@zeetools/ui`](../../packages/ui).

Privacy policy for all wzee.dev tools: [wzee.dev/privacy](https://wzee.dev/privacy).
