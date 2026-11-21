# DbContext service lifetimes configuration and providers — Core concepts and how they fit together

## Learning objectives

Choose a context lifetime based on the unit of work, explain DI and factory registration, identify pooling hazards, distinguish provider responsibilities, configure diagnostics safely, and select schema initialization appropriate to migration management.

## Prerequisites

Know basic C# dependency injection, async/await, LINQ, and relational database concepts. Entity mapping and query translation details are covered in later EF Core topics.

Version status and behavior are checked against the [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md) and [Microsoft's lifetime/configuration guidance](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/).

## Core concepts

**A context is a unit-of-work boundary.** A `DbContext` maintains an identity map/change tracker and coordinates a database provider. It is intended to be short-lived, disposed after a bounded operation, and not used concurrently. It is not a general-purpose cache or a singleton connection manager. An EF-originated `InvalidOperationException` can leave the context unrecoverable; do not catch it and continue issuing operations on that instance.

**DI scopes often match request work, but not always.** `AddDbContext<TContext>` registers a scoped context by default, a good fit when one HTTP request is one unit of work. A scope is a container lifetime, not automatically a business transaction. Background services, Blazor circuits, long-lived UI sessions, and multiple independent operations in one request often need `IDbContextFactory<TContext>` so each operation owns a fresh context and disposes it.

**Async does not make a context concurrent.** Await each operation before issuing another against the same instance. `Task.WhenAll` across queries sharing one context is unsupported. Parallel operations need separate contexts; that also means separate change trackers and units of work, and possibly separate transactions/connections.

**Pooling changes construction, not the unit-of-work contract.** `AddDbContextPool<TContext>` and `AddPooledDbContextFactory<TContext>` reuse context objects after disposal. EF resets its own internal state, but application-owned mutable state and manually changed driver/connection state must be reset. Pooling options are effectively established at registration; do not capture per-request tenant/user state in a pooled context's constructor or `OnConfiguring`. Context pooling is separate from database-driver connection pooling. Measure before accepting these constraints.

**A provider is part of semantics.** A provider translates query expression trees, generates database commands, maps types, and implements provider features. LINQ is not a promise that every query behaves identically across providers. Provider packages often have a major-version compatibility relationship with EF Core; align supported versions and test generated SQL and database behavior. `UseInMemoryDatabase` is a non-relational testing provider: it does not reproduce SQL translation, constraints, transactions, collation, or relational query behavior.

**Options have composition and security consequences.** `DbContextOptions<TContext>` carries provider and behavior choices. Configuration can come from DI, `OnConfiguring`, or explicit construction; `OnConfiguring` is called in all construction patterns. `ConfigureDbContext<TContext>` can compose reusable options with `AddDbContext`, with later conflicting configuration taking precedence. Never enable sensitive-data logging in production by default: logs may expose query values, identifiers, or secrets. Detailed errors improve diagnostics at a cost and should be chosen deliberately.

**Runtime and design-time construction differ.** Application startup can supply configuration through DI, but migration tooling must also construct the context at design time. `IDesignTimeDbContextFactory<TContext>` provides a deterministic design-time path when app-host creation is unsuitable; avoid embedding production secrets in design-time code.

**Database initialization is not migration management.** `EnsureCreated` creates a database directly from the current model and does not create migration history. It is useful for disposable/simple scenarios, but is not compatible with evolving a schema through migrations. `Database.Migrate` applies pending migrations and is commonly run through a deliberate deployment process rather than concurrently by every application replica at startup. `EnsureDeleted` is destructive and belongs only in controlled disposable environments.

## Mechanisms and relationships

For each operation ask: what owns the context; does its lifetime match exactly one unit of work; is there any overlap/concurrency; are options stable for the full context lifetime; is the provider/version appropriate; can logs reveal sensitive values; and who applies schema changes? A factory solves lifetime mismatch, not thread safety within a single context. Pooling solves some allocation overhead, not connection management or long-lived tracking. A provider abstraction hides some SQL details, not database-specific behavior. Migrations version the schema; `EnsureCreated` does not.

## Worked examples

```csharp
builder.Services.AddDbContext<OrdersContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("Orders")
        ?? throw new InvalidOperationException("Missing Orders connection string.")));

public sealed class OrderReader(IDbContextFactory<OrdersContext> contexts)
{
    public async Task<Order?> FindAsync(int id, CancellationToken cancellationToken)
    {
        await using var db = await contexts.CreateDbContextAsync(cancellationToken);
        return await db.Orders.FindAsync([id], cancellationToken);
    }
}
```

The registration creates a scoped context for ordinary injected consumers, and a factory can be registered when individual operations need to control lifetime. Do not register both patterns without a clear consumer/lifetime need. The sample's factory registration is omitted for brevity; add `AddDbContextFactory<OrdersContext>` when that pattern is selected.

```csharp
// Unsafe: both asynchronous operations use one DbContext at the same time.
var ordersTask = db.Orders.ToListAsync(cancellationToken);
var customersTask = db.Customers.ToListAsync(cancellationToken);
await Task.WhenAll(ordersTask, customersTask);
```

Run sequentially on one context, or create a separate context per parallel operation. Separate contexts do not share tracked instances or an implicit transaction.

## Misconceptions and edge cases

- Scoped lifetime is not “one context per user” across multiple requests; it is per DI scope.
- `AddDbContextFactory`-created contexts are application-owned and must be disposed by the caller.
- `OnConfiguring` is called even when options are supplied through DI; avoid configuring a second provider accidentally.
- Pooling does not make `DbContext` thread-safe or make it safe to retain a context for a long time.
- A pooled context must not retain tenant-specific mutable state between borrowers.
- Driver connection pooling and EF context pooling are distinct layers.
- The EF InMemory provider can make tests pass while relational production fails.
- `EnsureCreated` does not initialize migration history; switching later to migrations requires a deliberate database transition.
- `Database.Migrate` on every replica can race; make schema deployment an intentional, coordinated step.
- Connection strings and sensitive logging output must be protected as secrets/data.

## Knowledge checks with answers

1. **Why is one context per HTTP request often reasonable?** A request commonly forms one bounded unit of work and DI scopes that context for disposal at request end.
2. **Can two queries safely run with `Task.WhenAll` on the same context?** No. Use sequential operations or separate contexts.
3. **What is the key pooling hazard?** A reused context may retain application-owned state unless it is explicitly reset; per-request configuration cannot safely be captured as stable pooled configuration.
4. **Does the InMemory provider test SQL translation?** No; use the production relational provider or a representative database for relational semantics.
5. **Can `EnsureCreated` be used as the first migration step and then followed by normal migrations?** Not as a supported migration-managed schema path; it does not create migration history.
