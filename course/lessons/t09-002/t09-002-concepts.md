# CI CD builds tests artifacts deployment and rollback — Core concepts and how they fit together

Sources: [workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax), [dependency caching](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching), [workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts), [secure use](https://docs.github.com/en/actions/reference/security/secure-use), and [OIDC](https://docs.github.com/en/actions/reference/security/oidc).

## Learning objectives

You will distinguish CI, delivery, and deployment; explain workflow jobs and contexts; build and promote an immutable artifact; select safe caches and runners; define deployment recovery signals; and restrict credentials and untrusted code.

## Prerequisites

A workflow is event-triggered automation described in YAML. A job runs on a runner and contains steps. An artifact is an output that can be retained or promoted. Cloud federation can exchange a trusted workload identity token for a short-lived credential.

## Core concepts

### Delivery models and evidence

Continuous integration integrates and validates small changes frequently. Continuous delivery keeps every successful change ready to release, although a person or policy can decide when. Continuous deployment automatically releases changes that pass the defined controls. These are related maturity steps, not synonyms.

A quality gate must say what it proves. Build validation checks compilation; unit, integration, and end-to-end tests observe different boundaries. A successful workflow proves configured checks passed for its inputs and environment, not that coverage is complete or the change is correct.

### Workflow dependency graph

A workflow has trigger events, jobs, and steps. Jobs may run independently or wait for dependencies. A step runs a shell command or invokes an action. Matrices create job variations. Outputs pass small values; artifacts pass files. Conditions and expressions determine whether work runs, so context choice and shell quoting matter.

Event filters determine refs and paths that trigger runs. Scheduled triggers, activity types, concurrency, and cancellation policies each have specific semantics. A production concurrency lock should prevent conflicting deployments without cancelling an in-progress healthy release accidentally.

### Reproducibility and dependencies

Lockfiles pin resolved package versions and integrity data. Deterministic restore makes resolution consistent but does not guarantee every build tool and input is deterministic. Pin toolchains where repeatability matters and report them.

A cache reuses regenerable files to reduce time and network use. Correctness must not depend on a cache hit. Keys should include relevant OS, toolchain, and lockfile inputs; restore prefixes are fallbacks, not proof of compatibility. Treat restored contents as untrusted and never cache secrets. An artifact preserves an output for another job or later inspection; it is not a cache.

### Immutable artifact and provenance

Build once packages source into an identifiable output; promote that exact output through staging and production. Record a digest and provenance linking repository, commit, workflow, and environment. A mutable tag is an alias, not unique artifact identity.

Attestations provide signed provenance claims consumers can verify. They do not prove source correctness or absence of vulnerabilities. An SBOM lists components; it is not a security verdict. Scope registry credentials to the needed publication.

### Deployment and recovery

Rolling deployments replace instances gradually and need capacity planning. Blue-green deployment maintains two environments and switches traffic, trading cost for a fast switch. Canary deployment routes a small share to a candidate, then expands based on evidence. Progressive delivery stages a rollout with automated or human analysis. Feature flags separate deployment from feature exposure but require ownership and cleanup.

Old and new application versions overlap. Expand-and-contract database changes first add compatible structures, deploy code that tolerates both forms, migrate, then remove old structures after old readers/writers are gone. A failed app release can only be rolled back safely when existing data and external side effects remain compatible.

Define health thresholds and smoke tests that reflect user behavior. Automatic rollback requires a reliable failure signal and a known-good immutable artifact. If rollback is unsafe, roll forward or compensate. Verify recovery after traffic is restored.

### Workflow security

Third-party actions execute code in workflow context. Pin immutable revisions under your policy and review maintainers and permissions. Set token permissions to minimum required, preferably read-only by default, then elevate only the job that needs it. Secret masking is not guaranteed for transformed values, so prevent exposure at source.

Fork pull requests are untrusted. Do not execute their code with production secrets or write tokens. The pull_request_target event runs with base-repository context; combining it with checkout and execution of untrusted code can expose privileges. OIDC provides a short-lived workload identity token, but the cloud trust policy must restrict issuer, audience, and repository/branch or environment subject claims.

## Mechanisms and relationships

### Secure build-to-deploy path

1. Pull-request workflow validates source with minimal permissions and no deployment secrets.
2. Protected main integration triggers restore, tests, analysis, and package steps.
3. Jobs preserve reports and immutable outputs; caches are only for regenerable dependencies.
4. Publication records the artifact digest and provenance.
5. Staging deploys by digest and runs smoke and health checks.
6. Production environment policy gates deployment; OIDC claims are restricted to the approved repository/environment.
7. Gradual rollout observes the same user-facing signals as the SLO.
8. Failed verification restores a compatible known-good artifact or rolls forward; data recovery is planned separately.

### Cache versus artifact

A dependency cache is an optional speedup reusable across runs. A workflow artifact is a named output retained under a policy and downloadable by later jobs. Use caches for dependencies and artifacts for reports, binaries, and promotion. Do not make artifact correctness depend on a cache hit.

### Delivery performance

Deployment frequency and lead time measure delivery flow; change failure rate and mean time to restore measure stability. Define each consistently. Optimizing one number alone can reward undesirable behavior, such as frequent releases without useful verification.

## Worked examples

### Lockfile change

The lockfile changes, so restore uses the newly resolved dependency set and cache key. Tests run against those inputs. The package is generated once and its digest recorded. Staging downloads that exact output; production promotes it without rebuilding.

### Failed canary

A small traffic fraction reaches the candidate. The chosen error/latency threshold breaches. The rollout pauses and returns traffic to the known-good version or requests an operator according to policy. Before rollback, verify the migration remains compatible with the old app.

## Misconceptions and edge cases

- Green means configured checks passed, not that software is correct.
- Caches are optional speedups; artifacts preserve outputs.
- Rebuilding later may produce different bits even from the same source.
- Tags can move; digests identify artifact content.
- Attestation establishes provenance claims, not safety.
- Application rollback cannot reverse all database changes or external effects.
- Masking does not guarantee transformed secrets are hidden.
- Fork code is untrusted input regardless of who started the workflow.
- Cache contents can be stale or poisoned.
- A canary needs representative traffic, meaningful metrics, and enough observation time.

## Knowledge checks with answers

1. **Delivery versus deployment?** Delivery keeps a release ready; deployment automatically releases qualifying changes.
2. **Why promote by digest?** It identifies exact artifact bytes and avoids mutable aliases or rebuilding.
3. **Can an artifact replace a cache?** No. Artifacts preserve outputs; caches accelerate regeneration.
4. **Why are fork workflows risky with secrets?** Fork-controlled code can execute during the job and attempt to expose credentials.
5. **What does OIDC add?** A short-lived identity token exchanged under a narrowly constrained cloud trust policy.
6. **Why might rollback fail after a release?** Current data or external side effects may not be compatible with the old application.

