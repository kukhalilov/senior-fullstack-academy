# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Core concepts and how they fit together

Sources: Microsoft's [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), [high-performance logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/high-performance-logging), [providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/providers), and [OpenTelemetry observability](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel).

## Learning objectives

Design stable structured events; choose categories, levels, and IDs; predict provider-specific filtering; use scopes without confusing them for traces; adopt generated logging where useful; and avoid secret/high-cardinality logging.

## Prerequisites

Understand DI, application hosting, exceptions, basic JSON/log queries, and the distinction between logs, metrics, and traces.

## Core concepts

`ILogger` is the write abstraction, `ILoggerFactory` creates category loggers, and `ILoggerProvider` connects the factory to a destination. `ILogger<TCategoryName>` supplies a type-based category; explicit category names are useful when constructing dynamic/infrastructure loggers. `ILogger.Log<TState>` is the core event call, while `IsEnabled` can avoid expensive work when a level is disabled. Convenience methods (`LogTrace` through `LogCritical`) call into that core contract.

Levels run from Trace and Debug through Information, Warning, Error, Critical; `None` disables logging. Choose level by operational meaning, not by how dramatic the message sounds: normal state transitions are often Information/Debug, recoverable anomalies Warning, failed operations Error, and Critical for severe service-level failure. Avoid duplicate exception logs at multiple layers; log where context and ownership are clearest.

Message templates are structured event schemas. `{OrderId}` produces a named value for querying; interpolation (`$"...{id}"`) formats eagerly and generally records only a rendered string. Use stable, descriptive placeholder names. Positional placeholders are less readable; repeated names and provider-specific destructuring extensions can have differing semantics. Pass the exception in the exception overload/expected parameter position so providers receive stack details rather than only a string field. Avoid logging secrets or arbitrary object graphs; structured state can capture more data than visible text suggests.

`LoggerMessageAttribute` decorates static/instance partial methods; a source generator creates implementation code and diagnostics enforce constraints. It avoids runtime template parsing, boxing of value types, and some allocations. `LoggerMessage.Define<T...>` creates cached delegates for older/high-performance patterns. The source generator's `LogPropertiesAttribute` can capture object properties; `LogPropertyIgnoreAttribute` excludes members. Transitive property expansion, null-skipping, and reference-name omission affect event shape—use explicit allowlists and review generated output to prevent sensitive-data capture. Generated logging is not automatically better for every one-off event; weigh code ceremony against throughput and stability.

Providers differ in destination, format, durability, and scope support. The host commonly configures console/debug/EventSource and Windows EventLog providers. `ClearProviders` removes defaults; add the providers actually required. Provider aliases and per-provider options customize formatting. A provider/category filter rule is selected by specificity and matching order; changing minimum level in one place may not affect another provider's more-specific rule. Console formatter choice (simple, systemd, JSON) changes output format, not durability. EventLog is Windows-specific and has provider-specific defaults.

Scopes attach context to nested events while active. A provider can support scopes through `ISupportExternalScope` and `IExternalScopeProvider`; `IncludeScopes` controls capture for built-in formats. Scope properties can be useful for request/job IDs, but scopes are not a transaction, security boundary, or substitute for `Activity` trace IDs/baggage. Keep scope lifetime bounded and avoid untrusted/high-cardinality values.

## Mechanisms and relationships

```text
ILogger → factory → provider(s)
  event category + level + EventId + structured template/state + exception
  filters per provider/category → enabled records → provider formatting/export
BeginScope → ambient context stack → provider captures scope fields
```

Filtering drops events before export; sampling is a separate probabilistic/volume-control choice. High-volume event design, provider throughput, retention, and downstream query cardinality all affect cost.

## Worked examples

```csharp
logger.LogInformation(new EventId(1201, "OrderAccepted"),
    "Order {OrderId} accepted for {CustomerId}", orderId, customerId);

using (logger.BeginScope(new Dictionary<string, object?>
       { ["RequestId"] = requestId, ["TenantId"] = tenantId }))
{
    Log.OrderAccepted(logger, orderId, customerId);
}
```

The first event keeps values structured; the scope enriches related events only for providers that capture scopes. Ensure tenant/request identifiers are approved, bounded, and non-secret. For high throughput, define `Log.OrderAccepted` as a partial method with `LoggerMessageAttribute` and stable event metadata.

## Misconceptions and edge cases

- A logging scope is not automatically a distributed trace.
- An enabled event can still be absent from one provider due to per-provider/category filters or provider failure.
- Interpolation can do work even when the event is filtered out; avoid expensive argument construction unless `IsEnabled` is checked.
- Event ID/name stability matters to dashboards and queries; do not repurpose IDs casually.
- Provider support for scopes and structured fields varies.
- Capturing an object with `LogProperties` can reveal secrets; exclude or redact deliberately.
- Sampling and filtering have different semantics; filtering is threshold/rule selection, sampling chooses a subset.

## Knowledge checks with answers

1. **What is a category?** A string associated with log events, commonly the fully qualified type name.
2. **Why use templates instead of interpolation?** Templates preserve named structured values and avoid eager formatting.
3. **What happens when a level is disabled?** Providers should not receive the event; guard expensive argument work with `IsEnabled` or generated methods.
4. **Do all providers show scopes?** No; provider scope support/configuration is required.
5. **What does source generation optimize?** Template parsing, boxing, and temporary allocation for stable high-volume events.
