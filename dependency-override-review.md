# Dependency override review

Candidates for `package.json` overrides that were **not** applied in the security-deps PR. Review each before adding.

## Remaining audit findings (11 as of this branch)

### 1. `tar` via `bcrypt` → `@mapbox/node-pre-gyp` (critical)

- **Status:** Resolved — upgraded `bcrypt` to `^6.0.0` (no longer pulls vulnerable `tar` chain).

### 2. `sharp` libvips CVEs (high)

- **Advisory:** GHSA-f88m-g3jw-g9cj
- **Suggested fix:** `sharp@>=0.35.0`
- **Blocker:** `sharp@0.35.x` requires Node `>=20.9.0`; repo `engines.node` is `18`
- **Resolution:** Skip for now. Revisit after Node 20 LTS upgrade.

### 3. `uuid` (moderate)

- **Advisory:** GHSA-w5hq-g745-h8pq
- **Status:** Direct dependency upgraded to `^11.1.0`. Remaining paths are transitive only:
  - `sequelize` → `uuid@^8.3.2`
  - `webpack-dev-server` → `sockjs` → `uuid`
- **Override alternative:** Force `uuid` for `sockjs` / `sequelize` only (not applied).

### 4. `aws-sdk` v2 region validation (moderate)

- **Status:** Resolved — migrated to `@aws-sdk/client-s3`, `@aws-sdk/client-sqs`, and `@aws-sdk/lib-storage` v3.

### 5. `@typescript-eslint` v8 (high, dev-only)

- **Suggested fix:** `@typescript-eslint/eslint-plugin` and `parser` at `^8.x`
- **Blocker:** Requires `eslint@^8.57.0` and `eslint-config-airbnb@^19`; current stack uses ESLint 7 + `babel-eslint`
- **Resolution:** Skip for now (dev-only). Revisit with ESLint 8 + `@babel/eslint-parser` migration.

### 6. `file-type` ASF parser DoS (moderate)

- **Status:** Resolved — upgraded to `file-type@^22.0.1`, switched to `fileTypeFromBuffer`, and added Jest/babel transforms for ESM dependencies (`file-type`, `strtok3`, `token-types`, `@tokenizer/*`, `@borewit/*`, `uint8array-extras`).

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
| `bcrypt` | Upgraded to `^6.0.0` |
| `aws-sdk` v2 | Migrated to AWS SDK v3 modular clients |
| `uuid` (direct) | Upgraded to `^11.1.0` |
| `file-type` | Upgraded to `^22.0.1` with Jest ESM support |

## Do not use `npm audit fix --force`

It incorrectly suggests downgrades (`sequelize@3.x`, `aws-sdk@1.x`, `webpack-dev-server@1.x`) and corrupts `package.json`. Use targeted direct dependency updates and a fresh lockfile with `npm install --force` instead.

## Suggested follow-up order

1. `sharp@0.35+` (item 2) — blocked on Node 20
2. ESLint 8 + `@typescript-eslint` v8 (item 5) — dev tooling only
3. Transitive `uuid` in `sequelize` / `sockjs` — optional overrides if audit noise remains unacceptable
