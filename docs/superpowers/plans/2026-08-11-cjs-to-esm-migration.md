# CommonJS → ESM Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flip the GoGovSG server/build toolchain from implicit CommonJS to native ECMAScript Modules (`"type": "module"`), so the app isn't blocked from adopting ESM-only npm packages in the future.

**Architecture:** Work in "prepare, then flip" order. Every task up through the `"type": "module"` flip (Task 8) must leave the app **fully working under CommonJS** — each is independently committable and revertable. Only Task 8 changes the runtime module format; everything before it is scaffolding so that flip is a no-op for behavior. Tasks 9-10 fix the startup flags the flip invalidates, and Task 11 is end-to-end verification.

**Tech Stack:** Node 24, TypeScript 5.9 (`"module": "node16"`), webpack 5 + swc-loader, Jest + `@swc/jest`, Sequelize 6 + sequelize-cli, dd-trace 6, tsx (dev-time TS runner).

## Global Constraints

- Node engine is pinned to `"24"` in `package.json` (`engines.node`) — all fixes must work on Node 24, not older Node semantics.
- `src/server/serverless/**` is deployed to AWS Lambda (`runtime: nodejs14.x` in `serverless.yml`) as raw source files via `serverless-plugin-include-dependencies` — this plan must not require redeploying or changing Lambda runtime version to succeed.
- `migrations/*.js` run against production/staging/dev databases via `sequelize-cli` — must keep resolving under sequelize-cli's migration loader (verified pattern: `/^(?!.*\.d\.ts$).*\.(cjs|js|cts|ts)$/` in `node_modules/sequelize-cli/lib/core/migrator.js:52`).
- `dd-trace` (Datadog APM) must keep initializing correctly — it is loaded first in `src/server/index.ts` and patches Node's module loader; ESM apps need the additional `--import dd-trace/register.js` flag per `node_modules/dd-trace/README.md:77-80`.
- Client code (`src/client/**`) is always bundled by webpack and never executed by Node's native loader — it does **not** need explicit import extensions. Only `src/server/**` and `src/shared/**` (loaded natively by Node at runtime) need them.
- No task may leave the repo in a state where `pnpm build`, `pnpm start`, or `pnpm test` fails uncommitted — every task ends with a passing verification command.

---

### Task 1: Decouple Jest configs from the module-type flip

Jest's own config-file loader and the `test:integration` script both point at `.js` files. Once root `package.json` says `"type": "module"`, Jest would try to load these as ESM, and there's no reason to fight Jest's ESM support just for a config file — renaming to `.cjs` sidesteps it completely and works identically today (CJS is unaffected by this rename).

**Files:**
- Rename: `jest.config.js` → `jest.config.cjs`
- Rename: `test/integration/jest.config.js` → `test/integration/jest.config.cjs`
- Modify: `package.json` (the `test:integration` script)

- [ ] **Step 1: Rename the two config files**

```bash
git mv jest.config.js jest.config.cjs
git mv test/integration/jest.config.js test/integration/jest.config.cjs
```

- [ ] **Step 2: Update the `test:integration` script**

In `package.json`, change:

```json
"test:integration": "jest --config=./test/integration/jest.config.js",
```

to:

```json
"test:integration": "jest --config=./test/integration/jest.config.cjs",
```

- [ ] **Step 3: Verify**

Run: `pnpm test -- --listTests`
Expected: exits 0 and lists the unit test files (proves Jest still finds `jest.config.cjs` with zero `--config` flag needed, since Jest auto-discovers `jest.config.cjs`).

Run: `pnpm test:integration -- --listTests`
Expected: exits 0 and lists the integration test files.

- [ ] **Step 4: Commit**

```bash
git add jest.config.cjs test/integration/jest.config.cjs package.json
git commit -m "chore: rename jest configs to .cjs ahead of ESM migration"
```

---

### Task 2: Isolate Lambda functions from the module-type flip

`src/server/serverless/**` (4 Lambda functions: `bulk-qrcode-generation`, `capture-ses-events`, `lambda-migrate-user-links`, `lambda-migrate-url-to-user`) are plain `require()`/`module.exports` files, deployed as raw source (not through the `tsc` build). Each deployed zip also bundles a copy of the **root** `package.json` (see `serverless.yml` `package.patterns`, e.g. lines 27-28). Once root `package.json` says `"type": "module"`, that bundled copy would force these `.js` files to be parsed as ESM and crash on `require`/`module.exports` on next invocation — a production Lambda break with no local test coverage.

The safest fix: give the `serverless/` subtree its own `package.json` declaring `"type": "commonjs"`. Node resolves the nearest `package.json` per-directory, so this fully decouples these functions from the root flip without touching any handler code, `serverless.yml` patterns, or the pinned `nodejs14.x` runtime.

**Files:**
- Create: `src/server/serverless/package.json`

- [ ] **Step 1: Create the override package.json**

```json
{
  "type": "commonjs"
}
```

- [ ] **Step 2: Verify it doesn't break the existing Lambda source**

Run: `node -e "require('./src/server/serverless/bulk-qrcode-generation/qrCode.js')"`
Expected: no `Cannot use import statement`/`exports is not defined` error (module loads; it may throw on missing runtime env vars when actually invoked, which is fine — we're only checking it's parsed as CJS).

- [ ] **Step 3: Commit**

```bash
git add src/server/serverless/package.json
git commit -m "chore: pin serverless/ subtree to CommonJS ahead of ESM migration"
```

**Note for whoever owns Lambda deploys:** this task cannot be fully verified locally (no local Lambda invoke in this repo). After merging, confirm the next deploy of these 4 functions still runs cleanly. If it doesn't, the fallback is renaming the source files `.js` → `.cjs` instead, but try the `package.json` override first — it requires no `serverless.yml` changes.

---

### Task 3: Rename Sequelize migrations to `.cjs`

Same problem as Task 2, different subsystem: `migrations/*.js` are `module.exports = { up, down }` CommonJS files at the **repo root**, so a root `package.json` override won't help (they're not in a subdirectory we can scope). sequelize-cli's migration loader explicitly supports `.cjs` (confirmed via `node_modules/sequelize-cli/lib/core/migrator.js:52`: pattern `/^(?!.*\.d\.ts$).*\.(cjs|js|cts|ts)$/`), so renaming is a safe, zero-behavior-change fix. `config/config.js` does **not** need to change — it already uses `export default` and Node 24 already parses it as ESM today via syntax auto-detection (confirmed empirically).

**Files:**
- Rename: `migrations/20250804092620-add-urls-safebrowsing-expiry.js` → `.cjs`
- Rename: `migrations/20251218095856-add-index-urlShortUrl.js` → `.cjs`
- Rename: `migrations/20260129133521-clicks-idx.js` → `.cjs`

- [ ] **Step 1: Rename all three migration files**

```bash
git mv migrations/20250804092620-add-urls-safebrowsing-expiry.js migrations/20250804092620-add-urls-safebrowsing-expiry.cjs
git mv migrations/20251218095856-add-index-urlShortUrl.js migrations/20251218095856-add-index-urlShortUrl.cjs
git mv migrations/20260129133521-clicks-idx.js migrations/20260129133521-clicks-idx.cjs
```

- [ ] **Step 2: Verify sequelize-cli still discovers and can run them**

Run: `source .env.test && pnpm exec sequelize-cli db:migrate:status`
Expected: all three migrations listed (as `up` or `down`, matching current DB state) — proves the `.cjs` extension is picked up by the migration glob.

- [ ] **Step 3: Commit**

```bash
git add migrations/
git commit -m "chore: rename sequelize migrations to .cjs ahead of ESM migration"
```

---

### Task 4: Convert `webpack.config.ts` to ESM syntax

`webpack.config.ts` currently uses `module.exports = () => {...}` and `__dirname` (both invalid once this file is loaded as ESM), plus `require.resolve(...)` inside `resolve.fallback` for two polyfill packages. It's loaded today via `NODE_OPTIONS='-r tsx/cjs'` (tsx's CJS-loader hook); once the app is ESM, this becomes `NODE_OPTIONS='--import tsx'` (tsx's ESM-loader hook, per tsx's documented API for `--import`).

Because `src/shared/**` (which this config imports, and which server code also imports) will get explicit `.js` extensions in Task 6, webpack must be told that a `.js`-suffixed request can resolve to a `.ts`/`.tsx` source file on disk — otherwise the client bundle breaks. This is done via `resolve.extensionAlias`.

**Files:**
- Modify: `webpack.config.ts`
- Modify: `package.json` (the `build` and `client-dev` scripts)

- [ ] **Step 1: Rewrite the top and bottom of `webpack.config.ts`**

Replace lines 1-12:

```ts
import path from 'path'
import { fileURLToPath } from 'url'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import { CleanWebpackPlugin } from 'clean-webpack-plugin'
import webpack from 'webpack'

import assetVariant from './src/shared/util/asset-variant.js'
import { ddEnv, ddService } from './src/shared/util/environment-variables.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const outputDirectory = 'dist'
const srcDirectory = path.join(__dirname, 'src/client/app')

const assetResolveDir = `assets/${assetVariant}`
```

(The `.js` extensions on the two `./src/shared/...` imports are required once Task 6 adds explicit extensions there — TypeScript's `node16` resolution needs the specifier to say `.js` even though the source file is `.ts`.)

- [ ] **Step 2: Replace `module.exports =` with `export default`**

Change line 45 from:

```ts
module.exports = () => {
```

to:

```ts
export default () => {
```

- [ ] **Step 3: Fix `resolve.fallback`'s `require.resolve` calls and add `extensionAlias`**

Change the `resolve` block (originally lines 61-81) from:

```ts
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', '.png', '.svg'],
      alias: {
        '~': srcDirectory,
        '@assets': path.resolve(srcDirectory, assetResolveDir),
      },
      fallback: {
        path: require.resolve('path-browserify'),
        url: require.resolve('url/'),
        querystring: require.resolve('querystring-es3'),
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
      },
    },
```

to:

```ts
    resolve: {
      extensions: ['.jsx', '.js', '.tsx', '.ts', '.json', '.png', '.svg'],
      extensionAlias: {
        '.js': ['.js', '.ts', '.tsx'],
      },
      alias: {
        '~': srcDirectory,
        '@assets': path.resolve(srcDirectory, assetResolveDir),
      },
      fallback: {
        path: require.resolve('path-browserify'),
        url: require.resolve('url/'),
        querystring: require.resolve('querystring-es3'),
        zlib: false,
        http: false,
        https: false,
        stream: false,
        crypto: false,
      },
    },
```

**Correction (found during implementation, not caught during planning):** `import.meta.resolve` was the originally planned approach here, but it throws `TypeError: ... .resolve is not a function` at runtime — tsx (esbuild-based) transpiles this ESM-syntax config down to CJS on the fly even when loaded via `--import tsx`, and its `import.meta` shim for CJS output doesn't implement `.resolve()`. The working fix is Node's documented CJS-interop pattern: `createRequire(import.meta.url)`, which is a real function call unaffected by tsx's `import.meta` shim regardless of whether the underlying load is CJS or ESM. Add to the Step 1 import block:

```ts
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
```

Then use plain `require.resolve(...)` as shown above (this shadows the ambient Node `require` global with a real, working one scoped to this file — it is not the removed CJS `require`, it's an explicit Node builtin call).

- [ ] **Step 4: Fix the remaining `__dirname` use in `output.path`**

No change needed — it already reads `path.join(__dirname, outputDirectory)` at (originally) line 56, and `__dirname` is now the `const` defined in Step 1.

- [ ] **Step 5: Update the `build` and `client-dev` scripts in `package.json`**

Change:

```json
"build": "tsc && NODE_OPTIONS='-r tsx/cjs' webpack --mode production",
"client-dev": "NODE_OPTIONS='-r tsx/cjs' webpack serve --mode development --host 0.0.0.0 --devtool inline-source-map --hot",
```

to:

```json
"build": "tsc && NODE_OPTIONS='--import tsx' webpack --mode production",
"client-dev": "NODE_OPTIONS='--import tsx' webpack serve --mode development --host 0.0.0.0 --devtool inline-source-map --hot",
```

- [ ] **Step 6: Verify — this is the riskiest single step in the whole plan**

webpack-cli's internal config loader may call `require()` on the config file rather than `import()`, in which case `--import tsx` (an ESM-only hook) won't intercept it and the build will fail with a syntax error on `export default`. This must be tested empirically, not assumed:

Run: `pnpm run build`
Expected: completes successfully, producing `dist/bundle.js` and `build/server/**`.

If it fails with a `SyntaxError: Unexpected token 'export'` or similar: webpack-cli is `require()`-ing the config. In that case, keep `NODE_OPTIONS='-r tsx/cjs'` for the webpack scripts specifically (tsx's CJS hook already handles ESM-syntax source files fine by transpiling down to CJS on the fly — it does not require the *source* file to be written in CJS syntax) and revert Step 5's `package.json` change. Note this exception in the commit message if hit.

- [ ] **Step 7: Commit**

```bash
git add webpack.config.ts package.json
git commit -m "chore: convert webpack.config.ts to ESM syntax"
```

---

### Task 5: Convert `src/server/api/**` route modules from CJS export to `export default`

`src/server/api/index.ts` wires up 13 route modules via `require('./xxx')` calls, several inline inside `router.use(...)` call expressions. The route modules themselves use two different CJS export styles (`export = router` — TypeScript's CJS-interop syntax — and `module.exports = router`), neither of which is valid under native ESM. Grepped confirmation that **only** `src/server/api/index.ts` imports these 13 files directly (no other production or test code imports them by path).

**Files:**
- Modify: `src/server/api/logout.ts:13`, `src/server/api/statistics.ts:17`, `src/server/api/user/index.ts:188`, `src/server/api/admin-v1/index.ts:30`, `src/server/api/external-v1/index.ts:69` (all currently `export = router`)
- Modify: `src/server/api/login/index.ts:73`, `src/server/api/links.ts:17`, `src/server/api/ga.ts:15`, `src/server/api/qrcode.ts:49`, `src/server/api/link-statistics.ts:41`, `src/server/api/link-audit.ts:37`, `src/server/api/directory.ts:35`, `src/server/api/callback.ts:33` (all currently `module.exports = router`)
- Modify: `src/server/api/index.ts`

- [ ] **Step 1: Change every route file's export line**

In each of the 13 files listed above, change the final export line (whichever form it currently is) to:

```ts
export default router
```

- [ ] **Step 2: Rewrite `src/server/api/index.ts`'s imports and usages**

Replace the `require()` calls (lines 17-21, 104-108, 114, 125, 128) with top-level imports and pass the imported router directly. The file becomes:

```ts
import Express from 'express'
import jsonMessage from '../util/json'
import { DependencyIds, ERROR_404_PATH } from '../constants'
import { displayHostname, ffExternalApi } from '../config'
import assetVariant from '../../shared/util/asset-variant'
import { container } from '../util/inversify'
import ApiKeyAuthService from '../modules/user/services/ApiKeyAuthService'

import logoutRouter from './logout'
import loginRouter from './login'
import statisticsRouter from './statistics'
import linksRouter from './links'
import gaRouter from './ga'
import userRouter from './user'
import qrcodeRouter from './qrcode'
import linkStatisticsRouter from './link-statistics'
import linkAuditRouter from './link-audit'
import directoryRouter from './directory'
import callbackRouter from './callback'
import adminV1Router from './admin-v1'
import externalV1Router from './external-v1'

const BEARER_STRING = 'Bearer'
const BEARER_SEPARATOR = ' '
const apiKeyAuthService = container.get<ApiKeyAuthService>(
  DependencyIds.apiKeyAuthService,
)
const router = Express.Router()

/*  Public routes that do not need to be protected */
router.use('/logout', logoutRouter)
router.use('/login', loginRouter)
router.use('/stats', statisticsRouter)
router.use('/links', linksRouter)
router.use('/ga', gaRouter)

/**
 * To protect private user routes.
 * */
function userGuard(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    res.unauthorized(jsonMessage('Unauthorized'))
    return
  }
  req.body.userId = req.session.user.id
  next()
}

/**
 * To protect external-v1 APIs by APIKey.
 * */
async function apiKeyAuthMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const authorizationHeader = req.headers.authorization
  if (!authorizationHeader) {
    res.unauthorized(jsonMessage('Authorization header is missing'))
    return
  }
  const [bearerString, apiKey] = authorizationHeader.split(BEARER_SEPARATOR)
  if (bearerString !== BEARER_STRING) {
    res.unauthorized(jsonMessage('Invalid authorization header format'))
    return
  }
  try {
    const user = await apiKeyAuthService.getUserByApiKey(apiKey)
    if (!user) {
      res.unauthorized(jsonMessage('Invalid API Key'))
      return
    }
    req.body.userId = user.id
    next()
  } catch {
    res.unauthorized(jsonMessage('Invalid API Key'))
    return
  }
}

/**
 * To add guard for admin-user only api routes.
 * */
async function apiKeyAdminAuthMiddleware(
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction,
) {
  const { userId } = req.body
  const isAdmin = await apiKeyAuthService.isAdmin(userId)
  if (!isAdmin) {
    res.unauthorized(jsonMessage('User is unauthorized'))
    return
  }
  next()
}

/**
 *  Preprocess request parameters.
 * */
function preprocess(
  req: Express.Request,
  _: Express.Response,
  next: Express.NextFunction,
) {
  if (req.body.email && typeof req.body.email === 'string') {
    req.body.email = req.body.email.trim().toLowerCase()
  }

  next()
}

/* Register protected endpoints */
router.use('/user', userGuard, preprocess, userRouter)
router.use('/qrcode', userGuard, qrcodeRouter)
router.use('/link-stats', userGuard, linkStatisticsRouter)
router.use('/link-audit', userGuard, linkAuditRouter)
router.use('/directory', userGuard, directoryRouter)

router.use(
  '/callback',
  apiKeyAuthMiddleware,
  apiKeyAdminAuthMiddleware,
  callbackRouter,
)

/* Register APIKey protected endpoints */
if (ffExternalApi) {
  router.use(
    '/v1/admin',
    apiKeyAuthMiddleware,
    apiKeyAdminAuthMiddleware,
    preprocess,
    adminV1Router,
  )
  router.use('/v1', apiKeyAuthMiddleware, preprocess, externalV1Router)
}

router.use((_, res) => {
  res.status(404).render(ERROR_404_PATH, {
    assetVariant,
    displayHostname,
  })
})

export default router
```

(Note: the two `// eslint-disable-next-line node/global-require` comments are dropped since there's no more `require()` to suppress a lint rule for.)

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: no errors referencing `src/server/api/`.

Run: `pnpm test -- --testPathPattern=api`
Expected: existing API route tests (e.g. `test/server/api/LogoutRoute.test.ts`) still pass — they hit these routes over HTTP via supertest, so the export-style change is transparent to them.

- [ ] **Step 4: Commit**

```bash
git add src/server/api/
git commit -m "refactor: convert server api route modules from CJS exports to ESM"
```

---

### Task 6: Fix remaining `require()` usages outside `src/server/api/`

**Files:**
- Modify: `src/server/index.ts:24`
- Modify: `src/client/app/index.tsx:5-6`

- [ ] **Step 1: Fix `src/server/index.ts` — do NOT convert this one to a static `import`**

**Correction (found during implementation, not caught during planning):** this file's `require('./api')` sits behind an existing comment the original author wrote specifically to prevent the naive fix:

```ts
// Happens at the top so all imports will have
// properly-bound containers
bindInversifyDependencies()

// Routes.
// A dynamic require, not a static import: ES imports are hoisted above
// bindInversifyDependencies() by some compilers, but api/index.ts resolves
// inversify bindings at module-load time and needs binding registration to
// have already run.
const api = require('./api').default
```

`src/server/api/index.ts` calls `container.get<ApiKeyAuthService>(...)` at its own module top level (module-load time, not lazily). Under real ESM, **every** static `import` declaration in a file is hoisted and fully evaluated — including all of the target module's top-level side effects — before any of the importing module's own top-level statements run, regardless of where the `import` is textually written. So a static `import api from './api'` would run `./api`'s `container.get(...)` before `bindInversifyDependencies()` executes, no matter which line the import sits on — reintroducing exactly the bug the original comment documents. (This also means the general "convert require() to import" instruction that the rest of this task and Task 5 use does NOT apply here — this call site is the one deliberate exception in the codebase.)

The correct fix, consistent with Task 4's precedent for the same category of problem: use `createRequire(import.meta.url)` (a real Node builtin, works under real ESM) to get a `require` function that still executes synchronously at its exact textual position — preserving the original ordering guarantee. Change:

```ts
const api = require('./api').default
```

to (keep this positioned exactly where it is today, after `bindInversifyDependencies()` — do not move it up with the other imports):

```ts
import { createRequire } from 'module'

// ... (keep this near the top with the other imports, alongside `import path from 'path'`)

// Routes.
// A dynamic require, not a static import: ES imports are hoisted above
// bindInversifyDependencies() by some compilers, but api/index.ts resolves
// inversify bindings at module-load time and needs binding registration to
// have already run.
const require = createRequire(import.meta.url)
const api = require('./api').default
```

Add the `import { createRequire } from 'module'` line near the top alongside the other imports (e.g. next to `import path from 'path'`). Keep the `const require = createRequire(import.meta.url)` and `const api = require('./api').default` lines exactly where the original `const api = require('./api').default` line was — after `bindInversifyDependencies()` — along with the existing explanatory comment (keep it verbatim; it's still accurate and explains why this one call site is deliberately not a static import).

- [ ] **Step 2: Fix `src/client/app/index.tsx`**

Change lines 5-6 from:

```ts
require('core-js/stable')
require('regenerator-runtime/runtime')
```

to:

```ts
import 'core-js/stable'
import 'regenerator-runtime/runtime'
```

Move these two lines up next to the file's other imports if they aren't already at the top (side-effect-only imports must still execute in the same relative order for polyfills to apply before use).

- [ ] **Step 3: Verify**

Run: `pnpm typecheck && pnpm test`
Expected: no new errors; full unit suite still passes.

- [ ] **Step 4: Commit**

```bash
git add src/server/index.ts src/client/app/index.tsx
git commit -m "refactor: replace remaining require() calls with ESM imports"
```

---

### Task 7: Fix `__dirname` usage in `src/server/index.ts` and `QrCodeService.ts`

**Known issue (found during Task 6, applies here too):** `tsconfig.json`'s `"module": "node16"` determines each file's module kind (CommonJS vs ESM) from the *nearest `package.json`'s `"type"` field* — and that field isn't set to `"module"` until Task 9. Until then, TypeScript treats every file under `src/` as CommonJS and rejects `import.meta` with **TS1470** ("The 'import.meta' meta-property is only allowed when the '--module' option is 'es2020', 'es2022', 'esnext', 'system', 'node16', 'node18', or 'nodenext'"), even though `"node16"` is literally in that allowed list — the per-file detection still needs the package.json flag. This is an inherent ordering artifact of doing this migration incrementally (prepare everything, flip the switch last) — not a mistake to fix by reordering tasks (flipping `"type": "module"` earlier would break the build for every commit in between, violating this plan's Global Constraints).

**The fix used in Task 6 and required here too:** suppress the specific error with a scoped `// @ts-ignore TS1470` comment directly above each `import.meta` use, with a short note that it's temporary. Task 9 (Step 4, added below) removes all of these once the flip makes them unnecessary.

**Files:**
- Modify: `src/server/index.ts:158`
- Modify: `src/server/modules/qr/services/QrCodeService.ts:63`

**Correction (found during implementation, not caught during planning):** reusing the exact name `__dirname` for the new local `const` collides with Node's CommonJS module-wrapper function, which supplies `__dirname` as an implicit parameter of that wrapper — and while this file still compiles to CommonJS output (true until Task 9's flip), `const`/`let` cannot redeclare an existing parameter name in the same scope (a genuine `SyntaxError: Identifier '__dirname' has already been declared'`; `var` can redeclare it, but that trades one workaround for a `var`/lint-suppression one). The clean fix that avoids the collision entirely: **name the local binding something other than `__dirname`** (e.g. `dirname`) and update the one usage site in each file accordingly. This keeps `const`, needs no `eslint-disable` comment, and needs no `var`.

- [ ] **Step 1: Add the `dirname` shim to `src/server/index.ts`**

Near the top of the file (after the existing `import path from 'path'`), add:

```ts
import { fileURLToPath } from 'url'

// @ts-ignore TS1470 - import.meta is invalid under tsc's current CJS-per-file
// detection until Task 9 flips package.json to "type": "module"; valid at
// runtime on Node 24 regardless. Remove this ts-ignore in Task 9.
const dirname = path.dirname(fileURLToPath(import.meta.url))
```

Change line 158 from `app.set('views', path.resolve(__dirname, './views'))` to `app.set('views', path.resolve(dirname, './views'))`.

- [ ] **Step 2: Add the same shim to `QrCodeService.ts`**

Check the file's existing imports first (`src/server/modules/qr/services/QrCodeService.ts`), then add near the top:

```ts
import { fileURLToPath } from 'url'

// @ts-ignore TS1470 - import.meta is invalid under tsc's current CJS-per-file
// detection until Task 9 flips package.json to "type": "module"; valid at
// runtime on Node 24 regardless. Remove this ts-ignore in Task 9.
const dirname = path.dirname(fileURLToPath(import.meta.url))
```

Change line 63 from `const filePath = resolve(__dirname, ...)` to `const filePath = resolve(dirname, ...)`.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: no errors.

Run: `pnpm test -- --testPathPattern=Qr`
Expected: existing QR service tests pass (they exercise `QrCodeService`'s file-path resolution).

- [ ] **Step 4: Commit**

```bash
git add src/server/index.ts src/server/modules/qr/services/QrCodeService.ts
git commit -m "fix: replace __dirname with import.meta.url equivalent"
```

---

### Task 8: Add explicit `.js` extensions to relative imports under `src/server` and `src/shared`

TypeScript's `"module": "node16"` resolution (already set in `tsconfig.json`) requires every relative import to include the extension the *compiled output* will have (`.js`, even though the source is `.ts`) once the nearest `package.json` says `"type": "module"`. This applies only to `src/server/**` and `src/shared/**` — `src/client/**` is bundled by webpack and never hits Node's native resolver. `__tests__` directories are excluded (`tsconfig.json` already excludes them from the build; Jest resolves those via its own transform, unaffected by extensions).

This is a mechanical, ~600+ call-site change — write and run a codemod rather than hand-editing.

**Files:**
- Create (temporary, deleted after use): `scripts/add-esm-extensions.mjs`
- Modify: every non-`__tests__` `.ts`/`.tsx` file under `src/server/` and `src/shared/` that has a relative import without an extension

- [ ] **Step 1: Write the codemod**

Create `scripts/add-esm-extensions.mjs`:

```js
import ts from 'typescript'
import fs from 'fs'
import path from 'path'

const ROOTS = ['src/server', 'src/shared']
const SOURCE_EXTS = ['.ts', '.tsx']

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__' || entry.name === 'node_modules') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (SOURCE_EXTS.some((ext) => entry.name.endsWith(ext))) {
      out.push(full)
    }
  }
  return out
}

function resolveSpecifier(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec)
  if (fs.existsSync(`${base}.ts`) || fs.existsSync(`${base}.tsx`)) {
    return `${spec}.js`
  }
  if (fs.existsSync(base) && fs.statSync(base).isDirectory()) {
    if (
      fs.existsSync(path.join(base, 'index.ts')) ||
      fs.existsSync(path.join(base, 'index.tsx'))
    ) {
      return `${spec}/index.js`
    }
  }
  if (fs.existsSync(`${base}.json`)) {
    return `${spec}.json`
  }
  throw new Error(`Cannot resolve relative import "${spec}" from ${fromFile}`)
}

const files = ROOTS.flatMap((root) => walk(root))
let totalFiles = 0
let totalEdits = 0

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    file.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const edits = []

  const visit = (node) => {
    const hasModuleSpecifier =
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    if (hasModuleSpecifier) {
      const spec = node.moduleSpecifier.text
      if (spec.startsWith('.') && !/\.(js|jsx|json|css)$/.test(spec)) {
        const newSpec = resolveSpecifier(file, spec)
        edits.push({
          start: node.moduleSpecifier.getStart(sourceFile) + 1,
          end: node.moduleSpecifier.getEnd() - 1,
          text: newSpec,
        })
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)

  if (edits.length) {
    edits.sort((a, b) => b.start - a.start)
    let out = source
    for (const edit of edits) {
      out = out.slice(0, edit.start) + edit.text + out.slice(edit.end)
    }
    fs.writeFileSync(file, out)
    totalFiles += 1
    totalEdits += edits.length
  }
}

console.log(`Updated ${totalEdits} import(s) across ${totalFiles} file(s).`)
```

- [ ] **Step 2: Run it**

```bash
node scripts/add-esm-extensions.mjs
```

Expected: prints `Updated <N> import(s) across <M> file(s).` with no thrown errors. If it throws `Cannot resolve relative import "..."`, inspect that specific import by hand (likely a path-mapped or non-existent import) and fix the codemod's resolution logic or that one import manually, then re-run.

- [ ] **Step 3: Verify with the type checker**

Run: `pnpm typecheck`
Expected: no `TS2835` ("relative import paths need explicit file extensions") errors remaining. Any other new errors indicate the codemod picked a wrong extension (e.g. resolved to a file that also has a sibling `.tsx` — fix by hand).

- [ ] **Step 4: Delete the throwaway codemod**

```bash
rm scripts/add-esm-extensions.mjs
rmdir scripts 2>/dev/null || true
```

- [ ] **Step 5: Full regression check**

Run: `pnpm test`
Expected: full unit suite passes unchanged (Jest doesn't care about the extensions, but this confirms the codemod didn't silently point any import at the wrong file).

- [ ] **Step 6: Commit**

```bash
git add src/server src/shared
git commit -m "chore: add explicit .js extensions to server/shared relative imports"
```

---

### Task 8b: Extend the `.js`-extension codemod to `src/client`

**Gap found while implementing Task 9, not caught during planning:** Task 8 scoped the extension codemod to `src/server`/`src/shared` on the reasoning that `src/client` is always bundled by webpack, which doesn't need extensions at runtime. That reasoning is correct for *webpack's* module resolution, but wrong for *TypeScript's*: `pnpm typecheck` runs `tsc --noEmit -p tsconfig.json`, and `tsconfig.json`'s `"include": ["src"]` covers `src/client` too. Once `package.json` gets `"type": "module"` (Task 9), TypeScript's `"module": "node16"` resolution treats every file under `src` as ESM — including `src/client` — and demands explicit extensions on all of them, not just server/shared. Attempting Task 9 surfaced 682 typecheck errors, all under `src/client/**`, confirming this.

This is safe to fix the same way Task 8 did: Task 4 already added `resolve.extensionAlias: { '.js': ['.js', '.ts', '.tsx'] }` to `webpack.config.ts` specifically so that a `.js`-suffixed relative specifier still resolves to a `.ts`/`.tsx` source file when webpack bundles it — so extension-izing `src/client`'s relative imports does not break the client build.

**Files:**
- Create (temporary, deleted after use): `scripts/add-esm-extensions.mjs`
- Modify: every non-`__tests__` `.ts`/`.tsx` file under `src/client/` that has a relative import without an extension

- [ ] **Step 1: Write the codemod**

Use the same approach as Task 8, adapted for this repo's actual toolchain (Task 8 found that this repo's `typescript@^7.0.2` is the native Go-based compiler and does not expose the classic JS Compiler API — `ts.createSourceFile`, `ts.forEachChild`, etc. are all `undefined`). Task 8's implementer substituted `@babel/parser` (already present in `node_modules` as a transitive dependency, not a new addition to `package.json`) for parsing, keeping the same file-resolution and edit-application logic as originally specified. Write `scripts/add-esm-extensions.mjs` using `@babel/parser` (with the `jsx` and `typescript` plugins enabled, since `src/client` has `.tsx` files) to parse each file, walk the AST for `ImportDeclaration`/`ExportNamedDeclaration`/`ExportAllDeclaration` nodes with a string-literal relative `source` not already ending in `.js`/`.jsx`/`.json`/`.css`, and rewrite just the string body — following the same `resolveSpecifier` logic Task 8 used (resolve to `.ts`/`.tsx` sibling → `.js`; directory with `index.ts`/`index.tsx` → `/index.js`; `.d.ts`-only module → `.../index.js`; already-`.json` → unchanged extension).

Set `ROOTS = ['src/client']` (only — `src/server`/`src/shared` are already done from Task 8; do not re-run against them).

Also handle the asset-alias imports specific to client code (e.g. `@assets/...` and `~/...` webpack aliases, and imports of `.svg`/`.png`/`.css` files) — these are NOT relative specifiers (don't start with `.`) and must be left untouched; only touch specifiers starting with `.`/`..`, exactly as Task 8's `resolveSpecifier` did.

- [ ] **Step 2: Run it**

```bash
node scripts/add-esm-extensions.mjs
```

If it throws `Cannot resolve relative import "..."` for a handful of cases, inspect and fix those specific imports or extend the resolution logic, following the same process Task 8 used for its one `.d.ts`-only edge case.

- [ ] **Step 3: Verify with the type checker**

Run: `pnpm typecheck`
Expected: the 682 `src/client/**` errors from the blocked Task 9 attempt are gone, and no new errors appear anywhere else.

- [ ] **Step 4: Delete the throwaway codemod**

```bash
rm scripts/add-esm-extensions.mjs
```

- [ ] **Step 5: Full regression check**

Run: `pnpm test`
Expected: same baseline as Task 8 (59 suites / 488 passed / 4 skipped) — Jest doesn't care about the extensions for the reason already established (its `moduleNameMapper` added in Task 8 handles `.js`→`.ts` resolution generically, not scoped to server/shared).

- [ ] **Step 6: Verify the client bundle still builds**

Run: `ASSET_VARIANT=gov pnpm run build`
Expected: completes successfully, producing `dist/bundle.js` — this is the concrete proof that Task 4's `extensionAlias` correctly lets webpack resolve the newly `.js`-suffixed client imports back to their `.ts`/`.tsx` sources.

- [ ] **Step 7: Commit**

```bash
git add src/client
git commit -m "chore: add explicit .js extensions to client relative imports"
```

---

### Task 8c: Split TypeScript module resolution — `node16` for server/shared, `bundler` for client

**Gap found while implementing Task 9 (second attempt), not caught during planning:** with Task 8b's fix in place, flipping `"type": "module"` no longer produces any `.js`-extension errors — but it surfaces a **different** class of 85 errors, all under `src/client/**`. Once a file is resolved as real ESM, TypeScript's `"moduleResolution": "node16"` doesn't just require extensions on *relative* imports — it also applies real Node.js ESM rules to how *third-party* CommonJS packages are consumed:

- Deep subpath imports into a package without a modern `"exports"` map (e.g. `lodash/debounce`, `@material-ui/core/styles/makeStyles`) fail to resolve (`TS2307`).
- A CJS package's default-import shape can resolve differently under strict ESM interop than it did under `esModuleInterop`-flavored CJS resolution, breaking named/property access on the default import (e.g. `i18next`'s `.t`/`.use`, Material-UI v4 components no longer typing as callable JSX elements, `redux-thunk`'s ESM build exposing an incompatible type shape).

None of this is about `src/client`'s own relative imports (Task 8b's fix is unaffected and still correct) — it's that `src/client` is being held to Node's native-ESM-runtime resolution rules even though it never actually runs under Node: it's always compiled and bundled by webpack, whose own resolver (plus the `resolve.extensionAlias` already added in Task 4) is far more permissive about exactly these cases. `src/server`/`src/shared` genuinely do run under Node's native loader post-flip, so they should keep `node16` resolution — only `src/client` needs the more permissive mode.

**The fix:** TypeScript has a `moduleResolution: "bundler"` mode designed for exactly this situation — code that's always going to be processed by a bundler, not run directly by Node. It relaxes the extension/subpath/interop strictness that `node16` enforces, matching what webpack (or any modern bundler) actually does at resolution time. This requires splitting the single `tsconfig.json` program into two: the existing one, scoped down to `src/server`+`src/shared` (keeping `node16`), and a new one for `src/client` using `bundler` resolution.

**Files:**
- Modify: `tsconfig.json`
- Create: `tsconfig.client.json`
- Modify: `package.json` (the `typecheck` script)

- [ ] **Step 1: Narrow `tsconfig.json`'s scope to server + shared**

In `tsconfig.json`, change:

```json
"include": ["src"],
```

to:

```json
"include": ["src/server", "src/shared", "src/types/server"],
```

Leave every other setting in `tsconfig.json` unchanged (`"module": "node16"`, `"moduleResolution": "node16"`, etc.) — this file now only governs the code that actually runs under Node's native loader.

**Correction (found during implementation, not caught during planning):** narrowing `include` to just `src/server`/`src/shared` also silently drops ambient `.d.ts` type augmentations that the old blanket `"src"` include picked up incidentally (e.g. Express `Response`/`SessionData` augmentations under `src/types/server/**`), causing ~100 unrelated-looking errors (`Property 'ok'/'badRequest' does not exist on type 'Response'`, etc.). `src/types/server` must be added to this config's `include` alongside the two directories above. The equivalent applies to the client config in Step 2 below (`src/types/client`).

- [ ] **Step 2: Create `tsconfig.client.json`**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "esnext",
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "include": ["src/client", "src/types/client"]
}
```

This inherits `strict`, `jsx`, `paths` (including the `@assets/*` alias client code needs), and every other shared setting from the base config, overriding only the module-resolution strategy and forcing `noEmit` (this config exists purely for type-checking — webpack's `swc-loader` compiles client code independently and never reads this file).

- [ ] **Step 3: Update the `typecheck` script**

Change:

```json
"typecheck": "tsc --noEmit -p tsconfig.json",
```

to:

```json
"typecheck": "tsc --noEmit -p tsconfig.json && tsc --noEmit -p tsconfig.client.json",
```

- [ ] **Step 4: Verify**

Run: `pnpm typecheck`
Expected: both `tsc` invocations pass with zero errors — this must be run with `"type": "module"` NOT yet set in `package.json` (this task is still preparation; the flip is Task 9). Since the 85 errors from the blocked Task 9 attempt only manifest once `"type": "module"` is set, you won't see them in this task's own verification run — that's expected. To actually confirm this fix works, temporarily add `"type": "module"` to `package.json` in your working tree (do NOT commit it), run `pnpm typecheck` again and confirm the 85 errors are gone, then revert `package.json` back before committing this task (`git checkout -- package.json`) — Task 9 is responsible for committing that flip, not this task.

If errors remain after the split (some of the 85 may not be fixed by the resolution-mode change alone — e.g. the `Cannot find module '..'` and `Unused '@ts-expect-error'` cases look like they could be independent, smaller issues), fix each remaining one directly and note what was needed; don't guess broadly — inspect each remaining error individually.

- [ ] **Step 5: Confirm the build and test suite are unaffected**

Run: `ASSET_VARIANT=gov pnpm run build`
Expected: succeeds unchanged — the `build` script's plain `tsc` (no `-p` override, so it still uses `tsconfig.json`) now compiles a *smaller* scope (server+shared only, since client is no longer in its `include`), which is fine because webpack never consumed `tsc`'s emitted client output anyway (it compiles `src/client` from source directly via `swc-loader`).

Run: `pnpm test`
Expected: same baseline as Task 8b (59 suites / 488 passed / 4 skipped) — Jest doesn't use either tsconfig's `moduleResolution` setting (it goes through `@swc/jest`), so this change shouldn't affect it at all.

- [ ] **Step 6: Commit**

```bash
git add tsconfig.json tsconfig.client.json package.json
git commit -m "chore: use bundler module resolution for client TypeScript, node16 for server/shared"
```

---

### Task 9: Flip `package.json` to `"type": "module"`

Everything up to this point works identically under CJS. This is the single commit that changes the runtime module format — if something breaks, `git revert` this commit in isolation restores a working CJS state.

**Correction (found during implementation, not caught during planning):** flipping the flag makes `git commit` itself fail — husky's `commit-msg` hook runs `commitlint`, which loads `commitlint.config.js` (root-level, `module.exports = {...}`, plain CJS) via Node's module loader. Once `package.json` says `"type": "module"`, Node throws `ReferenceError: module is not defined in ES module scope` trying to load it. Same category of fix as Task 1 (Jest configs): rename it to `.cjs`, which is unaffected by the package's `"type"` field regardless of value. This is the only remaining root-level plain-`.js` config file that's Node-loaded directly (`jest.config.js`/`test/integration/jest.config.js` were already handled in Task 1; `lint-staged`'s config lives inline in `package.json`, not a separate file; `commitlint.config.js` was the one gap).

**Files:**
- Modify: `package.json`
- Rename: `commitlint.config.js` → `commitlint.config.cjs`

- [ ] **Step 0: Rename `commitlint.config.js`**

```bash
git mv commitlint.config.js commitlint.config.cjs
```

commitlint auto-discovers `commitlint.config.cjs` with no further configuration needed (same auto-discovery behavior Task 1 relied on for `jest.config.cjs`).

- [ ] **Step 1: Add the `type` field**

In `package.json`, add (alphabetically near `"private"`/`"repository"`, matching existing key ordering style):

```json
"type": "module",
```

- [ ] **Step 2: Verify TypeScript still agrees on module format**

Run: `pnpm typecheck`
Expected: no errors.

- [ ] **Step 3: Remove the temporary `@ts-ignore TS1470` comments from Tasks 6 and 7**

Those tasks added `// @ts-ignore TS1470 ...` above each `import.meta` use in `src/server/index.ts` (two spots: the `createRequire(import.meta.url)` line from Task 6, and the `__dirname` line from Task 7) and `src/server/modules/qr/services/QrCodeService.ts` (the `__dirname` line from Task 7), because TypeScript rejected `import.meta` while the package was still CJS-by-default. Now that `"type": "module"` is set, TypeScript will type-check these files as ESM and `import.meta` is valid — the suppressions are no longer needed. Search for `TS1470` across the repo and delete each `// @ts-ignore TS1470 ...` line (keep the code line beneath it unchanged):

```bash
grep -rn "TS1470" src/
```

Remove each matching comment line.

- [ ] **Step 4: Re-verify after removing the suppressions**

Run: `pnpm typecheck`
Expected: still no errors — this confirms `import.meta` is now valid on its own merits, not just silenced.

- [ ] **Step 5: Commit**

```bash
git add package.json commitlint.config.cjs src/server/index.ts src/server/modules/qr/services/QrCodeService.ts
git commit -m "chore: set \"type\": \"module\" in package.json"
```

Do **not** run `pnpm build`/`pnpm start` yet — Task 10 fixes the scripts that this flip invalidates.

---

### Task 10: Fix Node startup flags invalidated by the `type: module` flip

Two scripts pass Node flags that behave differently (or need additions) once the entry point is ESM:

- `start`: `node -r dotenv/config build/server/index.js` — `-r`/`--require` preloads via the classic CJS loader, which works independently of the main entry's module type (verified: `dotenv/config` resolves to `dotenv`'s own CJS file per its `package.json` `exports` map, and `-r` doesn't care what type the *main* entry is). This should keep working as-is, but must be verified empirically per Step 1 below rather than assumed. It also needs `--import dd-trace/register.js` added for dd-trace's ESM loader hooks (per Task 4's constraint and `dd-trace`'s README).
- `server-dev`: `tsx watch --inspect=0.0.0.0 -r dotenv/config src/server/index.ts` — tsx's CLI auto-detects module syntax per file regardless of flags; should be unaffected, verify only.

**Files:**
- Modify: `package.json` (the `start` script)

- [ ] **Step 1: Verify `-r dotenv/config` still works against an ESM entry point (before changing anything)**

Run: `pnpm run build && node -r dotenv/config build/server/index.js`
Expected: server boots (same behavior as before this migration). If this throws `ERR_REQUIRE_ESM` or similar, `-r` is not compatible here after all — in that case, remove `-r dotenv/config` from the `start` script and instead add `import 'dotenv/config'` as the very first line of `src/server/index.ts` (before `./util/tracing`), then re-verify.

- [ ] **Step 2: Add the dd-trace ESM loader flag**

Change:

```json
"start": "node -r dotenv/config build/server/index.js",
```

to:

```json
"start": "node -r dotenv/config --import dd-trace/register.js build/server/index.js",
```

(Keep the existing `import './util/tracing'` as the first line of `src/server/index.ts` unchanged — that still runs `tracer.init(...)` with this app's specific config options. `--import dd-trace/register.js` is additive: it registers dd-trace's ESM loader hooks so auto-instrumentation also covers ESM-loaded dependencies, per `node_modules/dd-trace/README.md:77-80`.)

- [ ] **Step 3: Verify the server boots with tracing**

Run: `pnpm run start` (with a valid `.env` present)
Expected: server starts without error; check logs for dd-trace's normal startup output (no `Cannot find module 'dd-trace/register.js'` or loader-hook warnings beyond the sync-loader-fallback warning dd-trace itself may emit on unsupported Node versions, which is non-fatal).

Run: `curl -sf http://localhost:8080/api/stats/total-clicks` (or any known-cheap health endpoint) after boot
Expected: HTTP 200, proving the ESM-built server actually serves requests end-to-end.

- [ ] **Step 4: Verify `server-dev` is unaffected**

Run: `pnpm run server-dev` (let it boot, then Ctrl-C)
Expected: boots identically to pre-migration behavior (tsx handles both module syntaxes transparently).

- [ ] **Step 5: Commit**

```bash
git add package.json src/server/index.ts
git commit -m "chore: fix Node startup flags for ESM entry point"
```

---

### Task 10a: Fix `cloudmersive-virus-api-client`'s unanalyzable named import

**Gap found while implementing Task 10, not caught during planning:** `pnpm run start` crashes on every boot, before touching any DB/Redis, with `SyntaxError: The requested module 'cloudmersive-virus-api-client' does not provide an export named 'ScanApi'`. That package (`node_modules/cloudmersive-virus-api-client/src/index.js`) is a hand-written UMD wrapper: `module.exports = factory(...)`, where `factory` is a function whose return value (an object literal) holds `ApiClient`/`ScanApi`/etc. as properties, computed at runtime. Node's ESM-importing-CJS interop uses `cjs-module-lexer` for *static* named-export detection, which cannot see into an arbitrary function's return value — so named imports (`import { ScanApi } from '...'`) fail at module-instantiation time, even though `require('cloudmersive-virus-api-client').ScanApi` works fine under plain CJS. The package's own doc comment confirms the intended consumption pattern is a default/namespace import with property access: `var CloudmersiveVirusApiClient = require('index'); var xxxSvc = new CloudmersiveVirusApiClient.XxxApi();`.

Two call sites, two different fixes (because they use `ScanApi` differently):

**Files:**
- Modify: `src/server/inversify.config.ts:4,170-171` (uses `ApiClient.instance` and `new ScanApi()` — real runtime values)
- Modify: `src/server/modules/threat/services/CloudmersiveScanService.ts:2,11,17` (uses `ScanApi` only as a TypeScript type annotation, never instantiates it)

- [ ] **Step 1: Fix `CloudmersiveScanService.ts` — this one only needs a type-only import**

`ScanApi` is used here purely as a type (`private api: ScanApi`, and a constructor parameter type) — it's never constructed in this file. Change:

```ts
import { ScanApi } from 'cloudmersive-virus-api-client'
```

to:

```ts
import type { ScanApi } from 'cloudmersive-virus-api-client'
```

A type-only import is fully erased at compile time and never touches Node's module loader at runtime, sidestepping the named-export detection problem entirely for this file.

- [ ] **Step 2: Fix `inversify.config.ts` — this one needs a default import, since it constructs real instances**

Change:

```ts
import { ApiClient, ScanApi } from 'cloudmersive-virus-api-client'
```

to a default import:

```ts
import CloudmersiveVirusApiClient from 'cloudmersive-virus-api-client'
```

Then update the two usage sites (around line 170-171):

```ts
  if (cloudmersiveKey) {
    const client = CloudmersiveVirusApiClient.ApiClient.instance
    const ApiKey = client.authentications.Apikey
    ApiKey.apiKey = cloudmersiveKey
  }
  const api = new CloudmersiveVirusApiClient.ScanApi()
```

If TypeScript complains about the default-import shape against this package's type declarations, check whether `@types/cloudmersive-virus-api-client` (or an ambient declaration under `src/types/`) exists and what shape it declares (`export =` vs `export default` vs a namespace) — `esModuleInterop: true` is already set in `tsconfig.json`, which should make a default import work against an `export =`-style declaration, but confirm empirically via `pnpm typecheck` rather than assuming.

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: no errors.

Run: `ASSET_VARIANT=gov pnpm run build && node -r dotenv/config --import dd-trace/register.js build/server/index.js`
Expected: the process no longer crashes on `CloudmersiveScanService.js`/`cloudmersive-virus-api-client` — it should proceed further into application startup (Task 10's report noted the next crash, if any, would be Gap B or a DB/Redis connection attempt — either is fine here; only the `cloudmersive-virus-api-client` crash is this task's concern).

Run: `pnpm test -- --testPathPatterns=threat` (or whatever pattern matches `CloudmersiveScanService`'s tests)
Expected: existing threat-service tests still pass.

- [ ] **Step 4: Commit**

```bash
git add src/server/inversify.config.ts src/server/modules/threat/services/CloudmersiveScanService.ts
git commit -m "fix: use default import for cloudmersive-virus-api-client's unanalyzable CJS exports"
```

---

### Task 10b: Fix type-only barrel re-exports missing `export type`

**Gap found while implementing Task 10, not caught during planning:** `pnpm run server-dev` crashes on boot with `SyntaxError: The requested module './types.js' does not provide an export named 'RedirectResult'` (`src/server/modules/redirect/index.ts:3`). `RedirectResult` is declared as `export type RedirectResult = {...}` (a type alias, no runtime value) in `./types.ts`, but re-exported as a plain value: `export { RedirectType, RedirectResult } from './types.js'` (missing `export type`). `tsc`'s whole-program build correctly elides this at compile time (confirmed: the actual `build/server/modules/redirect/index.js` output only contains the real value export) — but `tsx` (used by `server-dev`) transpiles each file in isolation, without cross-file type information, so it cannot tell `RedirectResult` is type-only and emits the re-export as-is, which then fails Node's real ESM static-export check at runtime.

Task 10's investigation found this is systemic, not a one-off: a scan of `src/server/**/*.ts` and `src/shared/**/*.ts` for `export { X, ... } from './Y.js'` statements where `X` is declared in `Y.ts` as `export interface X` or `export type X` (with no matching value declaration) found **32 more such sites**, essentially all of the `interfaces/index.ts` barrel files across every server module (`statistics`, `bulk`, `auth`, `user`, `threat`, `qr`, `directory`, `audit`, `job`, `analytics`). This only affects the dev path (`tsx`/`server-dev`) — the production build (`tsc`) already handles it correctly — but it must still be fixed, since `server-dev` needs to work for local development.

**Files:**
- Create (temporary, deleted after use): `scripts/fix-type-only-reexports.mjs`
- Modify: every barrel/re-export file under `src/server/` and `src/shared/` with a mixed or type-only re-export missing `export type`

- [ ] **Step 1: Write a discovery+fix script**

Use `@babel/parser` (the same tool Task 8 used, since this repo's `typescript@^7.0.2` doesn't expose the classic Compiler API) to parse every `.ts`/`.tsx` file under `src/server`/`src/shared` (excluding `__tests__`). For each `ExportNamedDeclaration` with a string-literal `source` (i.e. `export { A, B } from './x.js'`), resolve the target file (`./x.js` → `./x.ts`, following the same resolution logic as Task 8's codemod) and parse it too. For each named specifier (`A`, `B`, ...), check how it's declared in the target file:

- Declared via `TSInterfaceDeclaration`, or `TSTypeAliasDeclaration`, or `ExportNamedDeclaration` wrapping one of those, or itself re-exported with `exportKind: 'type'` → **type-only**.
- Declared via `ClassDeclaration`, `FunctionDeclaration`, `VariableDeclaration` (const/let/var), `TSEnumDeclaration`, or re-exported without a type-only marker → **value** (enums are both a type and a value at runtime — treat as value).
- If a specifier can't be resolved to a declaration in the target file (e.g. it's itself re-exported from yet another file), follow the chain one more hop; if still unresolvable, leave it untouched and print a warning for manual inspection.

For each `export { ... } from '...'` statement, partition its specifiers into type-only and value groups. If a statement is 100% type-only, rewrite it as `export type { ... } from '...'`. If 100% value, leave unchanged. If mixed, split it into two statements: `export type { A } from '...'` followed by `export { B } from '...'` (preserve relative order of the two new statements, source is identical in both).

- [ ] **Step 2: Run it**

```bash
node scripts/fix-type-only-reexports.mjs
```

Review its output — it should report roughly 32+ files touched (per Task 10's discovery scan), plus `src/server/modules/redirect/index.ts`.

- [ ] **Step 3: Verify with the type checker**

Run: `pnpm typecheck`
Expected: no errors (this change is type-safe by construction — `export type` vs `export` doesn't change what's type-checkable, only what's emitted at runtime).

- [ ] **Step 4: Delete the throwaway script**

```bash
rm scripts/fix-type-only-reexports.mjs
```

- [ ] **Step 5: The real verification gate — boot `server-dev` all the way through module loading**

Run: `pnpm run server-dev`
Expected: no more `SyntaxError: ... does not provide an export named ...` crashes. If DB/Redis aren't reachable in your environment, it's acceptable for it to fail there instead (an environment limitation, not a code gap) — but it must get past all module loading first. If a *new* such SyntaxError appears (a site the discovery scan missed, e.g. a multi-hop re-export chain), fix that specific site and re-run; don't loop indefinitely — after a couple of iterations, report remaining sites explicitly rather than guessing further.

- [ ] **Step 6: Regression check**

Run: `pnpm test`
Expected: same baseline as prior tasks (59 suites / 488 passed / 4 skipped) — this change doesn't alter runtime behavior of anything actually exercised at type-check time, only which barrel exports are erased vs. kept as re-exports.

Run: `ASSET_VARIANT=gov pnpm run build`
Expected: still succeeds (this change should be a no-op for the `tsc`-built production path, which already elided these correctly — confirms no regression there).

- [ ] **Step 7: Commit**

```bash
git add src/server src/shared
git commit -m "fix: mark type-only barrel re-exports with export type"
```

---

### Task 11: Full end-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `pnpm typecheck`
Expected: 0 errors.

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: 0 errors. (If `.oxlintrc.json`'s `"commonjs": true` env setting — line 760 — now flags nothing new, leave it; if it causes false positives on legitimate remaining CJS interop, note but don't fix speculatively.)

- [ ] **Step 3: Full unit test suite**

Run: `pnpm test:ci`
Expected: passes at the existing coverage threshold (`24%` statements, per `jest.config.cjs`).

- [ ] **Step 4: Integration tests**

Run: `pnpm test:integration`
Expected: passes (requires local DB/Redis per existing project setup — follow whatever this repo's normal integration-test prerequisites are).

- [ ] **Step 5: Full production build**

Run: `pnpm run build`
Expected: `dist/bundle.js` and `build/server/**` both produced with no errors.

- [ ] **Step 6: Boot the built server and smoke-test**

Run: `pnpm run start`
Expected: boots; hit a couple of real endpoints (health check, a GET redirect lookup) manually or via `curl` and confirm correct responses.

- [ ] **Step 7: Boot the dev servers**

Run: `pnpm run docker-dev` (or `pnpm run server-dev` + `pnpm run client-dev` separately)
Expected: both boot; load the client in a browser and confirm the landing page renders and login flow reaches the server.

- [ ] **Step 8: e2e suite (at least a smoke subset)**

Run: `pnpm test:e2e-headless`
Expected: passes, or at minimum shows no new failures vs. a baseline run on `develop` — this exercises the fully built+booted app closest to production shape.

- [ ] **Step 9: Note the Lambda caveat**

This plan cannot verify `src/server/serverless/**` locally (Task 2's note applies). Add a line to the PR description flagging that Lambda deploys need a post-merge smoke check.

**Three more gaps were found while running this task, not caught during planning** — fixed by Tasks 11a and 11b below, then this task's Steps 1, 2, 5, 6, 7, and 8 must be re-run to confirm they're actually resolved (not just plausible fixes).

---

### Task 11a: Fix Joi default-import and e2e `__dirname` usage

**Gap 1 — server boot crash (blocks Steps 6 and 7):** `src/server/api/external-v1/validators.ts:1`, `src/server/api/login/validators.ts:1`, and `src/server/api/user/validators.ts:1` all do `import * as Joi from 'joi'`. Under real Node ESM, this crashes with `TypeError: Joi.number is not a function` — `joi`'s CJS module does `module.exports = <object>` (a single default-shaped export, not individual named `exports.foo = ...` assignments), so a namespace (`* as`) import doesn't get the properties the same way a default import does. Six sibling validator files already correctly use `import Joi from 'joi'` (a default import) — these three are the odd ones out, presumably pre-dating whatever convention the other six settled on.

**Gap 2 — e2e suite crash (blocks Step 8):** `test/end-to-end/util/auth.ts:14` does `export const authDir = path.join(__dirname, '..', '.auth')`. `__dirname` is a CommonJS-only global, undefined under real ESM — this crashes Playwright's config load before any test runs. This is the only remaining `__dirname` usage in the repo outside `src/` (Task 7 only covered `src/**`).

**Files:**
- Modify: `src/server/api/external-v1/validators.ts`
- Modify: `src/server/api/login/validators.ts`
- Modify: `src/server/api/user/validators.ts`
- Modify: `test/end-to-end/util/auth.ts`

- [ ] **Step 1: Fix the three Joi imports**

In each of the three files, change:

```ts
import * as Joi from 'joi'
```

to:

```ts
import Joi from 'joi'
```

- [ ] **Step 2: Fix `test/end-to-end/util/auth.ts`**

Add near the top of the file (alongside the existing `import path from 'path'`):

```ts
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
```

Change line 14 from:

```ts
export const authDir = path.join(__dirname, '..', '.auth')
```

to:

```ts
export const authDir = path.join(dirname, '..', '.auth')
```

(Same pattern and naming convention Task 7 established for `src/server/index.ts`/`QrCodeService.ts` — use `dirname`, not `__dirname`, to avoid colliding with Node's CJS-wrapper-injected parameter name in any tooling that still transpiles this file to CJS, e.g. `@swc/jest` for the unit/integration suites, ts-node-style loaders, etc.)

- [ ] **Step 3: Verify**

Run: `pnpm typecheck`
Expected: no errors.

Run: `ASSET_VARIANT=gov pnpm run build && node -r dotenv/config --import dd-trace/register.js build/server/index.js`
Expected: no more `Joi.number is not a function` crash — the process should proceed further (to the next known env-var/DB-connectivity stop, which is fine).

Run: `pnpm test -- --testPathPatterns=validators` (or whatever pattern matches the affected validator files' tests, if any exist — check first)
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/server/api/external-v1/validators.ts src/server/api/login/validators.ts src/server/api/user/validators.ts test/end-to-end/util/auth.ts
git commit -m "fix: use default Joi import and replace __dirname in e2e auth util"
```

---

### Task 11b: Fix `no-extraneous-dependencies` false positives on the serverless subtree

**Gap found while running Task 11, not caught during planning:** `pnpm lint` now reports 9 new `import-js/no-extraneous-dependencies` errors, all under `src/server/serverless/**`. Root cause: Task 2 added `src/server/serverless/package.json` (`{"type": "commonjs"}`, no `"dependencies"` field) to isolate the Lambda functions from the root `"type": "module"` flip. oxlint's `no-extraneous-dependencies` rule resolves each file's dependency list from its *nearest* `package.json`, monorepo-style — before Task 2, files under `src/server/serverless/` had no local `package.json`, so oxlint correctly used the root one; now they resolve against this new, dependency-less one instead, so every third-party import under that subtree is flagged as extraneous, even though the packages are genuinely installed (via the root `package.json`) and genuinely used.

The fix: list the actually-imported third-party packages in this file's `"dependencies"` field, matching the version ranges already declared in the root `package.json` (this file is not a real pnpm workspace member — it's purely a lint/Node-module-resolution marker — so adding a `"dependencies"` field here has no install/lockfile effect, it only teaches the linter, and any future reader, exactly what this isolated subtree needs).

**Files:**
- Modify: `src/server/serverless/package.json`

- [ ] **Step 1: Add the dependencies field**

Change:

```json
{
  "type": "commonjs"
}
```

to:

```json
{
  "type": "commonjs",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1103.0",
    "@aws-sdk/lib-storage": "^3.1103.0",
    "archiver": "^8.0.0",
    "cheerio": "^1.2.0",
    "cross-fetch": "^4.1.0",
    "pg": "^8.22.0",
    "qrcode": "^1.5.4",
    "sharp": "^0.35.3"
  }
}
```

(These are exactly the 9 flagged imports' packages — `@aws-sdk/client-s3`/`@aws-sdk/lib-storage`/`archiver` from `bulk-qrcode-generation/s3.js`, `cheerio`/`qrcode`/`sharp` from `bulk-qrcode-generation/qrCode.js`, `cross-fetch` from `bulk-qrcode-generation/http.js`, `pg` from both `lambda-migrate-user-links/index.js` and `lambda-migrate-url-to-user/index.js` — with version ranges copied verbatim from the root `package.json`'s `"dependencies"` block, so they can't silently drift out of sync in an obviously-wrong way. If `pnpm lint` reveals any import this list missed, add it the same way.)

- [ ] **Step 2: Verify**

Run: `pnpm lint`
Expected: 0 errors (the 9 `no-extraneous-dependencies` errors are gone; nothing else should change, since this file has no other effect on linting).

- [ ] **Step 3: Commit**

```bash
git add src/server/serverless/package.json
git commit -m "fix: declare serverless subtree's third-party dependencies for lint resolution"
```

---

### Task 11 (re-verification): confirm all three Task 11 gaps are actually fixed

After Tasks 11a and 11b land, re-run the specific steps their fixes target — do not re-run the whole Task 11 checklist from scratch, just the steps that were affected:

- [ ] Re-run Step 2 (`pnpm lint`) — expect 0 errors.
- [ ] Re-run Step 5 (`ASSET_VARIANT=gov pnpm run build`) — expect success.
- [ ] Re-run Step 6 (boot the built server) — expect it to proceed past both the cloudmersive (Task 10a) and Joi (Task 11a) crash points, stopping only on the accepted DB/Redis/env-var environment limitation.
- [ ] Re-run Step 7 (`pnpm run server-dev` / `pnpm run client-dev`) — expect the same clean boot Task 10b already established, now also past the Joi crash point.
- [ ] Re-run Step 8 (`pnpm test:e2e-headless`) — expect Playwright's config to load without the `__dirname` crash; note whatever else the suite reports (further failures at this point may be legitimate e2e/environment issues rather than migration gaps — use judgment, and escalate anything that looks like a new module-resolution or ESM-interop crash rather than a normal e2e failure).

If any of these re-runs reveal yet another gap, treat it the same way as every other gap in this plan: diagnose, don't guess, and report clearly rather than patching blindly.

**Re-verification found one more gap**, fixed by Task 11c below: `pnpm run server-dev` crashes with `InversifyCoreError: No bindings found for service: "Symbol(logoutController)"`, deterministically, as soon as a full env-var set lets execution reach past the earlier (now-fixed) Joi crash point.

---

### Task 11c: Replace the `createRequire`-based deferred `./api` load with a dynamic `import()`

**Gap found during Task 11's re-verification, not caught during planning:** `src/server/index.ts` uses (from Task 6):

```ts
// Routes.
// A dynamic require, not a static import: ES imports are hoisted above
// bindInversifyDependencies() by some compilers, but api/index.ts resolves
// inversify bindings at module-load time and needs binding registration to
// have already run.
const require = createRequire(import.meta.url)
const api = require('./api').default
```

This works correctly under the actual production path (`tsc`-built output run via plain `node`) — confirmed clean in Task 11's re-verification Check 3. But under `pnpm run server-dev` (`tsx watch`), with a full env-var set that lets execution reach this code path, it crashes deterministically: the log shows `"Deploying in development mode."` printed **twice** (a `config.ts` module-level side effect), proving `require('./api')` under `tsx`'s loader does not share the same module registry/cache as the surrounding ESM graph — it re-evaluates `./api`'s entire transitive dependency chain as a **second, separate instance**, including `src/server/util/inversify.ts`'s `export const container = new Container(...)` singleton. This second `container` never receives `bindInversifyDependencies()`'s bindings (those were registered on the *first* instance, reached via the normal static-import graph), so `src/server/api/logout.ts`'s top-level `container.get(DependencyIds.logoutController)` throws `InversifyCoreError: No bindings found for service`.

Node's own native `require(esm)` interop (stable on Node 22.12+/23+, and this repo targets Node 24) correctly shares the module registry between `require()` and `import()` of the same resolved file — that's why production is unaffected. `tsx`'s own loader, however, does not honor that same guarantee for a `createRequire(...).require(...)` call targeting an ESM-format `.ts` file. This is a `tsx`-dev-mode-specific gap, not a Node/production one.

**The fix:** replace the `createRequire`-mediated `require()` with a dynamic `import()` — real ESM syntax, evaluates at its exact call site (not hoisted, exactly like the old `require()` and the current `createRequire` workaround), and uses Node's actual unified module registry under every loader, including `tsx`'s, since it's native ESM rather than a CJS-interop bridge. Since `src/server/index.ts` is the true application entrypoint (nothing else imports it), using top-level `await` here is safe — `tsconfig.json`'s `"module": "node16"` + `"target": "ES2020"` already satisfy TypeScript's requirements for top-level await.

**Files:**
- Modify: `src/server/index.ts`

- [ ] **Step 1: Replace the require-based load with a dynamic import**

Change:

```ts
// Routes.
// A dynamic require, not a static import: ES imports are hoisted above
// bindInversifyDependencies() by some compilers, but api/index.ts resolves
// inversify bindings at module-load time and needs binding registration to
// have already run.
const require = createRequire(import.meta.url)
const api = require('./api').default
```

to:

```ts
// Routes.
// A dynamic import, not a static one: ES imports are hoisted above
// bindInversifyDependencies() by some compilers, but api/index.ts resolves
// inversify bindings at module-load time and needs binding registration to
// have already run. `import()` (not `require()` via createRequire) is used
// so this shares Node's real module registry under every loader — tsx's
// dev-mode watcher does not honor shared module identity between
// createRequire()'d and natively-imported modules, which previously caused
// a second, unbound `container` singleton to be instantiated under
// `server-dev` specifically (production, via `tsc`-built output + plain
// `node`, was unaffected).
const api = (await import('./api/index.js')).default
```

(Note: `./api/index.js`, not `./api` — this repo's `node16` module resolution requires the explicit extension per Task 8's convention; `tsc` rejects the extensionless form with `TS2834`.)

Remove the now-unused `import { createRequire } from 'module'` line if `createRequire` isn't used anywhere else in this file (check first — it shouldn't be, since Task 6 introduced it for exactly this one purpose).

- [ ] **Step 2: Verify under `tsx` (the environment that was actually broken)**

Run `pnpm run server-dev` with a full set of dummy environment variables (matching what Task 11's re-verification used: `NODE_ENV`, `ASSET_VARIANT`, `DB_URI`, `REPLICA_URI`, `OG_URL`, `REDIS_OTP_URI`, `REDIS_SESSION_URI`, `REDIS_REDIRECT_URI`, `REDIS_STAT_URI`, `REDIS_SAFE_BROWSING_URI`, `SESSION_SECRET`, `VALID_EMAIL_GLOB_EXPRESSION`, `AWS_S3_BUCKET`, `API_KEY_SALT` — placeholder values are fine, no real DB/Redis needed for this check specifically).

Expected: exactly **one** `"Deploying in development mode."` log line (not two — this is the direct signal the double-module-instantiation is gone), no `InversifyCoreError`, and the process proceeds to attempt real Redis/Postgres connections (which will fail in this sandbox — that's fine, it's the same accepted environment limitation as Check 3). Stop the process afterward (don't leave it running).

If you still see two "Deploying" lines or any `InversifyCoreError`, the fix didn't work — stop and report BLOCKED with full output rather than trying another workaround blind.

- [ ] **Step 3: Verify the production path still works (regression check)**

Run: `ASSET_VARIANT=gov pnpm run build && node -r dotenv/config --import dd-trace/register.js build/server/index.js` (same dummy env vars as Step 2)
Expected: identical to Task 11's re-verification Check 3 — proceeds past all crash points, stops only on Redis/Postgres connectivity, exactly **one** "Deploying in development mode." line here too (confirming this was never double-instantiated in production, and still isn't).

- [ ] **Step 4: Verify typecheck and the unit suite**

Run: `pnpm typecheck`
Expected: no errors (top-level await should be valid given `tsconfig.json`'s existing `module`/`target` settings — if TypeScript rejects it, report the exact error rather than adding a suppression).

Run: `pnpm test`
Expected: same baseline as prior tasks (59 suites / 488 passed / 4 skipped) — Jest doesn't boot the real server, so this is a sanity check that nothing else broke, not a test of the fix itself.

- [ ] **Step 5: Commit**

```bash
git add src/server/index.ts
git commit -m "fix: use dynamic import instead of createRequire for deferred api load"
```

---

## Out of scope (flag, don't fix here)

- `serverless.yml`'s `runtime: nodejs14.x` is already past AWS's EOL support window — upgrading it is a separate, higher-risk infra change and shouldn't be bundled into this migration.
- The 15 Jest test files still using `require()` for mocking (e.g. `jest.mock`/`require` patterns in `BulkController.test.ts`, `JobController.test.ts`, etc.) are untouched — `@swc/jest` transforms them to CommonJS under the hood regardless of the root `"type"` field, so they keep working as-is and don't block this migration.

---

### Task 12: Fix two Critical + three Minor findings from the final whole-branch review

**Two Critical, previously-undetected production defects were found by the final whole-branch review (a class of bug no single task-scoped review could catch, since each is a cross-cutting/deployment-state issue, not a code-correctness one visible from any single task's diff):**

**C1 — `migrations/*.cjs` will make sequelize-cli re-run all three already-applied migrations on every environment.** Task 3 renamed `migrations/*.js` → `.cjs`. `umzug` 2.3.0 (sequelize-cli's underlying migration runner) computes which migrations are pending by comparing each discovered file's **full basename including extension** (`migration.file = path.basename(this.path)`, `node_modules/umzug/lib/migration.js:45`) against the names already stored in the `SequelizeMeta` table (`node_modules/umzug/lib/index.js:176-177`: `executedFiles = executed.map(m => m.file)`, then `all.filter(m => executedFiles.indexOf(m.file) === -1)`). Every environment's `SequelizeMeta` table currently stores rows like `20250804092620-add-urls-safebrowsing-expiry.js` (the pre-rename name). After the `.cjs` rename, the freshly-discovered file is named `...expiry.cjs`, which does not match the stored `...expiry.js` row — so `umzug` treats all three migrations as still-pending and re-runs their `up()` on the next `db:migrate`, which will throw (`addColumn`/`addIndex`/`CREATE INDEX` on already-existing columns/indexes), breaking every deploy. Task 3's plan text (this document, in the now-superseded Task 3 section) reasoned migrations "aren't in a subdirectory we can scope" — that reasoning was wrong: `migrations/` **is** a directory, and Node resolves the nearest `package.json` by walking up from a file's own directory, exactly like Task 2 already established for `src/server/serverless/`.

**Fix: revert the `.cjs` rename; isolate via `migrations/package.json` instead**, mirroring Task 2's already-proven pattern exactly. Zero `SequelizeMeta` impact, since the files go back to their original `.js` names.

**C2 — `src/server/serverless/package.json`'s CommonJS isolation never reaches the deployed Lambda artifact.** Task 2 placed `{"type": "commonjs"}` at `src/server/serverless/package.json` (the shared parent directory of all 4 Lambda functions). `serverless.yml`'s `package.patterns` for each function only include `'src/server/serverless/<fn-name>/**'` plus a bare `'package.json'` (which — per Serverless Framework's glob semantics — resolves against the **service root**, i.e. the actual root `package.json`, not this nested one). None of the four functions' patterns reference `src/server/serverless/package.json` directly, and none of them glob one level up from their own directory. So every deployed Lambda zip ships the CJS handler files (`require`/`module.exports`) alongside the **root** `package.json` (which now says `"type": "module"`), and Node parses them as ESM on the next invocation → `ReferenceError: require is not defined in ES module scope` for all four functions, in production, on every future deploy. This is exactly the break Task 2 was written to prevent — it just didn't reach the artifact.

**Fix: move the isolation into each of the 4 function directories directly** (`src/server/serverless/<fn-name>/package.json`), since each directory is already fully covered by its own `<fn-name>/**` glob pattern — no `serverless.yml` changes needed, and no dependence on getting a 4-YAML-block edit right. Delete the now-redundant parent-level `src/server/serverless/package.json` (nothing lives directly under `src/server/serverless/` except the 4 function subdirectories and this one file).

**Also fix, while touching these areas (cheap, unambiguous, no architectural trade-offs):**

- **I6 — `tsc` emits unloadable output for the serverless subtree.** `tsconfig.json`'s `include` (narrowed by Task 8c to `["src/server", "src/shared", "src/types/server"]`) still covers `src/server/serverless/**/*.js` (via `allowJs: true`), compiling it into `build/server/serverless/**` — output nothing consumes (Lambda deploys raw source) but which ships in the production Docker image as dead weight that would throw if ever loaded (the `.js` files there lack any accompanying `type: commonjs` marker once copied to `build/`). Add `"src/server/serverless"` to `tsconfig.json`'s `exclude`.
- **M8 — inconsistent `dirname` vs `__dirname` naming.** `webpack.config.ts` still declares `const __dirname` (Task 4's original code, predating Task 7's correction on other files to name this `dirname` instead, specifically to avoid colliding with Node's CJS-wrapper-injected `__dirname` parameter). This forced `.oxlintrc.json`'s `no-underscore-dangle` allow-list to include `__dirname` repo-wide, which now protects nothing (the one file needing the exception should use the safe name like everywhere else). Rename `webpack.config.ts`'s `__dirname` to `dirname` (both the declaration and its two usage sites: `path.join(dirname, 'src/client/app')` and `path.join(dirname, outputDirectory)`), then remove `"__dirname"` from `.oxlintrc.json`'s `no-underscore-dangle` allow-list (keep `"__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"`).
- **M9 — stale file-name references.** `.oxlintrc.json`'s `no-extraneous-dependencies` devDependencies allow-list still says `"**/jest.config.js"` (rename to `"**/jest.config.cjs"`, matching Task 1's rename). `test/shared/userLinksQuery.ts:5`'s comment still says "jest.config.js excludes test/end-to-end via modulePathIgnorePatterns" (update to "jest.config.cjs").

**Files:**
- Rename: `migrations/20250804092620-add-urls-safebrowsing-expiry.cjs` → `.js`, `migrations/20251218095856-add-index-urlShortUrl.cjs` → `.js`, `migrations/20260129133521-clicks-idx.cjs` → `.js`
- Create: `migrations/package.json`
- Delete: `src/server/serverless/package.json`
- Create: `src/server/serverless/bulk-qrcode-generation/package.json`, `src/server/serverless/capture-ses-events/package.json`, `src/server/serverless/lambda-migrate-url-to-user/package.json`, `src/server/serverless/lambda-migrate-user-links/package.json`
- Modify: `tsconfig.json`
- Modify: `webpack.config.ts`
- Modify: `.oxlintrc.json`
- Modify: `test/shared/userLinksQuery.ts`

- [ ] **Step 1: Fix C1 — revert the migration renames, isolate via a directory-level package.json**

```bash
git mv migrations/20250804092620-add-urls-safebrowsing-expiry.cjs migrations/20250804092620-add-urls-safebrowsing-expiry.js
git mv migrations/20251218095856-add-index-urlShortUrl.cjs migrations/20251218095856-add-index-urlShortUrl.js
git mv migrations/20260129133521-clicks-idx.cjs migrations/20260129133521-clicks-idx.js
```

Create `migrations/package.json`:

```json
{
  "type": "commonjs"
}
```

Verify: `pnpm exec sequelize-cli db:migrate:status` (no DB needed to reach the same point Task 3's original verification reached — confirm no file-extension/discovery errors; a DB-connectivity failure past that point is fine, same accepted limitation as every other DB-touching check in this migration).

- [ ] **Step 2: Fix C2 — move the serverless isolation into each function directory**

```bash
git rm src/server/serverless/package.json
```

Create `src/server/serverless/bulk-qrcode-generation/package.json`:

```json
{
  "type": "commonjs",
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1103.0",
    "@aws-sdk/lib-storage": "^3.1103.0",
    "archiver": "^8.0.0",
    "cheerio": "^1.2.0",
    "cross-fetch": "^4.1.0",
    "qrcode": "^1.5.4",
    "sharp": "^0.35.3"
  }
}
```

Create `src/server/serverless/lambda-migrate-url-to-user/package.json` and `src/server/serverless/lambda-migrate-user-links/package.json` (identical content, both functions only import `pg`):

```json
{
  "type": "commonjs",
  "dependencies": {
    "pg": "^8.22.0"
  }
}
```

Create `src/server/serverless/capture-ses-events/package.json` (this function has no third-party imports, only Node builtins):

```json
{
  "type": "commonjs"
}
```

(Each function directory is already fully covered by its own `'src/server/serverless/<fn-name>/**'` pattern in `serverless.yml` — no YAML changes needed. Verify by re-checking `serverless.yml`'s four `package.patterns` blocks against these four new file locations.)

- [ ] **Step 3: Fix I6 — exclude the serverless subtree from tsc's build**

In `tsconfig.json`, change:

```json
"exclude": ["node_modules", "lib", "tests", "**/__tests__"],
```

to:

```json
"exclude": ["node_modules", "lib", "tests", "**/__tests__", "src/server/serverless"],
```

- [ ] **Step 4: Fix M8 — consistent `dirname` naming in webpack.config.ts, restore the lint rule**

In `webpack.config.ts`, rename the `const __dirname = ...` declaration to `const dirname = ...`, and update both usage sites (`path.join(__dirname, 'src/client/app')` → `path.join(dirname, 'src/client/app')`, and the `output.path` line similarly).

In `.oxlintrc.json`, find the `no-underscore-dangle` allow-list entry `["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__", "__dirname"]` and remove `"__dirname"`, leaving just `["__REDUX_DEVTOOLS_EXTENSION_COMPOSE__"]`.

- [ ] **Step 5: Fix M9 — stale file-name references**

In `.oxlintrc.json`, change `"**/jest.config.js"` to `"**/jest.config.cjs"` in the `no-extraneous-dependencies` devDependencies allow-list.

In `test/shared/userLinksQuery.ts:5`, change the comment's `"jest.config.js excludes test/end-to-end via modulePathIgnorePatterns"` to `"jest.config.cjs excludes test/end-to-end via modulePathIgnorePatterns"`.

- [ ] **Step 6: Verify everything together**

Run: `pnpm typecheck && pnpm lint && pnpm test`
Expected: all clean, same baseline as every prior task (59 suites / 488 passed / 4 skipped for the test suite; zero errors for typecheck/lint — confirm the M8 lint-rule restoration doesn't newly flag anything, since `webpack.config.ts` should no longer need the allow-list entry at all).

Run: `ASSET_VARIANT=gov pnpm run build`
Expected: succeeds; confirm `build/server/serverless` is no longer produced (`ls build/server/serverless` should fail/not exist), verifying Step 3's exclude took effect.

- [ ] **Step 7: Commit**

```bash
git add migrations tsconfig.json webpack.config.ts .oxlintrc.json test/shared/userLinksQuery.ts src/server/serverless
git commit -m "fix: correct migration/serverless CJS isolation and other final-review findings"
```

---

## Follow-up recommendations (not blocking, from the final whole-branch review — put these in the PR description)

- **I3:** Nothing in CI currently catches a future ESM regression (a new bare `require()`, `__dirname`, or CJS-namespace-import in server code) before it surfaces at boot — Jest transpiles everything to CJS regardless, and `tsconfig.client.json`'s `bundler` resolution doesn't enforce extensions the way `node16` does for server/shared. Consider a CI lint rule or grep step for `require(`/`__dirname` outside the known CJS-isolated subtrees.
- **I4:** Task 8b's ~150-file `.js`-extension sweep across `src/client` was made unnecessary by Task 8c's later switch to `bundler` resolution (which doesn't require extensions). It's not harmful, but it's unenforced (per I3) and dominates the diff. Worth a follow-up decision: document the convention explicitly, or revert `e47eaad0` to reduce diff/merge-conflict surface.
- **I7:** `tsconfig.client.json` extends `tsconfig.json`, which is now semantically "the server config" — a future compiler-option change intended for the whole project has no neutral home. Consider splitting into `tsconfig.base.json` + `tsconfig.server.json` + `tsconfig.client.json` so neither profile is the other's implicit parent.
- **M10:** `test/**` isn't covered by either tsconfig program, so `pnpm typecheck` can't catch a bug like the `test/end-to-end/util/auth.ts` `__dirname` issue (Task 11a) — it was only found by actually running Playwright. Consider a `tsconfig.test.json`.
- **M11:** `serverless.yml` still packages `package-lock.json`, which hasn't existed since the pnpm migration — harmless but worth cleaning up.
- **M12:** `src/server/index.ts`'s top-level `await` (Task 11c) means a throw during `./api`'s evaluation surfaces as an unhandled rejection rather than a synchronous throw; Node still exits non-zero so this is informational, not a defect.
- **Residual risk (must state explicitly in the PR):** this migration was implemented and verified in a sandbox with no reachable Postgres/Redis/Docker — integration tests and the Playwright e2e suite never actually ran end-to-end locally. Every verification claim is "got past all code/module loading, then hit an environment-only connectivity error," which is strong evidence against ESM-interop regressions (module instantiation validates every static binding in the reachable graph) but does not exercise real request handling, EJS view rendering, or actual Lambda invocation. **Do not merge until this branch's CI `integration` job and all `playwright` matrix legs are green** — that's the substitute for the local verification this sandbox couldn't provide.
