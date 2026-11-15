# deployment settings environments troubleshooting and performance — Big-picture orientation and mental model

## Problem and purpose

Deploying an ASP.NET Core application means placing the same tested application artifact into a particular process, environment, filesystem, network, and service topology. The runtime environment selects environment-specific behavior; configuration providers supply values; startup validation checks assumptions; the host exposes requests; observability reveals behavior; and release operations manage changes without losing data or availability. A production issue often comes from a mismatch between these layers rather than a defect in the business method alone. [ASP.NET Core environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices)

## Plain-language mental model

Treat a deployment as a running process with a **configuration recipe** and a **request pipeline**. The process starts with an environment name, reads ordered configuration providers, validates required values, binds endpoints, and starts the host. Requests pass through exception handling, logging, authentication, endpoints, and data services. The process identity determines which files and secrets it can access. Metrics and traces show how it behaves under real load. A safe release changes the artifact or configuration while preserving compatibility with live clients and existing data.

Three distinctions prevent common mistakes:

1. **Environment name is not configuration source.** `Production` selects environment-specific behavior and files; it does not automatically inject production secrets.
2. **Configuration precedence is not secret safety.** A high-priority provider can override a value, but it can also leak it if the app logs the whole configuration root.
3. **Performance advice is not a benchmark promise.** Async I/O avoids blocking threads while waiting; it does not make CPU-heavy work faster or eliminate database, memory, or downstream saturation.

## How the parts fit together

| Stage | Question | Typical failure |
|---|---|---|
| Host bootstrap | Which environment and hosting model is active? | Wrong config file or unexpected precedence |
| Configuration | Which provider won, and was required data validated? | Missing/invalid secret discovered on first request |
| Files and identity | What is the content root, and what can the process read? | Local paths work in development but fail when published |
| Startup | Did the app validate dependencies and become ready? | Container receives traffic before initialization completes |
| Request | Is the path async, bounded, and cancellation-aware? | ThreadPool starvation or unbounded memory use |
| Observability | Can operators correlate user-visible symptoms with causes? | Sensitive errors to clients or no useful telemetry |
| Release | Are old and new app versions compatible with shared data? | Rolling deployment fails during schema transition |

## Concept map

```text
deployment inputs
  ├─ process environment + command line
  ├─ appsettings defaults + environment overlay
  ├─ development-only User Secrets
  └─ production secret/config provider or managed identity
          │ ordered precedence and validation
          ▼
host startup ── readiness ── request pipeline ── data/downstream services
     │               │             │                       │
     └─ safe errors  └─ health     ├─ async/cancellation   └─ pools/latency
                                    ├─ bounded payloads
                                    └─ logs/metrics/traces
                                             │
                                  deploy, smoke test, roll back app
                                  while preserving compatible data
```

## End-to-end walkthrough

`WebApplication.CreateBuilder` reads host configuration to determine environment and app configuration from default providers. The effective environment determines which `appsettings.{Environment}.json` file is loaded. In the modern builder, `DOTNET_ENVIRONMENT` takes precedence over `ASPNETCORE_ENVIRONMENT`; legacy `WebHost` uses the opposite ordering and is obsolete starting in ASP.NET Core 10. The default environment is Production. App configuration then layers environment variables and command-line values after JSON and Development User Secrets. Validate required options at startup, but never print secret values while reporting validation failures.

After the app starts, readiness should mean the instance can safely receive its intended traffic, not merely that the process exists. During a request, propagate `HttpContext.RequestAborted` to downstream I/O, avoid sync-over-async, and bound memory and database work. Measure percentiles, saturation, allocations, and traces under representative load before optimizing. During release, publish the intended artifact, smoke-test its actual output, preserve Data Protection keys across replicas/restarts, and use expand-and-contract database changes so old and new app versions can coexist during rollout.

## When to use it and tradeoffs

Keep safe defaults in source-controlled `appsettings.json`; use environment-specific nonsecret settings for overlays and a managed, protected provider for production credentials. Fail fast when required configuration is invalid, but make dependency-startup policy deliberate so a temporary downstream outage does not create an avoidable restart storm. Return stable safe errors to clients while preserving structured diagnostic context in protected logs. Stream or paginate large data when the contract permits; buffering can simplify small payloads but increases memory pressure. Move work to a durable queue when the request cannot reliably finish within client/proxy deadlines.

## What later lessons cover

Reference lessons explain configuration and environment precedence, exception and startup diagnostics, request-path performance, and production readiness/release operations. Practice walks through environment mismatch, leaked exception details, slow requests, and rolling-release compatibility. IIS, cloud operations, container orchestration, and deep profiling tools have dedicated infrastructure lessons.

## Sources

[Environments](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/environments) · [Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration) · [Error handling](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) · [Performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices) · [`dotnet publish`](https://learn.microsoft.com/en-us/dotnet/core/tools/dotnet-publish)
