# Contributing

## Setup

You need Node.js 22 or newer.

```bash
npm install     # installs every workspace and sets up the git hooks
npm run dev --workspace zeepass
```

## Scripts

Run these from the repository root; each one runs in every workspace that has it.

| Script | What it does |
| --- | --- |
| `npm run lint` | ESLint, with no warnings allowed |
| `npm run typecheck` | TypeScript |
| `npm test` | Vitest unit and component tests |
| `npm run test:ct` | Cypress component tests (`@zeetools/ui`) |
| `npm run build` | Production builds of the apps |

To work on one workspace, add `--workspace <name>`, for example `npm test --workspace @zeetools/ui`.

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
