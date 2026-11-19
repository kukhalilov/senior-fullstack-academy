# ASP.NET Core configuration providers binding and options lifecycle — Reference: Options validation, asynchronous validation, startup checks, and secret handling

Sources: Microsoft's [options validation](https://learn.microsoft.com/en-us/dotnet/core/extensions/options), [options validation source generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/options-validation-generator), [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), and [.NET 11 async validation compatibility guidance](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/async-options-validation-sync-access).

## Scope and version

Options validation tests configuration correctness before or during access. This is distinct from MVC/Minimal API request model validation and from domain invariants. .NET 11 adds asynchronous options validation and changes sync access when async validators are present.

## Synchronous validation choices

`OptionsBuilder<TOptions>.Validate(predicate)` registers a synchronous boolean rule; .NET 11 adds asynchronous delegate overloads of the same `Validate` method that accept a `CancellationToken` and return `Task<bool>` (with up to five DI service dependencies). There is no `OptionsBuilder.ValidateAsync` method. `ValidateDataAnnotations()` applies DataAnnotations; `IValidateOptions<TOptions>.Validate(name, options)` implements reusable named validation and returns `ValidateOptionsResult`: `Success`, `Fail(errors)`, or `Skip` when a validator does not apply. `ValidateOptions<TOptions>` and its dependency-taking forms are reusable validator implementations. `DataAnnotationValidateOptions<TOptions>` is the DataAnnotations-backed validator. `OptionsValidatorAttribute` triggers generated validator code; the generator is enabled by default with supported package versions and has compile-time diagnostics and nested traversal rules. `RequiredAttribute`, `RangeAttribute`, `ValidateObjectMembersAttribute`, and `ValidateEnumeratedItemsAttribute` express presence, bounds, and explicit nested/object-collection traversal. There is no `ValidateNestedOptionsAttribute`. By default, DataAnnotations does not recursively validate nested members or collection items; apply the appropriate supported traversal attribute. Use annotations when their semantics match and keep custom rule ownership clear.

`OptionsBuilder<TOptions>.ValidateOnStart()` and `AddOptionsWithValidateOnStart` arrange startup validation for the selected options name. The host runs the registered startup validator before startup completes; .NET 11 adds `IAsyncStartupValidator`, and `IStartupValidator` is retained for synchronous compatibility but is obsolete. `ValidateOnStart` failure prevents successful host startup. Without startup validation, invalid options may fail on first creation/access. Named options need the intended names validated; registering a validator type through `AddOptionsWithValidateOnStart<TOptions,TValidateOptions>` does not scope that validator registration to only the builder's name.

## .NET 11 asynchronous validation boundary

`IAsyncValidateOptions<TOptions>.ValidateAsync(name, options, cancellationToken)` supports async validation. In .NET 11 it derives from `IValidateOptions<TOptions>`, so a custom validator must also implement synchronous `Validate`; register it as `IValidateOptions<TOptions>` or through `OptionsBuilder.Validate<TValidateOptions>()`, not directly as `IAsyncValidateOptions<TOptions>`. An async-only rule should fail or skip appropriately on the sync method rather than block on I/O. Async `Validate` delegate overloads and `ValidateDataAnnotations` participate in async options creation. `ValidateOnStart` invokes asynchronous startup validation and can seed the initial default `IOptions<TOptions>` and `IOptionsMonitor<TOptions>` caches. It does not seed later `IOptionsSnapshot<TOptions>` scope caches, and `IOptionsMonitor<TOptions>` recreates values synchronously after a change. Therefore synchronous creation/access throws `OptionsValidationException` whenever that path must run an async-only validator: before async startup validation, for new snapshot values, and on monitor reload. A cached initial value that was successfully validated during startup can still be read synchronously. Test startup, new-scope, reload, and direct factory paths separately on the .NET 11 target. [Async validation compatibility details](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/async-options-validation-sync-access)

`Asynchronous options validation in .NET 11` must not be described as merely “same behavior but async”: construction/access semantics change. Async validators should honor cancellation, be deterministic, and avoid expensive/unavailable network dependencies unless startup must fail closed on that dependency. .NET 11 DataAnnotations also adds `AsyncValidationAttribute`, `IAsyncValidatableObject`, and `Validator.ValidateObjectAsync`, `TryValidateObjectAsync`, `ValidatePropertyAsync`, and `ValidateValueAsync`; options' DataAnnotations validator uses the async path during async creation, while its synchronous path remains synchronous. A remote check is not a durable invariant; validate again at operation time if the value can change. [Async DataAnnotations APIs](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

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

For synchronous rules this validates at startup. In .NET 11, `ValidateOnStart` invokes the async startup path for async validators; do not read a value synchronously before startup validation completes or assume snapshot creation/monitor reload can await. Validate nested objects explicitly with supported annotations or a validator. Options validation checks settings readiness; model validation checks caller input; domain validation protects business rules.

## Common mistakes

Relying on first-use failures for critical startup settings; validating only the default name when named options are used; performing network checks from synchronous validators; expecting async validation to work through `.Value`; treating user secrets as production storage; logging secret values; and relying on reload to rotate every consumer automatically.

## Knowledge checks with answers

1. **What is the difference between `Fail` and `Skip`?** Fail rejects the current options; skip means the validator does not apply to that name/instance.
2. **What happens on invalid `ValidateOnStart` options?** Startup validation fails before the app is considered healthy.
3. **What happens when async validators are required but a synchronous path must create options?** .NET 11 throws; async startup can seed initial default singleton/monitor caches, but later snapshot creation and monitor reload remain synchronous.
4. **Is User Secrets for production?** No, it is intended for local development.
5. **Does reload guarantee secret rotation everywhere?** No; providers and dependent consumers must refresh/observe and update their state.

## Supplied names explained

The complete inventory below preserves every declared validation API, result state, sync/async boundary, DataAnnotations item, startup hook, secret tool, and secret-handling concept.

## Exact terms covered

### Exact terms covered

- `OptionsBuilder<TOptions>.Validate`
- `OptionsBuilder<TOptions>.Validate async delegate overloads`
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
- `AsyncValidationAttribute`
- `AsyncValidationAttribute.IsValidAsync`
- `IAsyncValidatableObject`
- `IAsyncValidatableObject.ValidateAsync`
- `Validator.ValidateObjectAsync`
- `Validator.TryValidateObjectAsync`
- `Validator.ValidatePropertyAsync`
- `Validator.ValidateValueAsync`
- `IAsyncValidateOptions<TOptions> inherits IValidateOptions<TOptions>`
- `.NET 11 async validator synchronous Validate implementation requirement`
- `IStartupValidator obsolete in .NET 11`
- `IAsyncStartupValidator.ValidateAsync(CancellationToken)`
- `AsyncValidateOptions<TOptions>`
- `AsyncValidateOptions<TOptions,TDep>`
- `AsyncValidateOptions<TOptions,TDep1,TDep2>`
- `AsyncValidateOptions<TOptions,TDep1,TDep2,TDep3>`
- `AsyncValidateOptions<TOptions,TDep1,TDep2,TDep3,TDep4>`
- `AsyncValidateOptions<TOptions,TDep1,TDep2,TDep3,TDep4,TDep5>`
- `ValidateOptions<TOptions,TDep>`
- `ValidateOptions<TOptions,TDep1,TDep2>`
- `ValidateOptions<TOptions,TDep1,TDep2,TDep3>`
- `ValidateOptions<TOptions,TDep1,TDep2,TDep3,TDep4>`
- `ValidateOptions<TOptions,TDep1,TDep2,TDep3,TDep4,TDep5>`
- `DataAnnotations nested validation is opt-in`
- `Async startup validation seeds initial IOptions and IOptionsMonitor caches`
- `IOptionsSnapshot creation remains synchronous with async validators`
- `IOptionsMonitor reload remains synchronous with async validators`
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
