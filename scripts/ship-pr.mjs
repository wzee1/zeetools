// Merges a contributor PR, deploys what it changed, and refreshes wzee.dev: `pnpm ship-pr <PR_NUMBER>`.
// `pnpm deploy:latest` skips the merge, for a PR already merged on GitHub.
//   - A change under packages/ or to pnpm-lock.yaml can change every app, so all of them are deployed.
//   - Otherwise only the apps/<name>/ folders in the merge commit are. zeecall's signaling Worker is its own deploy target,
//     deployed only when apps/zeecall/worker/ changed.
//   - Each app deploys with SKIP_HUB_REFRESH=1; wzee.dev is rebuilt once at the end.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pr = process.argv[2];

function run(command, args, env = {}) {
  const result = spawnSync(command, args, { cwd: rootDir, stdio: "inherit", env: { ...process.env, ...env } });
  if (result.status !== 0) {
    console.error(`ship-pr: ${command} ${args.join(" ")} failed`);
    process.exit(1);
  }
}

function output(command, args) {
  const result = spawnSync(command, args, { cwd: rootDir, encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`ship-pr: ${command} ${args.join(" ")} failed: ${result.stderr.trim()}`);
    process.exit(1);
  }
  return result.stdout.trim();
}

// Every app with a deploy script.
function deployableApps() {
  return readdirSync(join(rootDir, "apps")).filter((name) => {
    const manifest = join(rootDir, "apps", name, "package.json");
    return existsSync(manifest) && Boolean(JSON.parse(readFileSync(manifest, "utf8")).scripts?.deploy);
  });
}

if (pr !== undefined && !/^\d+$/.test(pr)) {
  console.error("Usage: pnpm ship-pr <PR_NUMBER>   (or pnpm deploy:latest)");
  process.exit(1);
}
if (output("git", ["status", "--porcelain"]) !== "") {
  console.error("ship-pr: the working tree has uncommitted changes; commit or stash them first.");
  process.exit(1);
}

if (pr) run("gh", ["pr", "merge", pr, "--squash", "--delete-branch"]);
run("git", ["checkout", "main"]);
run("git", ["pull", "--ff-only", "origin", "main"]);
// The merge may have changed dependencies.
run("pnpm", ["install", "--frozen-lockfile"]);

const changed = output("git", ["diff-tree", "--no-commit-id", "--name-only", "-r", "HEAD"]).split("\n").filter(Boolean);
const available = deployableApps();
const sharedChanged = changed.some((file) => file.startsWith("packages/") || file === "pnpm-lock.yaml");
const apps = sharedChanged
  ? available
  : available.filter((name) => changed.some((file) => file.startsWith(`apps/${name}/`)));
const signalingChanged = changed.some((file) => file.startsWith("apps/zeecall/worker/"));

if (apps.length === 0 && !signalingChanged) {
  console.log("ship-pr: the merge doesn't touch a deployable app; nothing to deploy.");
  process.exit(0);
}
console.log(`ship-pr: deploying ${apps.join(", ") || "no site"}${signalingChanged ? " + zeecall signaling" : ""}${sharedChanged ? " (shared code changed)" : ""}.`);

// `run deploy`: a bare `pnpm deploy` is pnpm's own command.
for (const name of apps) run("pnpm", ["--filter", name, "run", "deploy"], { SKIP_HUB_REFRESH: "1" });
if (signalingChanged) run("pnpm", ["--filter", "zeecall", "run", "deploy:signaling"]);

run("node", ["scripts/refresh-hub.mjs"]);
