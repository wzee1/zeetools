// Custom Worker entry (https://opennext.js.org/cloudflare/howtos/custom-worker): OpenNext serves the app,
// and the Durable Object class that holds the secrets is exported from the same Worker.
// ts-ignore, not ts-expect-error: ./.open-next/worker.js only exists after `pnpm cf:build`, and the
// typecheck has to pass both with and without it.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import openNextWorker from "./.open-next/worker.js";

export { SecretVault } from "./lib/secret/vault";

const worker = {
  fetch: openNextWorker.fetch,
};

export default worker;
