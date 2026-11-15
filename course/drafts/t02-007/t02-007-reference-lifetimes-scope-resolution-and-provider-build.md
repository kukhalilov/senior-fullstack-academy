# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Reference: Lifetime semantics, scope creation, validation, and service resolution

## Scope and version

This group covers the boundary that determines reuse and disposal. A scope is independent, not a child of another scope. Request processing usually creates scopes, while background work must create its own. [DI guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

## How this group fits the mental model

The resolution provider matters as much as the registered lifetime. Singleton graphs cannot hold request scope state; root resolution can retain scoped services and disposable transients. Validate and exercise real paths, and keep required dependencies visible in constructors.

## Supplied names explained

- `Transient lifetime` — Fresh service instance per resolution graph; cheap stateless objects often fit. Dependencies can still be shared according to their own lifetimes.
- `Scoped lifetime` — One service instance per scope. A web request normally has a scope, but scopes can also be created explicitly for background work.
- `Singleton lifetime` — One service instance per provider. Its graph remains rooted and must tolerate concurrent calls and long-lived configuration/state.
- `Root service provider` — Application-lifetime provider from which scopes are created; resolving scoped/disposable transients here can retain them until shutdown.
- `Root scope` — The root provider behaves as the longest-lived scope; it is not a request or unit-of-work boundary.
- `Request scope` — Framework-created scope for one request; scoped services share within it and are released at request completion.
- `IServiceScopeFactory` — Singleton-safe factory for creating independent service scopes.
- `IServiceScope` — Synchronous scope object exposing its provider and disposal boundary.
- `IServiceScope.ServiceProvider` — Provider that resolves services within this scope.
- `IServiceScope.Dispose` — Ends the scope and synchronously disposes captured scoped and transient disposables.
- `IAsyncServiceScope` — Async-disposable scope abstraction for work whose dependencies may require asynchronous cleanup.
- `IAsyncServiceScope.DisposeAsync` — Ends the scope and awaits cleanup of async-disposable services.
- `IServiceProvider.CreateScope` — Creates an independent scope from a provider.
- `IServiceProvider.CreateAsyncScope` — Creates an async-disposable scope.
- `IServiceScopeFactory.CreateScope` — Creates a new scope; preferred dependency for long-lived workers that need scoped services.
- `IServiceScopeFactory.CreateAsyncScope` — Creates a new scope intended for awaited async disposal.
- `IServiceProvider.GetService(Type)` — Optional runtime-type resolution returning null when no service is registered.
- `IServiceProvider.GetRequiredService<T>` — Required generic resolution; throws when the service cannot be resolved.
- `IServiceProvider.GetServices<T>` — Resolves the registered set of T services as an enumerable.
- `IServiceProviderIsService` — Capability probe for whether a service type can be supplied by the provider.
- `IServiceProviderIsService.IsService` — Tests provider support for a service type without resolving its instance.
- `ServiceProviderOptions` — Controls validation behavior when building the default provider.
- `ServiceProviderOptions.ValidateScopes` — Enables checks for resolving scoped services from the root or capturing scoped services in singletons.
- `ServiceProviderOptions.ValidateOnBuild` — Validates many service call sites during provider build; it cannot execute arbitrary factory branches or prove all runtime/open-generic paths.
- `ServiceCollectionContainerBuilderExtensions.BuildServiceProvider` — Builds a provider from the collection. Application setup should build once through the host, not repeatedly inside registration code.
- `BuildServiceProvider inside ConfigureServices anti-pattern` — Creates a second provider and potentially duplicate singleton graphs/ownership; use provider-aware registration overloads instead.
- `Scope validation` — Runtime/build checks help catch invalid scope relationships, especially singleton-to-scoped dependencies.
- `Captive dependency` — A longer-lived service retaining a shorter-lived service beyond its intended scope.
- `Scoped service injected into singleton` — Invalid lifetime capture; inject IServiceScopeFactory and resolve scoped dependencies inside a bounded operation.
- `Scoped service resolved from root provider` — Uses the wrong boundary and may retain it until root disposal; create/use a scope.
- `Singleton dependency graph` — Every reachable dependency must be valid for the singleton lifetime and safe under concurrent use.
- `Transient captured by singleton` — Though registered transient, this object is retained as long as its singleton owner and may receive concurrent calls.
- `Scope is not hierarchical` — A scope created inside another has independent lifetime and service instances; parent disposal does not define child semantics.
- `Child scope independence` — Scopes are independent boundaries rather than nested/parent-child resource graphs.
- `Per-request scoped service` — One instance reused within an HTTP request scope, isolated from other request scopes.
- `IHttpContextAccessor singleton service` — Accessor is registered as singleton but exposes current context through async-local mechanics; do not store request context in singleton fields.
- `BackgroundService scoped dependency pattern` — Inject a scope factory, create a scope per iteration/work item, resolve the scoped dependency, await work, and dispose in finally/await using.
- `IHostedService scope factory pattern` — Long-lived hosted services should create scopes explicitly rather than constructor-injecting scoped services.
- `IServiceScope disposal boundary` — Disposal of the scope owns cleanup for container-created scoped and captured transient instances.
- `Asynchronous scope disposal` — Use async disposal when contained services implement IAsyncDisposable; it awaits their cleanup.
- `Service provider replacement` — Use the framework container factory integration point when an alternative provider is genuinely required.
- `DefaultServiceProviderFactory` — Builds the framework's built-in provider from IServiceCollection and provider options.
- `Service resolution failure` — Occurs when no applicable descriptor exists or the dependency graph cannot be constructed.
- `Unregistered service exception` — Required resolution fails clearly when no registration can satisfy the service.
- `Circular dependency resolution exception` — A cycle in constructor/factory dependencies prevents graph construction; break the cycle through design rather than hidden locator calls.
- `Constructor selection` — The container chooses a public constructor whose parameters it can resolve.
- `Greediest resolvable public constructor` — Constructor activation prefers the resolvable constructor with the most parameters; avoid overload ambiguity.
- `Ambiguous constructor exception` — Occurs when constructor candidates with equal preference cannot be selected unambiguously.
- `ActivatorUtilities` — Helpers for activating unregistered types while sourcing dependencies from a provider.
- `ActivatorUtilities.CreateInstance` — Constructs a type with provider-supplied dependencies plus explicit arguments; caller owns the returned object if not registered.
- `ActivatorUtilities.CreateFactory` — Creates a reusable activator delegate for a target type and explicit argument types.
- `ActivatorUtilities.GetServiceOrCreateInstance` — Resolves a registered service if present, otherwise creates an unregistered instance.
- `ActivatorUtilitiesConstructorAttribute` — Marks the constructor ActivatorUtilities should prefer when constructor selection needs explicit direction.
- `ActivatorUtilitiesConstructorAttribute constructor selection` — Selects an intended activation constructor; it does not change ordinary service registration ownership.
- `IServiceProvider.GetService resolution path` — Resolution follows the provider/scope and descriptor set; using it throughout business code hides dependencies.
- `Service locator pattern` — Runtime arbitrary lookup through IServiceProvider instead of declaring dependencies; reduces clarity and testability.
- `IServiceProvider in application service` — Usually indicates hidden dependencies; prefer constructor injection unless resolving genuinely optional/plugin-selected services.
- `IServiceProvider in factory delegate` — Appropriate for composition factories to resolve dependencies; keep factory synchronous and bounded.

## Cross-item comparison

Transient means new per resolution, scoped means one per scope, singleton means one per provider. A longer-lived owner may capture a shorter-lived instance and thereby promote its practical lifetime. `ValidateScopes` checks common scope violations; `ValidateOnBuild` checks many graphs but cannot prove arbitrary factory branches or every open-generic use. Create an explicit scope for background units of work; scopes are not nested.

## Examples

A worker should open a scope for each item rather than capturing a scoped repository in the worker constructor:
```csharp
public async Task ProcessAsync(IServiceScopeFactory scopeFactory, CancellationToken token)
{
    await using var scope = scopeFactory.CreateAsyncScope();
    var handler = scope.ServiceProvider.GetRequiredService<IWorkHandler>();
    await handler.ProcessNextAsync(token);
}
```
`IWorkHandler` is assumed to be registered with an appropriate scope lifetime. The compiler requires the handler contract and implementation elsewhere. A scope is disposed after the call even if processing throws.

## Common mistakes

Never inject scoped request state into a singleton. Do not resolve disposable transients from root. Do not make nested scopes responsible for each other. Constructor overload ambiguity and circular graphs fail at activation; solve the design graph rather than adding `IServiceProvider` everywhere. BuildServiceProvider inside registration creates duplicate singleton graphs.

## Knowledge checks with answers

1. **What is scoped lifetime?** One instance per independent provider scope.  2. **Are scopes hierarchical?** No.  3. **How does a worker use scoped services?** Create/dispose a scope per unit of work.  4. **What is captive dependency?** A long-lived owner retains a shorter-lived dependency.  5. **What can ValidateOnBuild miss?** Arbitrary factory paths and some open-generic constructions.

## Sources

[DI overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)
[DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)
[ServiceProviderOptions](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.serviceprovideroptions)
