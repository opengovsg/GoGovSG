# Dependency override review

Candidates for `package.json` overrides that were **not** applied in this PR. Review each before adding.

## Remaining audit findings (16 as of this branch)

### 1. `tar` via `bcrypt` → `@mapbox/node-pre-gyp` (critical)

- **Advisory:** Multiple node-tar path traversal / DoS issues (GHSA-34x7-hfp2-rc4v, etc.)
- **Chain:** `bcrypt@5.x` → `@mapbox/node-pre-gyp` → `tar@<=7.5.20`
- **Suggested fix:** Upgrade `bcrypt` to `^6.0.0` (native bindings change; verify hash/compare in auth flows)
- **Override alternative:** `"tar": ">=7.5.21"` under `bcrypt` / `@mapbox/node-pre-gyp`

### 2. `sharp` libvips CVEs (high)

- **Advisory:** GHSA-f88m-g3jw-g9cj
- **Suggested fix:** `sharp@>=0.35.0`
- **Blocker:** `sharp@0.35.x` requires Node `>=20.9.0`; repo `engines.node` is `18`
- **Options:** Bump Node to 20 LTS first, then upgrade sharp; or override only after Node upgrade

### 3. `uuid` (moderate)

- **Advisory:** GHSA-w5hq-g745-h8pq
- **Affected paths:**
  - `aws-sdk` (bundled uuid)
  - `sequelize` (depends on `uuid@^8.3.2`)
  - `webpack-dev-server` → `sockjs` → `uuid`
- **Suggested fix:** `uuid@>=11.1.1` (breaking API vs v8)
- **Override alternative:** Force `uuid` for `sockjs` only; Sequelize/aws-sdk need coordinated upgrades (aws-sdk v3 migration)

### 4. `aws-sdk` v2 region validation (moderate)

- **Advisory:** GHSA-j965-2qgj-vjmq
- **Suggested fix:** Migrate to `@aws-sdk/client-*` v3 or validate region input in application code
- **Note:** Not solvable with a version bump alone on v2; long-term migration item

### 5. `@typescript-eslint` v8 (high, dev-only)

- **Suggested fix:** `@typescript-eslint/eslint-plugin` and `parser` at `^8.x`
- **Blocker:** Requires `eslint@^8.57.0` and `eslint-config-airbnb@^19`; current stack uses ESLint 7 + `babel-eslint`
- **Options:** Migrate JS lint config to `@babel/eslint-parser`, then bump ESLint 8 + typescript-eslint 8
- **This PR:** Kept `@typescript-eslint@^6.16.0` for ESLint 7 compatibility

### 6. `file-type` ASF parser DoS (moderate)

- **Advisory:** GHSA-5v7r-6r5c-r473
- **Suggested fix:** `file-type@>=22.0.1`
- **Blocker:** v22+ is ESM-only; Jest/ts-jest currently loads it as CJS (`SyntaxError: Cannot use import statement outside a module`)
- **Options:** Add Jest `transformIgnorePatterns` / ESM support, or migrate file-type usage to dynamic `import()` in runtime code only

## Previously considered (addressed in this PR without overrides)

| Package | Resolution |
|---------|------------|
| `nodemailer` | Direct upgrade to `^9.0.4` |
| `i18next-http-backend` | Direct upgrade to `^4.0.1` |
| `cookie-session` | Direct upgrade to `^2.1.1` (fixes `on-headers`) |
| `jest` / `ts-jest` | Upgraded to v29 |
| `webpack-dev-server` | Upgraded to v5 |
| `testcafe` | Upgraded to v3 |
| `@commitlint/travis-cli` | Removed (unused; husky uses `@commitlint/cli` only) |

## Do not use `npm audit fix --force`

It incorrectly suggests downgrades (`sequelize@3.x`, `aws-sdk@1.x`, `webpack-dev-server@1.x`) and corrupts `package.json`. Use targeted direct dependency updates and a fresh lockfile with `npm install --force` instead.
