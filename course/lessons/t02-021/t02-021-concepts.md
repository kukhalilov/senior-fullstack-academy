# deployment settings environments troubleshooting and performance — Core concepts and how they fit together

## Learning objectives

By the end, you should be able to reason about effective configuration, environment-name precedence, secret boundaries, startup/readiness, production exception handling, async request behavior, load measurement, and safe rolling releases. You should know which layer to inspect first when the local development launch works but the deployed process fails.

## Prerequisites

Know the ASP.NET Core host and middleware pipeline, basic environment variables and JSON configuration, and the difference between a process and a container. Familiarity with HTTP request/response deadlines and database schema migrations helps with the operational examples.

## Core concepts

### Environment selects behavior; providers provide values

`Development`, `Staging`, and `Production` are conventional environment names. They are not security boundaries by themselves. Code can choose `IsDevelopment()` behavior, and the default builder loads an environment-specific appsettings file based on the name. A custom environment name is valid when the deployment and files use it consistently. If no environment variable is set, the environment defaults to Production.

With `WebApplication.CreateBuilder`, `DOTNET_ENVIRONMENT` wins over `ASPNETCORE_ENVIRONMENT`; with legacy `WebHost`, the order is reversed. ASP.NET Core 10 marks the WebHost model obsolete, so current applications should use `WebApplication`. Do not set both environment variables to conflicting values unless the selected builder's precedence is understood. Print the safe hosting environment name at startup; never print a whole configuration object.

### Configuration precedence is ordered composition

The default app configuration typically layers base JSON, environment-specific JSON, Development User Secrets, environment variables, then command-line arguments, with later providers overriding earlier ones. Host configuration values can also influence bootstrap. A key's effective value is the last provider that supplies it. Environment-variable hierarchy uses `__` for `:` across platforms, for example `ConnectionStrings__Primary`. `ASPNETCORE_` and `DOTNET_` have host-configuration roles; ordinary app variables are read by the app environment-variable provider. Inspect provider order and effective nonsecret values when diagnosing mismatches.

Environment-specific appsettings should usually contain nonsecret differences such as a feature endpoint or logging level. Development User Secrets keep local credentials outside the project tree, but are not encrypted production storage and should not contain production secrets. Production should use an appropriately protected secret service or platform identity. Prefer managed identity where supported so the application does not need a long-lived credential. Do not dump configuration values to logs, even when a validator throws.

### Startup validation and readiness are related but distinct

Fail-fast validation catches missing or malformed configuration before serving user traffic. It is useful for immutable assumptions such as an invalid endpoint, missing signing key, or impossible options. Dependency availability is a policy choice: failing startup on a transient database outage can make the orchestrator restart-loop; accepting traffic before a required dependency is usable can produce errors. Readiness should reflect whether this instance should receive traffic. Liveness should detect a stuck/unrecoverable process, not restart the app every time an external dependency briefly fails. The hosting platform decides how probes affect routing and restart.

### Error handling separates client contract from operator evidence

Production responses should not reveal stack traces, file paths, secrets, SQL, or internal hostnames. `UseExceptionHandler` and `IExceptionHandler` create a controlled error path; `UseDeveloperExceptionPage` is for local development. An `IExceptionHandler` is a singleton and must be thread-safe and must not capture scoped dependencies. Handler registrations run in order; the first one returning `true` owns the complete response. If it returns handled without setting a status/body, middleware behavior can produce an unintended 404. If it returns `false`, the configured fallback is used. Logging a handled exception in both handler and middleware can duplicate entries; choose where it is recorded.

Startup failures happen before ordinary requests and may appear only in host/ANCM/container logs. Application logging, `Microsoft.Hosting.Lifetime` messages, ANCM stdout output, and a health endpoint answer different questions. ANCM stdout logs are temporary diagnostics, not normal application logging, and require restricted storage and cleanup. Troubleshoot from process and exit code through environment, configuration, binding, dependencies, and request path; avoid changing many layers at once.

### Async request paths improve concurrency while preserving boundaries

An asynchronous I/O call releases its request thread while waiting, allowing that thread to serve other work. It does not speed CPU-bound computation. Sync-over-async via `.Wait()`/`.Result`, blocking locks, and wrapping synchronous work in `Task.Run` then immediately awaiting it add starvation or scheduling risk. Make the full I/O call chain async when asynchronous APIs exist. Pass `RequestAborted` to downstream calls so disconnected clients do not leave unnecessary work running; decide separately whether already accepted business work should continue in a worker.

`HttpContext` is request-scoped and not safe for arbitrary concurrent access. Do not save `IHttpContextAccessor.HttpContext` in a field for later use. Avoid `async void` in request handling because the host cannot await its completion or reliably observe its failure. Use pagination, projection, streaming, bounded queues, and cancellation to control memory and resource use. `IAsyncEnumerable<T>` can stream results, but headers/status may already be committed when a later item fails, and serialization/database enumeration behavior must be checked.

### Performance means workload and saturation, not a magic trick

Measure hot paths before editing. Track request volume, p50/p95/p99 latency, error rate, thread-pool queue/worker behavior, allocations/GC, downstream pool usage, and saturation. Load tests reveal concurrency and queueing effects; microbenchmarks isolate small code paths but do not replace production-like tests. Averages hide tail latency. CPU-bound and I/O-bound paths need different remedies. Reduce database round trips and returned columns, minimize unnecessary serialization/copies, cache only when bounded staleness is acceptable, and avoid caching personalized data without safe variation. Any optimization needs regression testing with representative payloads and concurrency.

### Releases must tolerate overlap

Rolling deployment means old and new app instances can run at the same time. Expand-and-contract database changes preserve compatibility: add nullable/new structures first, deploy code that can read both forms, migrate/backfill, then remove old structures only after old code is gone. A rollback changes app code, not necessarily data. Published output may be framework-dependent, self-contained, single-file, ReadyToRun, or Native AOT, each with runtime/platform/feature tradeoffs. Smoke-test the published artifact in a production-like process and verify runtime compatibility before rollout.

## Mechanisms and relationships

```text
Environment variables/args ─┐
appsettings base + overlay ──┼─ ordered providers → options validation → host startup
User Secrets (Development) ─┤                                           │
Secret service/identity ────┘                                           ▼
                                                            readiness and requests
                                                                   │
                                          async I/O + cancellation + bounded work
                                                                   │
                                                 logs / metrics / traces / probes
                                                                   │
                                                  deploy and compatible rollback
```

Configuration precedence answers “what value did the process receive?” Process identity answers “can it access that value/file?” Readiness answers “should it receive traffic now?” Health diagnostics answer “what dependency or condition failed?” These checks should be observable without disclosing secrets.

## Worked examples

### Conflicting environment variables

An app uses `WebApplication.CreateBuilder`, while the deployment sets `DOTNET_ENVIRONMENT=Production` and `ASPNETCORE_ENVIRONMENT=Staging`. The effective environment is Production. If the `Staging` file is expected, correct the deployment's conflicting input rather than renaming production configuration or adding a second builder. Log the selected environment name and verify the loaded nonsecret options.

### An exception handler returns `true`

The registered singleton handler returns true but only logs. The middleware considers the exception handled, yet the handler failed to produce the intended response. Set status code and write a safe body (or use the chosen Problem Details service) before returning true. Avoid injecting scoped services into the singleton handler; resolve per-request dependencies from the request scope if genuinely required.

## Misconceptions and edge cases

- The environment name does not automatically supply secrets or isolate the app.
- `DOTNET_ENVIRONMENT` precedence differs between modern `WebApplication` and obsolete `WebHost` hosting.
- Provider precedence only says which value wins; it does not make the winning secret safe to log.
- User Secrets are a development convenience, not production secret storage.
- Async does not make CPU-bound work faster, guarantee unlimited concurrency, or cancel side effects by itself.
- `Task.Run` is not a way to turn a synchronous I/O API into scalable async request handling.
- A disconnect cancels `RequestAborted`, but accepted durable work may intentionally continue.
- Streaming may commit response headers before a later enumeration failure.
- Liveness and readiness answer different questions; a dependency outage should not automatically cause endless restarts.
- A deployment rollback does not undo schema or data changes.
- Single-file, self-contained, ReadyToRun, and Native AOT are distinct publishing choices, not synonyms.

## Knowledge checks with answers

1. **Modern builder has conflicting environment variables. Which wins?** `DOTNET_ENVIRONMENT` for `WebApplication.CreateBuilder`; legacy `WebHost` uses the opposite precedence.
2. **Does `appsettings.Production.json` hold production secrets safely?** No. Keep secrets out of source-controlled files and use a protected production provider/identity.
3. **What must an `IExceptionHandler` returning `true` do?** Produce the complete intended response; otherwise a handled exception can end with an unintended 404 or incomplete response.
4. **Does `Task.Run(() => synchronousIo()).Wait()` make request I/O scalable?** No. It adds scheduling and still blocks a thread; use async I/O end-to-end.
5. **Does rolling back app binaries roll back the database?** No. Use backward-compatible schema changes and an explicit data recovery plan.

## Sources

[Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) · [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) · [Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) · [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices) · [Deployment modes](https://learn.microsoft.com/en-us/dotnet/core/deploying/deployment-modes)


## System-design deployment: readiness, draining, and compatible releases
## Performance connection: request budgets and bottleneck evidence

Treat performance as a user journey across browser, ASP.NET Core, database, and dependencies. Measure p95/p99 and error rate for a representative workload; separate time in the browser, server queue, application, database, and remote calls. Async I/O helps avoid occupying threads during waits, but CPU work needs CPU profiling. A profile or counter suggests where to investigate; compare the same request mix and data before and after any optimization. Avoid solving a local bottleneck by increasing retries, queue capacity, or database connections without checking downstream saturation. See the integrated performance engineering topic for the full browser-to-database investigation method. [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0) · [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/).


A production ASP.NET Core instance should receive traffic only after startup validation and required initialization finish. During shutdown, stop accepting new work and allow bounded in-flight requests to drain; durable background work needs its own checkpoint/retry protocol. Behind a reverse proxy, configure trusted forwarded headers deliberately so scheme, host, and client-address interpretation cannot be spoofed. For rolling deployment, keep old and new code compatible with the shared database and API clients: expand schema first, deploy code that can read both shapes, backfill, then contract after old consumers are gone. A binary rollback cannot reverse an incompatible data mutation. [ASP.NET Core health checks](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks) · [ASP.NET Core environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments).
