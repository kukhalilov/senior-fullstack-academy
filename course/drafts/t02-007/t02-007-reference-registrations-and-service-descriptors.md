# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Reference: Service collection extensions, implementation forms, ordering, and open generics

## Scope and version

A service registration describes the service type, creation path, lifetime, and optional key. The host builds one provider from the collection. Repeated registrations are intentional for extensibility, but resolution shape and order change the result. [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration)

## How this group fits the mental model

Think of registration as a recipe, not a constructed object. Type/factory registrations let the container construct and track services; a supplied instance stays externally owned. Factories are synchronous composition code, and a second provider splits singleton identity and cleanup.

## Supplied names explained

- `IServiceCollection` — Mutable composition-time collection of ServiceDescriptor registrations; the host builds a provider from it.
- `IServiceProvider` — The resolver for the built object graph. The provider instance/scope used for resolution determines scoped reuse and ownership.
- `IServiceProviderFactory<TContainerBuilder>` — Integration point that creates an alternative container builder from IServiceCollection and produces the final provider.
- `ServiceCollection` — The built-in mutable implementation of IServiceCollection.
- `ServiceDescriptor` — One registration describing service type, implementation form, lifetime, and optional service key.
- `ServiceLifetime` — Enum selecting when an implementation instance is reused and its disposable result is released.
- `ServiceLifetime.Singleton` — One instance per built provider; shared calls must be safe under concurrency.
- `ServiceLifetime.Scoped` — One instance per explicit scope; request scopes are common in web applications.
- `ServiceLifetime.Transient` — A new instance is requested each time the service is resolved; disposable transients are still captured for scope disposal.
- `AddSingleton` — Registers a singleton descriptor; overload shape determines whether a type, factory, or prebuilt instance is supplied.
- `AddScoped` — Registers a per-scope descriptor.
- `AddTransient` — Registers a per-resolution descriptor.
- `AddSingleton<TService, TImplementation>` — Maps a service abstraction to a container-constructed singleton implementation.
- `AddScoped<TService, TImplementation>` — Maps a service abstraction to a container-constructed scoped implementation.
- `AddTransient<TService, TImplementation>` — Maps a service abstraction to a container-constructed transient implementation.
- `AddSingleton<TService>(Func<IServiceProvider,TService>)` — Singleton factory registration; provider dependencies are resolved from the provider that creates it.
- `AddScoped<TService>(Func<IServiceProvider,TService>)` — Scoped factory registration; the factory is invoked once for that service within each scope.
- `AddTransient<TService>(Func<IServiceProvider,TService>)` — Transient factory registration invoked each time this service is resolved.
- `AddSingleton<TService>(TService)` — Registers an existing instance. Since the container did not create it, the registering code owns its disposal.
- `AddSingleton<TImplementation>` — Registers the implementation type as both service and implementation type; repeated registrations do not represent distinct service abstractions.
- `AddScoped<TImplementation>` — Registers a type as its own scoped service.
- `AddTransient<TImplementation>` — Registers a type as its own transient service.
- `TryAddSingleton` — Adds the singleton only when the service type has no prior registration.
- `TryAddScoped` — Adds the scoped service only when one is not already registered.
- `TryAddTransient` — Adds the transient service only when one is not already registered.
- `TryAddEnumerable` — Adds a multi-service descriptor unless that implementation type is already registered for the service type.
- `TryAdd` — Adds a descriptor only if the service type is not registered.
- `Replace` — Replaces a service registration matching the supplied descriptor/service type.
- `RemoveAll<TService>` — Removes registrations for the selected generic service type.
- `RemoveAll(Type)` — Removes all registrations matching a runtime service type.
- `ServiceDescriptor.Singleton` — Descriptor factory for singleton lifetime registrations.
- `ServiceDescriptor.Scoped` — Descriptor factory for scoped lifetime registrations.
- `ServiceDescriptor.Transient` — Descriptor factory for transient lifetime registrations.
- `ServiceDescriptor.Describe` — Creates a descriptor from explicit service type, implementation form, and lifetime.
- `ServiceDescriptor.DescribeKeyed` — Creates a keyed descriptor from service type, key, implementation form, and lifetime.
- `ServiceDescriptor.KeyedSingleton` — Keyed descriptor factory for singleton lifetime.
- `ServiceDescriptor.KeyedScoped` — Keyed descriptor factory for scoped lifetime.
- `ServiceDescriptor.KeyedTransient` — Keyed descriptor factory for transient lifetime.
- `ImplementationType` — Descriptor property naming the implementation type the container constructs.
- `ImplementationFactory` — Descriptor factory delegate used to create the service from a provider.
- `ImplementationInstance` — The already-created object held by the descriptor; its creator retains disposal ownership.
- `ServiceDescriptor.ServiceType` — The type requested by consumers during resolution.
- `ServiceDescriptor.Lifetime` — The reuse/disposal lifetime stored on the descriptor.
- `Multiple service registrations` — The same service type can have many descriptors; preserve intentional order and inspect which resolution shape the consumer uses.
- `Last-registration single-service resolution` — For repeated registrations of one unkeyed service, resolving one returns the last matching registration.
- `IEnumerable<T> multiple-service resolution` — Resolves all matching registrations in registration order, not just the last one.
- `Open generic service registration` — Registers a generic type definition so later closed service types can be constructed from it.
- `Open generic implementation registration` — Maps a generic implementation definition to a generic service definition; constraints and arity must be compatible.
- `Factory-based registration` — Uses a synchronous delegate to build an instance from dependencies and explicit configuration.
- `Instance-based registration` — Supplies an existing object and changes container disposal ownership.
- `Service registration order` — Order matters for multiple services; the last wins for singular resolution and all appear in IEnumerable<T>.
- `IServiceCollection.Add` — Appends a ServiceDescriptor and therefore affects later resolution order.
- `IServiceCollection.Insert` — Inserts a descriptor at a chosen position and can deliberately change ordering.
- `IServiceCollection.Remove` — Removes a matching descriptor object from the service list.
- `IServiceCollection.RemoveAt` — Removes the descriptor at a list index; ensure indexes remain valid as registrations change.
- `IServiceCollection.Clear` — Removes all registrations; doing this after framework setup can remove required services.
- `IServiceCollection indexer` — Reads or replaces a descriptor at an index in the mutable registration list.
- `AddOptions` — Registers the services that support the options configuration pattern.
- `AddLogging` — Registers logging abstractions/providers needed by the app.
- `AddHttpClient` — Registers HttpClientFactory services and related configuration.
- `AddDbContext` — Registers EF Core context services, commonly scoped to a unit of work/request.
- `AddHostedService` — Registers an IHostedService implementation as a hosted, application-lifetime service; create scopes inside long-running work when scoped dependencies are needed.
- `Registering an implementation instance disposal responsibility` — The code that creates/supplies an instance should dispose it; instance registration does not transfer ownership to the container.
- `TryAddEnumerable duplicate implementation handling` — Deduplication is by service/implementation registration identity, enabling library registration modules to coexist.

## Cross-item comparison

A type registration delegates construction to the container; a factory is for composition that depends on a provider or explicit key; a supplied instance is already constructed and externally owned. `Add` appends, `TryAdd` avoids a service-type duplicate, `TryAddEnumerable` avoids duplicate implementations while retaining a multi-service set, and `Replace`/`RemoveAll` intentionally alter the set. Singular resolution selects the last matching registration; `IEnumerable<T>` exposes all in order.

## Examples

The registration list intentionally contains two implementations. Singular resolution uses the last, while an enumerable lets a caller run both in registration order:
```csharp
var services = new ServiceCollection();
services.AddScoped<IFormatter, PlainFormatter>();
services.AddScoped<IFormatter, HtmlFormatter>();
using var provider = services.BuildServiceProvider();
using var scope = provider.CreateScope();
IFormatter selected = scope.ServiceProvider.GetRequiredService<IFormatter>();
IEnumerable<IFormatter> all = scope.ServiceProvider.GetServices<IFormatter>();
```
The containing file needs definitions for `IFormatter`, `PlainFormatter`, and `HtmlFormatter`. In an application, let the host build the provider once; this standalone fragment creates one provider only to illustrate registration semantics.

## Common mistakes

Avoid registering a service under its implementation type when consumers need multiple distinct implementations of one abstraction. Do not assume a factory registration transfers ownership for an object captured from outside. Avoid hidden order dependencies unless documented; prefer `IEnumerable<T>` for a pipeline and keyed selection for a named choice. Use `TryAddEnumerable` for library modules that can be included more than once.

## Knowledge checks with answers

1. **What does a descriptor record?** Service type, implementation/creation form, lifetime, and optional key.  2. **What does one-service resolution choose from repeated registrations?** The last matching descriptor.  3. **What does `IEnumerable<T>` do?** Returns all matches in registration order.  4. **Who owns a supplied instance?** Its creator/registering code generally does.  5. **Why use `TryAddEnumerable`?** To register a pipeline/collection while avoiding duplicate implementation entries.

## Sources

[Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration)
[IServiceCollection](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.iservicecollection)
