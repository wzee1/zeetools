import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// The dependency rule: app → components, hooks and lib. Code in those folders never reaches up into app.
const restrict = (files, groups) => ({
  files,
  rules: {
    "no-restricted-imports": [
      "error",
      { patterns: groups.map((group) => ({ group: [`@/${group}/*`], message: `${files.map((f) => f.replace("/**", "")).join(", ")} can't import from ${group}: they sit below app in the dependency order.` })) },
    ],
  },
});

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  restrict(["components/**", "hooks/**", "lib/**"], ["app"]),
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".open-next/**",
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
