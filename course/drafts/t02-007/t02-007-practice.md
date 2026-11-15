# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Exercises and worked solutions

## Goals

Practice reading registrations as an object graph, choosing lifetimes from ownership and reuse boundaries, creating scopes for long-running work, using keyed registrations precisely, and diagnosing disposal/thread-safety bugs. For each design, state who creates each instance, who may reuse it, which scope owns it, and who disposes it.

## Worked example

Two implementations are registered for one interface:

```csharp
services.AddScoped<IMessageSender, EmailSender>();
services.AddScoped<IMessageSender, AuditSender>();
```

Resolving `IMessageSender` yields the last registration, `AuditSender`. Resolving `IEnumerable<IMessageSender>` yields both in registration order: email, then audit. This behavior is useful for deliberate pipelines, but relying on registration order as an undocumented “priority” makes composition brittle. Use an explicit key when the consumer must choose one implementation by name. [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration)

## Exercises

### Exercise 1 — Resolve the registration set

Given the worked example, state what the constructor receives for one `IMessageSender` and for `IEnumerable<IMessageSender>`. Explain when `TryAddEnumerable` is preferable to `TryAddScoped` for a library that registers an audit participant.

### Exercise 2 — Repair a captive dependency

`InvoiceWorker` is registered as a singleton hosted service. Its constructor receives a scoped `BillingDbContext`. Explain why this is invalid and rewrite the design so each invoice batch receives a fresh scoped context with guaranteed cleanup after success or failure.

### Exercise 3 — Diagnose root-provider retention

A service resolves a transient `IDisposable` from the root provider every time it processes a message. The objects are not disposed until application shutdown. Explain why, then give two designs for bounded cleanup.

### Exercise 4 — Select a keyed implementation

Register a fallback `IStorage` for any key and a special implementation for the key `"archive"`. Show constructor injection for the archive store. Explain what `GetKeyedService` and `GetKeyedServices` with `KeyedService.AnyKey` do on .NET 10 and newer.

### Exercise 5 — Understand .NET 11 disposal failures

Two scoped services are captured in sequence and both throw from disposal. Explain the order and exception result when the scope ends on .NET 11. Describe what an error handler should inspect.

### Exercise 6 — Choose registration ownership

An application creates a singleton instance before registering it with `AddSingleton<TService>(instance)`. A separate implementation is registered by type. Compare creation, cleanup ownership, and what changes if the factory overload is used instead.

### Exercise 7 — Separate DI safety from service safety

A singleton is injected into endpoints and its mutable `Dictionary` is updated by concurrent requests. The team says “the DI container is thread-safe.” Explain why that does not establish safety and propose a better service design.

## Progressive hints

1. Compare singular resolution with collection resolution. `TryAdd` checks service presence; `TryAddEnumerable` protects a multi-service registration set from duplicate implementations.
2. A singleton outlives requests. Make it depend on a scope factory, not the scoped context.
3. The root provider owns captured disposable instances until it is disposed. Create a bounded scope or create a caller-owned object outside the container's tracked graph.
4. AnyKey is special. Use the requested concrete key to invoke a fallback; use plural lookup for enumeration.
5. Cleanup order is reverse capture order. .NET 11 attempts all disposals and aggregates multiple failures.
6. Type/factory registrations are container-created. Supplied instances are already constructed and remain externally owned.
7. Safe concurrent resolution says nothing about simultaneous mutation of one returned object.

## Complete solutions

### Solution 1

The single `IMessageSender` is `AuditSender`, because it is registered last. `IEnumerable<IMessageSender>` contains `EmailSender`, then `AuditSender`. `TryAddEnumerable` is appropriate when a library wants to add one participant to an intentional set but may be registered more than once; it prevents duplicate service/implementation registrations while preserving other implementations. `TryAddScoped` would skip registering the audit implementation if any service of that abstraction already exists.

### Solution 2

A singleton's constructor graph outlives request scopes. Capturing a scoped context makes one unit of work's database state available for the worker's whole lifetime, and scope validation can reject it. Inject `IServiceScopeFactory`, then create/dispose a scope for each batch:

```csharp
public sealed class InvoiceWorker(IServiceScopeFactory scopeFactory)
{
    public async Task ProcessBatchAsync(CancellationToken cancellationToken)
    {
        await using var scope = scopeFactory.CreateAsyncScope();
        var processor = scope.ServiceProvider.GetRequiredService<IInvoiceProcessor>();
        await processor.ProcessBatchAsync(cancellationToken);
    }
}
```

Register `InvoiceWorker` with the hosted-service pattern and `IInvoiceProcessor`/`BillingDbContext` with appropriate scoped registrations. `await using` disposes the scope even when processing throws. [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

### Solution 3

Disposable transients created through the root provider are captured for cleanup by that root provider, so repeated message processing accumulates references until shutdown. For bounded cleanup, either resolve the service inside an explicit scope and dispose the scope after each message/batch, or use a factory to create a limited-lifetime disposable outside the tracked service graph and dispose it directly. The second pattern is suitable only when the caller owns its dependencies and lifetime correctly; do not manually dispose an instance still owned by the container.

### Solution 4

```csharp
services.AddKeyedSingleton<IStorage>(KeyedService.AnyKey,
    (provider, key) => new DefaultStorage(key?.ToString() ?? "unknown"));
services.AddKeyedSingleton<IStorage, ArchiveStorage>("archive");

public sealed class Exporter([FromKeyedServices("archive")] IStorage storage)
{
    public IStorage Storage { get; } = storage;
}
```

For a concrete requested key, the specific registration wins; otherwise the AnyKey registration acts as fallback. On .NET 10+, singular `GetKeyedService` with `KeyedService.AnyKey` throws `InvalidOperationException`. Plural `GetKeyedServices` with AnyKey enumerates services registered under specific keys and does not return the AnyKey fallback registration. [.NET 10 behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey)

### Solution 5

The provider attempts cleanup in reverse capture order. On .NET 11 it continues after the first disposal failure, so both services receive a disposal attempt. With two failures it throws `AggregateException` containing both failures; with only one it rethrows that failure. Error handling should check/catch `AggregateException` before a broad handler and inspect `InnerExceptions`. Prefer disposal implementations that do not throw, and never rely on one failure to prevent another resource from being cleaned up. [.NET 11 disposal behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)

### Solution 6

With `AddSingleton<TService>(instance)`, application code created the object before registration and remains responsible for disposing it. With a service-type registration, the container creates the implementation and disposes it at provider shutdown. A factory registration is also container-created for ownership purposes when the container tracks the produced service; keep the factory synchronous and return a fresh object appropriate to singleton lifetime. Do not return an externally owned singleton from a factory unless ownership is deliberately coordinated.

### Solution 7

Provider resolution is thread-safe; the dictionary mutation is not made safe by DI. Prefer immutable state replaced atomically, a thread-safe collection, or synchronization around every compound operation. Also ask whether the service should be singleton at all. A scoped lifetime reduces cross-request sharing, but requests may still run multiple operations concurrently against one scoped object.

## Tests and edge cases

- Resolve one service after two registrations and verify the last is selected.
- Resolve `IEnumerable<T>` and preserve registration order.
- Register a library extension more than once and ensure `TryAddEnumerable` prevents duplicate implementations.
- Enable `ValidateScopes` and verify a singleton cannot capture scoped state.
- Throw from worker processing and confirm its async scope still ends.
- Resolve repeated disposable transients from root and from short scopes; observe the different cleanup boundary.
- Request a specific keyed implementation and an AnyKey fallback with a nonmatching key.
- Confirm singular AnyKey lookup throws on .NET 10+, while plural lookup enumerates specifically keyed registrations.
- Have two disposables throw on .NET 11 and inspect both failures in `AggregateException.InnerExceptions`.
- Concurrently update singleton-owned state and verify synchronization or immutable replacement.

## Reflection questions

1. Which dependency in your object graph has the shortest valid lifetime?
2. Who created each disposable instance, and who owns its cleanup?
3. Does the consumer need one implementation, all implementations, or one selected by a key?
4. Where does each background work item acquire and release its scope?
5. Which service state is shared across concurrent calls?
6. What can `ValidateOnBuild` and `ValidateScopes` prove, and what still requires exercising a runtime path?
7. How does the application report cleanup failures without abandoning later cleanup?

## Sources

[Dependency injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection) · [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration) · [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines) · [.NET 10 keyed-service behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey) · [.NET 11 disposal behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)
