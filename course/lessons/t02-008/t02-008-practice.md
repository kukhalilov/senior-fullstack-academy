# ASP.NET Core configuration providers binding and options lifecycle — Exercises and worked solutions

Sources: Microsoft's [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), [options](https://learn.microsoft.com/en-us/dotnet/core/extensions/options), and [configuration generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-generator).

## Goals

Trace provider precedence, diagnose binding failures, select options interface by lifetime, validate startup configuration, understand reload boundaries, and protect secrets.

## Worked example

An expected setting remains at its JSON default after deployment sets `PAYMENTS__TIMEOUTSECONDS=5`. Inspect `IConfigurationRoot.Providers` order, verify environment variable spelling/double-underscore mapping and process environment, inspect the effective key without exposing other secret values, then assert the bound option. The environment provider must be included later than JSON to override it.

## Exercises

### 1. Predict precedence

`appsettings.json` says `Cache:Enabled=false`; environment-specific JSON says true; environment variable says false; command line says true. What is the final value?

**Solution:** With the usual provider order in which environment and command line are later than JSON and command line later than environment, the final value is true. Confirm the actual hosting API's provider sequence rather than assuming it.

### 2. Choose the options abstraction

A singleton worker needs a stable startup URL. A scoped request service needs the latest configured display options per request. Another singleton should react when a watched file changes.

**Solution:** Use `IOptions<T>` for stable startup URL, `IOptionsSnapshot<T>` for per-scope values, and `IOptionsMonitor<T>` for singleton change observation. Confirm that the source emits change tokens; make callbacks thread-safe.

### 3. Find why invalid config passed startup

`Payments:Timeout=-1` binds, and first request fails. Identify fixes.

**Solution:** Add a range/custom options validator and `ValidateOnStart` for synchronous rules. If validation genuinely requires async I/O on .NET 11, register an async `Validate` delegate or `IAsyncValidateOptions` and use `ValidateOnStart` so async startup validation runs. Startup can seed initial `IOptions<T>`/`IOptionsMonitor<T>` caches, but a new `IOptionsSnapshot<T>` value and monitor reload still use synchronous creation and fail for an async-only rule. Add tests for pre-start access, startup, a new scope, reload, missing, invalid, and valid settings.

### 4. Diagnose generated binding warnings

An AOT publish reports trimming warnings for a `Bind` call despite `EnableConfigurationBindingGenerator=true`.

**Solution:** The generator intercepts supported call sites/shapes, not every reflection path. It does not support custom `TypeConverter` conversions that reflection binding can use. Check generated diagnostics/call site, supported binder APIs and types, package/framework versions, and generated output. Test the actual trimmed publish. Do not suppress warnings until runtime behavior is verified.

### 5. Handle a secret rotation

An API key rotates in a managed store, but a singleton client keeps using the old value.

**Solution:** Verify the provider refresh/change-token behavior, monitor cache invalidation, and consumer callback. A monitor notification does not rebuild a client automatically. Use an explicit safe client/key update or recreate the dependent client; support overlapping old/new credentials when the external service requires zero downtime.

### 6. Avoid configuration disclosure

An engineer adds `GetDebugView()` to an error log after a failed bind.

**Solution:** Remove or redact the full view; it may expose passwords, tokens, and connection strings. Log the key path and provider/source identity where safe, plus validation error names without values. Restrict diagnostic access.

### 7. Fix default-value ambiguity

`RetryCount` is `0` when the key is missing, and `0` is also a valid configured value.

**Solution:** Model requiredness explicitly, e.g. required nullable property or validation tracking; `GetRequiredSection` only ensures a section exists, not every scalar value. Add a validator to distinguish missing from intentionally zero.

## Progressive hints

Ask: what provider supplied the final key; did conversion happen; which name/lifetime is requested; when is validation invoked; does the source emit a change token; and where is the secret displayed?

## Complete solutions

Each exercise gives the full diagnosis and corrective direction. The production fix should be verified through the same host, provider set, publish mode, and secret-rotation mechanism as the deployed service.

## Tests and edge cases

Test provider order, empty-string override, missing/invalid conversions, enum/array/nested binding, unknown keys, named instances, snapshot scope, monitor invalidation, providers without reload, startup async validation, generator diagnostics/AOT, and redaction of debug output. Also test .NET 8 invalid array-element skipping/empty dictionary sections, .NET 10 null and empty-array binding, and .NET 11 chained empty-string override/ignored properties.

## Reflection questions

Does every settings class describe one cohesive consumer need? Which interface lifetime fits the consumer? Are reload callbacks able to change dependent resources safely? Can operators inspect failures without exposing secrets?
