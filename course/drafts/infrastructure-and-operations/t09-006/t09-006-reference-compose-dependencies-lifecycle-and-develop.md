# Docker images Dockerfiles compose networks volumes and security — Reference: Compose dependency readiness, lifecycle hooks, profiles, jobs, and file watch

Sources: [Compose service reference](https://docs.docker.com/reference/compose-file/services/), [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [Compose lifecycle hooks](https://docs.docker.com/compose/how-tos/lifecycle/), [Compose develop specification](https://docs.docker.com/reference/compose-file/develop/), [Compose provider services](https://docs.docker.com/compose/how-tos/provider-services/), and [Docker Compose releases](https://github.com/docker/compose/releases).

## Scope and version

Compose v5.7.1 is the latest tagged version checked 2026-11-16. `post_start`/`pre_stop` require Compose 2.30+, `pre_start` is documented for Compose 5.3+, `provider` 2.36+, and service `models` 2.38+. Check the installed plugin. The Compose jobs implementation is partial in v5.7.1 and supports manual trigger only according to release notes; do not treat it as a scheduled production job controller.

## How this group fits the mental model

Compose creates a project graph and orders operations. Dependency conditions govern startup progression. Hooks run around lifecycle events. Profiles select optional services. Develop watch monitors source paths for a development feedback loop. These are client/plugin behaviors, not a general continuous controller: a crash, unhealthy status, or external resource change does not imply Compose continuously reconciles all desired state.

## Supplied names explained

### Dependency conditions and readiness

- **Service depends_on** — Declares service ordering/dependency in the Compose graph. Short syntax waits for the dependency container to start, not necessarily become ready.
- **depends_on service_started** — Dependency has started. This is the short-syntax/default condition and is weaker than application readiness.
- **depends_on service_healthy** — Waits for dependency healthcheck to report healthy before starting dependent service. A correct healthcheck must test the real readiness boundary.
- **depends_on service_completed_successfully** — Waits for a finite dependency task to exit successfully; useful for one-shot setup/migration tasks but beware concurrent deploys and non-idempotence.
- **depends_on required** — When false, missing/failed dependency is treated as a warning rather than blocking; version-gated (Compose 2.20+ per service docs). This changes failure semantics intentionally.
- **depends_on restart** — Can restart a dependent after an explicit Compose-controlled dependency update/restart; it does not mean every dependency process crash automatically restarts the dependent.
- **Compose startup order and readiness** — `depends_on` controls orchestration order and optional health/completion gates. It cannot prove a remote system is reachable through the application's real network/auth path after startup.
- Service deploy.restart_policy condition delay max_attempts window — Deployment-spec process restart behavior controls on-failure/none/any with limits/delay/window where supported; distinct from service-level Engine `restart`.
- Service deploy.update_config parallelism delay failure_action monitor order — Describes update rollout strategy for platforms that implement it; local Compose may ignore it.
- Service deploy.rollback_config — Rollback strategy fields for implementing deployment platforms; not a promise that `docker compose up` can roll a failed rollout back.
- Service deploy.placement constraints preferences — Scheduling placement constraints/preferences for cluster-capable implementations; a single local Engine has no multi-node scheduler to honor them.
- Service deploy.mode replicated global — Deployment mode values (replicas versus one-per-node) on supported orchestrators; not universally supported by local Compose.
- Service deploy.endpoint_mode vip dnsrr — Service discovery mode (virtual IP or DNS round-robin) where platform implements it.
- Service deploy.resources limits reservations — Resource limits/reservations in deployment model; support varies, so check resulting Engine settings.
- Compose deploy implementation support — Deploy is optional in Compose Specification. Inspect actual platform behavior, not only schema acceptance.

### Lifecycle hooks

- Compose service post_start hook — Runs commands after container startup; Compose does not guarantee ordering against completion/readiness of the main entrypoint. Use for noncritical follow-up work, not a prerequisite migration.
- Compose service pre_start hook — Compose 5.3+ ordered init-container step(s) run to completion before main service starts, after dependencies are satisfied. Shared named/bind volumes are suitable for outputs; per-instance tmpfs/anonymous mounts may not be available to a single pre-start step.
- Compose service pre_stop hook — Runs before a Compose-initiated stop and receives command/user/environment/working_dir/privileged options like post_start. It is not guaranteed for sudden crashes, force-kill, or host failure.
- Compose hook execution context and timing — Hook commands may run with inherited service context plus overrides; exact synchronization differs by hook. Verify output, permissions, retries and idempotency.

### Development watch and profiles

- Compose develop.watch — Development-mode file watch rules in service `develop`; they sync or rebuild based on source changes and are not production deployment automation.
- Compose watch action sync — Copies changed files into a running container path, useful for interpreted code/static assets; target must exist/permissions allow and app may need reload.
- Compose watch action rebuild — Rebuilds/recreates the service image when changes require compilation or dependency installation; slower but preserves build/runtime separation.
- Compose watch action sync+restart — Synchronizes files and restarts the service process/container according to current implementation; validate support and startup impact.
- Compose watch ignore and include paths — Include/ignore controls limit watch scope; glob semantics and ignored context rules should be tested to avoid missing changes or rebuild loops.
- Compose watch target path and initial_sync — `target` identifies in-container destination; initial sync seeds current files before watching when configured. Do not write over generated/runtime state accidentally.
- Compose watch extensions sync+exec — Extension form runs commands after sync (including supported sync+exec action); commands need idempotency and correct environment.
- `docker compose watch` — Starts configured watch actions for a development project. It needs an attached development workflow and supported plugin; stop it when done.
- Compose profiles — Named opt-in service groups. Services without profiles start by default; profiled services start when selected or explicitly targeted according to dependency rules.
- Compose profile auto-start rules — Targeting a profiled service can activate it and its dependencies even if the profile was not globally enabled; inspect CLI behavior for the installed version.

### Jobs and dependency patterns

- Compose jobs (v5.7 partial support) — One-shot job-style resources added in recent Compose releases. Current support is incomplete compared with full engine/platform scheduling.
- Compose job manual trigger limitation — Compose 5.7 release notes state manual-trigger jobs are supported while scheduled jobs are not yet available; Engine 29.10's experimental job extension is a separate opt-in feature/API.

## Cross-item comparison

| Mechanism | Waits for | Does not guarantee |
|---|---|---|
| `service_started` | Container starts | App initialized or dependency reachable |
| `service_healthy` | Configured check succeeds | Permanent health or downstream path correctness |
| `service_completed_successfully` | Task exits zero | Idempotence, locking, exactly-once execution |
| `pre_start` | Init step completes | Distributed migration safety or rollback |
| `post_start` | Container starts | Ordering before app readiness |
| `pre_stop` | Compose stop path | Execution after crash/force-kill |
| `develop.watch` | File change | Production rollout safety |

## Examples

For an API that needs a database, give the database a healthcheck and use `condition: service_healthy`, but retain application-level retry/backoff because the database can become unavailable later. A migration service should be idempotent and use `service_completed_successfully`; multiple Compose projects can still race, so use database locking/versioned migration mechanisms. Put a debug admin UI behind a profile and avoid exposing it by default. Use watch sync for source-compatible development edits and rebuild when dependencies/native output change.

## Common mistakes

- Interpreting `depends_on` as a permanent health monitor or dependency restart controller.
- Using a post-start hook for an operation that must finish before traffic begins.
- Putting non-idempotent migrations in an init hook without concurrency control.
- Treating deploy placement/update keys as implemented by every Compose target.
- Assuming job support means scheduled Compose tasks work in v5.7.1.
- Using development watch as a production release process.
- Relying on `pre_stop` to run during abrupt termination.

## Knowledge checks with answers

1. Which condition waits for readiness? **`service_healthy`, if the healthcheck accurately tests readiness.**
2. Does a healthy dependency remain healthy forever? **No; health can change after startup.**
3. Does Compose v5.7.1 schedule jobs? **Release notes document partial manual-trigger support; scheduled jobs are not yet available there.**
4. Why should migrations be idempotent/locked? **Compose can be rerun or multiple project instances can execute concurrently.**

