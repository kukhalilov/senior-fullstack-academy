# ASP.NET Core configuration providers binding and options lifecycle — Big-picture orientation and mental model

Sources: Microsoft's [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), [configuration providers](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-providers), [options pattern](https://learn.microsoft.com/en-us/dotnet/core/extensions/options), [configuration source generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-generator), and [.NET 11 options validation compatibility note](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/async-options-validation-sync-access).

## Problem and purpose

Configuration lets deployment-specific values change without changing application code. Providers normalize files, environment variables, command-line switches, secret stores, and other sources into a hierarchical key/value view. The options pattern turns related values into validated, typed settings with explicit lifetime and reload behavior.

## Plain-language mental model

Think of configuration as an ordered stack of providers: each contributes keys, and a later provider normally wins for the same key. Binding maps those keys into a type. Options registration then configures, post-configures, validates, caches, and possibly reloads that type. These are separate steps; having a key, binding it, and observing a changed value are not the same guarantee.

## How the parts fit together

```text
configuration sources → providers/load values → ordered IConfiguration view
       → binder → options configure → post-configure → validate → cache/lifetime
provider reload token → options cache invalidation → monitor notification (when supported)
```

Provider ordering, key normalization, conversion, options names, scope, cache invalidation, and sync/async validation boundaries all affect the final value.

## Concept map

`IConfiguration` is the read-oriented abstraction; an `IConfigurationSource` creates a provider; a provider loads and supplies values. `ConfigurationBinder` converts a section into a CLR shape. `IOptions<T>` provides a named/default options value; snapshot and monitor interfaces have different lifetimes and change semantics. Validation rejects invalid settings; secret providers and deployment injection decide how sensitive values arrive.

## End-to-end walkthrough

Defaults in JSON can be overridden by environment-specific JSON, then environment variables and command-line arguments depending on the app's source order. Double underscores represent nested keys in environment variables. Bind `ConnectionStrings:Primary` or a related section into settings; add validation; select the appropriate options interface. If a watched provider reloads, an options monitor can invalidate its cache and raise a change callback. A provider without reload support cannot promise live updates.

## When to use it and tradeoffs

Use strongly typed options for cohesive settings consumed across services; use direct `IConfiguration` access for dynamic lookup or bootstrap cases where a stable options contract is not appropriate. Choose snapshot for per-scope recomputation, monitor for singleton consumers and change callbacks, and `IOptions<T>` for a cached default value. Keep secrets in user secrets for local development and managed/environment secret injection in deployment; never commit or log them.

## What later lessons cover

The references cover source/provider precedence, conversion and generated binding, options names/lifetimes/cache behavior, validation including .NET 11 async boundaries, startup checks, and secret handling. Exercises cover precedence debugging, reload, invalid values, and safe secret flow.

## Version notes

In .NET 11, asynchronous options validation APIs are available. Synchronous access to options requiring async validation throws; use async startup validation and respect the documented sync boundaries. Configuration source generation intercepts supported binder call sites for trim/AOT-friendly code; it does not promise generated support for every shape or call. See Microsoft's [.NET 11 compatibility note](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/async-options-validation-sync-access).
