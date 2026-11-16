# ASP.NET Core configuration providers binding and options lifecycle — Reference: Options registration, named instances, construction, caches, and change notifications

Sources: Microsoft's [options pattern](https://learn.microsoft.com/en-us/dotnet/core/extensions/options) and [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration).

## Scope and version

This reference covers registration, naming, creation, caching, lifetime, and reload notification. Validation details and .NET 11 async boundaries are in the next reference.

## Registration and names

`AddOptions<TOptions>()` returns an `OptionsBuilder<TOptions>` for configuring the type. Its `Name` identifies the instance. `AddOptions<TOptions>(String)` registers a named instance. `Options.DefaultName` is the empty string, so “unnamed” is the default named instance. Named options allow the same type to represent several clients/environments; do not confuse an options name with a DI keyed-service key.

`Configure<TOptions>` configures the default name; `Configure<TOptions>(String, Action<TOptions>)` configures one name; `ConfigureAll<TOptions>` applies across names. `PostConfigure<TOptions>` and `PostConfigureAll<TOptions>` run after ordinary configure delegates. `IConfigureOptions<TOptions>` handles default configuration; `IConfigureNamedOptions<TOptions>` can inspect the requested name; `IPostConfigureOptions<TOptions>` performs final adjustment. All configure delegates run before all post-configure delegates, in registration order within those stages. `AddOptionsWithValidateOnStart<TOptions>` and its validator-type overload combine registration and startup validation convenience; understand which validator is registered and when it executes.

## Factory and cache lifecycle

`IOptionsFactory<TOptions>.Create(name)` creates a fresh options instance and runs the applicable configure, post-configure, and validation steps. `OptionsFactory<TOptions>` is the default implementation. `OptionsManager<TOptions>` backs `IOptions<TOptions>` with a cache; `.Value` is the default named value. `OptionsSnapshot<TOptions>` caches values per DI scope/name when accessed. `OptionsMonitor<TOptions>` is singleton-safe and retrieves current named instances, using `OptionsCache<TOptions>`/`IOptionsMonitorCache<TOptions>`.

`IOptions<TOptions>.Value` is stable for app lifetime and does not support reload/name selection. `IOptionsSnapshot<TOptions>.Value` and `.Get(name)` provide per-scope options; recomputation occurs once for each name accessed in a scope, not continuously on every property read. It cannot be injected into a singleton. `IOptionsMonitor<TOptions>.CurrentValue`, `.Get(name)`, and `.OnChange(listener)` expose current/default or named values and change callbacks; it is safe to inject into singleton services. Its callbacks may run when a source change token fires and should be thread-safe, short, and exception-conscious.

`IOptionsMonitorCache<TOptions>.GetOrAdd` gets/creates cached options; `TryAdd` inserts if absent; `TryRemove` invalidates a name; `Clear` invalidates all names. `IOptionsChangeTokenSource<TOptions>` supplies a change token for an options name. A monitor subscribes to one or more sources, invalidates relevant caches, recreates values, and invokes listeners. Selective invalidation depends on source/name. `OptionsCache<TOptions>` is the underlying default cache implementation. Multiple token sources may trigger separate reloads; there is no distributed atomic snapshot across providers.

Options are mutable CLR objects, but treat them as immutable after resolution. Mutating a monitor value affects shared consumers; copy values into owned state if a component must derive mutable runtime state. `OptionsBuilder<TOptions>.Services` exposes the service collection for fluent registration extensions.

## Choose the interface by consumer lifetime

| Consumer need | Interface | Behavior |
|---|---|---|
| Stable singleton startup settings | `IOptions<T>` | Cached default value; no reload/named access |
| Scoped request reads of refreshed values | `IOptionsSnapshot<T>` | Per-scope/name cache; scoped lifetime |
| Singleton service reacts to reload | `IOptionsMonitor<T>` | Singleton-safe; named access and callbacks |

`IConfiguration` direct access can be more appropriate for dynamic key lookup; strongly typed options provide cohesive schema, DI, validation, and lifecycle. `IOptions<T>` itself is singleton semantics even if consumed by scoped/transient classes.

## Example

```csharp
builder.Services.AddOptions<OutboundApiOptions>("inventory")
    .BindConfiguration("OutboundApis:Inventory")
    .Validate(o => o.Timeout > TimeSpan.Zero, "Timeout must be positive")
    .ValidateOnStart();
```

Inject `IOptionsMonitor<OutboundApiOptions>` into a singleton client manager only if reload is needed; use `.Get("inventory")`. If a `HttpClient` handler is constructed once, a change callback does not automatically rebuild every dependent resource—design the refresh boundary explicitly.

## Common mistakes

Injecting snapshot into singleton; assuming monitor callbacks atomically reconfigure all services; changing options objects after reading; assuming every source emits change tokens; and treating `ConfigureAll` as named-only configuration.

## Knowledge checks with answers

1. **What is the default options name?** The empty string (`Options.DefaultName`).
2. **When do post-configure delegates run?** After all applicable configure delegates.
3. **How often is a snapshot recomputed?** Once per name per DI scope after invalidation/new scope, when accessed.
4. **What does monitor reload invalidate?** The relevant named cached options instance(s), based on change-token sources.

## Supplied names explained

The complete inventory below covers the interface/property/method surface, concrete managers/factories/caches, registration overloads, naming, lifetime, order, and mutation behavior described above.

## Exact terms covered

### Exact terms covered

- `IOptions<TOptions>`
- `IOptions<TOptions>.Value`
- `IOptionsSnapshot<TOptions>`
- `IOptionsSnapshot<TOptions>.Value`
- `IOptionsSnapshot<TOptions>.Get`
- `IOptionsMonitor<TOptions>`
- `IOptionsMonitor<TOptions>.CurrentValue`
- `IOptionsMonitor<TOptions>.Get`
- `IOptionsMonitor<TOptions>.OnChange`
- `IOptionsFactory<TOptions>`
- `IOptionsFactory<TOptions>.Create`
- `IOptionsMonitorCache<TOptions>`
- `IOptionsMonitorCache<TOptions>.GetOrAdd`
- `IOptionsMonitorCache<TOptions>.TryAdd`
- `IOptionsMonitorCache<TOptions>.TryRemove`
- `IOptionsMonitorCache<TOptions>.Clear`
- `IOptionsChangeTokenSource<TOptions>`
- `IConfigureOptions<TOptions>`
- `IConfigureNamedOptions<TOptions>`
- `IPostConfigureOptions<TOptions>`
- `OptionsFactory<TOptions>`
- `OptionsManager<TOptions>`
- `OptionsMonitor<TOptions>`
- `OptionsSnapshot<TOptions>`
- `OptionsCache<TOptions>`
- `OptionsBuilder<TOptions>`
- `OptionsBuilder<TOptions>.Name`
- `AddOptions<TOptions>`
- `AddOptions<TOptions>(String)`
- `AddOptionsWithValidateOnStart<TOptions>`
- `AddOptionsWithValidateOnStart<TOptions,TValidateOptions>`
- `Configure<TOptions>`
- `Configure<TOptions>(String, Action<TOptions>)`
- `ConfigureAll<TOptions>`
- `PostConfigure<TOptions>`
- `PostConfigureAll<TOptions>`
- `Options.DefaultName`
- `Options.DefaultName (empty string)`
- `Named options`
- `Options factory configuration order`
- `All configure delegates before post-configure delegates`
- `Named versus unnamed configure options`
- `Options lifetime registrations`
- `IOptions singleton semantics`
- `IOptionsSnapshot scoped semantics`
- `IOptionsMonitor singleton semantics`
- `Snapshot computed once per scope when accessed`
- `Monitor cache invalidation`
- `Monitor change tokens`
- `Selective named options invalidation`
- `Reload notification callback`
- `Multiple change token sources`
- `Options instance identity`
- `Options object mutability after resolution`
- `Options pattern versus direct IConfiguration injection`
## How this group fits the mental model
Options registration maps a configuration section to a named object, then factory/cache/lifetime rules determine which instance each consumer reads.

## Cross-item comparison
`IOptions` is stable default state, snapshot is per-scope/name, and monitor is singleton-safe with change notifications. `Configure` is the main configuration stage; `PostConfigure` runs after it.

## Examples
The inventory example binds named inventory-client settings and validates at startup; a monitor is useful only when a running consumer can safely react to reload.
