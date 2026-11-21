# Microsoft.Extensions.Logging levels providers filters scopes and source generation — Reference: Built-in providers, configuration, provider/category rules, and filtering

Sources: Microsoft's [logging providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/providers), [logging overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/logging/), and [`ILoggingBuilder` API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.iloggingbuilder).

## Scope and version

This reference covers framework providers and rule selection. Vendor ingestion, storage schema, and query language belong to provider-specific docs.

## Builder and provider registration

`ILoggingBuilder` configures logging services; `LoggingBuilder` is its implementation. `LoggingBuilderExtensions.AddConsole`, `AddDebug`, `AddEventSourceLogger`, and `AddEventLog` add built-in providers. `AddProvider` adds an `ILoggerProvider`; `ClearProviders` removes currently registered providers; `SetMinimumLevel` sets a default threshold; `AddFilter` adds code-based filtering. `LoggerFactory.Create` creates a standalone factory useful for simple apps/tests, but hosted applications should normally use the host's DI-managed factory. `ConsoleLoggerProvider`, `DebugLoggerProvider`, `EventSourceLoggerProvider`, and `EventLogLoggerProvider` implement their respective outputs.

Console provider formatters include `SimpleConsoleFormatter`, `SystemdConsoleFormatter`, and `JsonConsoleFormatter`. `ConsoleFormatterOptions` configures common output details; `ConsoleFormatterNames.Simple/Systemd/Json` identify formatter choices. `AddSimpleConsole`, `AddSystemdConsole`, and `AddJsonConsole` configure built-in formatters; `AddConsoleFormatter<TFormatter,TOptions>` registers a custom formatter and typed settings. Format choice changes serialization/layout, not durability. Ensure deployment collectors parse chosen format.

`AddEventLog` can use `EventLogSettings`; EventLog is Windows-specific and has different defaults (Warning absent explicit configuration). `Logging:LogLevel`, `Logging:Console:LogLevel`, and `Logging:Console:IncludeScopes` are configuration keys/sections, not methods. `Provider alias` is the provider name used to target settings/rules. EventSource is cross-platform; EventLog has platform limitations.

## Filtering and rule selection

`LoggerFilterRule` includes provider name/alias, category prefix, minimum level, and optionally a filter delegate. `LoggerFilterOptions.Rules` stores rules; `.MinLevel` is used if no rule matches; `.CaptureScopes` controls scope capture. Configuration and code can both add rules. For each provider, selection first prefers matching provider name/alias rules; if none match, rules without a provider name are considered. Among those, the longest matching category prefix wins; if several rules remain, the last one wins. If none remain, `MinLevel` applies. EventLog has a documented default of Warning and does not inherit the ordinary non-provider default. Avoid assuming one global minimum level controls every provider.

`Filter delegate` rules can inspect provider/category/level; the factory resolves a rule for each provider/category logger and filters before providers handle the event. `Provider-specific options` configure formatting and provider behavior separately from filtering. `Logging configuration reload` can update configuration-backed rules when providers/options support change tokens; confirm reload behavior in the host. A missing message may indicate level/category filtering, provider absence/failure, no scope capture, or collector behavior—not that the call site was skipped.

## Durable destination boundary

Console output is standard output; it may be captured by a container/runtime but is not durable storage by itself. A centralized durable backend/provider or platform collector is needed for retention, search, and alerting. Third-party providers ship independently and can change package APIs, defaults, costs, and data handling. Evaluate them separately; the `ILogger` contract does not guarantee their persistence or delivery semantics.

## Example and diagnostic path

```json
{
  "Logging": {
    "LogLevel": { "Default": "Information", "Microsoft": "Warning" },
    "Console": { "LogLevel": { "Default": "Debug" }, "FormatterName": "json" }
  }
}
```

To diagnose missing Debug output, confirm provider registration, provider alias and formatter, category, most-specific matching rule, final rule order, provider-specific threshold, and whether output reaches the destination. Do not lower every category globally as a first move.

## Cross-item comparison

Provider registration controls where records can go; filter rules control which records go there. Provider/category-specific settings are more targeted than a global minimum. Console formatting controls shape; centralized storage controls retention/query. `AddProvider` extends destination choices; `ClearProviders` removes defaults and can unintentionally remove diagnostics.

## Common mistakes

Clearing providers without adding production diagnostics; assuming EventLog is cross-platform; expecting Console to persist; setting `MinimumLevel` but overlooking provider-specific rules; treating provider alias as category; and exposing secrets in JSON logs.

## Knowledge checks with answers

1. **What does `ClearProviders` remove?** Registered providers currently in the logging builder.
2. **How are overlapping rules selected?** Match provider name/alias first (falling back to provider-agnostic rules only when none match), choose the longest matching category prefix, then take the last rule among ties. `MinLevel` is the fallback when no rules match.
3. **Does JSON console provide durable storage?** No; it formats standard output.
4. **Which provider is Windows-specific?** EventLog.

## Supplied names explained

The inventory below includes every declared logging builder/provider/formatter/configuration/filter interface, rule-selection concept, platform limitation, and durability boundary.

## Exact terms covered

### Exact terms covered

- `ILoggingBuilder`
- `LoggingBuilder`
- `LoggingBuilderExtensions.AddConsole`
- `LoggingBuilderExtensions.AddDebug`
- `LoggingBuilderExtensions.AddEventSourceLogger`
- `LoggingBuilderExtensions.AddEventLog`
- `LoggingBuilderExtensions.AddProvider`
- `LoggingBuilderExtensions.ClearProviders`
- `LoggingBuilderExtensions.SetMinimumLevel`
- `LoggingBuilderExtensions.AddFilter`
- `LoggerFactory.Create`
- `ConsoleLoggerProvider`
- `DebugLoggerProvider`
- `EventSourceLoggerProvider`
- `EventLogLoggerProvider`
- `Console provider formatter`
- `SimpleConsoleFormatter`
- `SystemdConsoleFormatter`
- `JsonConsoleFormatter`
- `ConsoleFormatterOptions`
- `ConsoleFormatterNames.Simple`
- `ConsoleFormatterNames.Systemd`
- `ConsoleFormatterNames.Json`
- `EventLogSettings`
- `AddConsoleFormatter<TFormatter,TOptions>`
- `AddJsonConsole`
- `AddSimpleConsole`
- `AddSystemdConsole`
- `Logging configuration section`
- `Logging:LogLevel`
- `Logging:Console:LogLevel`
- `Logging:Console:IncludeScopes`
- `Provider alias`
- `LoggerFilterRule`
- `LoggerFilterOptions`
- `LoggerFilterOptions.Rules`
- `LoggerFilterOptions.MinLevel`
- `LoggerFilterOptions.CaptureScopes`


- `Provider-specific filtering`
- `Category prefix filtering`
- `Most-specific category rule selection`
- `Last matching rule selection`
- `Filter delegate`
- `ILoggerFactory filter evaluation`
- `Provider-specific options`
- `EventLog platform limitation`
- `Console output versus durable log storage`
- `Third-party logging provider boundary`
## How this group fits the mental model
Providers are destinations; filters select which category/level events each destination receives.

## Examples
The JSON configuration above sets a broad threshold and a narrower provider/category threshold; verify actual effective rules at runtime.
