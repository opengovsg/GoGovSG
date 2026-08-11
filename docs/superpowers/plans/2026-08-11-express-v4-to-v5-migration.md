# Express v4 → v5 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bump `express` from `^4.22.2` to `^5.2.1` (and `@types/express` from `^4.17.25` to `^5.0.6`) with zero behavior change to the app's two route surfaces (the `/api/**` router tree and the top-level short-link redirect route), fixing the two breaking changes that actually apply to this codebase along the way.

**Architecture:** Same "prepare, then flip" order as `docs/superpowers/plans/2026-08-11-cjs-to-esm-migration.md`. Task 1 replaces the one Express-4-only route-path syntax in the app with an equivalent that works identically under **both** Express 4 and Express 5 — fully committable and revertable while still on Express 4. Task 2 is the actual flip (bumping `express` and `@types/express`), including an empirical red/green proof that `express-joi-validation@^5.0.1` crashes every query-validated route under Express 5, then the fix (bump to `^6.1.0`), then working through whatever `pnpm typecheck` fallout the type-package bump surfaces. Task 3 is full-suite verification (integration tests, e2e, build, lint) plus a manual smoke test of the redirect route against a running dev server.

**Tech Stack:** Node 24 (pnpm), TypeScript 5.9/7 (`tsc --noEmit`), Express 5, Jest + `@swc/jest`, supertest, path-to-regexp v8 (bundled inside Express 5's router).

## Global Constraints

- Node engine is pinned to `"24"` in `package.json` (`engines.node`) — Express 5's minimum is Node 18, so this is already satisfied; no runtime-version change needed.
- The short-link redirect route `app.get('/:shortUrl([a-zA-Z0-9-]+).?', ...)` in `src/server/index.ts:211-215` is the single entry point for every `go.gov.sg/<shortUrl>` request in production — its matching behavior (which strings are accepted vs. fall through to the 404 page) must be preserved exactly, not just "close enough."
- path-to-regexp v8 (used internally by Express 5's router) removed **all** inline custom-regex-per-parameter syntax (`:name(pattern)`) and the bare `?`/`+`/`(`/`)` route-string tokens entirely — confirmed directly from the library's own README (`Errors` section: "Unexpected `(`, `)`, `[`, `]`, etc. ... This version no longer supports them"). There is no string-syntax equivalent of `:shortUrl([a-zA-Z0-9-]+).?`; the fix in Task 1 moves that validation into application code instead of the route string.
- `express-joi-validation@^5.0.1` (currently installed, `node_modules/express-joi-validation/express-joi-validation.js:1` has `'use strict'`, line 81 does `req[type] = ret.value`) unconditionally reassigns `req.query` on every `validator.query(...)`-validated request. Express 5's `req.query` is a getter-only property. Because the reassignment runs in a strict-mode CJS module, this **throws** (not silently no-ops) under Express 5 — a hard 500 on every request to the 6 affected routes (`link-statistics`, `external-v1`, `link-audit`, `user`, `directory`, `qrcode`). This is fixed by bumping to `express-joi-validation@^6.1.0`, which added an `Object.getOwnPropertyDescriptor(req, type).writable` check specifically for this case before falling back to `Object.defineProperty(req, type, { get: () => ret.value })`.
- The following were checked repo-wide and require **no code changes** — do not re-litigate them mid-migration:
  - `app.del(`, `req.param(` (singular), `res.json(obj, status)`/`res.jsonp(obj, status)`, `res.send(body, status)`/bare numeric `res.send(n)`, `res.redirect(url, status)` two-arg form, `router.param()` with an array of names, `req.acceptsCharset()`/`acceptsEncoding()`/`acceptsLanguage()` (singular forms), `res.sendfile(` (lowercase f), `res.clearCookie()` with `maxAge`/`expires` options, `res.vary()` with no argument, `express.static.mime` — zero hits anywhere in `src/server/**`.
  - `express.urlencoded()`/`bodyParser.urlencoded()` — not used anywhere (only `bodyParser.json()`, `src/server/index.ts:187`), so the `extended` default flipping from `true` to `false` doesn't apply.
  - `express.static('dist')` / `express.static('public')` (`src/server/index.ts:160-161`) — `public/` contains no dotfiles (`ls -la public` shows only `assets/`, `index-*.html`, `locales/`, `robots.txt`), so the `dotfiles` default changing from served to `"ignore"` doesn't apply.
  - Nested/bracket query-string parsing (`?a[b]=1`) — every Joi query schema in `src/server/api/**` validates only flat scalar fields, so the default query-string parser changing from `"extended"` (qs) to `"simple"` (querystring) doesn't apply.
  - `body-parser`, `cookie-parser`, `cookie-session`, `express-session`, `express-fileupload`, `connect-redis`, `helmet`, `morgan` — none declare an `express` peer dependency (verified via `npm view <pkg> peerDependencies`) and none call Express-router-specific APIs; `express-rate-limit@^8.6.2` declares `"peerDependencies": {"express": ">= 4.11"}` (open-ended, already satisfied). None need a version bump for this migration — regressions, if any, will surface through Task 3's test suite, not speculative pre-emptive changes.
- Do not bump `helmet` (currently `^4.6.0`, quite old) as part of this migration — it has no Express-version coupling and bumping it is a separate, unrelated upgrade. Stay in scope.

---

### Task 1: Make the redirect route's path Express-5-safe (prep, still on Express 4)

**Files:**

- Create: `src/server/modules/redirect/shortUrlRouteGuard.ts`
- Create: `src/server/modules/redirect/__tests__/shortUrlRouteGuard.test.ts`
- Modify: `src/server/modules/redirect/index.ts`
- Modify: `src/server/index.ts:211-215`

- [ ] **Step 1: Write the failing test**

Create `src/server/modules/redirect/__tests__/shortUrlRouteGuard.test.ts`:

```ts
import express from 'express'
import request from 'supertest'

import { shortUrlRouteGuard } from '../shortUrlRouteGuard.js'

function buildTestApp() {
  const app = express()
  app.get('/:shortUrl', shortUrlRouteGuard, (req, res) => {
    res.status(200).json({ shortUrl: req.params.shortUrl })
  })
  app.use((_req, res) => {
    res.status(404).send('not found')
  })
  return app
}

describe('shortUrlRouteGuard', () => {
  const app = buildTestApp()

  it('accepts a plain alphanumeric short url', async () => {
    const res = await request(app).get('/abc123')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shortUrl: 'abc123' })
  })

  it('accepts uppercase letters and hyphens', async () => {
    const res = await request(app).get('/ABC-123')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shortUrl: 'ABC-123' })
  })

  it('strips a single trailing dot', async () => {
    const res = await request(app).get('/abc123.')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ shortUrl: 'abc123' })
  })

  it('falls through to the 404 handler for a double trailing dot', async () => {
    const res = await request(app).get('/abc123..')
    expect(res.status).toBe(404)
  })

  it('falls through to the 404 handler for invalid characters', async () => {
    const res = await request(app).get('/abc_123')
    expect(res.status).toBe(404)
  })

  it('does not match a multi-segment path', async () => {
    const res = await request(app).get('/abc/def')
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test -- shortUrlRouteGuard`
Expected: FAIL — `Cannot find module '../shortUrlRouteGuard.js'` (the module doesn't exist yet).

- [ ] **Step 3: Implement `shortUrlRouteGuard`**

Create `src/server/modules/redirect/shortUrlRouteGuard.ts`:

```ts
import { NextFunction, Request, Response } from 'express'

const VALID_SHORT_URL = /^[a-zA-Z0-9-]+$/

/**
 * Reproduces the matching behaviour of the pre-Express-5 route path
 * `/:shortUrl([a-zA-Z0-9-]+).?` in application code. path-to-regexp v8
 * (bundled with Express 5's router) removed inline per-parameter custom
 * regex and the bare `?` optional-suffix token entirely, so this can no
 * longer be expressed as a route-path string at all. A single trailing
 * literal dot is still accepted (as it was before); anything else that
 * isn't `[a-zA-Z0-9-]+` falls through to the app's 404 handler exactly as
 * it did when the route path itself failed to match.
 */
export function shortUrlRouteGuard(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const { shortUrl } = req.params
  const withoutTrailingDot = shortUrl.endsWith('.')
    ? shortUrl.slice(0, -1)
    : shortUrl

  if (!VALID_SHORT_URL.test(withoutTrailingDot)) {
    next('route')
    return
  }

  req.params.shortUrl = withoutTrailingDot
  next()
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test -- shortUrlRouteGuard`
Expected: PASS — 6/6 tests green.

- [ ] **Step 5: Wire the guard into the real route**

In `src/server/modules/redirect/index.ts`, add the export alongside the existing ones:

```ts
import { RedirectController } from './RedirectController.js'
import { shortUrlRouteGuard } from './shortUrlRouteGuard.js'

export type { RedirectResult } from './types.js'
export { RedirectType } from './types.js'
export { RedirectController } from './RedirectController.js'
export { shortUrlRouteGuard } from './shortUrlRouteGuard.js'

export default RedirectController
```

In `src/server/index.ts`, add the import next to the existing `RedirectController` import (line 62):

```ts
import {
  RedirectController,
  shortUrlRouteGuard,
} from './modules/redirect/index.js'
```

Then replace lines 211-215:

```ts
app.get(
  '/:shortUrl([a-zA-Z0-9-]+).?',
  ...redirectSpecificMiddleware,
  redirectController.redirect,
) // The Redirect Endpoint
```

with:

```ts
app.get(
  '/:shortUrl',
  shortUrlRouteGuard,
  ...redirectSpecificMiddleware,
  redirectController.redirect,
) // The Redirect Endpoint
```

- [ ] **Step 6: Run the full unit test suite**

Run: `pnpm test`
Expected: all suites pass (this is a pure refactor under Express 4 — `RedirectController.test.ts` calls the controller directly and is unaffected by the route-path change).

- [ ] **Step 7: Run typecheck**

Run: `pnpm typecheck`
Expected: exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/server/modules/redirect/shortUrlRouteGuard.ts src/server/modules/redirect/__tests__/shortUrlRouteGuard.test.ts src/server/modules/redirect/index.ts src/server/index.ts
git commit -m "refactor: move short-url route validation from path regex into middleware ahead of Express 5"
```

---

### Task 2: Bump Express to v5 (the flip)

**Files:**

- Modify: `package.json` (`express`, `@types/express`, `express-joi-validation`)
- Create: `src/server/api/__tests__/expressJoiValidationQuerySupport.test.ts`
- Modify: any files `pnpm typecheck` reports errors in after the bump (cannot be enumerated until the bump happens — see Step 6)

**Interfaces:**

- Consumes: `shortUrlRouteGuard` from Task 1 (already wired into `src/server/index.ts`; no changes needed to it in this task).

- [ ] **Step 1: Bump `express` and `@types/express` only**

In `package.json`, change line 81:

```json
    "express": "^4.22.2",
```

to:

```json
    "express": "^5.2.1",
```

and line 145:

```json
    "@types/express": "^4.17.25",
```

to:

```json
    "@types/express": "^5.0.6",
```

Run: `pnpm install`
Expected: lockfile updates, install succeeds (pnpm does not enforce strict peer dependencies by default in this repo — no `.npmrc` override was found).

- [ ] **Step 2: Write the test that proves `express-joi-validation@^5.0.1` crashes under Express 5**

Create `src/server/api/__tests__/expressJoiValidationQuerySupport.test.ts`:

```ts
import express from 'express'
import request from 'supertest'
import Joi from 'joi'
import { createValidator } from 'express-joi-validation'

function buildTestApp() {
  const app = express()
  const validator = createValidator()
  const schema = Joi.object({
    offset: Joi.number().min(0),
  })

  app.get('/search', validator.query(schema), (req, res) => {
    res.status(200).json({ offset: req.query.offset })
  })

  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction,
    ) => {
      res.status(500).json({ error: err.message })
    },
  )

  return app
}

describe('express-joi-validation query support under the installed Express version', () => {
  it('validates the query string without crashing the request', async () => {
    const app = buildTestApp()
    const res = await request(app).get('/search?offset=10')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ offset: 10 })
  })
})
```

- [ ] **Step 3: Run the test to verify it fails (red)**

Run: `pnpm test -- expressJoiValidationQuerySupport`
Expected: FAIL — `res.status` is `500`, not `200` (Express 5's getter-only `req.query` throws when `express-joi-validation@5.0.1` tries `req.query = ret.value` in its own strict-mode module, and the app's error-handling middleware catches it and returns 500). This empirically confirms the crash described in the Global Constraints section, on the actual installed Express 5.

- [ ] **Step 4: Fix it — bump `express-joi-validation`**

In `package.json`, change line 83:

```json
    "express-joi-validation": "^5.0.1",
```

to:

```json
    "express-joi-validation": "^6.1.0",
```

Run: `pnpm install`
Expected: install succeeds. `express-joi-validation@^6.1.0` declares `"peerDependencies": {"joi": "17"}` while this repo has `"joi": "^18.2.3"` — pnpm will likely print a peer-dependency mismatch warning during install; this is expected and non-fatal (no `.npmrc` strict-peer-dependencies setting exists in this repo). Confirm the warning doesn't escalate to an install failure; if it does, note the exact error before proceeding (do not silently add a peer-dependency override without understanding why).

- [ ] **Step 5: Run the test to verify it passes (green)**

Run: `pnpm test -- expressJoiValidationQuerySupport`
Expected: PASS.

- [ ] **Step 6: Run typecheck and fix what surfaces**

Run: `pnpm typecheck`

This bumps both `express` and `@types/express` by a major version across ~40 files (see Task 1's research: 24 files use `import Express from 'express'` + reference `Express.Request`/`Express.Response`/`Express.NextFunction` as a namespace-merged type; several others use named imports `import { Request, Response, NextFunction } from 'express'`; `src/server/index.ts:226` uses `express.ErrorRequestHandler`; `src/server/util/response.ts:2` does `import { response } from 'express'` to patch `express.response.ok`/`.created`/etc. directly onto the prototype). Expected error patterns and how to resolve each as it appears:

- If a file reports `Property 'X' does not exist on type 'Request'` for something that used to work (e.g. a body-parser- or session-typed property), check whether the corresponding `@types/*` package (`@types/body-parser`, `@types/express-session`, `@types/cookie-session`, `@types/express-fileupload`, `@types/connect-redis`, `@types/cookie-parser`) needs its own version bump to a release compatible with `@types/express@5` — check with `npm view <package> versions --json` and bump to the latest in `package.json`, then re-run `pnpm install` and `pnpm typecheck`.
- If a file reports an error on `Express.Request`/`Express.Response`/`Express.NextFunction` namespace access (the `import Express from 'express'` pattern), this means `@types/express@5` changed how its namespace merges — fix by switching that file's import to the named form (`import { Request, Response, NextFunction } from 'express'`) and updating the type annotations accordingly, rather than trying to preserve the namespace-access style.
- If `src/server/util/response.ts:2`'s `import { response } from 'express'` errors, check `node_modules/express/lib/express.js` (or the `@types/express` `index.d.ts`) to confirm whether the internal `response` prototype export still exists under the same name in Express 5 — it is expected to (this mechanism predates v4 and is unrelated to the v5 router rewrite), but confirm rather than assume.
- Do not proceed to Step 7 until `pnpm typecheck` exits 0.

- [ ] **Step 7: Run the full unit test suite and fix any runtime fallout**

Run: `pnpm test`
Expected: exits 0. If any test fails, read the actual failure (not just the file name) — this repo's tests mock `req`/`res` heavily with `node-mocks-http` and hand-rolled objects (see `src/server/modules/redirect/__tests__/RedirectController.test.ts`), which are plain objects unaffected by Express 5's real `req.query` getter behavior, so failures here are more likely to be genuine logic issues (e.g. a controller that now receives `undefined` instead of `{}` for an unparsed `req.body` — see the `req.body` default-value change noted in Express's own migration guide) than false positives from the mocks.

- [ ] **Step 8: Commit**

```bash
git add package.json pnpm-lock.yaml src/server/api/__tests__/expressJoiValidationQuerySupport.test.ts
git commit -m "chore(deps): bump express 4 -> 5, @types/express 4 -> 5, express-joi-validation 5 -> 6"
```

If Step 6 or 7 required additional file changes, stage and commit those too (either folded into this commit or as a immediately-following `fix:` commit — whichever this repo's existing commit history style favors for a single logical change; check `git log --oneline -10` before deciding).

---

### Task 3: Full-suite verification

**Files:** None expected (verification only). If verification surfaces a real bug, fix it in the relevant file and note it here before committing.

- [ ] **Step 1: Lint and format**

Run: `pnpm run lint`
Run: `pnpm run format:check`
Expected: both exit 0.

- [ ] **Step 2: Build**

Run: `pnpm run build`
Expected: exits 0 (compiles server + client bundle).

- [ ] **Step 3: Integration tests**

Run: `pnpm run dev:server-only &` (boots the docker-compose stack per `.github/workflows/ci.yml`'s `Integration Tests` job), wait for it to accept requests, then run: `pnpm run test:integration`
Expected: exits 0. This exercises `test/integration/api/external-v1/Urls.test.ts`, `test/integration/api/user/Urls.test.ts`, and `test/integration/api/admin-v1/Urls.test.ts` — all three hit query-validated `/api` routes for real over HTTP, giving independent confirmation of the `express-joi-validation` fix beyond Task 2's standalone test.
Tear down the stack afterward: `docker compose -f docker-compose.yml down`.

- [ ] **Step 4: Manual smoke test of the redirect route against a running dev server**

Run: `pnpm run dev` (or `pnpm run docker-dev` if already set up locally per this repo's existing dev workflow), then once it's up:

```bash
curl -i http://localhost:8080/<a-real-short-url-from-your-dev-db>
curl -i http://localhost:8080/<a-real-short-url-from-your-dev-db>.
curl -i http://localhost:8080/this-should-not-exist
curl -i "http://localhost:8080/invalid_chars!"
```

Expected: the first two return a redirect (3xx) to the mapped long URL; the last two return the app's rendered 404 page (`ERROR_404_PATH`), not a 500 — confirming `shortUrlRouteGuard` falls through correctly end-to-end through the real `redirectSpecificMiddleware` (`cookieSession`) and `errorHandler`, not just in the standalone test from Task 1.

- [ ] **Step 5: End-to-end tests**

Run: `pnpm run test:e2e-headless`
Expected: exits 0. (If this requires the same docker stack as Step 3/4, reuse it rather than tearing down and rebooting.)

- [ ] **Step 6: Final commit (if Step 3-5 required fixes)**

```bash
git add -A
git commit -m "fix: address issues found during Express 5 full-suite verification"
```

If no fixes were needed, there's nothing to commit here — Task 2's commit already covers the migration.
