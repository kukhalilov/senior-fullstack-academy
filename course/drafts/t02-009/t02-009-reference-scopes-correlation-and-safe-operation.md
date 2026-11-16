# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Reference: Scopes, contextual values, correlation, redaction, and operational use

Sources: Microsoft's [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), [logging providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/providers), and [OpenTelemetry observability](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel).

## Scope and version

This lesson covers shared log context and safe operations. Distributed trace/metric design and OpenTelemetry semantic conventions are covered in t08-013.

## Scope lifetime and provider integration

`ILogger.BeginScope` starts a scope and returns an `IDisposable`; dispose it at the logical operation boundary, usually with `using`. Scopes can nest and expose key/value state to events written while active. `LoggerExternalScopeProvider` is a common implementation of `IExternalScopeProvider`; `Push` adds a scope and `ForEachScope` enumerates active scopes. `ISupportExternalScope` lets a provider accept a shared scope provider, avoiding incompatible independent scope stacks. Provider scope integration and `IncludeScopes` settings determine visibility; scope capture is not universal.

Scopes are useful for request IDs, correlation IDs, tenant IDs, or job IDs shared by many events. Use bounded strings/IDs, avoid high-cardinality payloads and secrets, and never use untrusted values that can inject log lines. A scope is contextual enrichment, not a transaction or authorization boundary. `Activity` trace context has trace/span identifiers and baggage; scope values may complement it but do not create distributed trace propagation. OpenTelemetry logging integration can correlate logs with `Activity` context and export through an OTel provider, but configure and verify the exporter/resource attributes.

## Operational meaning and cost

Log levels should map to operational importance and alerting policy; event IDs and event names should remain stable. Avoid duplicate exception logging as failures bubble through layers. Protect sensitive fields at source; providers may have redaction capabilities, but `ILogger` does not know secret classification automatically. Structured logs can include raw exception, user input, or object properties even when the rendered message looks harmless.

High-cardinality fields (unique user/request/order identifiers) can increase index and query cost in some backends; they may still be useful as searchable log fields, but should not become metric labels. Keep metric cardinality rules distinct. Logging volume has CPU, allocation, network, retention, and cost implications. Filtering removes categories/levels; sampling retains only a subset based on a policy. They are not equivalent: sampling can lose rare events, while threshold filtering is deterministic by rule.

Default host logging providers vary by host/template. `ClearProviders` removes providers; ensure a useful provider remains. Console output needs container/platform capture for persistence. Logging config reload can change thresholds, but provider behavior and option change support matter. `ILoggerFactory` owns provider resources and must be disposed when manually created; host-managed factories are disposed with the host.

## Example: request context without secret leakage

```csharp
using (logger.BeginScope(new Dictionary<string, object?>
{
    ["RequestId"] = context.TraceIdentifier,
    ["TenantId"] = tenantId
}))
{
    logger.LogInformation("Processing request for tenant {TenantId}", tenantId);
}
```

The scope lifetime is bounded to the operation and values are explicit. Do not add authorization tokens, passwords, full request bodies, or unbounded user-controlled text. Use `Activity.Current.TraceId` for trace correlation when tracing is configured; scope correlation can make logs searchable but doesn't replace trace propagation.

## Comparison and knowledge checks

| Mechanism | Purpose | Boundary |
|---|---|---|
| Logging scope | Attach context to nested log events | Provider must capture it |
| `Activity` trace context | Distributed span correlation | Requires propagation/instrumentation |
| Filtering | Deterministically disable matching events | Can hide every matching event |
| Sampling | Retain a subset by policy | Can omit rare events |

1. **Who owns scope lifetime?** The caller that creates it and disposes the returned handle.
2. **Can scopes replace traces?** No; they are complementary context mechanisms.
3. **Should request ID be a metric label?** Usually not if high-cardinality; use logs/traces for per-request detail.
4. **Who must redact secrets?** Application/provider pipeline configured for its data classification; the abstraction does not infer sensitivity.

## Common mistakes

Forgetting disposal; expecting providers to capture scopes by default; using scopes as authentication; putting secrets or arbitrary bodies in state; using high-cardinality identifiers as metric dimensions; confusing sampling with filtering; and manually created factories that are never disposed.

## Supplied names explained

The inventory below is the complete declared set for scope APIs, context values, correlation, provider support, operating practices, and lifetime boundaries.

## Exact terms covered

### Exact terms covered

- `ILogger.BeginScope`
- `IDisposable scope lifetime`
- `Nested logging scopes`
- `Scope state key/value pairs`
- `LoggerExternalScopeProvider`
- `IExternalScopeProvider`
- `IExternalScopeProvider.ForEachScope`
- `IExternalScopeProvider.Push`
- `ISupportExternalScope`
- `Scope provider integration`
- `IncludeScopes provider option`
- `Provider scope support`
- `Scope shared context`
- `Request ID logging scope`
- `Correlation ID logging scope`
- `Activity trace ID correlation`
- `Baggage versus logging scope`
- `OpenTelemetry logging provider integration`
- `Log level operational meaning`
- `Log event ID stability`
- `Event name stability`
- `Avoid duplicate exception logging`
- `Avoid logging secrets`
- `Log injection and untrusted values`
- `High-cardinality log fields`
- `Logging volume and cost`
- `Sampling versus filtering`
- `Console provider deployment capture`
- `Default host logging providers`
- `ClearProviders host behavior`
- `Logging configuration reload`
- `ILoggerFactory disposal`
## How this group fits the mental model
Scopes enrich events that flow through the logger/provider path while the associated operation is active.

## Cross-item comparison
Scopes attach log fields; Activity carries trace identity; filtering drops rule-matched events; sampling retains a subset.

## Examples
The request-context example above shows bounded scope lifetime and approved correlation values.

## Knowledge checks with answers
1. **What ends a scope?** Dispose the returned handle.
2. **Can a scope guarantee trace propagation?** No; Activity/instrumentation propagates traces.
3. **Why avoid high-cardinality metric labels?** They can multiply time-series storage/query cost.
