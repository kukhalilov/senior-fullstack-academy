# CI CD builds tests artifacts deployment and rollback — Reference: CI, continuous delivery, pipeline stages, and release evidence

Sources: [Workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts).

## Scope and version

Covers the exact assigned inventory against current GitHub Actions documentation checked 2026-11-20. Runner images, action runtimes, product-plan capabilities, and event details can change independently; verify current behavior before depending on it.

## How this group fits the mental model

A pipeline should carry one revision through visible validation, packaging, promotion, and recovery decisions. Define what each stage proves and retain evidence; a green run proves only configured checks.

## Supplied names explained

- `Continuous Integration (CI)` — Frequent integration of small changes with automated validation so defects surface close to their introduction.
- `Continuous Delivery` — Keeping each validated change in a releasable state while a human or policy may still choose the release time.
- `Continuous Deployment` — Automatically releasing every change that passes delivery controls, requiring trustworthy tests, monitoring, and recovery.
- `Build pipeline` — The ordered automation that resolves inputs, compiles/packages a revision, and emits validation evidence.
- `Deployment pipeline` — The controlled path that promotes a known artifact into environments, verifies it, and responds to failure.
- `Workflow run` — One execution of the workflow for an event/ref, with its own jobs, logs, outputs, and artifacts.
- `Pipeline stage` — A logical gate grouping operations with a defined output and failure decision.
- `Pipeline job` — A schedulable unit on a runner; jobs can be parallel unless the dependency graph imposes order.
- `Pipeline step` — An action or shell command within a job, executed in declared order.
- `Job dependency graph` — The directed graph of prerequisites; avoid unnecessary serial dependencies that delay feedback.
- `Fail-fast stage` — A policy to stop related work after decisive failure; matrix fail-fast should reflect whether collecting all failures is useful.
- `Quality gate` — An explicit pass condition such as tests, scan policy, review, or deployment health that blocks promotion when unmet.
- `Build validation` — Checks that the selected revision restores and compiles with defined inputs and toolchain.
- `Test stage` — Runs selected test boundaries and preserves reports; unit/integration/end-to-end checks catch different defects.
- `Artifact promotion` — Moving the same identified output from one trust/environment stage to another without rebuilding it.
- `Build once deploy many` — Create an immutable artifact once and promote identical bytes so environments do not receive separate builds.
- `Immutable build artifact` — A packaged output whose content remains fixed and whose digest can be verified at each promotion.
- `Reproducible build` — A build designed to yield verifiable repeatable outputs from declared inputs; pinning alone does not guarantee byte identity.
- `Deterministic dependency restore` — Resolve the declared locked dependency graph consistently rather than silently adopting newer versions.
- `Release candidate` — A specific versioned build being considered for a release and subject to final verification.
- `Release manifest` — Metadata mapping release components to source revisions, versions, artifact digests, and intended targets.
- `Deployment verification` — Checks that the expected version is deployed and behaves according to defined post-release criteria.
- `Post-deployment smoke test` — A small live critical-path check after release; it is narrow evidence, not a full regression suite.
- `Deployment freeze` — A policy interval restricting changes due to risk or staffing; emergency paths should be separately defined.
- `Change failure rate` — The proportion of changes resulting in a production incident or rollback under a consistent measurement definition.
- `Deployment frequency` — How often releases reach the chosen environment; interpret with stability and change size.
- `Lead time for changes` — Elapsed time from the team’s chosen change start point to production; define both measurement boundaries.
- `Mean time to restore` — Average time to restore service after a failure using a consistent incident and recovery definition.

## Cross-item comparison

CI validates; delivery keeps changes releasable; deployment releases them automatically. Build-once promotion preserves bits; rebuilding per environment can diverge. Flow measures and stability measures must be defined consistently.

## Examples

Restore lockfile dependencies, build, test, package once, record a digest, then promote the same output. Delivery may await a release decision; deployment automates it after policy passes.

## Common mistakes

Do not equate delivery with deployment, assume a gate proves untested behavior, or rebuild a different artifact for every environment.

## Knowledge checks with answers

1. **When should a pipeline build once and promote the same artifact?** When environment changes are configuration-only and artifact identity must remain consistent across stages.
2. **What should a release record capture?** Source revision, dependency/build inputs, artifact digest, checks, approvals, and deployment target.
3. **Why separate build and deployment permissions?** It limits the credentials and environments exposed to untrusted build steps.
