# CI CD builds tests artifacts deployment and rollback — Interview questions and reasoning

Sources: [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [cache security](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching), [secure use](https://docs.github.com/en/actions/reference/security/secure-use), [OIDC](https://docs.github.com/en/actions/reference/security/oidc), [deployment environments](https://docs.github.com/en/actions/concepts/workflows-and-actions/deployment-environments), and [artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations).

## Core questions

1. How do continuous integration, delivery, and deployment differ?
2. Why build once and promote by digest?
3. How is a workflow artifact different from a dependency cache?
4. How should jobs and permissions be separated?
5. How do rolling, blue-green, and canary deployments differ?
6. Why can application rollback be unsafe after a schema change?
7. What security risks come from third-party actions and fork pull requests?
8. How does OIDC reduce credential risk?
9. What do attestations and SBOMs prove?
10. Which delivery performance measures balance speed and reliability?

## Concise interview answers

1. CI validates frequently integrated changes; delivery keeps successful changes releasable; deployment automatically releases qualifying changes.
2. A digest identifies exact bytes and ensures staging/production run the tested output, not separate rebuilds or mutable aliases.
3. A cache accelerates regenerable work and may miss; an artifact preserves a job output for transfer or later inspection.
4. Express prerequisites with job dependencies, isolate untrusted validation, set read-only token defaults, and elevate only the publishing/deploying job.
5. Rolling replaces instances incrementally; blue-green switches between parallel environments; canary exposes a small traffic share before expansion.
6. The prior app may not understand new schema/data, and external side effects may not be reversible.
7. Actions execute code with job permissions; fork code is attacker-controlled. Pin revisions, audit dependencies, and withhold sensitive credentials from untrusted jobs.
8. A workflow requests a short-lived signed identity token; a cloud provider issues a scoped credential only if issuer, audience, and subject trust conditions match.
9. Attestations provide signed build provenance; SBOMs enumerate components. Neither alone proves correctness or safety.
10. Deployment frequency and lead time measure flow; change failure rate and mean time to restore measure stability, provided definitions are consistent.

## Deep follow-up answers

### How do you prove the artifact in production is what passed tests?

Build once, assign a content digest, retain the artifact and provenance, and pass it between jobs. Deploy by digest and record it in the deployment manifest/status. Verify attestation identity and ensure no later job rebuilds from mutable inputs.

### How do you cache safely?

Cache only regenerable, non-sensitive data. Include OS/toolchain/lockfile inputs in the key, understand restore fallback behavior, and make cache misses safe. Treat restored contents as untrusted and isolate writes/read scopes for low-trust events.

### Which Actions permissions should a pipeline grant?

Start with minimal read permissions. Grant contents-write, package-write, or OIDC token-request permission only to the job that needs it. Secrets should be scoped to environment/job purpose and must not be exposed to untrusted PR code. Permissions are capability grants, so reduce both breadth and duration.

### What is the danger of pull_request_target?

It executes in the base repository’s context and may have access to privileged token/secrets. If the workflow checks out and executes fork-controlled code, that code can use the privileged context. Separate trusted metadata handling from untrusted code execution and never expose sensitive credentials to it.

### How would you make database migrations compatible with rolling deploys?

Use an expand-and-contract sequence: add compatible schema, deploy code that supports old and new forms, backfill/transition data, verify all old versions are gone, then remove old structures in a later release. Design rollback before destructive change; application rollback does not imply database rollback.

### What should trigger automatic rollback?

A reliable, low-noise signal tied to user impact, evaluated over adequate traffic/time, plus a known-good artifact and an operation safe for current data. Include a pause/manual intervention path when the signal is ambiguous or rollback risks corruption.

## Scenario questions

### A deployment job rebuilds from source in each environment. Why change it?

The toolchain, dependency resolution, timestamps, and build inputs may differ, producing different bits. Build one immutable artifact, verify its digest, and promote the same output. Environment-specific configuration should be injected safely at deploy/runtime without changing the binary image unexpectedly.

### The cache contains compiled output and a secret file. What do you do?

Remove the secret from cache production and access, rotate it if exposure is possible, and review logs/runs that could read it. Treat cache contents as untrusted; rebuild from clean inputs and revise the cache path/key. Do not rely on deletion alone if data was already accessible.

### A canary passes infrastructure health but fails checkout conversion rate. What is the right signal?

Use the user-facing correctness/availability SLI. Infrastructure liveness is supporting evidence, not the release objective. Pause expansion, inspect correlated traces/logs and recent changes, then rollback or roll forward only if data compatibility permits.

### A team wants a required human approval for production. How do you model it?

Use a deployment environment with protection rules and environment-scoped secrets, subject to repository visibility and plan capabilities. Keep CI validation separate, require the production job to reference that environment, and make deployment history auditable.

## Tradeoffs and alternatives

- **Cache versus artifact:** speed/reuse versus retained output and job transfer.
- **Hosted versus self-hosted runners:** managed clean environment versus local control/network access and added isolation/maintenance responsibility.
- **OIDC versus static cloud key:** short-lived federated identity versus long-lived stored credential, with cloud trust configuration as a requirement.
- **Rolling versus blue-green versus canary:** capacity-efficient gradual replacement versus parallel environments and quick switch versus traffic-based risk sampling.
- **Rollback versus roll-forward:** restore known-good bits when state remains compatible versus apply a fix/compensation when reversal is unsafe.

## Common weak answers

- “CI/CD is one thing.” It hides the distinct release decision in delivery versus deployment.
- “Cache the build, then deploy the cache.” Caches are not immutable release records.
- “Same tag means same artifact.” Tags can move; compare digests.
- “Attestation proves the software is safe.” It proves scoped provenance claims, not correctness.
- “A rollback just means redeploy the previous app.” Current data and side effects may make it incompatible.
- “GitHub masks secrets.” Redaction is not guaranteed, especially after transformation.
- “The token is automatically secure.” Its permissions and event context determine risk.
- “A green pipeline means no production defects.” Checks have finite coverage and imperfect signals.

## Self-check rubric

Score each 0–2: 0 = incorrect; 1 = correct but generic; 2 = mechanism plus tradeoff and verification.

- I can describe the exact source commit and digest deployed.
- I can distinguish artifacts, caches, tags, digests, provenance, and SBOMs.
- I can design least-privilege jobs for trusted and untrusted events.
- I can describe OIDC claims and cloud trust conditions.
- I can explain rollout strategies and user-facing health signals.
- I can plan recovery across application, database, and external effects.

