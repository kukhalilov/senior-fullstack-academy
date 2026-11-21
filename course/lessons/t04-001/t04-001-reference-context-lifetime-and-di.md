# DbContext service lifetimes configuration and providers — Reference: DbContext lifetime, factory creation, and dependency injection

## Scope and version

This reference follows the EF Core 11 lesson baseline, cross-checked against [Microsoft's DbContext lifetime/configuration guidance](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/) and [context pooling performance guidance](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics). The API shape is stable across EF Core 10 and 11 unless called out; use the final [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md) for version-specific fixes.

## How this group fits the mental model

The APIs in this group create and configure a short-lived unit-of-work object. DI registration is convenient when a scope matches one unit of work; a factory makes ownership explicit when it does not. Pooling can reuse instances, but the caller still gets a fresh logical unit of work and must dispose it. None of these APIs permits concurrent use of one context.

## Supplied names explained

- **`DbContext`** — EF Core's unit-of-work and identity-map object. It exposes entity sets, tracks changes, creates queries, and coordinates save operations through its configured provider. It is not thread-safe; dispose it after a bounded operation.
- **`DbContextOptions`** — Non-generic base options type consumed by context construction and configuration internals. Most application code uses the typed options form to preserve context/provider typing.
- **`DbContextOptions<TContext>`** — Immutable configuration for a particular context type, usually provided to its constructor by DI or a factory. It carries provider and behavior configuration and prevents accidentally passing options for a different context type.
- **`DbContext constructor`** — A derived context commonly exposes a public constructor taking `DbContextOptions<TContext>` and passes it to `base(options)`. A parameterless constructor is mainly useful for limited scenarios and is not the normal DI pattern.
- **`AddDbContext<TContext>`** — Registers the context and its options in an `IServiceCollection`; the context lifetime is scoped by default. In ASP.NET Core, one request scope commonly corresponds to one unit of work. Its options callback runs when configuration is built; it is not a per-request hook for mutable tenant state.
- **`ConfigureDbContext<TContext>`** — Composes additional options configuration for a context, useful for reusable libraries/tests that add non-conflicting logging/interceptors/settings around an app's registration. Configuration is applied in registration order; later conflicting options take precedence. It does not safely permit two different database providers on the same context instance.
- **`AddDbContextPool<TContext>`** — Registers DI-created contexts backed by a pool; the default retained-pool size is 1024 and can be configured. The context is returned to the pool when disposed. Options and provider configuration are effectively fixed for pooled instances; application-owned mutable state must be reset.
- **`AddDbContextFactory<TContext>`** — Registers `IDbContextFactory<TContext>` for explicit context creation, commonly when DI scope lifetime does not align with database work. Factory-created contexts are not disposed by the container; callers must dispose them.
- **`AddPooledDbContextFactory<TContext>`** — Registers a factory that creates contexts from a pool. It combines explicit factory ownership with pooling reuse and therefore has the same state-reset and stable-options constraints.
- **`IDbContextFactory<TContext>`** — Factory abstraction for creating independent context instances, commonly injected into a long-lived service or component.
- **`IDbContextFactory<TContext>.CreateDbContext`** — Creates a context synchronously. The caller owns and must dispose the result, typically with `using`.
- **`IDbContextFactory<TContext>.CreateDbContextAsync`** — Creates a context asynchronously and accepts cancellation in supported overloads. The caller owns and must dispose the result, typically with `await using`.
- **`Scoped DbContext lifetime`** — One context instance per DI scope. It fits a request-per-unit-of-work design, but a long-lived scope (such as a UI circuit) can make that lifetime much longer than intended.
- **`DbContext is not thread-safe`** — A context does not support simultaneous operations from multiple threads or overlapping async queries. Await each operation before using the same instance again; use separate instances for parallel independent work.
- **`Unit-of-work boundary`** — The bounded operation that loads/changes data, calls save, and disposes its context. It often aligns with a request or command handler, not necessarily with an entire user session.
- **`Dispose DbContext`** — Synchronously releases context-owned resources and ends the unit of work. In a `using` block, disposal occurs even when the operation throws.
- **`DisposeAsync DbContext`** — Asynchronously disposes context-owned resources where async disposal is supported; use `await using` for async workflows.
- **`AddDbContext options lifetime`** — `AddDbContext` accepts context and options service lifetime choices; the default context and options lifetimes are scoped. Changing these lifetimes requires checking that options are safe to share and that dependent services have compatible lifetimes.
- **`DbContext pooling state reset`** — EF resets its internal state before reusing a pooled context, but cannot reset arbitrary state the application changes or external driver/connection state. Restore manually changed state before disposal and do not retain per-request data in a pooled instance.
- **`OnConfiguring`** — Context hook used to configure options; EF calls it regardless of whether options came from DI or explicit construction in ordinary non-pooled creation. Pooled registrations configure options externally and do not provide a per-lease `OnConfiguring` callback. Avoid configuring a conflicting second provider and avoid storing secrets in source.
- **`OnModelCreating`** — Context hook that builds the model metadata (entities, properties, relationships, conventions/customization). EF caches the model; do not treat it as per-request mutable configuration.
- **`DbContext.Set<TEntity>`** — Returns a `DbSet<TEntity>` for querying and working with an entity type, including entity types without a declared `DbSet` property.
- **`DbContext.Database`** — Relational/database facade for connection and database-level operations, transactions, creation/migration calls, and provider capabilities. Exact operations vary by provider.
- **`DbContext.ChangeTracker`** — Exposes the context's tracked entity state manager and change-detection/tracking configuration. Its contents live only as long as the context and can affect memory/query behavior.

## Cross-item comparison

`AddDbContext<TContext>` supplies contexts through a DI scope; `AddDbContextFactory<TContext>` supplies an explicit creator. A factory-created context must be disposed by its caller. The pooled variants reuse context instances but do not extend the logical unit-of-work lifetime or make contexts concurrent. `Dispose`/`DisposeAsync` end ownership; factory creation without disposal leaks resources. `OnConfiguring` configures options; `OnModelCreating` configures the cached model. `DbContext.Database` represents provider/database operations, while `ChangeTracker` is in-memory entity state.

## Examples

```csharp
builder.Services.AddDbContextFactory<OrdersContext>(options =>
    options.UseSqlServer(connectionString));

public sealed class OrderReader(IDbContextFactory<OrdersContext> factory)
{
    public async Task<Order?> FindAsync(int id, CancellationToken cancellationToken)
    {
        await using var context = await factory.CreateDbContextAsync(cancellationToken);
        return await context.Orders.FindAsync([id], cancellationToken);
    }
}
```

The factory owns creation, while the operation owns disposal. For a short request-scoped unit of work, injecting `OrdersContext` registered with `AddDbContext<OrdersContext>` is simpler.

## Common mistakes

- Registering `DbContext` as a singleton or sharing one across parallel operations.
- Assuming a DI scope always matches one database unit of work.
- Forgetting to dispose factory-created contexts.
- Storing a tenant ID or other changing request state in pooled context fields/options.
- Overriding `OnConfiguring` to configure a second provider after DI already selected one.
- Putting per-request model changes in `OnModelCreating`; the model is cached.
- Treating a larger pool as automatically faster; measure allocation and database bottlenecks first.

## Knowledge checks with answers

1. **Who disposes a context returned by `IDbContextFactory<TContext>`?** The caller.
2. **Does pooling make `DbContext` safe for `Task.WhenAll`?** No; each concurrent operation needs its own context.
3. **Which hook configures options and which builds model metadata?** `OnConfiguring` configures options; `OnModelCreating` configures the model.
4. **Why is a scoped context not always right for Blazor Server?** Its DI scope may be a long-lived user circuit rather than one database unit of work.
