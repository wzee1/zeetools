// Rebuilds and redeploys wzee.dev after a tool deploy: `node scripts/refresh-hub.mjs [slug]`.
// The wzee.dev code lives in the private zeetools-pro repo; this repo is public, so the checkout's path isn't written down here.
// Set WZEE_DEV_DIR in .env.local at this repo's root (git-ignored) to the zeetools-pro checkout. Without it, or with
// SKIP_HUB_REFRESH=1, this skips with a warning and the tool deploy still counts as done.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(rootDir, ".env.local");
if (existsSync(envFile)) process.loadEnvFile(envFile);

if (process.env.SKIP_HUB_REFRESH === "1") {
  console.log("refresh-hub: SKIP_HUB_REFRESH=1, not refreshing wzee.dev.");
  process.exit(0);
}

const hubDir = process.env.WZEE_DEV_DIR;
if (!hubDir) {
  console.warn("refresh-hub: WZEE_DEV_DIR isn't set in .env.local, so wzee.dev wasn't refreshed. Run the refresh from zeetools-pro by hand.");
  process.exit(0);
}
const script = join(hubDir, "scripts", "refresh-hub.mjs");
if (!existsSync(script)) {
  console.warn(`refresh-hub: ${script} not found (WZEE_DEV_DIR is wrong?), so wzee.dev wasn't refreshed.`);
  process.exit(0);
}

const slug = process.argv[2];
const result = spawnSync("node", slug ? [script, slug] : [script], { stdio: "inherit" });
process.exit(result.status ?? 1);
