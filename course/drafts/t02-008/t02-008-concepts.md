# ASP.NET Core configuration providers binding and options lifecycle — Core concepts and how they fit together

Sources: Microsoft's [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), [providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-providers), [options](https://learn.microsoft.com/en-us/dotnet/core/extensions/options), and [configuration generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-generator).

## Learning objectives

Trace a value from source through provider and binding; predict precedence; distinguish named options and lifetimes; explain reload/cache behavior; choose validation strategy; and identify source-generation/AOT limitations.

## Prerequisites

Understand DI lifetimes, host/app configuration at a high level (t02-002), environment variables, JSON, C# classes/properties, and asynchronous startup.

## Core concepts

Configuration is a hierarchical, case-insensitive key/value abstraction. `:` separates nested keys; environment variables commonly use `__`. Providers expose values and may have different loading, reload, normalization, and error semantics. Later registered providers normally win duplicate keys. Empty values are still values and can override earlier providers. Host configuration and app configuration are separate roots with distinct precedence; don't infer one from the other.

Binding uses key/property matching and type conversion. Missing keys commonly leave defaults; invalid conversions can throw or produce behavior dependent on API/options. `ErrorOnUnknownConfiguration` can reject unknown keys for supported binder paths. Binding records should use binder-supported shapes; constructors/fields/private members and generated paths have constraints. Reflection binding may carry trimming/AOT warnings. The configuration binding source generator intercepts supported calls from binder/DI option extensions and emits compile-time code; unsupported shapes/call sites may fall back or produce diagnostics, so inspect generated diagnostics and test published AOT output.

The options system creates an instance through `IOptionsFactory<TOptions>`, runs applicable configure delegates, then post-configure delegates, then validation depending on access/startup path. Named instances are keyed by name; the default name is the empty string. `IOptions<T>.Value` is singleton-cached and does not reload. `IOptionsSnapshot<T>` is scoped and computes/caches once per scope/name when accessed. `IOptionsMonitor<T>` is singleton-safe, caches current named values and can invalidate/notify when change tokens are supplied. Reload is provider-specific and not a transaction across multiple sources or consumers. Treat resolved option objects as immutable; mutating shared options causes cross-request state bugs.

Validation may be a delegate, `IValidateOptions<T>`, DataAnnotations, or generated validation. Startup validation fails host startup rather than allowing first request to reveal an invalid setting. In .NET 11, async validation interfaces and startup checks exist. Synchronous access (`IOptions<T>.Value`, snapshot access, or monitor current value at their sync boundaries) cannot perform asynchronous validators and throws when async validation is required; use async validation/startup APIs where documented. Do not hide network calls in settings validation unless startup dependency on that service is deliberate.

Secrets are configuration values but have stronger handling requirements. User Secrets supports development, not production secret management. Environment injection is operationally simple but needs protected deployment controls and rotation. A managed secret store can add access policy/audit/rotation but introduces remote dependency and availability considerations. Provider precedence determines which value wins; logging configuration debug views can expose sensitive data.

## Mechanisms and relationships

```text
sources create providers → ordered root resolves a key → binder converts section
options factory: configure(name) → post-configure(name) → validate(name) → cache by name
reload token → monitor cache invalidation → OnChange callback (if provider supports reload)
```

## Worked examples

Environment variable `Payments__TimeoutSeconds=8` corresponds to nested key `Payments:TimeoutSeconds` and can override JSON if its provider is later. Bind `PaymentsOptions`, validate the timeout range, and inject `IOptionsMonitor<PaymentsOptions>` only if live changes are required and the source can reload. For a stable startup-only setting, snapshot/monitor complexity may be unnecessary.

## Misconceptions and edge cases

- “Configuration is typed” is false until conversion/binding succeeds.
- Last-provider-wins only predicts values when source registration order is known.
- A file provider's `reloadOnChange` does not make every provider reloadable.
- `IOptionsSnapshot` cannot be injected into a singleton.
- `IOptionsMonitor` can notify, but callback work should be short and thread-safe; it is not a global atomic reconfiguration transaction.
- Configuration source generation is supported-call-site based, not arbitrary reflection-shape generation.
- Async options validation changes synchronous accessor behavior in .NET 11.
- Diagnostic configuration dumps may reveal passwords, tokens, or connection strings.

## Knowledge checks with answers

1. **Which duplicate key wins?** Usually the provider registered later, subject to source-specific behavior.
2. **Which interface is appropriate for scoped recomputation?** `IOptionsSnapshot<T>`.
3. **Can all providers reload?** No; reload is provider capability-specific.
4. **What does the .NET 11 async boundary mean?** Sync options access throws if async validators must run; use async validation paths.
5. **Is source-generated binding universal?** No; supported binder call sites/shapes are intercepted and limitations/diagnostics matter.
