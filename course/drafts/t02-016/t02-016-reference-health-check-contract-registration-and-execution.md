# health checks diagnostics metrics tracing and OpenTelemetry — Reference: health-check abstractions registration results tags timeouts and publishers

## Scope and version

This reference covers framework-provided health-check contracts and execution. It is not a catalog of database-specific third-party health-check packages. Health checks are invoked either by a selected HTTP endpoint request or, when a publisher is registered, on the publisher's schedule. Individual check timeouts are cooperative cancellation signals; implementations must pass tokens to I/O and stop promptly. The descriptions reflect ASP.NET Core 11 / .NET 11 GA documentation checked 2026-11-16. [ASP.NET Core health checks](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)

## How this group fits the mental model

Registration determines the check's identity, tags, timeout, and failure policy. The runtime builds a `HealthCheckContext`, calls `CheckHealthAsync`, and collects results into a report. The health-check service can select registrations by predicate and executes checks concurrently by default. An HTTP endpoint projects a report into a response; a publisher receives reports periodically. Keep registration policy distinct from the app's definition of readiness/liveness.

## Supplied names explained

### Contract and results

| Supplied name | Purpose and behavior |
|---|---|
| `IHealthCheck` | Implement this contract for a component check. Prefer a small, bounded check over a generic “everything is up” operation. |
| `IHealthCheck.CheckHealthAsync` | Asynchronously evaluate health using a `HealthCheckContext` and cancellation token; return a `HealthCheckResult` rather than writing HTTP output. |
| `HealthCheckResult` | Immutable result carrying status and optional description, exception, and data. It is a report input, not automatically a public response payload. |
| `HealthCheckResult.Healthy` | Factory for a healthy result, optionally with description/data. Avoid putting sensitive detail in the description. |
| `HealthCheckResult.Degraded` | Factory for a degraded result. Whether a probe treats it as success depends on endpoint mapping and platform policy. |
| `HealthCheckResult.Unhealthy` | Factory for an unhealthy result. Its explicit status is retained rather than replaced by registration failure status. |
| `HealthCheckResult.Status` | One of `Healthy`, `Degraded`, or `Unhealthy`; aggregate reports take the worst selected status. |
| `HealthCheckResult.Description` | Optional human-readable summary. Treat it as potentially public if the result can reach an endpoint. |
| `HealthCheckResult.Exception` | Optional exception evidence retained for diagnostics; redact or omit it from external responses. |
| `HealthCheckResult.Data` | Optional key/value diagnostic details for trusted consumers. It may contain credentials or topology if careless. |
| `HealthStatus` | The three-level health result enum. It is independent of HTTP status codes. |
| `HealthStatus.Healthy` | No detected problem for this check's purpose. It does not promise every feature or dependency works. |
| `HealthStatus.Degraded` | The check reports a reduced condition that may still be acceptable for some traffic decisions. |
| `HealthStatus.Unhealthy` | The check's failure policy says this condition fails its operational purpose. |
| `HealthCheckContext` | Per-execution context passed to a check; exposes the registration and supports named behavior. |
| `HealthCheckContext.Registration` | The registration executing now, including its name, tags, timeout, and failure status. |
| `HealthCheckRegistration` | Configuration record describing a check factory/instance, failure status, tags, timeout, delay, and period. Delay/period are relevant to publisher scheduling, not ordinary endpoint polling. |
| `HealthCheckRegistration.Name` | Stable identifier used in the report entry dictionary; duplicate names are invalid/ambiguous and must be avoided. |
| `HealthCheckRegistration.FailureStatus` | Status assigned when the check throws or uses registration failure status. It does not rewrite an explicitly returned result. |
| `HealthCheckRegistration.Tags` | Labels used by predicates to select checks for readiness, liveness, or publishers. Choose stable nonsecret tags. |
| `HealthCheckRegistration.Timeout` | Maximum intended execution interval before cancellation is requested. A check that ignores cancellation may continue running. |
| `HealthCheckRegistration.Delay` | Optional initial publisher delay for this registration. It does not schedule HTTP endpoint executions. |
| `HealthCheckRegistration.Period` | Optional publisher period for this registration. It has meaning in scheduled publisher execution, not per-probe caching. |

### Registration and execution

| Supplied name | Purpose and behavior |
|---|---|
| `IHealthChecksBuilder` | Builder returned by health-check registration for adding checks and configuring options. |
| `AddHealthChecks` | Registers health-check services and returns a builder; no dependency-specific checks are added automatically. |
| `IHealthChecksBuilder.AddCheck` | Adds an existing or factory-created check, with a name, optional failure status, tags, and timeout. Duplicate check names should be caught at startup/configuration. |
| `IHealthChecksBuilder.AddTypeActivatedCheck` | Adds a check type activated with supplied constructor arguments while framework services can provide other dependencies. Use DI registration when normal constructor injection is preferable. |
| `IHealthChecksBuilder.ConfigureHealthCheckOptions` | Configures `HealthCheckServiceOptions` for the service's registered checks. It is separate from HTTP endpoint response mapping and writing. |
| `HealthCheckService` | Coordinates the registered check set and returns health reports. Applications normally use its extensions or endpoints rather than construct it. |
| `HealthCheckService.CheckHealthAsync` | Executes selected checks and returns a `HealthReport`. Endpoint requests can invoke it repeatedly; there is no implicit result cache. |
| `HealthCheckServiceOptions` | Options for the default service implementation, including its registration collection. It does not define endpoint response formatting; the built-in service runs checks concurrently by default. |
| `IHealthCheckPublisher` | Push-oriented integration that receives periodic health reports and can send them to an external monitoring service. |
| `IHealthCheckPublisher.PublishAsync` | Receives a report and cancellation token. Keep publication bounded and honor cancellation during shutdown. |
| `HealthCheckPublisherOptions` | Controls scheduled publisher execution across registered publishers. Its defaults are an initial delay of five seconds and a period/timeout of thirty seconds; set an operationally appropriate budget. |
| `HealthCheckPublisherOptions.Delay` | One-time startup delay before the first scheduled publisher cycle; it is not repeated each period. |
| `HealthCheckPublisherOptions.Period` | Interval between publisher executions. A short period can amplify load on dependencies. |
| `HealthCheckPublisherOptions.Timeout` | Overall timeout for executing the checks/publishers in a cycle. Cancellation still depends on cooperative implementations. |
| `HealthCheckPublisherOptions.Predicate` | Selects registrations executed for the publisher. A null predicate includes every registered check. |

### Execution semantics and design constraints

| Supplied name | Purpose and behavior |
|---|---|
| `Health check names and duplicate registration behavior` | Report entries are keyed by check name; use unique names and avoid accidental repeated registration that obscures report meaning. |
| `Health check tags and probe selection` | Tag checks by operational purpose, then use endpoint/publisher predicates to select them. A tag is metadata; it does not create a separate endpoint automatically. |
| `Health check cancellation and cooperative timeout behavior` | The service passes a token and requests cancellation at timeout. Pass it through every async dependency call; .NET cannot safely terminate arbitrary check code. |
| `Health check exception-to-failure-status mapping` | A thrown exception becomes a failed report entry using `FailureStatus` and includes exception evidence. An explicitly returned status is honored. |
| `Health check result data and secret redaction` | Keep structured details internal and allowlist fields in any response writer. Never emit connection strings, tokens, exception messages, or internal hostnames by default. |
| `Health checks run concurrently by default` | Independent registrations can overlap during a report, reducing latency but increasing simultaneous dependency load. Bound dependencies and use an execution policy appropriate to shared resources. |
| `Health check publisher versus HTTP probe endpoint` | Endpoint execution is pull-based and happens when requested; publishers perform scheduled checks and push reports outward. They have different timing, scaling, and failure paths. |
| `Health check publisher hosted-service execution` | The default publisher service runs in the host background, applies delay/period/timeout and a predicate, and stops with host cancellation. It is not a durable job scheduler. |

## Cross-item comparison

| Mechanism | Trigger | Consumer | Main operational risk |
|---|---|---|---|
| `HealthCheckService.CheckHealthAsync` through an endpoint | Probe request | Orchestrator/load balancer/monitor | Probe frequency repeatedly invokes selected checks |
| `IHealthCheckPublisher.PublishAsync` | Host publisher schedule | Push-based monitoring system | Slow checks/publication consume background capacity or delay shutdown |
| `HealthCheckRegistration.Timeout` | Per-check execution | Health-check service | Ignored cancellation can leave work continuing past the budget |
| `HealthCheckPublisherOptions.Timeout` | Publisher cycle | Host publisher service | Aggregate timeout does not forcibly interrupt noncooperative code |

## Examples

### Register independent checks with purpose tags

```csharp
builder.Services.AddHealthChecks()
    .AddCheck<ProcessHealthCheck>("process", tags: ["live"])
    .AddCheck<DatabaseHealthCheck>("database", tags: ["ready"], timeout: TimeSpan.FromSeconds(2));
```

The example only registers the checks. Map separate endpoints with predicates in the endpoint reference. Do not label a database check `live` unless restarting the process is the intended recovery action.

### Make a check cancellation-aware

```csharp
public sealed class DatabaseHealthCheck(IDbConnectionFactory factory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            await using var connection = await factory.OpenAsync(cancellationToken);
            await connection.PingAsync(cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            return new HealthCheckResult(context.Registration.FailureStatus, exception: ex);
        }
    }
}
```

Use the database driver's own timeout as well as the check token. If you instead catch every exception and return `Unhealthy`, the registration's `FailureStatus` cannot choose a different mapping.

### Register a publisher

```csharp
builder.Services.Configure<HealthCheckPublisherOptions>(options =>
{
    options.Delay = TimeSpan.FromSeconds(10);
    options.Period = TimeSpan.FromMinutes(1);
    options.Timeout = TimeSpan.FromSeconds(8);
    options.Predicate = registration => registration.Tags.Contains("ready");
});
builder.Services.AddSingleton<IHealthCheckPublisher, MetricsHealthPublisher>();
```

This creates periodic push execution independently of any mapped `/health` endpoint. Avoid publishing the full report to an untrusted destination.

## Common mistakes

- Assuming `AddHealthChecks` automatically tests databases or other dependencies.
- Reusing a name and then treating the report dictionary as an unambiguous inventory.
- Thinking registration `Delay` and `Period` make HTTP probes run on a timer.
- Catching `OperationCanceledException` and reporting healthy after the caller timed out.
- Returning exception text or `Data` directly to a public endpoint.
- Running every expensive check concurrently with a high-frequency readiness probe.
- Using a shared remote dependency in liveness and restarting every replica during its outage.
- Treating a publisher as a durable scheduler or assuming it survives process loss.

## Knowledge checks with answers

1. **What does `FailureStatus` control?** The status for thrown failures or registration-based failure results; it does not override an explicit returned result.
2. **Do endpoint checks run periodically by default?** No. They run when the endpoint is requested. A publisher provides scheduled execution.
3. **Can timeout safely stop a check that ignores cancellation?** No. It requests cancellation; the implementation and its dependencies must cooperate.
4. **Why use tags?** To select different check subsets for purposes such as readiness, liveness, or a publisher.
5. **Does `HealthStatus.Degraded` always produce HTTP 503?** No. Endpoint status mappings determine the HTTP response; the default mapping can return 200.
6. **Why can concurrent checks be harmful?** They can cause many simultaneous calls to the same constrained dependency, even though the total report finishes faster.

## Sources

- [Health checks in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks)
- [HealthCheckPublisherOptions API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.diagnostics.healthchecks.healthcheckpublisheroptions)
