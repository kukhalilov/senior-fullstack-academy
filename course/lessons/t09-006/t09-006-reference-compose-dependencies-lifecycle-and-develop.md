# Docker images Dockerfiles compose networks volumes and security — Reference: Compose dependency readiness, lifecycle hooks, profiles, jobs, and file watch

Sources: [Compose service reference](https://docs.docker.com/reference/compose-file/services/), [Compose jobs reference](https://docs.docker.com/reference/compose-file/jobs/), [Run jobs in Compose](https://docs.docker.com/compose/how-tos/jobs/), [Docker Engine jobs extension](https://docs.docker.com/engine/daemon/jobs/), [Docker Engine 29 release notes](https://docs.docker.com/engine/release-notes/29/), [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [Compose lifecycle hooks](https://docs.docker.com/compose/how-tos/lifecycle/), [Compose develop specification](https://docs.docker.com/reference/compose-file/develop/), [Compose provider services](https://docs.docker.com/compose/how-tos/provider-services/), and [Docker Compose releases](https://github.com/docker/compose/releases).

## Scope and version

Compose v5.8.0 is the latest tagged version checked 2026-11-20. `post_start`/`pre_stop` require Compose 2.30+, `pre_start` is documented for Compose 5.3+, `provider` 2.36+, and service `models` 2.38+. Check the installed plugin. Compose 5.8 adds manual and scheduled one-shot jobs, but scheduled jobs remain experimental and require Docker Engine 29.10+ with the opt-in `org.mobyproject.jobs.v0` extension enabled. Docker Engine, Compose, and the extension must all support the feature.

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

- **Compose top-level jobs (Compose 5.8 experimental)** — Compose 5.8 map of one-shot containers that run to completion. Jobs share the container/workload attributes, support `profiles` and job-to-job `extends`, but do not accept service-only `deploy`, `scale`, `restart`, lifecycle hooks, `container_name`, `attach`, `develop`, `provider`, `links`, or `external_links`. Job names share a namespace with service names. Services cannot depend on jobs.
- **Compose job triggers and `manual`** — `triggers` is required. A job can be run on demand with `docker compose run`; `manual: true` means manual-only and cannot be combined with a schedule. With a schedule, omitting `manual` leaves manual invocation available; `manual: false` disables manual runs.
- **Compose job `schedule` and `cron`** — A scheduled job uses one schedule entry with a five-field cron expression (minute 0–59, hour 0–23, day of month 1–31, month 1–12, day of week 0–7 where both 0 and 7 mean Sunday). Lists, ranges, and steps are accepted; names such as `mon` and shortcuts such as `@daily` are unsupported. If both day-of-month and day-of-week are restricted, a run occurs when either field matches. Engine validates the expression when registering via `up`/`create`, not merely when Compose parses YAML.
- **Compose job `timezone`** — Uses an IANA time-zone name; if absent, Engine evaluates the schedule in UTC.
- **Compose job `concurrency`** — When a schedule fires during an existing run, `forbid` (default) skips that firing; `queue` waits and starts one queued run after completion.
- **Compose job `missed_fires`** — Handles scheduled times missed while Engine was stopped: `one` (default) starts one catch-up run, while `skip` discards missed firings.
- **Compose job `depends_on`** — Manual `docker compose run` starts dependency services and runs dependent jobs first; a dependent job runs as a regular container without its own run record. Scheduled Engine execution does not start or wait for `depends_on` services/jobs; required services must already be available, and the job must tolerate dependency failure.
- **Compose job run records** — Engine records `pending`, `running`, `succeeded`, `failed`, `timed_out`, or `cancelled` state and exit code across container removal/daemon restarts (up to 10,000 runs per job by default); Compose exposes the five most recent runs. Successful scheduled-run containers are removed, failed ones are retained for inspection. A registered job definition is immutable: remove/re-register it to apply a changed definition or image.
- **Docker Engine jobs extension security boundary** — Experimental extension `org.mobyproject.jobs.v0` is disabled by default. The jobs gRPC API is served on every daemon listener address, including TCP/TLS; Docker authorization plugins apply to HTTP API requests and do not authorize jobs API requests. Restrict listener access before enabling.
- **Compose job registration and cleanup** — `docker compose up`/`create` registers scheduled jobs; `up --no-start` registers without starting services. `down` removes registered schedules but preserves run history. Removing a job from YAML alone can leave its schedule firing; use `up --remove-orphans` to remove undeclared registered jobs. If a registered job's definition or image changes, Compose reports a changed-job error; remove/re-register rather than assuming the next `up` updates it.
- **Compose job behavior when Engine extension is off** — Scheduled-job projects are refused by `up`, `create`, or `start`; manual `run` falls back to a one-off service with a warning and without an Engine run record. `down` ignores jobs if the extension was never enabled.
- **Docker Engine jobs API version** — The extension requires Engine 29.10.0/API v1.57 or later, in addition to the Compose 5.8 client; matching the Compose version alone is insufficient.

For exact terms used by the manifest: **Compose job triggers manual and schedule** are the `triggers` map; **Compose job manual true and false semantics** are described above; **Compose job schedule cron five-field syntax**, **Compose job IANA timezone and UTC default**, **Compose job concurrency forbid and queue**, and **Compose job missed_fires one and skip** are the schedule controls. **Compose job scheduled depends_on is not started or awaited**, **Compose job execution run records and retention**, **Compose job registration immutable definition and re-registration**, and **Compose job extension gRPC API authorization boundary** describe distinct operational limits. **Docker Engine jobs extension org.mobyproject.jobs.v0 opt-in** names the disabled-by-default feature.

### Engine 29.10 changes affecting container operations

- **Docker Engine 29.10 loopback insecure-registry behavior** — If `insecure-registries` is explicitly configured, Engine no longer automatically treats loopback registries as insecure; local HTTP or untrusted-TLS registry pulls/pushes can fail until specifically configured or given trusted TLS. With the setting omitted, loopback registries remain insecure by default; an explicit empty list disables all defaults.
- **Docker Engine API OpenAPI 3.2 source and Swagger transition** — Engine API source specification is now OpenAPI 3.2; a generated Swagger 2.0 file remains for compatibility, including a v1.57 snapshot, but future API versions will not receive per-version Swagger 2.0 copies. Update generators/tooling that assume those copies.

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
| Scheduled job | Daemon cron trigger | Dependency startup, production-grade orchestration, or safe exposure of the daemon API |

## Examples

For an API that needs a database, give the database a healthcheck and use `condition: service_healthy`, but retain application-level retry/backoff because the database can become unavailable later. A migration service should be idempotent and use `service_completed_successfully`; multiple Compose projects can still race, so use database locking/versioned migration mechanisms. Put a debug admin UI behind a profile and avoid exposing it by default. Use watch sync for source-compatible development edits and rebuild when dependencies/native output change.

## Common mistakes

- Interpreting `depends_on` as a permanent health monitor or dependency restart controller.
- Using a post-start hook for an operation that must finish before traffic begins.
- Putting non-idempotent migrations in an init hook without concurrency control.
- Treating deploy placement/update keys as implemented by every Compose target.
- Assuming Compose 5.8 scheduled jobs are stable or that their dependency services will be started by the schedule.
- Using development watch as a production release process.
- Relying on `pre_stop` to run during abrupt termination.

## Knowledge checks with answers

1. Which condition waits for readiness? **`service_healthy`, if the healthcheck accurately tests readiness.**
2. Does a healthy dependency remain healthy forever? **No; health can change after startup.**
3. What does a Compose 5.8 scheduled job require? **Engine 29.10+, Compose 5.8+, and the enabled experimental jobs extension.**
4. Does a scheduled job start its `depends_on` services? **No; ensure they are running or design the job to handle their absence.**
5. Why should migrations be idempotent/locked? **Compose can be rerun or multiple project instances can execute concurrently.**

