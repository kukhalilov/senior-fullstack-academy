# LINQ translation server client evaluation and IQueryable — Exercises and worked solutions

Source basis: Microsoft [querying](https://learn.microsoft.com/en-us/ef/core/querying/), [client/server evaluation](https://learn.microsoft.com/en-us/ef/core/querying/client-eval), [provider support](https://learn.microsoft.com/en-us/ef/core/providers/), and the [EF10](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew) and [EF11 final release](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md) material.

## Goals

- Identify when a query executes and where each operator runs.
- Make result cardinality and ordering contracts explicit.
- Move expensive filtering and projection to the provider when supported, while keeping deliberate client work bounded.
- Check current operator/provider support and inspect actual SQL/behavior.

## Worked example

Return the latest matching order summary, or no result, with stable ordering and only needed columns:

```csharp
var summary = await db.Orders
    .Where(order => order.CustomerId == customerId && order.Status == OrderStatus.Paid)
    .OrderByDescending(order => order.CreatedAt)
    .ThenByDescending(order => order.Id)
    .Select(order => new OrderSummary(order.Id, order.CreatedAt, order.Total))
    .FirstOrDefaultAsync(cancellationToken);
```

This describes a query until terminal execution. The tie-breaker makes the ordering deterministic. `FirstOrDefaultAsync` communicates zero-or-one intent; it does not enforce uniqueness. The provider still determines exact SQL and null/collation behavior.

## Exercises

1. A query calls a custom `NormalizePhone` method inside `Where`. Predict EF behavior and give two ways to make intent correct.
2. A screen needs 20,000 rows for local formatting. Compare buffering, streaming, and server projection; design a bounded flow.
3. An endpoint asks whether any unpaid invoice exists but calls `CountAsync() > 0`. Choose a better expression and explain why.
4. The application calls `FirstAsync()` without `OrderBy` to get the “oldest” event. Fix the query contract.
5. Explain when `AsNoTrackingWithIdentityResolution` differs from ordinary no-tracking for repeated navigation results.
6. A filter uses a captured list of 5,000 IDs. What should be measured, and what EF10 behavior is relevant?
7. A query with `GroupBy` materializes an `IGrouping` unexpectedly. Explain server translation versus client grouping and how to inspect it.
8. State whether `ToQueryString()` proves the query succeeded or has an efficient execution plan.
9. Name the .NET/EF pair for `LeftJoin`, `RightJoin`, and `FullJoin` in the curriculum's current release line.
10. Dynamic report code builds a new expression with literal constants for every filter value. Explain the cache risk and redesign it.
11. A custom CLR function should run in SQL. Compare top-level projection client evaluation, `DbFunction`, and `IMethodCallTranslator`.

## Progressive hints

1. EF does not know arbitrary method bodies; unsupported filters throw by default. Translate via supported functions or fetch a selective bounded projection and process locally.
2. Project/filter/limit on server, then stream if consumer can process gradually; cap and cancel; buffer only if bounded and repeated access requires it.
3. `AnyAsync` expresses existence and typically lets SQL stop after a match.
4. Add ordering by timestamp plus a unique tie-breaker. Use `First` or `FirstOrDefault` based on whether emptiness is valid.
5. It deduplicates within a query using a temporary tracker, without adding entities to the context tracker.
6. Compare SQL shape, parameter counts, provider limits, plan quality across list sizes. EF10 default parameterized collection mode uses scalar parameters with padding, and can expose modes; this is provider/workload-sensitive.
7. Supported aggregates can run on server; arbitrary `IGrouping` semantics may require client materialization/grouping. Check generated query and test provider output.
8. It only renders a provider SQL/debug representation; it does not execute and does not show actual plan/runtime behavior.
9. .NET10/EF Core10 for left/right; .NET11/EF Core11 for full outer join, where provider supports translation.
10. Use stable expression structure with parameterized values; avoid adding value-specific constants as new query shape nodes.
11. Client projection runs in application; `DbFunction` maps a method to a database function; translator is provider-level extension for custom method translation.

## Complete solutions

1. The provider cannot translate arbitrary `NormalizePhone`; since it occurs in a filter, EF throws rather than silently loading the table. Either normalize/store a queryable canonical column and filter it server-side, or first apply selective server filters/projection/limit and then normalize in memory. A database function mapping is another option if server semantics are defined.

2. First select only required columns and apply selective filtering/paging on the server. Use `AsAsyncEnumerable` for a large but bounded stream if formatting can happen incrementally; ensure connection lifetime is acceptable and cancellation is passed. If the screen truly needs all 20,000 at once for sorting/repeated access, buffer a DTO projection and enforce a resource limit. Do not materialize full entity graphs by default.

3. ```csharp
   bool exists = await db.Invoices.AnyAsync(x => x.Status == InvoiceStatus.Unpaid, cancellationToken);
   ```
   This states existence and usually avoids counting every match.

4. ```csharp
   var oldest = await db.Events
       .OrderBy(x => x.OccurredAt)
       .ThenBy(x => x.Id)
       .FirstOrDefaultAsync(cancellationToken);
   ```
   Use `FirstAsync` if no event is exceptional. The unique key resolves timestamp ties.

5. Plain no-tracking may produce multiple CLR instances for the same database key in a join/include result. Identity-resolving no-tracking deduplicates those result objects via a standalone tracker; context tracking remains absent.

6. Inspect generated SQL and provider parameter limits/plan quality for representative collection sizes. EF10 changed default parameterized-collection translation to scalar parameters with padding to balance SQL/plan reuse and cardinality estimates, and allows choosing alternatives. Large collections may require a different approach (table-valued parameters/temp tables/joins) depending on provider and workload.

7. `GroupBy` in LINQ represents grouped sequences, which a relational result cannot always return directly as nested group objects. Providers translate supported aggregates/keys; unsupported compositions can trigger client grouping or translation failure depending on shape/version. Project keys and aggregates explicitly when possible, inspect SQL, and test actual behavior. EF11 improved selected composition over top-per-group and navigation aggregate shapes; that is not blanket translation of every `IGrouping` operation.

8. No. It is a generated SQL representation and does not execute the query, expose real runtime parameter values, or prove an efficient plan. Execute with representative data and inspect logs/plans.

9. `.NET 10` provides `LeftJoin`/`RightJoin`, translated by EF Core 10 supported providers; `.NET 11` provides `FullJoin`, translated by EF Core 11 supported relational providers. Always verify the target provider/version.

10. Build the expression tree with parameter/captured values, keeping filters/operators structurally stable. EF can then reuse compilation for the same shape and parameterize commands. Test query compilation count and database plan behavior; EF and database plan caches are separate.

11. A final projection may run a client helper after fetching needed values; this is unsuitable if the function must filter/index data at the server. `DbFunction` is an application mapping to an existing SQL function with matching semantics. `IMethodCallTranslator` is a lower-level provider plugin, usually implemented by provider authors/extension packages rather than per-query application code.

## Tests and edge cases

- Assert an unsupported helper in `Where` fails translation and verify the intentional client boundary returns bounded data.
- Test `First`/`Single` empty/duplicate cases and deterministic ordering.
- Compare async and sync execution without overlapping operations on one context.
- Inspect SQL and database plan for small/large parameterized collections.
- Test relevant translation against the real provider, not only EF InMemory.
- Test nulls, collation, precision, and enum/value-converter comparisons.
- Verify query tags contain no credentials or private user data.
- Benchmark buffering and streaming with realistic row counts and consumer speed.
- Check EF10 join operators and EF11 full join/MaxBy/MinBy only for the exact provider package/version.

## Reflection questions

- Where does the query cross from provider expression to local code?
- How many rows/columns are transferred before the boundary?
- Does the terminal operator describe the actual result contract?
- Is ordering stable where pagination or top-row selection depends on it?
- What evidence proves the production provider translates and executes the query efficiently?
