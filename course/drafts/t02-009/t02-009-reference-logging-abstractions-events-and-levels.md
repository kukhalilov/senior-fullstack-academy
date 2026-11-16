# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Reference: Logger abstractions, event data, categories, severity, and templates

Sources: Microsoft's [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), [ILogger API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.ilogger), and [high-performance logging](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/high-performance-logging).

## Scope and version

This reference covers the common event contract and levels. Provider configuration is in the next chapter; logging does not replace traces/metrics.

## Logger and category

`ILogger` is the logging abstraction. `ILogger<TCategoryName>` is a generic logger whose category conventionally derives from `TCategoryName`'s fully qualified type name; this ties events to source classes and supports category-prefix filters. An explicit-category `ILogger` from `ILoggerFactory.CreateLogger(string)` is useful when one type needs distinct logical categories. `ILoggerFactory` creates loggers and owns providers/configuration; `ILoggerProvider` creates logger instances for a destination. In hosted/DI apps, inject `ILogger<T>` or `ILoggerFactory` rather than creating a separate factory that bypasses host filters/providers.

`ILogger.Log<TState>` is the core event contract: level, `EventId`, state, optional exception, and formatter. `IsEnabled(level)` tests whether the logger is enabled; use it before constructing expensive state not handled lazily. `BeginScope<TState>` attaches state until its returned `IDisposable` is disposed. Extension methods `LogTrace`, `LogDebug`, `LogInformation`, `LogWarning`, `LogError`, and `LogCritical` provide readable level-specific calls; overloads accept exceptions and event IDs. `Log` overloads are the general path.

## Levels and event identity

`LogLevel.Trace` is highly detailed; `Debug` supports diagnosis; `Information` describes normal significant operations; `Warning` is an unexpected/recoverable condition; `Error` is a failed operation; `Critical` signals severe application failure; `None` disables events. A threshold typically allows events at that level and above. Avoid using Error merely because a branch is unusual if the operation succeeded.

`EventId` carries numeric `Id` and optional `Name`. IDs/names should be stable when dashboards or alerts depend on them. A template's event schema should also remain stable: placeholder names are queryable property keys. Do not reuse an ID for semantically different event types. Distinguish an exception record from an exception included as a structured property.

## Message templates and generated declarations

A message template such as `"Order {OrderId} failed for {CustomerId}"` describes a stable message plus named values. Structured logging state includes template and arguments, and a formatter renders a display string for providers. Interpolated strings construct output before the logger can filter it and generally lose the field/value shape. Positional placeholders can be supported but are difficult to interpret. Repeated placeholder names can collide or be handled differently by provider; use unique meaningful names.

`LoggerMessage.Define` creates reusable delegates for high-performance logging; `LoggerMessage.DefineScope` creates reusable scope delegates. Generic `Define<T1>`/`DefineScope<T1>` variants type values without per-call boxing. `LoggerMessageAttribute` declares generated events with `EventId`, `Level`, `Message`, `EventName`, and `SkipEnabledCheck`. A generated method typically must be partial, with supported parameter and method shapes. `SkipEnabledCheck` controls generated enabled-check behavior and should only be used when understood. Generation diagnostics point to unsupported signatures or mismatched placeholders.

## Examples

Use `ILogger<OrderService>` for the default source category. For an event called from several layers, centralize a stable event ID/name and keep placeholders consistent. If a hot path logs an integer and a template each item, use a generated partial method; for a rare configuration warning, a normal extension call is clear and adequate.

## Cross-item comparison

`ILogger<T>` provides type-derived category; explicit category lets infrastructure separate logical streams. `LoggerMessage.Define` is the cached-delegate approach, while `LoggerMessageAttribute` generates a strongly typed method at compile time. Both improve hot-path cost; source generation provides diagnostics and less manual delegate boilerplate.

## Common mistakes

Using unstable categories; changing event IDs after telemetry dashboards depend on them; logging exceptions twice at multiple layers; eagerly computing expensive values when disabled; choosing levels by emotional severity; and assuming a template is structured when it is interpolated.

## Knowledge checks with answers

1. **What identifies the source category?** The logger category, commonly the class's fully qualified name.
2. **What are the event's structured parts?** Level, EventId, template/state properties, exception, and category.
3. **When use `IsEnabled`?** Before expensive state construction when filtered events should avoid that cost.
4. **What is a stable EventId for?** Identifying a semantic event consistently across code and telemetry.

## Supplied names explained

The complete inventory below includes all logger interfaces, core methods, severity values, event metadata, cached/generator APIs, and attribute properties declared for this reference.

## Exact terms covered

### Exact terms covered

- `ILogger`
- `ILogger<TCategoryName>`
- `ILoggerFactory`
- `ILoggerFactory.CreateLogger`
- `ILoggerProvider`
- `ILogger.Log<TState>`
- `ILogger.IsEnabled`
- `ILogger.BeginScope<TState>`
- `ILogger.LogTrace`
- `ILogger.LogDebug`
- `ILogger.LogInformation`
- `ILogger.LogWarning`
- `ILogger.LogError`
- `ILogger.LogCritical`
- `ILogger.Log overloads`
- `LogLevel.Trace`
- `LogLevel.Debug`
- `LogLevel.Information`
- `LogLevel.Warning`
- `LogLevel.Error`
- `LogLevel.Critical`
- `LogLevel.None`
- `EventId`
- `EventId.Id`
- `EventId.Name`
- `LoggerMessage.Define`
- `LoggerMessage.DefineScope`
- `LoggerMessageAttribute`
- `LoggerMessageAttribute.EventId`
- `LoggerMessageAttribute.Level`
- `LoggerMessageAttribute.Message`
- `LoggerMessageAttribute.SkipEnabledCheck`
- `LoggerMessageAttribute.EventName`
## How this group fits the mental model
These interfaces and event fields define what is recorded before filtering and provider output.
