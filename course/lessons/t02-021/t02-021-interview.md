# deployment settings environments troubleshooting and performance — Interview questions and reasoning

## Core questions

These questions test deployment reasoning across configuration, process startup, request capacity, diagnostics, and rolling releases. [Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) [Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices)

## Concise interview answers

Start with these short statements, then connect each to a concrete deployment assumption.

## Deep follow-up answers

### 1. What is an ASP.NET Core environment?

It is a host environment name that selects environment-specific behavior and configuration such as `appsettings.{Environment}.json`. Development, Staging, and Production are conventions; custom names are allowed. The default is Production. It is not a source of secrets or an isolation boundary.

### 2. How do environment variables take precedence?

For `WebApplication.CreateBuilder`, `DOTNET_ENVIRONMENT` wins over `ASPNETCORE_ENVIRONMENT`; legacy `WebHost` reverses the precedence and is obsolete starting in ASP.NET Core 10. In default app configuration, environment variables override JSON and Development User Secrets, while command-line args normally override those. Provider order is the actual rule.

### 3. How do you keep secrets safe?

Keep nonsecret defaults in source-controlled config, use User Secrets only for local development, and use a protected production provider or managed identity in production. Validate configuration at startup but report the invalid key/rule without printing the credential. Rotate any secret committed to source history.

### 4. How should production exceptions be handled?

Use `UseExceptionHandler` with a safe fallback and optionally ordered `IExceptionHandler` implementations. The handler must write a full response before returning true. Return a stable safe error and correlation ID; retain details in protected logs. Keep `UseDeveloperExceptionPage` limited to Development.

### 5. Why avoid blocking calls in request handlers?

Blocking `.Wait()`/`.Result` ties up ThreadPool workers during I/O, and enough blocked requests can starve the pool. Use asynchronous APIs end-to-end and propagate cancellation. Async improves thread use while waiting but does not make CPU work faster or remove downstream pool limits.

### 6. How do you approach performance work?

Establish a representative baseline, identify a hot path and saturated resource, then change one thing and remeasure. Track throughput, latency percentiles, concurrency, CPU, allocations/GC, ThreadPool health, database pools, and dependency spans. Use load tests for system capacity and microbenchmarks for local code questions.

## Scenario questions

### 7. Development works, Production reads the wrong configuration. What do you inspect?

Confirm the actual builder type, host environment log, conflicting environment variables, provider order, content root, published files, process identity, and environment-specific values. In modern hosting, resolve `DOTNET_ENVIRONMENT` versus `ASPNETCORE_ENVIRONMENT` first. Print safe keys and selected environment, not secret values.

### 8. An app fails during container startup but `/health` never responds. What is your diagnostic sequence?

Check process/exit code and restart reason, host lifetime logs, runtime image compatibility, entrypoint/arguments, environment, required configuration and validation, content-root/file permissions, port binding, then dependency behavior. A request exception handler cannot catch an exception before the host serves requests. Make stdout/host diagnostics temporary and protected.

### 9. p99 latency rises, while average CPU stays moderate. What hypotheses do you test?

Inspect request queueing and ThreadPool worker/queue signals, database connection-pool waits, downstream trace durations, allocation/GC pauses, lock contention, and network/body sizes. Moderate average CPU does not rule out blocked workers or one saturated dependency. Correlate percentiles with concurrency and a reproducible representative load.

### 10. How do you roll out a column rename safely?

Use expand-and-contract. Add the new column; deploy code that reads/writes both compatibly; backfill; switch reads; wait until old instances are gone; remove old schema later. Rollback of app binaries does not roll back the database, so the transitional state must support both versions.

## Tradeoffs and alternatives

Fail-fast validation is useful for invalid configuration, but startup dependence on a temporarily unavailable database can create restart storms; readiness gating may be better depending on the app. Streaming lowers memory and can deliver early, but partial responses cannot be replaced with a normal error after commitment. Self-contained publishing avoids a required shared runtime installation but enlarges output and transfers runtime patch responsibility to the app's release process. ReadyToRun and Native AOT have different startup/runtime/compatibility tradeoffs and require measurement.

## Common weak answers

- “Production is automatically secure.” The environment name selects behavior; deployment and secret policy must still be configured.
- “Environment variables always win.” They usually override default JSON, but the last-added provider wins and command line may be later.
- “`WebApplication` uses whichever environment variable I set.” If both are set, `DOTNET_ENVIRONMENT` takes precedence.
- “Return the exception details so support can debug.” Give a safe correlation ID and retain protected diagnostics.
- “Put synchronous code in `Task.Run`.” That does not turn blocking I/O into scalable asynchronous I/O.
- “The app rolled back, so the database did too.” App and data changes have separate rollback behavior.
- “The average latency is healthy.” Tail percentiles and saturation can reveal severe user-facing delay.

## Self-check rubric

Score 0–2 on each: environment/provider precedence; secret handling; startup versus request failure; client-safe exception handling; async/cancellation limits; measurement and percentile reasoning; schema compatibility and rollback. **0** is incorrect, **1** names a mechanism without its boundary, and **2** gives the correct mechanism, limitation, and an operational check. A production-ready answer scores 2 in every category.

## Sources

[Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) · [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) · [Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) · [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices) · [Deployment modes](https://learn.microsoft.com/en-us/dotnet/core/deploying/deployment-modes)
