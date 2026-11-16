# ASP.NET Core configuration providers binding and options lifecycle — Reference: Options validation, asynchronous validation, startup checks, and secret handling

Sources: Microsoft's [options validation](https://learn.microsoft.com/en-us/dotnet/core/extensions/options), [options validation source generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/options-validation-generator), [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), and [.NET 11 async validation compatibility guidance](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/async-options-validation-sync-access).

## Scope and version

Options validation tests configuration correctness before or during access. This is distinct from MVC/Minimal API request model validation and from domain invariants. .NET 11 adds asynchronous options validation and changes sync access when async validators are present.

## Synchronous validation choices

`OptionsBuilder<TOptions>.Validate(predicate)` registers a boolean rule; `.ValidateDataAnnotations()` applies DataAnnotations; a validation delegate can express a cross-property condition. `IValidateOptions<TOptions>.Validate(name, options)` can implement reusable named validation and returns `ValidateOptionsResult`: `Success`, `Fail(errors)`, or `Skip` when a validator does not apply to the name. `ValidateOptions<TOptions>` is a helper base class. `DataAnnotationValidateOptions<TOptions>` is the DataAnnotations-backed validator. `ValidateOptionsAttribute` and `OptionsValidatorAttribute` support generated validation patterns; the source generator can create efficient trim-friendly validators for attributed types. `RequiredAttribute`, `RangeAttribute`, and nested-member attributes such as `ValidateObjectMembersAttribute`, `ValidateEnumeratedItemsAttribute`, and `ValidateNestedOptionsAttribute` express presence, bounds, and nested collection/type traversal. Use them when their semantics match; avoid duplicating custom rules without a clear owner.

`OptionsBuilder<TOptions>.ValidateOnStart()` and `AddOptionsWithValidateOnStart` arrange startup validation. `IStartupValidator` participates in synchronous startup validation; `ValidateOnStart` failure surfaces as `OptionsValidationException`/`ValidationException` and prevents a healthy host from serving requests. Without startup validation, invalid options may fail on first access instead. Named options need the intended names validated; ensure the startup path creates/checks all required named variants rather than assuming only default is used.

## .NET 11 asynchronous validation boundary

`IAsyncValidateOptions<TOptions>.ValidateAsync(name, options, cancellationToken)` supports async validation. `OptionsBuilder<TOptions>.ValidateAsync` registers an async delegate. `IAsyncStartupValidator` supports asynchronous startup validation. These enable I/O-dependent checks without blocking a thread, but they introduce a hard sync/async boundary: synchronous access such as `IOptions<T>.Value`, `IOptionsSnapshot<T>` access, and `IOptionsMonitor<T>.CurrentValue` cannot await async validators and throws when asynchronous validation is required. Use the documented asynchronous validation/startup APIs and keep async validators from being invoked through sync-only paths. Test startup and runtime access on the exact .NET 11 target.

`Asynchronous options validation in .NET 11` must not be described as merely “same behavior but async”: construction/access semantics change. Async validators should honor cancellation, be deterministic, and avoid expensive/unavailable network dependencies unless startup must fail closed on that dependency. A remote check is not a durable invariant; validate again at operation time if the value can change.

## Secrets and precedence

Secret Manager stores local development secrets outside the repository. `UserSecretsId` identifies the development secret store; `dotnet user-secrets init` initializes it and `dotnet user-secrets set` writes a key/value. These are developer tooling, not encrypted production vault semantics. Production secrets can arrive through protected environment injection or a managed secret store. Choose based on access control, audit, rotation, deployment platform, and availability needs. Secret rotation only takes effect in-process if the source/provider refreshes and consumers observe monitor changes or reload state.

Never commit secrets, paste them in logs, or emit raw configuration debug views. Secret precedence matters: a higher-priority environment variable can override an expected secret-store value. Validate presence without revealing the secret. Connection strings and API keys belong in restricted configuration, not exception messages or telemetry attributes.

## Comparison and practical registration

```csharp
builder.Services.AddOptions<PaymentsOptions>()
    .BindConfiguration("Payments")
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

For synchronous rules this validates at startup. In .NET 11, if the options require async validation, register/use the async validation path and async startup validator; do not assume synchronous `ValidateOnStart` or `.Value` can execute it. Validate nested objects explicitly with supported annotations or a validator. Options validation checks shape/readiness; model validation checks caller input; domain validation protects business rules.

## Common mistakes

Relying on first-use failures for critical startup settings; validating only the default name when named options are used; performing network checks from synchronous validators; expecting async validation to work through `.Value`; treating user secrets as production storage; logging secret values; and relying on reload to rotate every consumer automatically.

## Knowledge checks with answers

1. **What is the difference between `Fail` and `Skip`?** Fail rejects the current options; skip means the validator does not apply to that name/instance.
2. **What happens on invalid `ValidateOnStart` options?** Startup validation fails before the app is considered healthy.
3. **What happens when async validators are required but sync `.Value` is read?** .NET 11 throws; use the async path.
4. **Is User Secrets for production?** No, it is intended for local development.
5. **Does reload guarantee secret rotation everywhere?** No; providers and dependent consumers must refresh/observe and update their state.

## Supplied names explained

The complete inventory below preserves every declared validation API, result state, sync/async boundary, DataAnnotations item, startup hook, secret tool, and secret-handling concept.

## Exact terms covered

### Exact terms covered

- `OptionsBuilder<TOptions>.Validate`
- `OptionsBuilder<TOptions>.ValidateAsync`
- `OptionsBuilder<TOptions>.ValidateDataAnnotations`
- `OptionsBuilder<TOptions>.ValidateOnStart`
- `OptionsBuilder<TOptions>.Services`
- `IValidateOptions<TOptions>`
- `IValidateOptions<TOptions>.Validate`
- `IAsyncValidateOptions<TOptions>`
- `IAsyncValidateOptions<TOptions>.ValidateAsync`
- `ValidateOptionsResult`
- `ValidateOptionsResult.Success`
- `ValidateOptionsResult.Fail`
- `ValidateOptionsResult.Skip`
- `ValidateOptions<TOptions>`
- `ValidateOptionsAttribute`
- `OptionsValidatorAttribute`
- `Options validation source generator`
- `DataAnnotationValidateOptions<TOptions>`
- `ValidateDataAnnotations extension`
- `IStartupValidator`
- `IAsyncStartupValidator`
- `Startup options validation`
- `ValidationException`
- `OptionsValidationException`
- `ValidateOnStart startup failure`
- `Named options validation`
- `Cross-property validation delegate`
- `Reusable IValidateOptions implementation`
- `Asynchronous options validation in .NET 11`
- `Sync access to async-validated options throws`
- `IOptions<T>.Value with async validators`
- `IOptionsSnapshot<T> with async validators`
- `IOptionsMonitor<T>.CurrentValue async validation boundary`
- `Startup async validation behavior`
- `Options validation versus model validation`
- `RequiredAttribute`
- `RangeAttribute`
- `ValidateObjectMembersAttribute`
- `ValidateEnumeratedItemsAttribute`
- `ValidateNestedOptionsAttribute`
- `Secret Manager User Secrets`
- `UserSecretsId`
- `dotnet user-secrets init`
- `dotnet user-secrets set`
- `Environment-based secret injection`
- `Secret rotation and monitor reload`
- `Avoid logging credentials`
- `Configuration secret precedence`
## How this group fits the mental model
Validation runs after options construction at startup or access; secret providers supply values into the same ordered configuration system but require stronger operational handling.

## Cross-item comparison
`IValidateOptions` is synchronous and reusable; DataAnnotations express common declarative rules; validation delegates are local; async validators require async access/startup boundaries in .NET 11.

## Examples
The registration example validates synchronous attributes during startup. A separate async validator requires the async startup path and cannot be called by sync `.Value` access.
