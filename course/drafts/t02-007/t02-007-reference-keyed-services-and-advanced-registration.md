# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Reference: Keyed registration, service selection, activation, and diagnostics

## Scope and version

Keyed registrations add an object key to service type and lifetime. .NET 10 changed AnyKey lookup: singular GetKeyedService with AnyKey throws, while plural enumeration returns specifically keyed registrations. [Keyed services](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) [.NET 10 behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey)

## How this group fits the mental model

Use a specific key for one service and AnyKey only for its fallback/enumeration roles. Attributes make constructor selection explicit; the current activation key can be injected separately. Keep key equality and the DI scope visible in design.

## Supplied names explained

- `Keyed service` — Registration selected by service type plus a key object.
- `Service key` — Object identity/equality value used to select a keyed descriptor; use stable keys consistently.
- `AddKeyedSingleton` — Registers keyed service with singleton lifetime; resolve by its exact key or a defined AnyKey fallback.
- `AddKeyedScoped` — Registers keyed service per scope.
- `AddKeyedTransient` — Registers keyed service per resolution.
- `AddKeyedSingleton<TService,TImplementation>` — Maps keyed service abstraction to a container-created singleton implementation.
- `AddKeyedScoped<TService,TImplementation>` — Maps keyed abstraction to a scoped implementation.
- `AddKeyedTransient<TService,TImplementation>` — Maps keyed abstraction to a transient implementation.
- `AddKeyedSingleton<TService>(Object, Func<IServiceProvider,Object?,TService>)` — Keyed singleton factory receives the provider and actual service key, useful for key-dependent construction.
- `GetKeyedService<TService>` — Optional keyed lookup; returns null when no matching keyed registration/fallback exists.
- `GetRequiredKeyedService<TService>` — Required keyed lookup; fails when the key/type cannot be resolved.
- `GetKeyedServices<TService>` — Enumerates services matching a key; with AnyKey, current behavior enumerates services registered under specific keys.
- `IKeyedServiceProvider` — Provider capability for keyed service resolution.
- `IKeyedServiceProvider.GetKeyedService` — Optional keyed provider lookup that may return null.
- `IKeyedServiceProvider.GetRequiredKeyedService` — Required keyed provider lookup.
- `IServiceProviderIsKeyedService` — Capability interface, derived from `IServiceProviderIsService`, for probing whether a provider can supply a given service type/key pair.
- `IServiceProviderIsKeyedService.IsKeyedService(Type,Object)` — Returns whether the provider can supply the requested keyed service; this is a capability check, not a substitute for handling resolution/activation failures.
- `TryAddKeyedSingleton` — Adds a keyed singleton default only when the service/key registration is not already present; useful for library defaults that consumers may override.
- `TryAddKeyedScoped` — Adds a keyed scoped default only when the service/key registration is not already present.
- `TryAddKeyedTransient` — Adds a keyed transient default only when the service/key registration is not already present.
- `FromKeyedServicesAttribute` — Parameter attribute selecting a keyed dependency during constructor activation.
- `FromKeyedServicesAttribute.Key` — The key the parameter should resolve; null with inherited lookup can request the parent activation key.
- `FromKeyedServicesAttribute.LookupMode` — Controls keyed lookup mode, including whether the key is inherited from the parent keyed activation.
- `ServiceKeyAttribute` — Parameter attribute injecting the key used to register/resolve the current keyed service.
- `KeyedService.AnyKey` — Special wildcard/fallback key, not an ordinary literal key for resolving one service.
- `KeyedService.AnyKey registration enumeration` — A registration under AnyKey can act as fallback for specific missing keys; enumeration with AnyKey lists specifically keyed registrations, not the fallback registration.
- `Keyed service constructor injection` — Use FromKeyedServices on a parameter to declare the key as part of the constructor dependency.
- `Keyed service factory` — Factory can receive the actual service key and choose key-dependent construction behavior.
- `Keyed service lifetime` — Keyed and unkeyed registrations still obey transient/scoped/singleton reuse rules.
- `Keyed service versus named options` — Keyed service selects an implementation instance; named options select a configuration value for a service.
- `ServiceDescriptor.IsKeyedService` — Indicates whether a descriptor represents a keyed registration.
- `ServiceDescriptor.ServiceKey` — The registration key stored in a keyed descriptor.
- `ServiceDescriptor.KeyedImplementationType` — Implementation type for the keyed registration.
- `ServiceDescriptor.KeyedImplementationFactory` — Factory delegate for constructing a keyed service.
- `ServiceDescriptor.KeyedImplementationInstance` — Prebuilt keyed instance; registering code retains disposal responsibility.
- `Keyed open generic registration` — Keyed mapping can use compatible open generic service/implementation definitions.
- `Keyed multiple implementation resolution` — Multiple registrations for one service type can coexist under separate keys; selection should be explicit.
- `Keyed service fallback attribute` — FromKeyedServices supports inherited-key lookup for nested keyed activation; specify a concrete key when fallback/inheritance is not intended.
- `[ServiceKey] parameter` — Injects the current registration/resolution key into the keyed service constructor.
- `Dependency resolution scope` — The provider scope used for resolving dependencies determines scoped instance reuse.
- `Service provider diagnostics` — Use validation and resolution diagnostics to find invalid graphs; do not turn provider introspection into application logic.
- `ValidateOnBuild startup validation` — Build-time check of resolvable registration graphs; factory code and open generics still need runtime path tests.
- `ValidateScopes development default` — Development host defaults commonly enable scope validation; set expectations explicitly for tests/production provider construction.
- `AddKeyedScoped(IServiceCollection, Type, Object, Func<IServiceProvider,Object,Object>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedScoped(IServiceCollection, Type, Object, Type)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the implementation form shown in the signature.
- `AddKeyedScoped(IServiceCollection, Type, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedScoped<TService,TImplementation>(IServiceCollection, Object, Func<IServiceProvider,Object,TImplementation>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedScoped<TService,TImplementation>(IServiceCollection, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedScoped<TService>(IServiceCollection, Object, Func<IServiceProvider,Object,TService>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedScoped<TService>(IServiceCollection, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton(IServiceCollection, Type, Object, Func<IServiceProvider,Object,Object>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton(IServiceCollection, Type, Object, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton(IServiceCollection, Type, Object, Type)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the implementation form shown in the signature.
- `AddKeyedSingleton(IServiceCollection, Type, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton<TService,TImplementation>(IServiceCollection, Object, Func<IServiceProvider,Object,TImplementation>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton<TService,TImplementation>(IServiceCollection, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton<TService>(IServiceCollection, Object, Func<IServiceProvider,Object,TService>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedSingleton<TService>(IServiceCollection, Object, TService)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the implementation form shown in the signature.
- `AddKeyedSingleton<TService>(IServiceCollection, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedTransient(IServiceCollection, Type, Object, Func<IServiceProvider,Object,Object>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedTransient(IServiceCollection, Type, Object, Type)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the implementation form shown in the signature.
- `AddKeyedTransient(IServiceCollection, Type, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedTransient<TService,TImplementation>(IServiceCollection, Object, Func<IServiceProvider,Object,TImplementation>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedTransient<TService,TImplementation>(IServiceCollection, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedTransient<TService>(IServiceCollection, Object, Func<IServiceProvider,Object,TService>)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `AddKeyedTransient<TService>(IServiceCollection, Object)` — Keyed service-collection overload for this lifetime; it registers the service under the supplied object key using the factory, implementation type, or existing instance shown in the signature.
- `GetKeyedService(IServiceProvider, Type, Object)` — Runtime-type optional keyed lookup; service type and object key select the descriptor, and absence returns null.
- `GetKeyedService<T>(IServiceProvider, Object)` — Generic optional keyed lookup; the compile-time service type is T and the supplied object key selects the descriptor.
- `GetRequiredKeyedService(IServiceProvider, Type, Object)` — Runtime-type required keyed lookup; throws if the requested service type/key pair cannot be resolved.
- `GetRequiredKeyedService<T>(IServiceProvider, Object)` — Generic required keyed lookup; throws if the service type/key pair cannot be resolved.
- `GetKeyedServices(IServiceProvider, Type, Object)` — Runtime-type plural keyed lookup returning the registered service set for the supplied key.
- `GetKeyedServices<T>(IServiceProvider, Object)` — Generic plural keyed lookup returning the registered service set for the supplied key.
- `TryAddKeyedSingleton(IServiceCollection, Type, Object, implementation forms)` — Non-generic keyed singleton registration family, with implementation-type, factory, and instance forms as exposed by the overloads.
- `TryAddKeyedScoped(IServiceCollection, Type, Object, implementation forms)` — Non-generic keyed scoped registration family, with implementation-type and factory forms as exposed by the overloads.
- `TryAddKeyedTransient(IServiceCollection, Type, Object, implementation forms)` — Non-generic keyed transient registration family, with implementation-type and factory forms as exposed by the overloads.
- `TryAddKeyedSingleton<TService>(IServiceCollection, Object, implementation forms)` — Generic keyed singleton overload family, including implementation-type, factory, and instance forms.
- `TryAddKeyedScoped<TService>(IServiceCollection, Object, implementation forms)` — Generic keyed scoped overload family, including implementation-type and factory forms.
- `TryAddKeyedTransient<TService>(IServiceCollection, Object, implementation forms)` — Generic keyed transient overload family, including implementation-type and factory forms.
- `FromKeyedServicesAttribute()` — Default attribute constructor sets LookupMode to InheritKey, so nested activation can use the parent service key.
- `FromKeyedServicesAttribute(Object)` — Attribute constructor that selects a specific service key for this parameter.

## Cross-item comparison

A specific key selects one implementation; `KeyedService.AnyKey` can serve as a fallback for keys without a specific registration, while plural `GetKeyedServices` with AnyKey enumerates registrations for specific keys. On .NET 10+, singular lookup with AnyKey throws. `FromKeyedServicesAttribute` selects a dependency; `ServiceKeyAttribute` receives the activation key. A keyed service selects an implementation; named options select settings.

## Examples

A specific key wins over an AnyKey fallback; constructor selection can declare a concrete key:
```csharp
services.AddKeyedSingleton<ICache>(KeyedService.AnyKey,
    (provider, key) => new DefaultCache(key?.ToString() ?? "unknown"));
services.AddKeyedSingleton<ICache, PremiumCache>("premium");

public sealed class ReportService([FromKeyedServices("premium")] ICache cache)
{
    public ICache Cache { get; } = cache;
}
```
This assumes `ICache`, its implementations, and the service type exist in the application. Use `GetKeyedService` with an actual requested key; do not use AnyKey for a singular lookup. [.NET 10 keyed-service behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey)

## Common mistakes

Do not use different string instances with inconsistent spelling/casing as accidental keys. Do not resolve one service using `KeyedService.AnyKey` on .NET 10+. Do not confuse AnyKey fallback registration with plural enumeration. Check attribute lookup mode when a nested keyed service should inherit or explicitly change its parent's key.

## Knowledge checks with answers

1. **What forms a keyed service identity?** Service type plus key.  2. **How does AnyKey work?** As fallback/special enumeration key, not a normal singular key.  3. **What does `[FromKeyedServices]` do?** Selects a keyed constructor dependency.  4. **What does `[ServiceKey]` do?** Injects the key used for activation.  5. **How does .NET 10 singular AnyKey lookup behave?** It throws.

## Sources

[Keyed services](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)
[Keyed registration overloads](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions)
[Keyed resolution overloads](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.serviceproviderkeyedserviceextensions)
[TryAdd keyed registration overloads](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.extensions.servicecollectiondescriptorextensions?view=net-11.0)
[IServiceProviderIsKeyedService](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.iserviceprovideriskeyedservice?view=net-11.0)
[FromKeyedServicesAttribute](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.fromkeyedservicesattribute)
[.NET 10 AnyKey change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey)
