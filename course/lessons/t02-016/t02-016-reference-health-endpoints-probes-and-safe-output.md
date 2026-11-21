# health checks diagnostics metrics tracing and OpenTelemetry — Reference: endpoint mapping middleware options readiness liveness and response security

## Scope and version

This reference covers HTTP exposure and response behavior for ASP.NET Core health reports. It distinguishes endpoint routing from legacy middleware mapping and keeps platform probe policy separate from framework status. The default response writer is plain text; a custom writer must explicitly choose content type, fields, serialization, and caching. [ASP.NET Core health checks](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)

## How this group fits the mental model

The check service computes a report; an endpoint applies a predicate, maps report states to HTTP status, and writes a response. The orchestrator interprets the response according to its own probe configuration. Therefore three policies must agree: which checks run, which HTTP code each aggregate state gets, and which codes the platform treats as success. The endpoint is also an information boundary: return only what its consumer is authorized to see.

## Supplied names explained

### Endpoint mapping and options

| Supplied name | Purpose and behavior |
|---|---|
| `HealthCheckOptions` | Controls the endpoint predicate, result-to-status map, response writer, and response caching headers. |
| `HealthCheckOptions.Predicate` | Selects registrations for this endpoint. Use distinct predicates for readiness and liveness rather than running every dependency check on every probe. |
| `HealthCheckOptions.ResultStatusCodes` | Maps each `HealthStatus` to an HTTP code. Configure deliberately because platform success criteria often distinguish only 2xx from non-2xx. |
| `HealthCheckOptions.ResponseWriter` | Writes the HTTP body from the computed `HealthReport`. Default output is plain text status; a custom writer can serialize a safe projection. |
| `HealthCheckOptions.AllowCachingResponses` | Controls whether the response may be cached. For live probes, keep the default no-cache protections unless there is a measured reason to change them. |
| `HealthCheckOptions default HTTP status mapping` | The default mapping is Healthy→200, Degraded→200, Unhealthy→503. Degraded's 200 surprises teams that assume every non-Healthy status fails the probe. |
| `HealthCheckEndpointRouteBuilderExtensions.MapHealthChecks` | Maps a health report as an endpoint in endpoint routing; the route can use endpoint conventions such as authorization. |
| `HealthCheckApplicationBuilderExtensions.UseHealthChecks` | Adds legacy health-check middleware at a path. Middleware placement matters because it can short-circuit the rest of the pipeline. Prefer endpoint mapping in endpoint-routed apps. |
| `HealthCheckOptions.AllowCachingResponses default behavior` | Caching responses are disabled by default through no-store-related headers. Confirm the exact response at proxies and gateways too. |
| `HealthCheckOptions.ResultStatusCodes defaults` | Default values are 200 for Healthy and Degraded and 503 for Unhealthy. A probe platform may accept only one configured status family. |
| `HealthCheckOptions.ResponseWriter content negotiation` | The default writer is plain text and does not negotiate a rich JSON schema. A custom writer should set its media type and honor `Accept` only if it supports genuine negotiation. |

### Access, metadata, and middleware

| Supplied name | Purpose and behavior |
|---|---|
| `Health check endpoint authorization and access control` | Decide whether the probe endpoint is internal, authenticated, or safely exposed. Health status itself can reveal operational state. |
| `Health check endpoint host and port restrictions` | Endpoint host constraints can limit exposure but depend on correctly validated Host values and trusted proxy configuration. Network controls are often more reliable. |
| `MapHealthChecks endpoint metadata and conventions` | A mapped endpoint participates in routing and metadata-based endpoint conventions, including access policies. Avoid documenting internal probes as public business APIs. |
| `UseHealthChecks middleware ordering and short-circuiting` | The middleware handles its matching path and may stop downstream execution. Put it where required routing, forwarded headers, and access controls have already run. |
| `Custom health response writer with HealthReport` | Read report entries and explicitly serialize an allowlisted view. Never serialize exception messages or arbitrary `Data` without redaction. |

### Probe purposes and platform integration

| Supplied name | Purpose and behavior |
|---|---|
| `Readiness probe` | Answers whether this instance should receive new traffic now. It can include required dependencies, but failures may remove capacity from the whole fleet. |
| `Liveness probe` | Answers whether the process is irrecoverably stuck such that restart may help. Keep it cheap and avoid shared dependencies. |
| `Startup probe` | Gives an initializing process a bounded window before liveness/readiness checks take effect. Configure its deadline to match worst-case startup. |
| `Readiness versus liveness failure policy` | Readiness usually removes an instance from service; liveness typically restarts a container. A failure should trigger the action that can plausibly recover the fault. |
| `Kubernetes HTTP probe integration` | Kubernetes HTTP probes treat configured response codes and timing thresholds as platform policy. Startup probes can delay liveness/readiness; failure thresholds and periods define detection latency. |
| `Kubernetes gRPC probe integration` | Kubernetes can issue gRPC health probes using the standard health-check protocol. Configure the gRPC health service and probe service name consistently; this is separate from HTTP status-code probing. |
| `Dependency checks in readiness versus liveness` | A required dependency may affect readiness if the app cannot serve useful traffic without it. It rarely belongs in liveness when restarting cannot repair the dependency. |
| `Health endpoint caching and no-store headers` | Probe responses should reflect current execution and generally include cache-prevention headers. Verify intermediary caches do not serve stale status. |
| `Health response detail exposure and information disclosure` | Detailed report names, internal hosts, exception text, versions, and dependency topology can aid attackers. Use a minimal external response and a separate secured diagnostic surface if needed. |

### Report values

| Supplied name | Purpose and behavior |
|---|---|
| `HealthReport` | Aggregate result produced by health-check execution, including entries, overall status, and total duration. |
| `HealthReport.Status` | Worst status among selected checks: Unhealthy dominates Degraded, which dominates Healthy. |
| `HealthReport.Entries` | Map from registration name to `HealthReportEntry`. Names must be unique to avoid ambiguous output. |
| `HealthReport.TotalDuration` | Elapsed time for the aggregate execution. It can help detect slow probes but does not identify the slow check by itself. |
| `HealthReportEntry` | Per-check result containing status, duration, optional description, exception, data, and tags. |
| `HealthReportEntry.Status` | Result status for one registered check. |
| `HealthReportEntry.Description` | Optional human-readable check summary; keep it safe for the endpoint's audience. |
| `HealthReportEntry.Exception` | Captured exception from a failed execution; do not expose its message/stack trace publicly by default. |
| `HealthReportEntry.Data` | Structured details provided by the check; treat it as potentially sensitive and project only approved fields. |
| `HealthReportEntry.Duration` | Time spent in the individual check, useful for locating a slow dependency probe. |
| `HealthReportEntry.Tags` | Registration tags copied to the report entry and useful for internal rendering/filtering. |
| `HealthCheckServiceExtensions.CheckHealthAsync overloads` | Convenience methods invoke selected checks and return a report, optionally with a predicate or cancellation token. |
| `AspNetCore.Diagnostics.HealthChecks is a community package, not the built-in framework package` | The popular ecosystem package adds provider checks, UI, publishers, and integrations. It is independently maintained; confirm package version/support and do not teach its APIs as built-in ASP.NET Core. |
| `Grpc.AspNetCore.HealthChecks package` | Official gRPC ASP.NET Core integration package that exposes registered .NET health checks through the standard gRPC health-checking protocol. It is a package integration, not the HTTP health endpoint middleware. This integration was introduced in .NET 7. |
| `AddGrpcHealthChecks` | Registers the gRPC health-check service and connects it to the .NET health-check registrations. |
| `MapGrpcHealthChecksService` | Maps the health service endpoint into the gRPC server. Apply appropriate endpoint authorization/access controls because health state can reveal sensitive service information. |
| `GrpcHealthChecksOptions.Services.MapService` | Maps a gRPC service name to a predicate selecting .NET health-check registrations, commonly by tag. Configure a deliberate default service mapping and named service groups. |
| `gRPC Health.Check method` | Unary protocol method that checks current health immediately and returns the corresponding service status; an unknown service name returns `NOT_FOUND`. |
| `gRPC Check unknown service returns NOT_FOUND while Watch reports Unknown` | The standard service methods differ for an unrecognized service name: unary `Check` returns `NOT_FOUND`, while streaming `Watch` reports `Unknown`. Do not treat the responses as interchangeable. |
| `gRPC Health.Watch method` | Streaming protocol method that reports status changes using periodically published health reports. Its timing follows the registered `IHealthCheckPublisher` schedule, so publisher configuration controls freshness. |
| `gRPC health status mapping from HealthReport` | No health results maps to `Unknown`; any `HealthStatus.Unhealthy` maps to `NotServing`; otherwise the service reports `Serving`, so `Degraded` is treated as serving by this integration's default mapping. |
| `gRPC Check executes health checks immediately` | A `Check` request performs a current health-check execution rather than waiting for the publisher's cached report; budget its latency and dependency load. |
| `gRPC Watch uses periodic IHealthCheckPublisher results` | `Watch` relies on publisher-driven report refreshes, including the configured startup delay and period; it is not an independent per-message probe loop. |
| `gRPC health endpoint access control` | Protect or deliberately expose the gRPC health service. If the app's fallback authorization policy blocks probes, configure the intended policy explicitly; anonymous health status can still leak operational information. |
| `gRPC health checks in ASP.NET Core introduced in .NET 7` | The separate `Grpc.AspNetCore.HealthChecks` package integration was added in ASP.NET Core 7; it uses the standard protocol and the .NET health-check abstractions. |

## Cross-item comparison

| Mapping approach | Best fit | Key property |
|---|---|---|
| `MapHealthChecks` | Endpoint-routing applications | Endpoint metadata/conventions apply naturally |
| `UseHealthChecks` | Existing middleware-oriented setup | Path-matching middleware can short-circuit downstream pipeline |
| `Readiness probe` | Traffic admission | May reflect required dependencies and reduce available capacity |
| `Liveness probe` | Process recovery | Should avoid remote dependency failures that restart healthy processes |
| `Startup probe` | Slow/variable initialization | Defers other probe actions within a configured startup budget |
| `Grpc.AspNetCore.HealthChecks` | gRPC clients and gRPC-native probe endpoints | Standard gRPC `Check`/`Watch` protocol; status aggregation and publisher freshness differ from a per-request HTTP probe |
| `MapHealthChecks` HTTP endpoint | HTTP-capable load balancers/orchestrators | Request executes selected checks immediately and returns configured HTTP status/body |

## Examples

### Separate readiness and liveness endpoints

```csharp
builder.Services.AddHealthChecks()
    .AddCheck<ProcessHealthCheck>("process", tags: ["live"])
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"]);

var app = builder.Build();
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});
```

The tag filter is the policy boundary; the orchestrator must point each probe to the correct route and assign different restart/traffic actions.

### Return minimal JSON, not the whole report

```csharp
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var result = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(entry => new
            {
                name = entry.Key,
                status = entry.Value.Status.ToString()
            })
        };
        await JsonSerializer.SerializeAsync(context.Response.Body, result);
    }
});
```

This shape omits descriptions, exceptions, and data. If the endpoint is internet-accessible, even check names may reveal architecture; a single overall status may be safer.

## Common mistakes

- Assuming an unhealthy report automatically returns 500; the default is 503.
- Assuming `Degraded` maps to 503; the default is 200.
- Using one all-dependencies endpoint for both liveness and readiness.
- Exposing report exception/data fields to the public internet.
- Requiring authorization on a probe without configuring the orchestrator's credentials or network path.
- Trusting `RequireHost` alone to defend against a spoofed Host header.
- Leaving caching to a proxy without checking no-store headers and cache rules.
- Mapping middleware before the routing/security components that must protect it.

## Knowledge checks with answers

1. **What is the default HTTP status for Degraded?** 200, although applications can configure a different mapping.
2. **Which probe usually removes an instance from traffic?** Readiness; liveness commonly asks the platform to restart a process.
3. **Can you safely serialize every `HealthReportEntry` property?** No. Exceptions and arbitrary data may leak secrets or deployment details.
4. **Why may `MapHealthChecks` be preferable in a modern app?** It creates an endpoint that participates in endpoint routing and conventions.
5. **Does the community HealthChecks package ship as part of ASP.NET Core?** No, it is a separate community package with its own integrations and release cadence.

## Sources

- [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [Health check endpoint options API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.aspnetcore.diagnostics.healthchecks.healthcheckoptions)
- [gRPC health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/grpc/health-checks?view=aspnetcore-11.0)
- [Kubernetes liveness, readiness, and startup probes](https://kubernetes.io/docs/concepts/workloads/pods/probes/)
