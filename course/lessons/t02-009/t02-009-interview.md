# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Interview questions and reasoning

Sources: Microsoft's [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), [providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/providers), [high-performance logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/high-performance-logging), and [OpenTelemetry observability](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/observability-with-otel).

## Core questions

1. Explain the `ILogger` → factory → provider path.
2. What is a category and why use `ILogger<T>`?
3. Compare message templates and interpolation.
4. How do you choose log levels and EventIds?
5. What does LoggerMessage source generation improve?
6. When would you use `LoggerMessage.Define`?
7. How are provider/category filters selected?
8. What does `ClearProviders` do?
9. What is a logging scope and how does it relate to Activity?
10. How do you prevent secrets and log injection?
11. Compare filtering and sampling.
12. Is console logging durable?
13. What changed for generated logging methods in .NET 11?

## Concise interview answers

1. `ILogger` emits an event; the factory owns category loggers/providers and filter configuration; providers format/export enabled events.
2. Category groups events by source and supports filtering; `ILogger<T>` commonly uses the type name.
3. Templates preserve named properties; interpolation eagerly renders a string and discards the structured schema.
4. Select by operational meaning; keep IDs/names stable and use exceptions for actual failures.
5. It parses templates at compile time and reduces boxing/allocations with typed methods.
6. It is a cached-delegate high-performance approach, especially in older code; generated methods are preferred for current new high-volume logging.
7. The factory selects provider-name/alias matches first, then the longest matching category prefix, then the last among equally specific rules; `MinLevel` is the fallback. Inspect the actual alias and options.
8. It removes registered logging providers, so add replacements deliberately.
9. A scope attaches state during a bounded operation if the provider captures scopes; Activity carries trace context and is complementary.
10. Classify/redact at source, avoid broad object capture, sanitize untrusted data, and keep credentials/request bodies out of logs.
11. Filtering disables matching categories/levels deterministically; sampling retains a subset according to policy.
12. No. Console writes stdout; a platform collector or durable backend must persist it.
13. Generic methods are supported with standard constraints, primarily to keep typed values unboxed; the `allows ref struct` anti-constraint is unsupported.

## Deep follow-up answers

### Why might a log statement execute but be absent?

The logger may be filtered for its level/category/provider; provider may not be registered or may fail; scopes may not be captured; a collector/exporter may drop it; or the destination may query a different category/schema. Trace the whole path before changing the call site. For built-in rule selection, provider name/alias is considered first, then longest category prefix, then last rule among ties; `MinLevel` is the fallback.

### How should exception logging be organized?

Log at the boundary that owns the failure/response and adds useful context. Lower layers may add typed error context but repeated full exception logging creates noise and cost. Keep exception as exception data, preserve stack with `throw;`, and ensure the failure is observable exactly where handled.

### When is source generation worth the ceremony?

It is useful on hot/high-volume paths, stable event catalogs, or when strong typing and analyzer diagnostics improve maintainability. For a rare simple log, normal extensions are clearer. Benchmark total app behavior if performance is the reason.

## Scenario questions

1. **A framework Information event is missing, but app events appear.** Inspect category prefix and provider-specific rules/order.
2. **A rendered line looks safe but contains a token in fields.** Inspect structured state and generated property expansion; redact at source.
3. **A scope appears in Debug but not JSON console.** Check provider IncludeScopes/formatter options and scope support.
4. **Logs exist on stdout but disappear after container restart.** Configure/verify durable platform collection and retention.
5. **A retry event overwhelms backend indexing.** Reduce volume via level/filter/sample policy and avoid high-cardinality fields; keep rare errors observable.

## Tradeoffs and alternatives

Compare structured event schemas with free-form prose; source generation with ordinary calls; provider persistence with stdout collection; and logging scopes with trace context. Use logs for discrete events, metrics for aggregate numeric behavior, and traces for causal distributed operations.

## Common weak answers

Avoid claiming `ILogger` itself persists logs, all providers support scopes, interpolated strings remain structured, categories are automatically traces, `ClearProviders` only changes console, or Error is the right level for every rejected request.

## Self-check rubric

A strong answer explains event shape, provider/filter routing, cost and sensitivity, and the operational destination. Give one point for each; revisit answers that discuss only the API call.
