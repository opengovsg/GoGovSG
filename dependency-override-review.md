# Dependency override review

Candidates for `package.json` overrides that were **not** applied in the security-deps PR. Review each before adding.

## Remaining audit findings (5 as of this branch)

### 1. `tar` via `bcrypt` → `@mapbox/node-pre-gyp` (critical)

- **Status:** Resolved — upgraded `bcrypt` to `^6.0.0`.

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

- **Status:** Resolved — migrated to AWS SDK v3 modular clients.

### 5. `@typescript-eslint` v8 / ESLint 8 (high, dev-only)

- **Status:** Resolved — upgraded to `eslint@^8.57.0`, `eslint-config-airbnb@^19`, `@typescript-eslint/*@^8.66`, `@babel/eslint-parser`, `eslint-plugin-jest@^28`, `eslint-plugin-jsdoc@^50`, and `typescript@^4.9.5`. Applied ESLint autofixes for `react/function-component-definition` across client components; remaining Airbnb 19 rules that cannot be autofixed are disabled in `.eslintrc.json`.

### 6. `file-type` ASF parser DoS (moderate)

- **Status:** Resolved — upgraded to `file-type@^22.0.1` with Jest ESM/babel transforms.

## Previously considered (addressed in the security-deps PR without overrides)

| Package | Resolution |
|---------|------------|
| `nodemailer` | Direct upgrade to `^9.0.4` |
| `i18next-http-backend` | Direct upgrade to `^4.0.1` |
| `cookie-session` | Direct upgrade to `^2.1.1` (fixes `on-headers`) |
| `jest` / `ts-jest` | Upgraded to v29 |
| `webpack-dev-server` | Upgraded to v5 |
| `testcafe` | Upgraded to v3 |
| `@commitlint/travis-cli` | Removed (unused) |
| `bcrypt` | Upgraded to `^6.0.0` |
| `aws-sdk` v2 | Migrated to AWS SDK v3 modular clients |
| `uuid` (direct) | Upgraded to `^11.1.0` |
| `file-type` | Upgraded to `^22.0.1` with Jest ESM support |
| ESLint / `@typescript-eslint` | Upgraded to ESLint 8 + `@typescript-eslint` v8 |

## Do not use `npm audit fix --force`

It incorrectly suggests downgrades (`sequelize@3.x`, `aws-sdk@1.x`, `webpack-dev-server@1.x`) and corrupts `package.json`. Use targeted direct dependency updates and a fresh lockfile with `npm install --force` instead.

## Suggested follow-up order

1. `sharp@0.35+` (item 2) — blocked on Node 20
2. Transitive `uuid` in `sequelize` / `sockjs` — optional overrides if audit noise remains unacceptable
3. Adopt new Airbnb 19 lint rules incrementally (currently disabled in `.eslintrc.json`)
