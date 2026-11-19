# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Core concepts and how they fit together

## Learning objectives

You should be able to read a registration and predict how instances are selected, reused, and disposed; choose a lifetime from the consumer boundary; spot captive dependencies and root-scope resolution; create scopes for background work; explain keyed and multi-registration resolution; and distinguish container thread safety from service instance thread safety.

## Prerequisites

A class can depend on interfaces or other classes through constructor parameters. A **service type** is what the consumer asks for; an **implementation type** is the concrete class. A **factory** creates an instance, and an **instance registration** supplies one already-created object. A **provider** resolves registered dependencies. A **scope** is a lifetime boundary, not necessarily a tree node beneath another scope.

## Core concepts

### Registration and composition

`IServiceCollection` is an ordered collection of `ServiceDescriptor` entries. A descriptor records a service type, implementation form (type, factory, or instance), lifetime, and, for keyed services, key. Framework `Add...` helpers produce these registrations. Add them during composition, then build the application's provider once through its host/builder. Calling `BuildServiceProvider` inside service configuration creates another graph with separate singleton instances and disposal ownership; use a supported factory registration when setup needs a provider.

Type registrations let the container construct implementations and track their disposal. Factory registrations let you use the provider and explicit inputs, but factories should be fast and synchronous. Instance registrations use an already-created object; disposal responsibility remains with the registering code. `TryAdd` adds only when appropriate; `TryAddEnumerable` avoids duplicate implementation types while supporting multiple implementations. `Replace` and `RemoveAll` deliberately alter registrations. Ordering matters for multi-registration behavior: one service resolves the last registration, while `IEnumerable<T>` includes all in registration order. [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration)

Open generic registration maps a generic service definition to a generic implementation definition so closed service types can be resolved later. It does not mean every generic constraint or factory can be validated at startup; verify the constructed types actually match.

### Lifetimes and scope boundaries

Transient means the container makes an instance per resolution request (within the graph being built). Scoped means one instance per scope. Singleton means one instance per provider. In a web application, each request normally receives a scope; a scoped service is reused inside that request but distinct across requests. In a command-line or worker host, create a scope explicitly when a unit of work needs scoped dependencies.

Scopes are not hierarchical. A scope created while another scope is active is an independent scope, not a child that inherits or disposes with the first. The root provider is the long-lived root boundary. Resolving a scoped service from the root can effectively keep it until root disposal if scope validation is disabled; it is almost always the wrong lifetime boundary.

A **captive dependency** occurs when a longer-lived service captures a shorter-lived dependency. A singleton that directly captures a scoped service can hold request state across requests. A singleton capturing a transient can also promote its practical lifetime and must consider the transient's state and thread safety. Scope validation detects common singleton-to-scoped mistakes, but it is not a substitute for understanding the object graph.

### Resolution, constructors, and validation

The provider builds constructor graphs. Constructor injection keeps required dependencies visible. `GetService` represents an optional lookup and may return null; `GetRequiredService<T>` expresses a required dependency and fails when missing. Resolving from a scope's provider determines the scope for scoped instances. The container selects a usable public constructor with the most resolvable parameters; ambiguous constructors can fail. `ActivatorUtilities` creates objects outside registration while reusing provider dependencies. Do not use `IServiceProvider` as an application-wide service locator when constructor injection can express the dependency.

`ValidateScopes` checks scope misuse (especially resolving scoped services from the root/capturing them in singletons). `ValidateOnBuild` checks many registration graphs when building the provider. These checks have limits: runtime factory logic and some open generic constructions cannot be exhaustively proven before use. Keep them enabled in development/testing and still exercise actual resolution paths. [DI guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

### Disposal and ownership

The container disposes the disposable services it creates when their owning scope/provider ends. Scoped and captured transient disposables belong to their resolution scope; singleton disposables belong to provider shutdown. Dispose a scope to dispose its services, not individual resolved dependencies. Manually disposing a dependency still owned by the container can cause use-after-dispose or a second disposal.

If code supplies an existing instance registration, it generally retains disposal responsibility because the container did not create that instance. Disposable transient services resolved from the root are captured until root shutdown and can accumulate; use an owned factory pattern for short-lived disposable objects or resolve them within a short-lived scope. For async cleanup, use async scope/provider disposal when services implement `IAsyncDisposable`.

If a captured service implements `IAsyncDisposable` but not `IDisposable`, synchronous provider or scope disposal throws `InvalidOperationException`; use asynchronous disposal (`DisposeAsync` or `await using`) so cleanup runs to completion. [DI disposal guidance](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

In .NET 11, the built-in provider attempts cleanup for all captured services in reverse capture order even if one disposal throws. One failure is rethrown; multiple failures become `AggregateException`. Disposal implementations should normally avoid throwing, and error handling must not assume the first failure prevents remaining cleanup. [.NET 11 disposal behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)

### Concurrency and service design

The built-in provider and scope resolution are safe to use concurrently. Resolved objects are not made thread-safe by that guarantee. A singleton's shared mutable state needs its own synchronization or an immutable design. A transient captured by a singleton can also be called concurrently through that singleton. Scoped services generally avoid cross-request sharing, but concurrent operations within one request may still access the same scoped instance.

Do not run async work in constructors or registration factories. Resolve synchronously, then call an async initialization or operation method with explicit error handling. For long-running workers, create a scope per iteration/work item, await the work, and dispose the scope even when the work fails. Do not register request data in `IServiceCollection`; registrations configure the app, while request data belongs to request-scoped state or explicit method parameters.

### Keyed services

A keyed registration adds a service key dimension to the service type. Keys are objects whose equality behavior determines matching. `[FromKeyedServices]` selects a keyed dependency for a constructor parameter; `[ServiceKey]` injects the key used to resolve a keyed service. `KeyedService.AnyKey` has special fallback and enumeration semantics, not ordinary equality semantics. In .NET 10+, single-service lookup with `AnyKey` throws, while plural lookup enumerates services registered under specific keys. Distinguish a keyed implementation choice from named options: one chooses an implementation; the other selects configuration for a service. [.NET keyed services](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) [.NET 10 behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey)

When a library wants to register a keyed default without overriding an application's prior registration for that same service/key, use the `TryAddKeyedSingleton`, `TryAddKeyedScoped`, or `TryAddKeyedTransient` family. A provider may also expose `IServiceProviderIsKeyedService.IsKeyedService(type, key)` for capability checks; checking availability does not guarantee later activation will succeed if construction itself fails. [Keyed registration API](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.extensions.servicecollectiondescriptorextensions?view=net-11.0) [Keyed provider probe](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.dependencyinjection.iserviceprovideriskeyedservice?view=net-11.0)

## Mechanisms and relationships

| Symptom | Likely cause | Corrective direction |
|---|---|---|
| Request data leaks across requests | Scoped dependency captured by singleton or resolved from root | Create a scope per unit of work; keep request-specific state within it |
| Disposable instances accumulate | Disposable transient resolved from root | Resolve within bounded scope or use a factory-owned instance with explicit disposal |
| Different singleton objects appear in one app | Multiple providers built | Build the provider once; use host registrations/factories |
| Wrong implementation is injected | Registration order or wrong keyed/unkeyed lookup | Inspect descriptor order and match the intended key |
| Startup succeeds, later resolution fails | Unvalidated factory/open generic/runtime path | Exercise actual paths and use validation where it can help |
| Singleton race or corrupt state | Container is thread-safe, service is not | Make service immutable/thread-safe or use appropriate shorter lifetime |
| Cleanup stops after one error (older assumption) | Outdated expectation of disposal behavior | On .NET 11, inspect a possible `AggregateException`; all captured services are attempted |

## Worked examples

Two `IFormatter` registrations can model a default and a specialized implementation. Injecting one selects the last registration; injecting `IEnumerable<IFormatter>` lets a pipeline apply both. If the consumer needs to choose one by configuration at runtime, keyed registration may be clearer than relying on order, but the key selection must be explicit and stable.

A hosted worker outlives request scopes. Its safe pattern is to inject `IServiceScopeFactory`, open an async scope around each work item, resolve the scoped service from `scope.ServiceProvider`, await the work, and dispose the scope in `await using`. This bounds connection/context lifetime and guarantees cleanup on success or exception. Do not inject a scoped context into the worker constructor.

For a disposable stream or parser that must live only inside one method, a factory can create it using container dependencies through `ActivatorUtilities.CreateInstance`, then the caller owns and disposes that new object. If the instance is shared among services for a unit of work, register it scoped and let the scope own it instead. Pick one owner.

## Misconceptions and edge cases

- Scoped does not mean “one instance per class”; it means one per provider scope.
- A scope created inside another scope is independent, not hierarchical.
- Transient does not mean disposable immediately; the container captures disposable results it creates until that scope ends.
- The container's resolution thread safety does not protect singleton state.
- An instance supplied to `AddSingleton<TService>(instance)` is not container-created, so ownership differs from type/factory registrations.
- `ValidateOnBuild` cannot execute every runtime factory branch or construct every open generic variant.
- `AnyKey` is a special fallback/enumeration key; it is not valid as a single-service lookup key on .NET 10+.
- A background worker's lifetime is not a request scope. Create explicit scopes per unit of work.
- `IServiceProvider` injected into business logic often hides missing constructor dependencies and makes tests harder.
- DI does not support async constructors or async service registration factories.
- Service decoration is not built into the default container; a library such as Scrutor or explicit composition can provide that behavior.

## Knowledge checks with answers

1. **What does lifetime decide?** Instance reuse and disposal boundary, not thread safety.
2. **Why is singleton-to-scoped capture invalid?** The singleton outlives the scope and can retain request-specific state; validation should catch common forms.
3. **How should a worker use scoped dependencies?** Create and dispose a scope for each unit of work using `IServiceScopeFactory`.
4. **What happens with multiple registrations?** Single resolution gets the last registration; `IEnumerable<T>` gets all in registration order.
5. **Who disposes a supplied instance registration?** The code that supplied the already-created instance generally retains ownership.
6. **What is the difference between container and singleton thread safety?** Provider resolution is safe concurrently; the object must protect its own shared state.
7. **What changed in .NET 11 disposal?** It attempts every captured disposable even when one fails; multiple failures aggregate.
8. **Can `GetKeyedService(KeyedService.AnyKey)` be used to resolve the fallback?** No. In .NET 10+ it throws; resolve with the actual requested key to use an AnyKey fallback.

## Sources

[DI overview](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) · [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration) · [Guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines) · [.NET 10 keyed-service change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey) · [.NET 11 disposal change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)
