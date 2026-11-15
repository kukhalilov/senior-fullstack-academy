# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Interview questions and reasoning

## Core questions

1. What does a service descriptor represent, and how do type, factory, and instance registrations differ?
2. Compare transient, scoped, and singleton lifetimes in terms of reuse, memory retention, and disposal.
3. What is a captive dependency? How would you fix a singleton that needs a scoped repository for each job?
4. How do repeated registrations behave for single resolution and `IEnumerable<T>`?
5. Why should application setup avoid building a second provider inside service configuration?
6. What can `ValidateScopes` and `ValidateOnBuild` detect, and where are their limits?
7. When would you use a keyed service rather than `IEnumerable<T>` or named options?
8. How does `KeyedService.AnyKey` behave on .NET 10 and newer?
9. Who disposes container-created services, supplied instance registrations, and transient disposables resolved from root?
10. What changed in .NET 11 scope/provider disposal, and how should multiple failures be handled?
11. What does DI's thread-safe resolution guarantee, and what does it not guarantee?

## Concise interview answers

1. A descriptor maps a service type to an implementation type, factory, or existing instance with a lifetime and optional key. Type/factory objects are created by the container; an existing supplied instance remains externally owned.
2. Transient creates per resolution, scoped reuses within a scope, and singleton reuses for one provider. Their captured object graphs may live longer than registration labels suggest, and disposal follows the owning scope/provider.
3. A captive dependency is a shorter-lived service retained by a longer-lived owner. A singleton worker should inject `IServiceScopeFactory` and create a scope per operation.
4. Singular resolution chooses the last matching registration; `IEnumerable<T>` gets all matches in registration order.
5. A second provider creates duplicate singleton graphs and competing disposal ownership. Build once through the host.
6. `ValidateScopes` detects common root/singleton-to-scoped mistakes; `ValidateOnBuild` validates many graphs. Neither executes arbitrary factories or proves every open generic/runtime branch.
7. Use `IEnumerable<T>` when processing all implementations; use keyed services when selecting one by an explicit key. Named options select configuration rather than an implementation.
8. `GetKeyedService(KeyedService.AnyKey)` throws on .NET 10+. `GetKeyedServices` with AnyKey enumerates registrations under specific keys, not the AnyKey fallback.
9. The container disposes instances it creates at scope/provider end. The creator owns prebuilt instance registrations. Disposable transients resolved from root are captured until root shutdown.
10. .NET 11 attempts all captured disposals in reverse capture order even after a failure; multiple failures become `AggregateException`. Inspect `InnerExceptions` and do not rely on an early failure to stop cleanup.
11. The built provider/scope can be resolved concurrently. Returned service objects must implement their own synchronization or immutable-state design.

## Deep follow-up answers

### Why does lifetime validation matter?

Without validation, a singleton may capture a scoped context and reuse it across requests, violating isolation and resource assumptions. A transient captured by a singleton also becomes practically long-lived. Use scopes to align object reuse with a real unit of work, not just to silence validation. Scope validation catches common invalid graphs, while runtime factory branches and open generic construction still need deliberate exercise.

### Why are disposable transients dangerous at the root?

The container tracks disposables it creates so it can clean them up. A disposable transient resolved repeatedly from the root is retained for root-provider cleanup, so short logical uses can create long-lived memory retention. Resolve it through a short scope or use a factory-owned limited-lifetime instance whose caller disposes it. Ownership must be unambiguous.

### When do multiple registrations make sense?

They support ordered pipelines such as validators or notification handlers. `IEnumerable<T>` makes the whole set visible to the consumer. If the consumer chooses only one implementation, relying on whichever registration happens last couples behavior to setup ordering; keyed registration can express that choice. Library modules should use `TryAdd` for defaults and `TryAddEnumerable` for duplicate-resistant pipelines.

### What is the difference between `ServiceKeyAttribute` and `FromKeyedServicesAttribute`?

`FromKeyedServicesAttribute` on a constructor parameter selects a keyed dependency. `ServiceKeyAttribute` injects the key used to register/resolve the current keyed service, which lets an implementation adapt to its activation key. The default `FromKeyedServicesAttribute` constructor uses inherited-key lookup; specify an explicit key when inheritance is not the intent.

### What is special about `KeyedService.AnyKey`?

It can be registered as a fallback that matches arbitrary requested keys not handled by a specific registration. It is also used for plural enumeration of specifically keyed registrations. It is not a normal key for a single lookup: .NET 10 changed singular lookup with AnyKey to throw. Resolve fallback behavior with the actual requested key. [.NET 10 keyed-service behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey)

### How should disposal failures be handled?

Write cleanup that is idempotent and normally does not throw. On .NET 11, the provider continues through reverse capture order after a service throws. A single failure is rethrown; multiple failures are aggregated. Catch `AggregateException` before broad exceptions when special handling is required and inspect each inner failure. Do not use one disposal failure as a control-flow mechanism to skip cleanup of other resources. [.NET 11 disposal change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)

## Scenario questions

1. **A singleton stores the first `IHttpContextAccessor.HttpContext` in a field.** Explain why the accessor's singleton lifetime does not make a request context valid as singleton state. Read the current context per operation and do not retain it.
2. **A worker receives a scoped repository in its constructor.** Replace it with `IServiceScopeFactory` and scope per work item.
3. **A disposable operation object must be used by two scoped services and released after one message.** Register it scoped, create a message scope, and let that scope dispose it.
4. **A plugin system needs every registered handler.** Use `IEnumerable<T>` and stable registration order if order is part of the contract; otherwise make ordering explicit in the abstraction.
5. **The app needs one storage implementation by tenant configuration.** Use an explicit key or factory policy, validate the key mapping, and preserve tenant isolation; do not depend on last-registration order.
6. **Shutdown reports an AggregateException.** Log/report every `InnerException`; verify each resource's cleanup path was attempted and make disposal failures actionable.

## Tradeoffs and alternatives

| Approach | Useful when | Main tradeoff |
|---|---|---|
| Constructor injection | Dependency is required and stable | Large constructors can reveal too many responsibilities |
| `IEnumerable<T>` | Consumer intentionally handles a set/pipeline | Order must be defined if behavior depends on it |
| Keyed service | Consumer selects one implementation by explicit key | Keys and fallback semantics become part of composition contract |
| Explicit factory | Object has caller-controlled or limited lifetime | Caller owns disposal and dependency use |
| Alternative container | Built-in container lacks a needed feature | Adds integration, diagnostics, and operational complexity |

## Common weak answers

- “Transient means it is disposed right away.” Container-created disposable transients are captured until their scope ends.
- “Scoped means one per thread.” It means one per scope, often but not inherently an HTTP request.
- “A singleton is thread-safe because DI is thread-safe.” Resolution safety does not synchronize returned objects.
- “Nested scopes are children.” Scopes are independent.
- “AnyKey resolves the fallback.” Use the actual key; singular AnyKey lookup throws on .NET 10+.
- “The first disposal exception stops shutdown cleanup.” .NET 11 continues attempts and aggregates multiple failures.
- “BuildServiceProvider helps me get a service during registration.” It creates another graph with duplicate singleton/disposal state.
- “An instance registration is always container-owned.” A supplied prebuilt instance remains externally owned.

## Self-check rubric

Score 0–2: **0** = incorrect or unsafe; **1** = names the rule but misses ownership/failure implications; **2** = correctly predicts selection, scope, cleanup, and concurrency.

- I can predict singular and enumerable resolution from descriptor order.
- I can explain what object owns and disposes each service instance.
- I can identify a captive dependency and repair it with a bounded scope.
- I can distinguish keyed service selection, AnyKey fallback, and named configuration.
- I can use `ValidateScopes`/`ValidateOnBuild` without treating them as complete proof.
- I can explain .NET 10 AnyKey behavior and .NET 11 aggregate-disposal behavior.
- I can distinguish safe provider resolution from thread-safe service state.

## Sources

[Dependency injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) · [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration) · [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines) · [.NET 10 AnyKey change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey) · [.NET 11 disposal change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)
