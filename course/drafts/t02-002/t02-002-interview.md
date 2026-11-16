# ASP.NET Core startup host builder and application lifetime — Interview questions and reasoning

Sources: Microsoft's [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/), [.NET Generic Host](https://learn.microsoft.com/en-us/dotnet/core/extensions/generic-host), and [hosted lifecycle API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.hosting.ihostedlifecycleservice).

## Core questions

1. Walk through builder, build, start, run, and shutdown phases.
2. What defaults does `WebApplication.CreateBuilder` provide, and when choose `CreateSlimBuilder`?
3. How do `WebApplicationBuilder` and `WebApplication` differ?
4. Compare Generic Host and legacy Web Host/Startup patterns.
5. How should a `BackgroundService` use scoped services?
6. What is the difference between host startup and readiness?
7. Compare `IHostedService`, `BackgroundService`, and `IHostedLifecycleService`.
8. How do you validate required configuration before serving?
9. What happens to a host when a background service throws?
10. How do you design graceful shutdown in a container?
11. What is the risk of enabling concurrent hosted-service startup?
12. What does TestServer prove and what does it omit?

## Concise interview answers

1. Create/configure builder, register services/options, build provider/app, configure pipeline/endpoints, start host/services/server, wait, then stop cooperatively and dispose.
2. `CreateBuilder` provides common web defaults. `CreateSlimBuilder` intentionally omits some, so explicitly configure needed settings/providers/validation after checking target-version defaults.
3. Builder is mutable pre-build composition; `WebApplication` is built pipeline/host and exposes runtime services/environment/lifetime and app execution.
4. Generic Host is the common lifetime/configuration/DI/logging/hosted-service model. Web Host/Startup are supported compatibility APIs; new web templates favor minimal hosting.
5. Inject a scope/context factory and create/dispose a scope per unit of work; do not capture scoped DbContext in the singleton worker.
6. Host started means lifecycle startup completed; readiness means the service can correctly receive traffic, including required warm-up/dependencies.
7. `IHostedService` defines start/stop; `BackgroundService` supplies a long-running async execution loop; `IHostedLifecycleService` adds callbacks surrounding start/stop.
8. Bind and validate options with `IValidateOptions<T>`/`ValidateOnStart`; fail safely before requests. External service health is separate readiness behavior.
9. `HostOptions.BackgroundServiceExceptionBehavior` determines whether to stop the host or ignore the fault. Ignoring requires explicit degradation health/alerting; stopping is safer if service correctness depends on the worker.
10. On SIGTERM stop new work, observe cancellation, finish/checkpoint within a bounded deadline, and make unfinished work resumable. Align host timeout with container/orchestrator grace period.
11. Startup dependencies may race; registration order is not a safe dependency protocol under concurrent starts. Coordinate explicitly or make components independently safe.
12. TestServer exercises app pipeline in-process; it omits real sockets, TLS termination, reverse proxy, OS hosting, and deployment networking.

## Deep follow-up answers

### Is `ApplicationStarted` a readiness probe?

It is a host lifecycle token signaled after startup, not a universal statement about cache warm-up, database migration, external dependencies, or domain invariants. Readiness should represent whether the instance can safely receive its intended traffic. Keep liveness and readiness distinct to avoid restarting a live process merely because a dependency is temporarily unavailable.

### How would you handle startup dependency failure?

Classify it. Required local configuration should fail fast using startup validation. A required startup dependency may fail startup or leave readiness false according to rollout policy, with bounded retries/backoff and diagnostics. Optional integrations can degrade only if the endpoint contract remains correct. Do not make an unbounded `StartAsync` wait that leaves deployment state opaque.

### What does graceful shutdown guarantee?

It provides a cooperative window, not an absolute completion guarantee. The host signals cancellation and waits within configured timeouts; the orchestrator may enforce another deadline and kill the process. Persist progress incrementally, stop acquiring new work, use idempotency/leases, and test termination under load.

### Why can slim builder break an app?

Some defaults are intentionally absent. An app can lose a JSON provider, expected logging sink, HTTP JSON defaults, or DI validation. Re-add required defaults explicitly and test effective behavior; smaller configuration is not equivalent configuration.

## Scenario questions

1. **A service is healthy after host start, but requests fail until warm-up ends.** Separate liveness from readiness and keep traffic away until required warm-up completes.
2. **A singleton background service captures DbContext.** Replace it with scope/context factory ownership per operation and avoid context concurrency.
3. **A startup validation error prints a credential.** Preserve fail-fast behavior while redacting the value; report the setting name/source, not secret contents.
4. **Host stops before a queue batch finishes.** Observe cancellation, stop pulling, checkpoint or release lease, and resume idempotently; align all grace deadlines.
5. **Configuration differs between `WebApplicationFactory` and deployment.** Compare builder defaults, environment variables, content root, service replacement, server/proxy setup, and actual provider precedence.

## Tradeoffs and alternatives

Choose default builder for standard web apps; choose slim only for explicit startup/size needs and known defaults. Run required initialization in startup only when it should gate serving. Use background services for ongoing tasks with bounded, resumable units. Use provider-specific real-host integration tests for network boundaries and TestServer for quick pipeline tests.

## Common weak answers

- “Builder and app are the same thing.”
- “Host started means ready.”
- “A hosted service can use any scoped dependency through constructor injection.”
- “Graceful shutdown guarantees every operation completes.”
- “Ignoring a worker fault is fine because the web host is still up.”
- “TestServer tests the reverse proxy and TLS.”
- “`CreateSlimBuilder` only changes output size.”

## Self-check rubric

| Skill | A strong answer demonstrates |
|---|---|
| Lifecycle | Names construction/build/start/run/stop boundaries accurately. |
| Defaults | Understands full versus slim builder behavior and version checks. |
| Lifetime | Uses correct DI scope ownership for background work. |
| Readiness | Separates process liveness, host start, and ability to serve. |
| Shutdown | Uses cancellation, bounded time, and resumable work. |
| Testing | Chooses TestServer or real-host tests according to the claim. |
