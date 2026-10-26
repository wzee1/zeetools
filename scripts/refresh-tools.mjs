// `pnpm tools:refresh`, run at the end of each app's `deploy`: makes wzee.dev/tools re-read its list now,
// so a new or changed app shows up within a minute instead of at the next scheduled refresh.
// Reads TOOLS_REFRESH_SECRET from the root .env.local; TOOLS_REFRESH_URL points it at another site than wzee.dev.
// Without the secret (a fork, or a machine that isn't set up) it skips, so the deploy before it still counts.
const secret = process.env.TOOLS_REFRESH_SECRET;
if (!secret) {
  console.warn("TOOLS_REFRESH_SECRET isn't set (see .env.example), so wzee.dev/tools wasn't refreshed.");
} else {
  const url = new URL("/api/tools/refresh", process.env.TOOLS_REFRESH_URL ?? "https://wzee.dev");
  const res = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${secret}` } });
  console.log(`${url} ${res.status} ${await res.text()}`);
  if (!res.ok) process.exitCode = 1;
}
