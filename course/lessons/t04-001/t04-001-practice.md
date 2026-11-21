# DbContext service lifetimes configuration and providers — Exercises and worked solutions

## Goals

Choose a correct context owner/lifetime, avoid concurrent context use, identify pooling state leaks, select realistic test providers, and distinguish schema initialization from migration deployment. These exercises follow [Microsoft's context lifetime guidance](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/) and [pooling guidance](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics).

## Worked example

A Blazor Server component injects one scoped `OrdersContext` and keeps it for the user's circuit. After the first query, the component issues two independent refresh queries with `Task.WhenAll` against that same instance. The fix has two parts: inject `IDbContextFactory<OrdersContext>`, create/dispose a context for each operation, and run concurrent operations on separate contexts. If the operations must observe one consistent snapshot or commit atomically, do not assume separate contexts share a transaction; design an explicit database transaction boundary or run sequentially on one context.

## Exercises

1. An ASP.NET Core endpoint injects a scoped `DbContext`, awaits one command, saves, and returns. Is the default registration reasonable? State the conditions that make it so.
2. A background hosted service injects a scoped context in its constructor and stores it for the service lifetime. Identify the lifetime and disposal problem; outline a per-operation solution.
3. A developer starts two queries using the same context and `Task.WhenAll`. Explain the failure mechanism and provide two safe alternatives.
4. A context's constructor stores a tenant ID in a field. The team switches to pooled contexts. Describe the cross-request risk and a safer design direction.
5. Tests use `UseInMemoryDatabase` and pass, but production SQL Server rejects a translated query and enforces a unique constraint. Explain why the test missed both behaviors and how to improve coverage.
6. A project creates its schema with `EnsureCreated`, then later wants to add incremental migrations. Explain the mismatch and what migration strategy is required.
7. All application replicas call `Database.Migrate` concurrently at startup. Identify operational hazards and propose a safer deployment boundary.
8. Production logs show customer identifiers and parameter values after a diagnostics change. Which configuration is the likely cause, and what containment/remediation steps follow?

## Progressive hints

1. Does one request normally correspond to one bounded unit of work? Is the context disposed at scope end?
2. A hosted service is singleton-like; ask who creates a scope or context for each iteration and who disposes it.
3. A context has one state manager/connection workflow and disallows overlapping operations. Choose sequential use or separate contexts.
4. A pooled object can serve a later request; EF cannot reset arbitrary application fields.
5. InMemory is not relational and doesn't run SQL Server translation/constraints.
6. One path has no migration history; the other relies on it.
7. Consider startup races, locks, schema permissions, partial rollout, and expand/contract compatibility.
8. Sensitive-data logging intentionally exposes values for diagnostics; remove the setting and handle any logged data as a potential exposure.

## Complete solutions

1. Yes, for a conventional request-per-unit-of-work endpoint: scoped DI registration creates a context for the request and disposes it at scope end. The endpoint must await operations sequentially on that instance and avoid retaining it beyond the request.
2. Storing the scoped context in a long-lived worker causes a captive dependency, stale tracking state, and incorrect disposal/lifetime. Inject a factory or scope factory, create a context/scope inside each worker iteration, and dispose it before the next iteration. Stop/cancellation should propagate to the operation.
3. Two operations overlap on one non-thread-safe context, so EF may throw `InvalidOperationException`; if overlap escapes detection, state can become corrupted. Either await one query and then issue the next, or create one separately disposed context per parallel operation. Separate contexts have independent tracking/transaction state.
4. The next borrower can inherit the tenant field because pooling resets EF internals, not arbitrary application state. Prefer immutable/shared configuration for pooled options and pass tenant-specific values through a safe per-operation mechanism that is reset/set for every lease; if reliable state reset is complex, avoid pooling that context. Also ensure data isolation is enforced in queries/database security, not only by UI state.
5. The in-memory provider does not translate to SQL Server SQL, enforce the same relational constraints, or reproduce SQL Server behavior. Keep unit tests for business logic, and add integration tests against SQL Server (often a disposable container/database) for translation, unique constraints, transactions, collation, and provider-specific queries.
6. `EnsureCreated` builds a schema from the current model without migration metadata; migrations expect a tracked starting point and ordered history. For a disposable database, drop/recreate it through migrations from a known baseline. For existing data, plan a controlled baseline/adoption migration and validate schema/history; do not apply `EnsureCreated` and then assume normal migration discovery will work.
7. Concurrent startup migration can race, require elevated schema permissions on every app instance, lengthen startup, and leave a partially rolled-out system incompatible with old/new code. Apply migrations through a single coordinated deployment/job or controlled release stage, review scripts, use backward-compatible expand/contract changes, and deploy application versions after schema readiness. Account for provider-specific locking and rollback limitations.
8. `EnableSensitiveDataLogging` is the likely setting. Disable it in production, restrict and rotate access to existing logs, follow incident/data-retention policy for exposed identifiers, and keep structured logs useful with safe correlation/query metadata. Add environment-specific configuration guards and review the logging sink's access/retention.

## Tests and edge cases

- Verify scoped registration is disposed after request/operation completion.
- Exercise cancellation and exceptions to confirm `using`/`await using` disposes contexts.
- Run parallel tests with separate contexts and verify they do not accidentally assume shared transactions.
- Reuse a pooled context across simulated tenant identities and assert no state crosses leases.
- Test migrations from an empty database and from the previous released schema, not only model creation.
- Test transient connection retries with an idempotency/transaction plan; a retry may repeat work.
- Ensure startup/health checks don't treat one successful `CanConnect` call as a lasting guarantee.
- Ensure logs remain free of connection strings, access tokens, and sensitive parameter data.

## Reflection questions

1. What exact event ends each context's unit of work in your design?
2. Which database behavior is not covered by your unit-test provider?
3. If you enable pooling, what state can change per request and where is it reset?
4. Who applies schema changes, with which credentials, and how does the new schema remain compatible during rollout?
