# Investigation: floci as a LocalStack replacement for GoGovSG

**Date:** 2026-08-11
**Author:** research agent (delegated by adriangohjw)
**Scope:** Is [floci](https://github.com/floci-io/floci) a viable replacement for the LocalStack S3 emulator currently used in this repo's local dev / integration-test setup?

**Note on where this file lives:** the repo has no existing `docs/investigations/`, `notes/`, or ADR convention — `docs/` only contained an empty `superpowers/specs/` directory (not tracked in git; `git ls-files docs` returns nothing). This file establishes `docs/investigations/` per the task's fallback instruction.

**Correction to the initial brief:** the brief referenced a `docker-compose.server-only.yml` that "depends on localstack for the integration test suite." That file does not exist in this repo (`git ls-files | grep docker-compose` returns only `docker-compose.yml`). All other ground-truth details from the brief (docker-compose.yml lines, config.ts, inversify.config.ts, init-localstack.sh) were re-read and confirmed accurate as of this branch (`perf/e2e-ci-speedup`).

---

## 1. What floci actually is

floci is **not** a LocalStack fork and **not** a wrapper around MinIO/Moto/etc. It is a from-scratch reimplementation of AWS service APIs, written in Java on **Quarkus**, compiled with **GraalVM** to a native binary, distributed primarily as a Docker image.

- README: "Floci is a free, open-source local AWS emulator... named after [floccus](https://en.wikipedia.org/wiki/Cirrocumulus_floccus)." ([README.md](https://github.com/floci-io/floci/blob/main/README.md))
- `gh api repos/floci-io/floci/languages`: dominant language is **Java (19.6 MB)**, with smaller TypeScript/Python/Go/Shell components (companion tooling, not the core emulator).
- Its architecture diagram in the README shows an HTTP router (JAX-RS/Vert.x) in front of three tiers: stateless in-process services, stateful in-process services (S3, DynamoDB), and container-backed services (Lambda, RDS, etc., which shell out to real Docker containers via the Docker Engine API).
- It is maintained by a dedicated GitHub org, **floci-io** ("Any Cloud. Locally.", created 2026-03-27, 17 public repos: `floci` (core), `floci-cli`, `floci-ui`, `floci-duck` (DuckDB sidecar for Athena/S3 Select), testcontainers modules for Java/Node/Python/Go/.NET, `floci-az`/`floci-gcp`/`floci-oci` (non-AWS emulator ambitions), a Homebrew tap, and a docs site repo). Source: `gh api orgs/floci-io/repos`.
- Originally published under `hectorvent/floci` on Docker Hub; the README explicitly instructs users of that old image to migrate to `floci/floci` (`docker/hectorvent/floci` "no longer receives updates").

## 2. License

**MIT**, confirmed by directly reading the LICENSE file in the repo:

> MIT License
> Copyright (c) 2025 Hector Ventura
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software...

(`gh api repos/floci-io/floci/contents/LICENSE`, and independently confirmed via `gh repo view --json licenseInfo` → `{"key":"mit","name":"MIT License"}`.)

This is unambiguously more permissive than LocalStack's current terms. Per LocalStack's own announcement (**[The Road Ahead for LocalStack](https://blog.localstack.cloud/the-road-ahead-for-localstack/)**, published 2025-12-18): beginning March 2026 LocalStack ships as a single unified image that "will require authentication via an auth token for use," the previously-free `localstack/localstack` image stops receiving updates once consolidated, and "our free plan does not include CI credits." Pinning to an old Community tag avoids the auth requirement but forfeits future updates and security patches. floci's README cites the same announcement as its own "Why Floci?" rationale.

## 3. AWS service coverage, S3 specifically

floci's README claims **69 AWS services** (a services table lists ~45 category rows spanning core app services, events/workflows, containers/compute, data/analytics/AI, databases/caching, messaging, security/governance, cost/billing, backup/config).

**S3 is fully supported** and documented in detail (`docs/services/s3.md`, fetched from the repo):

- Buckets: ListBuckets, CreateBucket, HeadBucket, DeleteBucket, GetBucketLocation
- Objects: PutObject, GetObject, GetObjectAttributes, HeadObject, DeleteObject, DeleteObjects, CopyObject
- Listing, multipart upload, versioning, tagging, bucket policy, CORS, lifecycle, ACLs, encryption, notifications, Object Lock, static website hosting, pre-signed URLs, range reads, and S3 Select (via an optional DuckDB sidecar, `floci-duck`)
- Explicitly **not implemented**: bucket replication, access logging, request payment, Intelligent-Tiering, Inventory, Metrics/Analytics configs — none of these are used by GoGovSG.
- S3 is implemented **in-process** (not proxied to a real MinIO/AWS backend), per the README's architecture table.

This comfortably covers GoGovSG's actual usage (bucket creation + `PutObject`/`GetObject`/ACL via the AWS SDK v3 S3 client — see `src/server/inversify.config.ts`).

## 4. How it's deployed / run

Primary distribution is a **Docker image**, `floci/floci`, on Docker Hub:

```yaml
services:
  floci:
    image: floci/floci:latest
    ports:
      - "4566:4566"
```

Tagging scheme (from README "Image Tags" section):

| Channel | Standard | Compat (bundles AWS CLI + boto3 + `awslocal`) |
|---|---|---|
| Release, floating | `latest` | `latest-compat` |
| Release, pinned | `x.y.z` | `x.y.z-compat` |
| Nightly | `nightly` / `nightly-mmddyyyy` | `nightly-compat` / `nightly-mmddyyyy-compat` |

Release cadence is real and frequent: `gh api repos/floci-io/floci/releases` shows tagged releases roughly every 2-4 days from `1.5.5` (2026-04-20) through `1.6.0` (2026-08-06), i.e. semantic-release-driven continuous delivery (a `semantic-release-bot` shows up in the contributors list).

Non-Docker options confirmed from the repo tree and README: a companion CLI (`floci start` / `floci env`, separate repo `floci-io/floci-cli`), a Homebrew tap (`floci-io/homebrew-floci`), and Testcontainers modules for Java (Maven Central, `io.floci:testcontainers-floci`), Node (npm, `@floci/testcontainers`), Python (PyPI, `testcontainers-floci`), with Go "in progress." There is no plain npm package for the emulator itself — it is a JVM/native binary, not a Node.js library.

## 5. Compatibility specifics for GoGovSG's use case

**Path-style addressing:** Explicitly supported and documented as "always works" (`docs/services/s3.md`, "Addressing Styles" section). Both path-style (`forcePathStyle`/`pathStyleAccessEnabled`) and virtual-hosted-style (via floci's embedded DNS resolving `*.localhost.floci.io`) are supported. GoGovSG's `inversify.config.ts` sets `forcePathStyle: true`, which maps directly.

**AWS SDK v3 compatibility:** The README's SDK-integration section includes a working Node.js/AWS SDK v3 example (`@aws-sdk/client-sqs`) using `endpoint`, `region`, `credentials`, exactly matching how GoGovSG constructs its S3 client. `docs/getting-started/aws-setup.md` explicitly calls out `forcePathStyle: true` for "AWS SDK v3 (Node.js)."

**Env vars for fake credentials/region:** floci accepts any non-empty credential values by default (`AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`, e.g. `test`/`test`) and defaults region via `FLOCI_DEFAULT_REGION=us-east-1`. GoGovSG's existing `foobar`/`foobar` values would work unchanged (auth is not enforced by default; there's an opt-in `FLOCI_SERVICES_S3_ENFORCE_AUTH` flag, default `false`).

**Bucket-init mechanism — this is the one real compatibility gap.** floci supports LocalStack-style init hooks, but **only the newer LocalStack convention**, not the legacy one GoGovSG uses:

- Confirmed via source (`src/main/java/io/github/hectorvent/floci/lifecycle/inithook/InitializationHook.java`): floci hard-codes exactly four phases — `boot`, `start`, `ready`, `shutdown` — each with a floci-native path (`/etc/floci/init/<phase>.d`) and a LocalStack-compat path (`/etc/localstack/init/<phase>.d`).
- A targeted code search of the whole repo for `docker-entrypoint-initaws` returned **zero matches**. floci does not support the older LocalStack init convention (`/docker-entrypoint-initaws.d/`) that GoGovSG's `docker-compose.yml` currently mounts (`./init-localstack.sh:/docker-entrypoint-initaws.d/init-localstack.sh`, using `localstack/localstack:1.2`).
- **Practical implication:** migrating would require moving `init-localstack.sh` from being mounted at `/docker-entrypoint-initaws.d/init-localstack.sh` to `/etc/localstack/init/ready.d/init-localstack.sh` (or `/etc/floci/init/ready.d/`). This is a small, mechanical change, not a blocker, but it is a required edit, not "drop-in."
- The init script itself (`init-localstack.sh`) calls `pip install awscli-local` then `awslocal s3 mb ...` / `awslocal s3api put-bucket-acl ...`. floci's `-compat` image tag ships an `awslocal` wrapper (`bin/awslocal` in the floci repo, confirmed via code search: `docker/Dockerfile.compat: COPY bin/awslocal /usr/local/bin/awslocal`), so the existing script's dependency on `awslocal` would work as-is **if** the `-compat` image tag is used and the script is remounted to the new path — no script rewrite needed.
- LocalStack-specific env vars are partially auto-translated by floci's `LOCALSTACK_PARITY` shim (`docker/localstack-parity.sh`, read directly from the repo): it maps `PERSISTENCE`/`PERSIST_STATE` → `FLOCI_STORAGE_MODE`, `LOCALSTACK_HOST`/`LOCALSTACK_HOSTNAME` → `FLOCI_HOSTNAME`, `EDGE_PORT` → `FLOCI_PORT`, `DEBUG=1`/`LS_LOG` → `QUARKUS_LOG_LEVEL`, TLS vars, and Lambda-related vars. It explicitly does **not** translate `DATA_DIR` (GoGovSG's current LocalStack `DATA_DIR=/tmp/localstack/data`) or `HOSTNAME_EXTERNAL` — these would need to become `FLOCI_STORAGE_PERSISTENT_PATH` and `FLOCI_HOSTNAME` respectively (the parity shim maps `HOSTNAME_EXTERNAL`'s LocalStack sibling `LOCALSTACK_HOST`, but not `HOSTNAME_EXTERNAL` itself — this one is not in the shim's mapping list and would need to be set manually as `FLOCI_HOSTNAME`). `AWS_BUCKET_NAME` is not a LocalStack-native variable in the first place (it's a convention local to GoGovSG's own `init-localstack.sh`), so it carries over unchanged as a shell var consumed by the init script.
- `SERVICES=s3` (used today to restrict LocalStack to just S3) is explicitly ignored by floci — "Floci starts all services in ~24ms" regardless (`docker/localstack-parity.sh` comment: "SERVICES — intentionally ignored"). This is harmless for GoGovSG (extra unused services emulated, no functional difference) but means the env var becomes a no-op rather than an error.

**The LocalStack `Date`-header / clock-skew quirk:** GoGovSG's `inversify.config.ts` sets `disableClockSkewCorrection: true` on its S3 client specifically to work around a known LocalStack quirk (malformed/missing `Date` response header breaking AWS SDK v3 signing). **This could not be verified either way from primary sources.** A repo-wide search of floci's issue tracker for "Date header" and "clock skew" returned zero results, and `docs/services/s3.md` does not mention response `Date` headers at all. Since floci is an independent implementation (not LocalStack's codebase), it is plausible the quirk doesn't reproduce, but this is unconfirmed — it would need to be tested empirically (spin up floci, inspect S3 response headers, try removing `disableClockSkewCorrection`) before assuming either way.

## 6. Project health / maturity signals

All figures from `gh api repos/floci-io/floci` and related endpoints, captured 2026-08-11:

- **Stars:** 19,450. **Forks:** 1,984. **Watchers/subscribers:** 66. **Open issues:** 244.
- **Created:** 2026-02-18 (per repo metadata) — i.e. roughly 6 months old at time of writing. **Not archived.**
- **Commit activity:** actively committed to on the day of this research (`2026-08-11T02:03:52Z`, a real substantive fix to RDS endpoint advertisement, PR #2074).
- **Releases:** frequent, semantic-versioned releases (`1.5.5` → `1.6.0` over roughly 4 months, cadence of a new release every 2-4 days).
- **Contributors:** dozens of distinct human logins in `gh api repos/floci-io/floci/contributors` (top contributor `hectorvent` at 330 commits, but a long tail of other named contributors with double-digit commit counts, plus `dependabot[bot]` and `semantic-release-bot`), i.e. not a single-committer hobby project, though there is one dominant maintainer.
- **Org backing:** dedicated GitHub org `floci-io` with 17 repos (CLI, UI, docs site, testcontainers modules in 5 languages, a DuckDB sidecar, and nascent Azure/GCP/OCI emulator repos), suggesting an intent to grow beyond a single-maintainer side project. It funds itself via GitHub Sponsors (README lists sponsor tiers; one named community sponsor, "Nexxion.ai," at time of writing) rather than VC backing — i.e., not corporate-backed in the way LocalStack Inc. is.
- **Independent third-party validation:** a real, currently-open issue on the `quarkusio/quarkus` repository, **[quarkusio/quarkus#53218](https://github.com/quarkusio/quarkus/issues/53218)**, proposes evaluating floci as an alternative AWS emulator provider for Quarkus Dev Services specifically because of LocalStack's March 2026 licensing change, citing the same performance/size claims as floci's own README (~24ms startup vs ~3.3s, ~13MiB vs ~143MiB idle memory, ~90MB vs ~1.0GB image). This is independent corroboration that floci is a live candidate outside its own ecosystem, though as of this research it is a proposal/issue, not a merged integration.

**Caveat on the growth curve:** 19.4k stars and ~2k forks in ~6 months is fast growth for a young project. This research did not attempt to authenticate star/fork velocity beyond what the GitHub API reports (e.g., no star-history timestamp sampling was done to rule out a bot-driven spike). The open-issue volume (244), commit cadence, and real per-service bug reports (see below) are at least consistent with genuine, active usage rather than a purely artificial number, but this should be treated as a soft signal, not hard proof.

## 7. Known gaps / caveats relevant to an S3-only use case

From floci's own docs (`docs/services/s3.md`, "Not Implemented" section) — unimplemented S3 features are replication, access logging, request payment, Intelligent-Tiering, Inventory, and Metrics/Analytics configs. **None of these are used by GoGovSG.**

From floci's open issue tracker (`gh search issues "S3" --repo floci-io/floci --state open`), sampled 2026-08-11 — recent open S3-labeled bugs include:
- `#2144` S3 omits SSE-KMS key ID from object responses (not relevant — GoGovSG doesn't use SSE-KMS)
- `#1589` `ListObjectsV2` decodes `+` to space in returned object keys (edge case, could matter if short URLs/object keys ever contain `+`)
- `#1841` presigned URL signature is not verified even with `enforce-auth` enabled (not relevant — GoGovSG doesn't rely on presigned-URL auth enforcement in dev)
- `#1865` S3 CORS preflight (OPTIONS) always returns 403, ignoring configured allowed origins (worth checking if GoGovSG's dev flow does any browser-side CORS S3 access — the production flow proxies through the app server, so likely not exercised)
- Several S3 Vectors bugs (`#2160`, `#2161`, `#2162`) — irrelevant, GoGovSG doesn't use S3 Vectors

These are the kind of long-tail bugs expected from a young, actively-developed reimplementation — none block basic bucket-create / put-object / get-object / path-style flows, but they indicate the S3 surface is not yet bug-for-bug identical to real AWS or to LocalStack.

The one substantive, confirmed compatibility gap for this repo specifically is the **init-script path mismatch** described in Section 5 (`/docker-entrypoint-initaws.d/` not supported; must move to `/etc/localstack/init/ready.d/` or `/etc/floci/init/ready.d/`).

---

## Recommendation

**Viable, with caveats — not a zero-touch drop-in, but the required changes are small and well-documented.**

What's solid:
- MIT license, unambiguously more permissive than LocalStack's post-March-2026 terms (confirmed from both LICENSE files directly).
- S3 emulation is real, in-process, well-documented, and covers every operation GoGovSG uses (bucket create/ACL, put/get object, path-style addressing, AWS SDK v3).
- Runs as a single Docker image (`floci/floci:latest` or `:latest-compat`), same port (4566), same style of fake credentials — genuinely low-friction to try.
- Active, multi-contributor, frequently-released project with a dedicated org behind it, plus independent third-party evaluation (the Quarkus issue) — this is not a one-person weekend project, though it is young (~6 months old) and still has a dominant single maintainer.

What needs work before calling it done, none of which are blockers:
1. **Move the init script's mount path** from `/docker-entrypoint-initaws.d/init-localstack.sh` to `/etc/localstack/init/ready.d/init-localstack.sh` (or the floci-native `/etc/floci/init/ready.d/`) and switch to the `floci/floci:latest-compat` tag so `awslocal` remains available — floci does not support the legacy `docker-entrypoint-initaws.d` path at all (verified: zero hits in its source for that string).
2. **Re-map a couple of env vars**: `DATA_DIR` → `FLOCI_STORAGE_PERSISTENT_PATH` (with `FLOCI_STORAGE_MODE=persistent` or `hybrid`), and `HOSTNAME_EXTERNAL` → `FLOCI_HOSTNAME` (this one isn't auto-translated by floci's LocalStack-parity shim, unlike `LOCALSTACK_HOST`).
3. **Empirically verify the `Date`-header/clock-skew behavior** that GoGovSG currently works around with `disableClockSkewCorrection: true` in `inversify.config.ts` — this could not be confirmed or ruled out from floci's docs/issues, and is a five-minute manual check (start floci, hit it with the S3 client with clock-skew correction re-enabled, see if requests still succeed) before removing that workaround.

Given the narrow bar (S3-only, path-style, AWS SDK v3, bucket auto-creation on startup), floci clears it. The recommendation is to prototype the swap on a branch, confirm the three items above, and only then commit to it as the LocalStack replacement — this is not something to merge on documentation alone given the project's youth and the one unverified quirk.
