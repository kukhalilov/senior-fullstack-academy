# CI CD builds tests artifacts deployment and rollback — Reference: Build graph, tests, dependency lockfiles, caches, and supply-chain checks

Sources: [Dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching), [Secure use](https://docs.github.com/en/actions/reference/security/secure-use), [Artifact attestations](https://docs.github.com/en/actions/concepts/security/artifact-attestations).

## Scope and version

Covers the exact assigned inventory against current GitHub Actions documentation checked 2026-11-20. Runner images, action runtimes, product-plan capabilities, and event details can change independently; verify current behavior before depending on it.

## How this group fits the mental model

Locked inputs, tests, and supply-chain evidence make builds more repeatable. Caches are optional and untrusted; artifacts preserve outputs. Keep accelerator data out of correctness and security claims.

## Supplied names explained

- `Dependency lockfile` — A package-manager file recording resolved versions and integrity data. Restore from it in CI and fail if dependency manifests are out of sync.
- `Package manager cache` — A cache of downloaded packages maintained by the package tool; it is regenerable and should not be treated as a trusted release input.
- `actions/cache key` — A lookup key for one cache entry; include OS/toolchain and lockfile hash so incompatible dependencies do not collide.
- `Cache restore-keys` — Prefix fallbacks used after an exact key miss; they can return stale data and must not affect correctness.
- `Cache scope` — The branch/ref and event access boundary for entries; low-trust workflow runs must not poison trusted build inputs.
- `Cache poisoning` — An attacker-influenced cache entry later restored by a privileged workflow, potentially executing malicious compiled or scripted content.
- `Dependency cache versus artifact` — Cache speeds regeneration and may be absent; artifact records output for transfer/inspection. They serve different lifecycle contracts.
- `Build cache` — Reusable intermediate build outputs; key by all inputs that affect output and assume a cache miss or invalidation can occur.
- `Test matrix` — A declared set of runtime/OS/configuration combinations expanded into repeated test jobs.
- `Unit-test job` — A fast check of isolated behavior; it does not validate wiring to real infrastructure or complete user journeys.
- `Integration-test job` — A check across component boundaries, often with real or representative dependencies, catching configuration and contract failures.
- `End-to-end-test job` — A test of a user-visible path across the assembled system; expensive and potentially more brittle than focused tests.
- `Service container` — A container dependency started alongside a job for tests such as database or cache integration; wait for readiness, not just container startup.
- `Test report artifact` — A retained structured test result for later inspection even when a runner is gone.
- `Code coverage artifact` — A retained coverage report indicating executed code paths, not proof of assertion quality or behavior correctness.
- `Dependency vulnerability scan` — A check comparing dependency identities with vulnerability data; results need severity policy, triage, and update process.
- `Static analysis stage` — Automated source inspection for specified defect classes; it complements but does not replace tests or review.
- `Secret scan` — A search for credential-like data in source/history/output; exposed credentials must be revoked, not only deleted.
- `Software Composition Analysis (SCA)` — Analysis of third-party components, licenses, and known vulnerabilities in the dependency graph.
- `Software Bill of Materials (SBOM)` — A machine-readable list of included software components, useful for inventory and response but not itself a security verdict.
- `Container image scan` — Analysis of image contents/configuration for known vulnerabilities or policy violations before deployment.
- `Build provenance` — Evidence linking artifact production to source revision, workflow, inputs, and build environment.
- `Artifact attestation` — A signed statement about artifact provenance/integrity that a consumer can verify against a trust policy.
- `actions/attest-build-provenance` — The GitHub action for generating a build provenance attestation; its token permissions, build subject, and workflow identity must be correct.
- `Pinned action commit SHA` — An immutable action revision reference that avoids a mutable tag silently changing the executed code.
- `Verified action creator` — A trust signal about an action publisher; it does not replace source review, permission minimization, or revision pinning.
- `Third-party action audit` — Review of action source, maintainer, dependencies, release process, and permissions before execution.
- `Workflow dependency lockfile` — A mechanism or file that pins workflow action dependencies where supported, stabilizing the referenced executable graph.
- `Action runtime deprecation` — A platform lifecycle change that can cause an action to warn or stop executing until its runtime is updated.
- `Runner image version` — The OS/tool image provided to the job; hosted image contents change, so record or pin an image where reproducibility needs it.
- `Self-hosted runner` — Customer-managed execution capacity with local access; persistent state and network privileges require isolation and cleanup.
- `GitHub-hosted runner` — GitHub-provisioned job machine with managed images and clean run isolation, subject to platform quotas and image updates.
- `Ephemeral runner` — A runner instance destroyed after a job, limiting persistence of compromised files or credentials.

## Cross-item comparison

Unit/integration/end-to-end tests cover different boundaries. Cache accelerates; artifact preserves outputs. Hosted runners are managed; self-hosted runners need isolation; ephemeral runners reduce persistence.

## Examples

Key dependency caches by platform/toolchain/lockfile. A cache miss restores normally. Upload test reports as artifacts; scan the exact image that later gets promoted.

## Common mistakes

Make cache misses safe; treat cache data as untrusted; lock dependencies; retain reports; isolate self-hosted runners from untrusted code.

## Knowledge checks with answers

1. **Why use a lockfile in CI?** It constrains dependency resolution to a reproducible graph when the package manager honors it.
2. **What is the difference between build and test evidence?** Build verifies compilation/package creation; tests exercise selected behavior and can still miss untested defects.
3. **What belongs in a reusable build artifact?** The versioned output and provenance needed by downstream jobs, not secrets or mutable build state.
