# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Big-picture orientation and mental model

## Problem and purpose

An application is made of objects that need other objects: an endpoint needs a service, the service needs a repository, and the repository needs a database connection. Dependency injection (DI) records how these objects are built and gives them the right dependencies at the right time. The built-in .NET container also controls instance reuse and cleanup for objects it creates. Its most important decisions are registration, lifetime, scope, and ownership. [Dependency injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection)

DI is not a general object registry, a database, or a way to hide arbitrary lookups inside business logic. It is a composition mechanism: the application describes its object graph at startup, and the framework resolves it when needed.

## Plain-language mental model

Think of a workshop. A registration is a recipe for a tool. Resolving a service asks the workshop to make or retrieve that tool. A **transient** is a freshly made tool for each request. A **scoped** tool is shared by one work session, such as an HTTP request. A **singleton** is shared from application startup to shutdown. A **scope** is a bounded work session with its own scoped instances and cleanup boundary.

The workshop also owns cleanup for tools it creates. If you hand it an already-created object instance, you retain disposal responsibility. Reuse is not thread safety: a singleton may be called by many requests at once and must protect its own mutable state.

## How the parts fit together

| Part | Purpose | Key question |
|---|---|---|
| `IServiceCollection` | Ordered list of service descriptors during composition | Which service type maps to which implementation, factory, or instance? |
| `ServiceDescriptor` | One registration and its lifetime/key | How is the instance created, selected, and owned? |
| `IServiceProvider` | Resolves services from the built graph | Which scope is doing the resolution? |
| Scope | Reuse and cleanup boundary for scoped services | When should scoped objects be released? |
| Lifetime | Controls reuse/disposal timing | Can the consumer live as long as its dependencies? |
| Keyed service | Selects a registration by a key in addition to type | Is there a specific key, fallback, or inherited key? |

The type and registration determine selection. The scope and lifetime determine reuse. Ownership determines disposal. These are separate axes: a service can be correctly registered but resolved from the wrong scope, or have the right lifetime but unsafe shared mutable state. [Service registration](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/service-registration) [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

## Concept map

```text
register service type → implementation / factory / instance
        ↓                         ↓
      lifetime                 service key (optional)
        ↓                         ↓
build one provider → resolve from root or explicit scope
        ↓                         ↓
constructor graph      transient / scoped / singleton reuse
                                  ↓
                         owning scope/provider disposes
```

The built-in container intentionally provides constructor injection, registrations, scope management, keyed lookup, and disposal. Use abstractions only where they clarify a boundary. Avoid building another provider during registration, resolving arbitrary services from `IServiceProvider` throughout application code, or putting request/user data into registrations. [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

## End-to-end walkthrough

Suppose an order endpoint needs an order service and a database context. Register the service and its dependencies once in `IServiceCollection`. The web host builds one provider. When a request begins, the framework creates a request scope. Resolving the endpoint's order service in that scope also resolves the database context in the same scope; another request gets another scoped context. When the request scope ends, scoped disposable services are cleaned up.

Now a background worker needs the same scoped repository. A worker is long-lived, so it should inject a scope factory and create a scope around each unit of work. It must not capture one scoped repository for the worker's entire lifetime. A singleton's dependency graph cannot safely hold request-scoped state. [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)

If two implementations of one interface are registered, a single-service resolution uses the last registration; `IEnumerable<T>` returns all registered services in registration order. If a consumer needs a specific implementation by meaning (for example, a named storage provider), a keyed service can make that choice explicit. A key is an object with equality semantics, so use stable key values and avoid accidental mismatches.

## When to use it and tradeoffs

Use constructor injection for stable dependencies. Register stateless and inexpensive services as transient when per-resolution instances are appropriate; scoped services when a unit of work/request should share and release them together; and singletons only when shared lifetime is intentional and the full graph is safe for concurrent use.

Use keyed services when multiple implementations of one service type coexist and the caller has a clear selection rule. Use `IEnumerable<T>` when the consumer intentionally processes all implementations. Avoid turning every optional dependency into runtime service lookup. If a third-party container feature is required, replace the default provider through the framework extension point; do not create a second provider and then resolve half the application from each.

## Recent version changes

.NET 8 introduced keyed DI registrations and resolution, including `IKeyedServiceProvider`, `[FromKeyedServices]`, and `[ServiceKey]`; it lets one service type have distinct implementations selected by an object key. Later versions refined edge cases: .NET 10 changed `KeyedService.AnyKey` lookup/enumeration behavior, and .NET 11 changed disposal to attempt every captured disposable after a failure, aggregating multiple failures. The core composition and lifetime model is unchanged. [.NET 8 keyed DI](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8/runtime) [.NET 10 keyed-service change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/10.0/getkeyedservice-anykey) [.NET 11 disposal change](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)

## What later lessons cover

The concept lesson builds the object-graph, lifetime, scope, ownership, and concurrency model. Reference lessons then explain registration forms and ordering; provider resolution and validation; keyed services; and disposal/thread-safety design. Practice asks you to repair lifetime bugs and implement safe worker scopes. The interview lesson prepares you to explain tradeoffs and debug common production failures.
