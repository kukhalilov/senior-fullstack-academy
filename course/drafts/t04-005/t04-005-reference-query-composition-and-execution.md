# LINQ translation server client evaluation and IQueryable — Reference: IQueryable composition, execution boundaries, and results

## Scope and version

This reference uses Microsoft's [querying guide](https://learn.microsoft.com/en-us/ef/core/querying/) and [provider documentation](https://learn.microsoft.com/en-us/ef/core/providers/). EF Core 10/11 operator support is cross-checked against [EF10 What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew), [EF11 What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew), and [final EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). Exact translation is provider-dependent.

## How this group fits the mental model

Query operators build a provider-readable recipe. Enumeration or a terminal operator executes it. The operator chosen communicates whether the caller wants a sequence, one row, existence, a count, or an aggregate; buffering/streaming determines result consumption and memory behavior.

## Supplied names explained

- **DbSet<TEntity>** — Entity query root for the context; it implements queryable behavior and also exposes entity set operations.
- **IQueryable<TEntity>** — Query abstraction with an expression tree and provider. Operators usually extend a remote-query description instead of executing locally.
- **IQueryProvider** — Interprets/creates query expressions. In EF it connects LINQ expression processing to the selected database provider.
- **Expression tree** — Structured representation of lambda/query operations that a provider can inspect and translate; it is not an arbitrary executable C# method body.
- **LINQ query operator** — Method such as `Where`, `Select`, or `OrderBy` that composes a query. Translation support varies by provider.
- **Deferred execution** — Query construction is delayed until results are enumerated or a terminal operation runs; it does not mean building the expression has no cost.
- **Query execution boundary** — Consumption point that executes the provider query, such as enumeration or a terminal materializer/aggregate.
- **ToList** — Executes synchronously and buffers every returned item into a list.
- **ToListAsync** — Executes asynchronously and buffers all results; pass cancellation where offered. It is unsuitable for unbounded result sets.
- **ToArray** — Executes and buffers the entire result in a new array.
- **ToArrayAsync** — Async buffered array materialization; same full-memory tradeoff as `ToListAsync`.
- **ToDictionary** — Executes and buffers keyed results; duplicate keys throw and full results occupy memory.
- **ToDictionaryAsync** — Async dictionary materialization; duplicate keys still throw and projection/key selector should be server-efficient.
- **AsQueryable** — Wraps an in-memory sequence as an `IQueryable`; it does not convert that data into a database query or move it to a server.
- **First** — Executes and returns the first row or throws if none. Without explicit ordering it does not mean earliest/smallest.
- **FirstAsync** — Async `First`; throws on empty sequence.
- **FirstOrDefault** — Returns first row or default when empty; deterministic meaning requires ordering.
- **FirstOrDefaultAsync** — Async zero-or-first operation.
- **Single** — Asserts exactly one result; throws for zero or multiple rows.
- **SingleAsync** — Async exactly-one contract.
- **SingleOrDefault** — Allows zero or one result; still throws if more than one.
- **SingleOrDefaultAsync** — Async zero-or-one contract.
- **Last** — Returns last row in an explicitly ordered sequence or throws when empty. Relational translation and ordering requirements should be checked.
- **LastAsync** — Async last-row contract; provide deterministic ordering and verify provider translation.
- **LastOrDefault** — Returns last or default; still requires meaningful ordering.
- **LastOrDefaultAsync** — Async last-or-default operation.
- **Any** — Tests whether at least one row exists, with optional predicate; usually translates to an existence query.
- **AnyAsync** — Async existence operation.
- **All** — Tests whether every element satisfies a predicate; true for an empty sequence by universal-quantification semantics.
- **AllAsync** — Async all-match contract; check provider translation for the expression.
- **Count** — Returns a 32-bit count; use when result cardinality fits `int`.
- **CountAsync** — Async 32-bit count.
- **LongCount** — Returns a 64-bit count for potentially larger cardinality.
- **LongCountAsync** — Async 64-bit count.
- **Min and MinAsync** — Aggregate to the minimum scalar value; empty/null/type behavior depends on overload and provider/database.
- **Max and MaxAsync** — Aggregate to the maximum scalar value; distinguish scalar max from selecting the row with maximum key.
- **Sum and SumAsync** — Numeric aggregation; nullable and empty input behavior varies by type/provider translation.
- **Average and AverageAsync** — Numeric average; result type, precision, and empty-input behavior deserve provider/database verification.
- **MaxBy and MaxByAsync** — Select the element with maximal key. EF Core 11 adds translation support for this shape where provider supports it.
- **MinBy and MinByAsync** — Select element with minimal key; EF Core 11 supports translation in supported provider shapes.
- **AsAsyncEnumerable** — Executes/streams results asynchronously when enumerated and makes later async-enumerable operators local; EF's `Where`/`Select` translation stops at this boundary.
- **AsEnumerable** — Treats later operators as LINQ-to-Objects, switching to local execution after database results are enumerated. It does not itself buffer.
- **ToQueryString** — Returns a provider-generated SQL/debug string without executing the query; parameter values/actual command details may differ at runtime.
- **IAsyncEnumerable<T>** — Async streaming contract. Enumeration is incremental, but holds context/connection resources and can fail mid-stream.
- **CancellationToken query overload** — Async EF terminal overloads accept cancellation tokens to cancel provider I/O cooperatively; cancellation is not a transaction rollback guarantee.
- **Streaming query** — Incremental result consumption, typically via `AsAsyncEnumerable`; reduces full-result buffering but keeps database resources occupied during enumeration.
- **Buffered result** — Entire result materialized by `ToList`/`ToArray`/dictionary operators; simpler repeated access but memory proportional to result.
- **Scalar projection** — Selects scalar values rather than entities, reducing columns/materialization and avoiding entity tracking if no entity is included.
- **Anonymous-type projection** — Projects selected values into a compiler-generated result type; entity members included within it can still be tracked.
- **DTO projection** — Projects data into an application-owned read model; typically reduces transfer/tracking overhead and prevents exposing persistence entities directly.
- **Where and Select translation** — Filters and projects. Keep predicates selective and project only required fields; unsupported methods outside top-level projection generally fail.
- **OrderBy and ThenBy** — Establish primary and tie-breaker order. Add a unique tie-breaker when pagination/first/last must be deterministic.
- **Skip and Take** — Offset and limit result rows. Large offsets can be costly and pagination requires stable ordering.
- **Distinct** — Requests duplicate elimination according to provider/database equality/collation semantics; can require sort/hash work.
- **Contains** — May translate to `IN`/`EXISTS` depending on source/shape. Parameterized collection translation changed across EF versions; inspect SQL and plan for large collections.
- **Join and GroupJoin** — LINQ relational join/grouping patterns. The specific expression shape affects translation; use explicit supported patterns and inspect generated SQL.
- **LeftJoin (.NET 10)** — First-class LINQ operator introduced in .NET 10 and translated by EF Core 10 providers that support it; keeps unmatched left-side rows.
- **RightJoin (.NET 10)** — First-class .NET 10 operator retaining unmatched right-side rows; support depends on relational provider.
- **FullJoin (.NET 11)** — First-class .NET 11 operator retaining unmatched rows from both inputs; EF Core 11 translates it for supported relational providers.
- **GroupBy and aggregate translation** — Provider can translate supported grouping/aggregate shapes. EF Core 11 improves selected GroupBy composition/materialization shapes; do not assume arbitrary `IGrouping` materializes on server.
- **Set operators (Concat, Union, Intersect, Except)** — Combine query results with bag/set semantics and type/column compatibility requirements; provider SQL translation varies.

## Cross-item comparison

`First` means at least one; `Single` means exactly one; their `OrDefault` forms permit empty input but `SingleOrDefault` still rejects duplicates. `Any` asks existence; `Count` scans/counts all matches unless optimized. `ToListAsync` buffers; `AsAsyncEnumerable` streams. `AsQueryable` on local data is not EF provider translation. `AsEnumerable` changes downstream operators to client-side work. `LeftJoin`/`RightJoin` arrive with .NET 10, while `FullJoin` is .NET 11; translation remains provider-specific.

## Examples

```csharp
var page = await db.Products
    .Where(product => product.IsPublished)
    .OrderBy(product => product.Name)
    .ThenBy(product => product.Id)
    .Skip(offset)
    .Take(pageSize)
    .Select(product => new ProductCard(product.Id, product.Name))
    .ToListAsync(cancellationToken);

var hasOverdue = await db.Invoices.AnyAsync(invoice => invoice.DueAt < now, cancellationToken);
```

The unique `Id` tie-breaker stabilizes paging. Existence uses `AnyAsync` rather than retrieving/counting all rows.

## Common mistakes

- Calling `ToList()` before filtering, sorting, or projecting.
- Using `Single` when the database does not enforce uniqueness or the input can legitimately have duplicates.
- Using `First`/`Last` without deterministic ordering.
- Treating `ToQueryString` as execution or proof the command succeeds.
- Streaming while retaining a context/connection longer than necessary or starting parallel work on it.
- Converting to `IEnumerable` before a selective filter and moving work to memory.
- Assuming operator existence guarantees every provider can translate it.

## Knowledge checks with answers

1. **Which operator should check whether any row matches?** `Any`/`AnyAsync`.
2. **Which guarantees exactly one?** `Single`/`SingleAsync`.
3. **What is the memory difference between list and async enumerable?** List buffers all results; async enumerable can consume incrementally.
4. **Does `AsQueryable` turn a list into remote database data?** No.
5. **Which first-class join operator is from .NET 11?** `FullJoin`.
