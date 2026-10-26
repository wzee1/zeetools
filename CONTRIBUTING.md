# Contributing

## Setup

You need Node.js 22 or newer.

```bash
pnpm install     # installs every workspace and sets up the git hooks
pnpm --filter zeepass dev
```

## Scripts

Run these from the repository root; each one runs in every workspace that has it.

| Script | What it does |
| --- | --- |
| `pnpm run lint` | ESLint, with no warnings allowed |
| `pnpm run typecheck` | TypeScript |
| `pnpm test` | Vitest unit and component tests |
| `pnpm run test:ct` | Cypress component tests (`@zeetools/ui`) |
| `pnpm run build` | Production builds of the apps |

To work on one workspace, use `pnpm --filter <name> <script>`, for example `pnpm --filter @zeetools/ui test`.

The pre-commit hook runs lint, typecheck, `test` and `test:ct`. If it fails, fix the cause; do not skip it.

## Commits

Titles look like `type: lowercase description`, with a type of `feat`, `fix`, `refactor`, `docs`, `chore`, `build`, `ci`, `test` or `perf` (or `style`), for example `fix: keep the sidebar width after a reload`. The `commit-msg` hook checks it.

## Code

- One component per file, as the default export. Radix-style compound primitives (dialog, select, tabs) keep their named exports.
- Shared UI belongs in `packages/ui`. An app keeps only its own product code.
- Inside `packages/ui`, import with relative paths: there is no `@/` alias, so the package works when installed from npm.
- No `any`, no `console.log`, no TODO comments. zeepass never uses `Math.random`.
- Icons used in command menus are Lucide components.
- Add or update tests next to the code you change.
