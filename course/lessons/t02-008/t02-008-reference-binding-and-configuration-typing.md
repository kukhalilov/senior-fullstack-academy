# ASP.NET Core configuration providers binding and options lifecycle — Reference: Configuration binding APIs, conversions, validation, and source generation

Sources: Microsoft's [configuration](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), [configuration binder API](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration), and [configuration source generator](https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration-generator).

## Scope and version

This reference covers binding a configuration tree to CLR values and generated binding. It does not cover options lifetime/validation beyond how binding produces an instance.

## Choosing an access style

`IConfiguration` indexer and `GetSection` support direct access for bootstrap/dynamic-key cases. `ConfigurationBinder.Get<T>` creates a typed object; `Bind` populates an existing instance; `GetValue<T>` reads/converts a scalar. These are available through `ConfigurationBinder` overloads and `IConfiguration` extensions (`Get<T>`, `Bind`, `GetValue<T>`). `GetRequiredSection` fails early when a required subtree is absent. `GetConnectionString` reads the conventional `ConnectionStrings` section; it does not validate connectivity or ensure the returned string is secret-safe. `GetDebugView` helps inspect effective keys and origins, but may expose sensitive values.

Strongly typed binding is easier to validate and test than scattered string lookups. Mutable object binding commonly uses a public parameterless constructor and public writable properties; `ConfigurationBinder.Get<T>` also supports a type with exactly one public parameterized constructor (a common immutable-record pattern). Multiple public parameterized constructors are ambiguous and fail. Fields and private setters are not normally bound; `BinderOptions.BindNonPublicProperties` can opt into non-public properties for supported reflection binding. `ConfigurationKeyNameAttribute` maps a property to a differently named configuration key, and .NET 11 `ConfigurationIgnoreAttribute` excludes a property from binding. Avoid broad private binding unless needed because it creates surprising configuration surface.

## Shape and conversion behavior

Binder supports scalar conversions, nullable values, enum names/numbers, arrays, collections, dictionaries, nested objects, and record-shaped options where binder constraints are met. Configuration key/property matching is case-insensitive and nested object properties map to nested keys. `IConfigurationSection.GetChildren` supports collection-style binding; numeric child names represent array/list positions. Scalar conversion failures generally throw for typed binding rather than silently proving the value valid. Missing keys often retain default values, which is why requiredness must be validated explicitly. `ErrorOnUnknownConfiguration` can report unrecognized child keys on supported binding paths and is useful for catching misspellings.

`BinderOptions` configures binding behavior. `ConfigurationBinder.Get`, `.Bind`, and `.GetValue` have overloads for section/instance/type/options variants; select overloads intentionally. Manual `IConfiguration` access is appropriate when keys are dynamic, but overuse scatters conversion/error handling. A strongly typed binding contract makes shape discoverable.

## Source generation, trimming, and AOT

`ConfigurationBindingGenerator` is enabled with the `EnableConfigurationBindingGenerator` MSBuild property. Starting with .NET 8, the generator intercepts call sites from `ConfigurationBinder`, `OptionsBuilderConfigurationExtensions`, and `OptionsConfigurationServiceCollectionExtensions`, emitting typed code for trim/AOT-friendly paths. It is not “all reflection binding becomes source generated”: call-site interception, supported shapes, APIs, and diagnostics determine coverage. The generated binder does not support custom `TypeConverter` conversions that reflection binding can use; unsupported cases can retain reflection-based behavior/warnings or fail to match generated expectations. Review generated-binding diagnostics, inspect generated code when a deployment issue warrants it, and publish/test the actual trimmed/AOT target.

Important binder behavior changes are versioned. Starting in .NET 8, invalid array/list elements can be silently skipped unless error-on-unknown handling is enabled, and dictionary entries for empty configuration sections are materialized with default values. In .NET 10, explicit JSON `null` is distinct from a missing key and binds as null/default, including in arrays; an empty JSON array is bound as empty. In .NET 11, `ConfigurationIgnoreAttribute` excludes properties, and an empty array can bind to a constructor parameter. Validate requiredness and collection counts explicitly rather than inferring them from a successful bind. [.NET 8 failed collection elements](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/8.0/configurationbinder-skips-failed-array-elements) [.NET 8 empty dictionary keys](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/8.0/dictionary-configuration-binding) [.NET 10 null binding](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/configuration-null-values-preserved) [.NET 11 library changes](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/libraries)

The `Microsoft.Extensions.Configuration.Binder` package may be needed when using binder extensions outside shared framework scenarios. Package references and versions should align with the target framework. In AOT-sensitive applications, prefer supported source-generated paths and treat trimming warnings as design feedback rather than suppressing them blindly.

## Example and comparison

```csharp
var section = configuration.GetRequiredSection("Payments");
var options = section.Get<PaymentsOptions>(binder =>
    binder.ErrorOnUnknownConfiguration = true)
    ?? throw new InvalidOperationException("Payments configuration is required.");
```

This fails for a missing section or unknown key under the configured path, and conversion errors surface during binding. Separate configuration-shape errors from domain/business validation. `Bind` reuses an instance; `Get<T>` creates one; `GetValue<T>` is for one scalar. Use options registration when services need consistent lifetime, validation, and reload handling.

## Common mistakes

Relying on default zero/false for required keys; assuming unknown keys always fail; assuming reflection and generated paths accept identical shapes; exposing connection strings in debug output; binding untrusted configuration without range checks; and treating successful conversion as semantic validity.

## Knowledge checks with answers

1. **What is `GetRequiredSection` for?** Detect missing required subtrees instead of silently binding defaults.
2. **What does `BindNonPublicProperties` change?** Enables binding non-public properties for supported binder paths.
3. **Is source generation universal?** No, only supported call sites and shapes are intercepted.
4. **Does successful enum conversion prove allowed business value?** No; validate permitted semantics separately.

## Supplied names explained

The inventory below includes every named binder method, overload family, value shape, generator switch/diagnostic, and configuration access alternative declared for this group.

## Exact terms covered

### Exact terms covered

- `ConfigurationBinder.Get<T>`
- `ConfigurationBinder.Bind`
- `ConfigurationBinder.GetValue<T>`
- `IConfiguration.Get<T>`
- `IConfiguration.Bind`
- `IConfiguration.GetValue<T>`
- `GetRequiredSection`
- `GetConnectionString`
- `ConnectionStrings configuration section`
- `GetDebugView`
- `BinderOptions`
- `BinderOptions.BindNonPublicProperties`
- `BinderOptions.ErrorOnUnknownConfiguration`
- `ConfigurationBinder.Get overloads`
- `ConfigurationBinder.Bind overloads`
- `ConfigurationBinder.GetValue overloads`
- `Scalar conversion binding`
- `Nullable value binding`
- `Enum configuration binding`
- `Collection binding`
- `Dictionary binding`
- `Nested object binding`
- `Array binding`
- `Record options binding`
- `Single public parameterized constructor binding`
- `Multiple public parameterized constructors fail binding`
- `ConfigurationKeyNameAttribute`
- `ConfigurationIgnoreAttribute`
- `.NET 8 invalid collection element skipping`
- `.NET 8 empty dictionary section binding`
- `.NET 10 null and empty-array binding`
- `.NET 11 empty-array constructor parameter binding`
- `Public property binding requirements`
- `Missing key default values`
- `Invalid conversion behavior`
- `ErrorOnUnknownConfiguration behavior`
- `Configure binding source generator`
- `ConfigurationBindingGenerator`
- `EnableConfigurationBindingGenerator`
- `Configuration binding reflection fallback`
- `Trimming-safe configuration binding`
- `AOT configuration binding considerations`
- `Generated binding diagnostics`
- `Configuration key to property mapping`
- `Case-insensitive property matching`
- `ConfigurationSection.GetChildren collection binding`
- `Manual IConfiguration access`
- `Strongly typed configuration binding`
- `Configuration binder package reference`
- `ConfigurationBinder source-generated overload limitations`
- `Generated binder custom TypeConverter limitation`

## How this group fits the mental model
Binding is the conversion step between resolved configuration keys and a typed object; generated binding is an alternative implementation for supported call sites.

## Cross-item comparison
Use `GetValue<T>` for one scalar, `Get<T>` to create an object, and `Bind` to populate an existing instance. Reflection provides flexibility; source generation improves trim/AOT compatibility for supported shapes.

## Examples
The `PaymentsOptions` snippet above is a representative required-section bind with unknown-key checking; options registration is preferable when multiple services share the same settings/lifecycle.

