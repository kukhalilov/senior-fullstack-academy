# DbContext service lifetimes configuration and providers — Big-picture orientation and mental model

## Problem and purpose

An application needs a disciplined boundary around database work: construct a context with the right provider and configuration, use it to query/change one unit of work, persist, and dispose it. Poor lifetime choices cause stale tracked entities, concurrency failures, leaked resources, and tests that behave unlike a production database.

## Plain-language mental model

Treat `DbContext` as a short-lived workbench for one database unit of work. It knows how to translate LINQ through one configured provider, tracks entities when requested, coordinates changes, and owns short-lived connection/identity-map state. The dependency injection container or a factory decides when that workbench is created. A provider supplies the database-specific translation and update behavior. Configuration wires those pieces together; migrations manage schema history separately from the context's normal query/save work.

The current released major version is EF Core 11.0.0, shipped with .NET 11 on 2026-11-10. Microsoft's release-planning page still displays stale “upcoming” language, so these lessons use the final [official .NET 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/11.0.0.md) and the [EF Core release documentation](https://learn.microsoft.com/en-us/ef/core/what-is-new/).

## How the parts fit together

1. Register options and a provider, usually through `AddDbContext<TContext>` in the application composition root.
2. Let dependency injection create a scoped context for a web request when one request is one unit of work.
3. Use a factory when the scope outlives a unit of work or multiple independent contexts are needed inside one scope.
4. Keep each context single-threaded and short-lived; await each database operation before reusing it.
5. Choose a provider whose capabilities and version match the database, then test database-specific behavior against that provider.
6. Use migrations for versioned schema evolution. `EnsureCreated` is a different create-from-model path and cannot be layered onto a migration-managed database.

## Concept map

| Concern | Mechanism | Decision |
|---|---|---|
| Work boundary | `DbContext` and change tracker | How long does this unit of work live? |
| Creation | DI registration or context factory | Does scope lifetime match the unit of work? |
| Reuse optimization | Context pooling | Is construction measured as a bottleneck, and is context state safe to reuse? |
| Translation/storage | EF Core provider | Which database semantics and provider version are required? |
| Cross-cutting behavior | Options, logging, warnings | What is safe to expose and which warnings should fail early? |
| Schema lifecycle | Migrations versus `EnsureCreated` | Is schema evolution tracked and deployable? |

## End-to-end walkthrough

An HTTP request loads an order, applies a business rule, saves it, and ends. A request-scoped `DbContext` tracks that order and saves the change. If the handler starts two queries with `Task.WhenAll` on the same context, the operations overlap and EF Core does not support that; create separate contexts for genuinely parallel units. If a Blazor circuit or background worker lives much longer than one database operation, inject `IDbContextFactory<TContext>`, create a context per operation, and dispose it. For high-throughput workloads, measure first; pooling can reduce allocation but makes per-request state unsafe unless it is reliably reset. The provider still determines SQL translation and database behavior in every case.

## When to use it and tradeoffs

Use scoped `AddDbContext<TContext>` for ordinary request-per-unit-of-work applications. Use a factory when the app scope is longer than a database unit of work, when an operation must own/dispose its context explicitly, or when independent work must run in parallel. Use pooling only after measurement and with strict state hygiene. Prefer the production relational provider for behavior tests; the InMemory provider is not a relational substitute. Keep sensitive-data logging limited to trusted development environments.

## What later lessons cover

The reference lessons enumerate creation/lifetime APIs and provider/options features. Practice covers scope mismatch, concurrency, pooling, and schema initialization choices. Interview questions focus on why a context is short-lived, why it is not thread-safe, how providers affect portability, and why migrations differ from `EnsureCreated`.
