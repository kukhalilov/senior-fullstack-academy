# DbContext service lifetimes configuration and providers — Interview questions and reasoning

The answers align with [Microsoft's DbContext configuration guidance](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/), [pooling guidance](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics), and the [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF Core 11.0.0 shipped with .NET 11 on 2026-11-10; a current release-planning page still contains stale upcoming language.

## Core questions

1. What responsibilities belong to `DbContext`, and why should it be short-lived?
2. Why is `AddDbContext<TContext>` scoped by default in a web application?
3. When would you use `AddDbContextFactory<TContext>` instead?
4. Is `DbContext` thread-safe? What does `Task.WhenAll` change?
5. How does context pooling differ from database connection pooling?
6. What state-reset issue must be considered with pooled contexts?
7. What does an EF Core provider control, and how portable is LINQ across providers?
8. Why is `UseInMemoryDatabase` not an integration test for a relational provider?
9. Compare `EnsureCreated` with `Database.Migrate`.
10. What risk does `EnableSensitiveDataLogging` introduce?

## Concise interview answers

1. It is the unit of work and identity map: it tracks entity state, builds/executes queries through one provider, and persists changes. Keep it bounded to control tracking/memory and resource lifetime.
2. A request commonly forms one unit of work, and the request DI scope naturally disposes one context at the end.
3. When the DI scope is longer than one unit of work, such as Blazor circuits/background operations, or when separate independent contexts are needed.
4. No. Overlapping async operations on one context are unsupported; await sequentially or create separate contexts.
5. Context pooling reuses EF context objects; connection pooling reuses underlying database connections in the driver. They optimize different allocation/resource layers.
6. EF resets its own state, but not arbitrary application fields or driver/connection state. Pooled contexts must not carry tenant/request-specific data between leases.
7. It translates LINQ, maps types, and implements database commands/features. SQL, type, collation, transaction, and translation semantics vary; test important behavior on the production provider.
8. InMemory is non-relational and does not reproduce SQL translation, constraints, transactions, collation, or provider-specific behavior.
9. `EnsureCreated` creates directly from the current model without migration history; `Migrate` applies versioned migrations. They are different schema lifecycle strategies.
10. It can place parameter/entity values and potentially personal or secret data in logs/exceptions; restrict it to controlled development diagnostics.

## Deep follow-up answers

**A request scope is not automatically a transaction.** A scoped context groups tracking and often one logical command, but the database transaction boundary depends on operations/save behavior. For parallel independent contexts, neither tracker nor transaction is shared. State that distinction before promising atomicity.

**Why not make a context singleton?** It would accumulate tracked entities, retain stale state, share mutable internal state across users/requests, and invite concurrent access. A context's intended lifetime is short even if the underlying connection is pooled separately.

**What changes when pooling is enabled?** Construction is amortized by reusing instances, but configuration is stable for the pool. Per-request fields, connection manipulation, and tenant state must be reset before returning a context. Pooling is not a safe first optimization; measure and test reuse boundaries.

**Why can a query pass on one provider and fail on another?** Providers translate expression trees into different database languages and support different functions, types, collations, and null semantics. A provider switch is not just a connection-string change. Test query translation and results against the target database.

**Why should migrations not run as an uncoordinated startup side effect?** Multiple replicas can race, runtime accounts gain schema privileges, startup becomes coupled to schema work, and new schema can break old app instances. A migration job/release stage can serialize changes, review SQL, and use expand/contract compatibility.

## Scenario questions

1. A hosted worker injects a scoped context once in its constructor and runs for weeks. Redesign it and explain disposal.
2. A developer launches two parallel queries on a request context. What would you change if the results must also be a consistent snapshot?
3. An application enables context pooling to fix slow requests, then intermittently returns data for the previous tenant. Diagnose and mitigate.
4. Unit tests use InMemory but production fails on a SQL translation and FK constraint. What test layers are missing?
5. Three replicas apply migrations on startup, while a release changes a required column. Explain how to make the rollout safe.
6. A production log contains SQL parameters after a troubleshooting deployment. What configuration and incident response do you check?

## Tradeoffs and alternatives

Scoped contexts minimize ceremony when request and unit-of-work boundaries align. Factories add explicit ownership and suit long-lived scopes or multiple units of work, at the cost of disciplined disposal. Pooling lowers construction overhead only when measured and increases state hygiene requirements. InMemory enables fast logic tests but cannot verify relational behavior; a real provider/container is slower but more faithful. Startup migration is convenient in simple single-instance development but a dedicated migration stage provides safer production coordination.

## Common weak answers

- “DbContext is just a connection.” It is a mutable unit of work/tracker with provider operations.
- “Scoped means thread-safe.” Scope lifetime says nothing about concurrent access.
- “Async queries can run in parallel because I awaited `Task.WhenAll`.” They still overlap on the same context.
- “Pooling is the same as connection pooling.” They reuse different objects and resources.
- “LINQ makes the database provider interchangeable.” Provider translation and semantics differ.
- “InMemory tests prove the SQL works.” It does not execute relational SQL.
- “EnsureCreated is the easy first migration.” It skips migration history.
- “Sensitive logging is safe if logs are internal.” Internal logs can still expose regulated/user data or secrets.

## Self-check rubric

Score 0 (missing), 1 (partly correct), or 2 (clear and accurate): unit-of-work definition; scoped-vs-factory decision; thread-safety and parallelism; pooling versus connection pooling; provider portability; test-provider limitations; migration lifecycle; sensitive-data logging. A strong answer scores at least 13/16 and gives a concrete lifetime redesign with explicit disposal.
