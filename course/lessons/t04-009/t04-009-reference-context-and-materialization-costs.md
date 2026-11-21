# query performance indexes projection pagination split queries and compiled queries — Reference: DbContext pooling, tracking costs, and measured optimization

## Scope and version

Sources: Microsoft [advanced performance topics](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics), [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), and [EF Core 11 release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). EF Core 11.0.0 shipped on 2026-11-10. The exact cost depends on provider, model, workload, and deployment; benchmark your application.

## How this group fits the mental model

After SQL and data volume are reasonable, application-side costs can matter: tracking, materialization, allocations, model initialization, and context setup. These optimizations address specific measured costs; they do not compensate for excessive rows, poor indexes, or network round trips.

## Supplied names explained

- `DbContext pooling` — EF retains disposed context instances in a pool and reuses them, reducing context initialization/allocation overhead in high-throughput scenarios. It does not pool DB connections and requires safe state reset.
- `AddDbContextPool` — DI registration that enables a pool for a context type. `OnConfiguring` runs when each instance is first created, not for every checkout; request-specific state must be injected/reset through a safe pattern.
- `PooledDbContextFactory` — factory API for creating contexts from an EF pool, useful outside direct scoped context injection. Dispose each returned context to return it to the pool.
- `Connection pooling versus DbContext pooling` — connection pooling is usually handled by the ADO.NET/provider driver and reuses physical/logical DB connections; context pooling reuses EF context objects. They address different setup costs and can both be active. EF ordinarily opens a connection for an operation and returns it promptly to the driver pool.
- `Change-tracking snapshot cost` — tracked entities need original-value snapshots or notification-based tracking so EF can detect modifications. Large graphs and mutable values increase memory and detection work; avoid tracking read-only results when it is not needed.
- `AsNoTrackingWithIdentityResolution` — read-only entity query mode that deduplicates instances for repeated keys using a temporary standalone change tracker, without attaching them to the context's tracker. It uses more work than plain no-tracking but can reduce duplicate objects for graph queries.
- `ValueComparer cost` — a configured comparer can define equality, hash, and snapshot semantics for converted or mutable properties. A deep snapshot/comparison may be expensive; correct semantics must come before performance.
- `Materialization cost` — EF reads database values, performs conversions, creates entities/projections, and may wire relationships. Fewer rows/columns and DTO projection can reduce this cost; provider type conversion and object graph size also matter.
- `Large object allocation` — big strings, arrays, JSON, binary values, and large result lists can create allocation and GC pressure. Avoid selecting large data unless needed; streaming can help with list buffering but does not prevent each requested value from being materialized.
- `Internal buffering` — EF/provider may buffer results internally even when application code streams, for example for retrying execution strategies or split queries when multiple active result sets are unavailable. Account for this in memory measurements.
- `Retry strategy buffering` — enabling a retrying execution strategy may require EF to buffer query results so it can replay safely. Large result sets can therefore use more memory than apparent application code suggests.
- `Split-query buffering` — split collection queries may buffer earlier result sets before later commands on providers that cannot keep multiple readers active. The cost depends on provider capabilities and query shape.
- `CancellationToken propagation` — pass cancellation tokens through async query and save APIs so canceled requests can stop waiting/reading when supported. Cancellation is cooperative; provider/database cancellation timing varies and cancellation is not proof that a write did not commit.
- `Async database I/O` — async APIs avoid blocking a thread while waiting on I/O and can improve server scalability. They do not make an individual SQL query inherently faster; provider async implementations and CPU-heavy work have their own tradeoffs.
- `Parallel DbContext instances` — independent concurrent DB operations need separate contexts, normally obtained from DI or a factory. Do not run simultaneous operations on one context; each context has its own unit-of-work/tracking state.
- `DbContext not thread-safe` — a context cannot safely execute overlapping operations or be mutated concurrently. Await each operation before reusing it, or create separate contexts for parallel work.
- `Compiled model` — generated model metadata designed to reduce first-use model initialization for very large models. It does not speed normal query execution or improve SQL; regenerated output is needed after model changes.
- `UseModel` — options-builder method to use a prebuilt compiled `IModel`. Use the generated model compatible with the context/provider configuration and keep it in sync with source model changes.
- `BenchmarkDotNet database benchmark` — BenchmarkDotNet can measure .NET-side throughput/allocations in a controlled benchmark, but database benchmarks must control data reset, connection state, warm-up, server load, and latency. Do not treat an isolated microbenchmark as production proof.
- `Cold-start measurement` — measure first operation that initializes the model and potentially JITs/compiles query code, separately from context construction and warmed steady-state requests.
- `Warm query benchmark` — compare repeated equivalent executions after model initialization and query-cache warm-up, using realistic parameter distributions and database data.
- `Tail latency measurement` — inspect high percentiles (such as p95/p99) as well as means; pooling contention, database queues, retries, and GC can disproportionately affect slow requests.
- `Optimize after profiling` — preserve a baseline, identify the dominant measured cost, change one factor, and remeasure. If SQL or network dominates, a context pool may not produce a material end-to-end gain.

## Cross-item comparison

`DbContext pooling` and `Connection pooling versus DbContext pooling` target different objects and are independent. `AsNoTrackingWithIdentityResolution` retains per-query deduplication while avoiding context attachment; plain no-tracking avoids that extra identity map. A `Compiled model` targets first-use model initialization, whereas query compilation/cache concerns target query shapes. Cold-start, warm-query, and tail-latency measurements reveal different bottlenecks.

## Examples

If a request includes 5,000 entities but returns only names and IDs, first project those values and bound or stream the result. Do not start with pooling. If a large model's first request is slow but warm requests are acceptable, measure model initialization separately and evaluate a compiled model. If many short requests show measurable context setup overhead after SQL is already fast, benchmark a context pool and verify tenant/request state is overwritten on every checkout and driver state is restored before disposal.

For parallel independent lookups, create a context per operation through `IDbContextFactory<TContext>` and dispose it after use. Do not use `Task.WhenAll` over one scoped context. Pass cancellation tokens, but treat cancellation during writes as an outcome that may need reconciliation.

## Common mistakes

- Pooling contexts before establishing that context initialization matters.
- Assuming EF resets manually changed driver/connection state or application fields.
- Reusing a context concurrently because each LINQ query is a different object.
- Comparing cold first-run performance with warm steady-state runs.
- Expecting `UseModel` to improve SQL execution or a compiled query to reduce database reads.
- Reporting only average latency while rare slow requests dominate user experience.

## Knowledge checks with answers

1. **What does context pooling reuse?** EF `DbContext` instances; it is distinct from provider-managed connection pooling.
2. **Why is mutable tenant state risky with pooling?** One instance may serve different requests; stale state can cause cross-tenant data exposure unless reliably overwritten/reset.
3. **When is a compiled model relevant?** When measured first-use initialization of a very large EF model is significant.
4. **Can cancellation prove a database write was rolled back?** No; cancellation can occur after the server commits or while acknowledgment is lost, so reconcile uncertain outcomes.
