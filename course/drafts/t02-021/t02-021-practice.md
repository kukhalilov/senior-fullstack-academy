# deployment settings environments troubleshooting and performance — Exercises and worked solutions

## Goals

Practice diagnosing deployment mismatches and designing safe request, error, and release behavior. [Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices)

## Worked example

An app works locally but fails in a Linux container because `appsettings.Production.json` cannot be found. The local launch profile set a working directory equal to the project root; the container starts from `/`. Check the selected environment, process working directory, `ContentRootPath`, published output, and file permissions. Set an intentional content root or copy the file to the published layout. Log only the selected environment and safe path/configuration keys, not secret values.

## Exercises

### Exercise 1: environment precedence

The app uses `WebApplication.CreateBuilder`. The deployment defines `DOTNET_ENVIRONMENT=Production` and `ASPNETCORE_ENVIRONMENT=Staging`. Which environment is active? What should the deployment team change?

### Exercise 2: secret boundary

An engineer copies a production database password into `appsettings.Production.json` and commits it. Explain the risks and a safer replacement. What should be done with the already exposed credential?

### Exercise 3: production exception response

An `IExceptionHandler` logs a database exception and returns `true` but does not set a status or response. What is wrong? How should details be exposed to the client and operator?

### Exercise 4: startup or request failure?

A process exits before its health endpoint responds. The team added an exception handler but sees no log from it. What failure classes and evidence should be checked first?

### Exercise 5: sync-over-async

A handler uses `Task.Run(() => legacyClient.Get()).Result` to “keep the request async.” Explain why it may starve workers and propose a migration path if the library has no async API.

### Exercise 6: memory and streaming

An endpoint loads 500,000 rows into a list and serializes them into a single response. Give three safer alternatives and one tradeoff for streaming.

### Exercise 7: performance diagnosis

After a release, throughput is flat but p99 latency rises sharply. What measurements help distinguish ThreadPool starvation, database pool exhaustion, GC pressure, and a slow downstream service?

### Exercise 8: rollback after schema change

A new release renames a database column and is rolled back after errors. Old application instances return, but requests still fail. Explain the cause and design a safer migration.

## Progressive hints

Start with the host builder and effective environment. For error questions, separate client response from operator diagnostics. For performance, identify which finite resource is saturated before changing code. For rollout, assume old and new instances overlap and database state remains after binary rollback.

## Complete solutions

1. **Environment:** `Production` is active because modern `WebApplication.CreateBuilder` gives `DOTNET_ENVIRONMENT` precedence. Remove the conflict or set the variables consistently; do not rename environment files as a workaround.
2. **Secret:** Repository history and clones can preserve the password indefinitely. Move it to a protected production secret provider/managed identity, remove it from tracked config and history per the repository's incident procedure, and rotate/revoke the exposed credential. Do not paste the new value into an issue or log.
3. **Exception response:** Returning true means the handler owns the response, so it must set status and write a complete safe body (or use the configured Problem Details service). Return a generic problem/correlation ID to the client and keep exception details in access-controlled structured logs. Check that logging is not duplicated by middleware.
4. **Startup:** Request exception middleware cannot catch failures before the host serves requests. Inspect process exit code/restart reason, host lifetime and stdout/stderr, runtime/hosting bundle compatibility, selected environment, configuration validation, file permissions, port binding, and required dependencies. Use temporary protected diagnostics.
5. **Sync-over-async:** `Task.Run` schedules the synchronous call on another worker, and `.Result` blocks the request worker; under concurrency this can consume the ThreadPool. Prefer a real async API and propagate cancellation. If unavailable, isolate the blocking dependency behind a deliberately bounded worker/concurrency queue rather than creating unbounded thread work; document latency/capacity limits.
6. **Large result:** Paginate with stable ordering; project only necessary columns; stream through supported `IAsyncEnumerable<T>` or an export/background job. Streaming lowers whole-result memory but may commit headers before a later error and can keep a DB connection occupied during client delivery.
7. **Measurements:** Compare request duration percentiles, active concurrency, ThreadPool queue/worker counts, CPU, allocation/GC counters, database connection-open waits/pool timeouts, dependency spans, and error rates. Use traces to locate time within the call chain and a representative load test to reproduce the shape.
8. **Rollback:** Schema changes are durable and not undone with app binaries; the old code expects the old column. Use expand-and-contract: add new column, deploy dual-compatible code, backfill, switch reads, wait until all old binaries are gone, then remove the old column in a later release.

## Tests and edge cases

Test the published artifact with each environment variable set/conflicting and unset; verify configuration provider precedence without printing values. Exercise invalid required configuration, expired secrets, unreadable certificate/config files, missing runtime, port collision, downstream startup outage, malformed request, and safe error output. Load-test slow downstream calls, cancellation after client disconnect, large forms and responses, deep pagination, streaming failure after headers, ThreadPool saturation, and DB pool exhaustion. During rollout, test old and new binaries against the transitional schema and verify rollback behavior.

## Reflection questions

1. Which values are safe to commit, and where do production secrets enter the process?
2. What signal distinguishes “process alive” from “ready for traffic” in this deployment?
3. Which resource is saturated when p99 latency rises?
4. Can the previous app version run against the schema after the new release starts?

## Sources

[Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) · [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) · [Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) · [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices) · [Deployment modes](https://learn.microsoft.com/en-us/dotnet/core/deploying/deployment-modes)
