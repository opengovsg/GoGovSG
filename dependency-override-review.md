# Dependency override review

Candidates for `package.json` overrides that were **not** applied in the security-deps PR. Review each before adding.

## Remaining audit findings (16 as of this branch)

### 1. `tar` via `bcrypt` → `@mapbox/node-pre-gyp` (critical)

- **Advisory:** Multiple node-tar path traversal / DoS issues (GHSA-34x7-hfp2-rc4v, etc.)
- **Chain:** `bcrypt@5.x` → `@mapbox/node-pre-gyp` → `tar@<=7.5.20`
- **Override alternative:** `"tar": ">=7.5.21"` under `bcrypt` / `@mapbox/node-pre-gyp`
- **Resolution:** Upgrade `bcrypt` to `^6.0.0`. Verify `hash` / `compare` in auth flows (`CryptographyBcrypt`, `ApiKeyAuthService`). Do not use a tar override.

### 2. `sharp` libvips CVEs (high)

- **Advisory:** GHSA-f88m-g3jw-g9cj
- **Suggested fix:** `sharp@>=0.35.0`
- **Blocker:** `sharp@0.35.x` requires Node `>=20.9.0`; repo `engines.node` is `18`
- **Resolution:** Skip for now. Revisit after Node 20 LTS upgrade.

### 3. `uuid` (moderate)

- **Advisory:** GHSA-w5hq-g745-h8pq
- **Affected paths:**
  - `aws-sdk` (bundled uuid) — addressed by aws-sdk v3 migration (item 4)
  - `sequelize` (depends on `uuid@^8.3.2`)
  - `webpack-dev-server` → `sockjs` → `uuid`
- **Override alternative:** Force `uuid` for `sockjs` only
- **Resolution:** Upgrade `uuid` to `^11.1.1` (or latest 11.x) and fix breaking API changes at call sites. Coordinate with sequelize and any direct `uuid` imports.

### 4. `aws-sdk` v2 region validation (moderate)

- **Advisory:** GHSA-j965-2qgj-vjmq
- **Note:** Not solvable with a version bump alone on v2
- **Resolution:** Migrate to `@aws-sdk/client-*` v3. Replace `aws-sdk` imports with modular v3 clients (e.g. `@aws-sdk/client-s3`). Removes bundled v2 `uuid` advisory path.

### 5. `@typescript-eslint` v8 (high, dev-only)

- **Suggested fix:** `@typescript-eslint/eslint-plugin` and `parser` at `^8.x`
- **Blocker:** Requires `eslint@^8.57.0` and `eslint-config-airbnb@^19`; current stack uses ESLint 7 + `babel-eslint`
- **Resolution:** Skip for now (dev-only). Revisit with ESLint 8 + `@babel/eslint-parser` migration.

### 6. `file-type` ASF parser DoS (moderate)

- **Advisory:** GHSA-5v7r-6r5c-r473
- **Suggested fix:** `file-type@>=22.0.1`
- **Blocker:** v22+ is ESM-only; Jest/ts-jest currently loads it as CJS (`SyntaxError: Cannot use import statement outside a module`)
- **Resolution:** Add Jest ESM support (e.g. `extensionsToTreatAsEsm`, `transformIgnorePatterns` for `file-type`, or dynamic `import()` in `FileTypeFilterService` with test config updates). Then upgrade to `file-type@^22.0.1` and switch to `fileTypeFromBuffer` import.

## Previously considered (addressed in the security-deps PR without overrides)

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

## Suggested follow-up order

1. `bcrypt@^6` (item 1) — smallest runtime change, clears critical `tar` finding
2. Jest ESM + `file-type@^22` (item 6) — isolated to threat module + test config
3. `uuid` upgrade (item 3) — after or alongside aws-sdk v3
4. `aws-sdk` v3 migration (item 4) — largest change; clears v2 region + bundled uuid paths
5. `sharp@0.35+` (item 2) — blocked on Node 20
6. ESLint 8 + `@typescript-eslint` v8 (item 5) — dev tooling only
