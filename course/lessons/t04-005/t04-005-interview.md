# LINQ translation server client evaluation and IQueryable — Interview questions and reasoning

Source basis: Microsoft [querying](https://learn.microsoft.com/en-us/ef/core/querying/), [client/server evaluation](https://learn.microsoft.com/en-us/ef/core/querying/client-eval), [providers](https://learn.microsoft.com/en-us/ef/core/providers/), [EF10 translation changes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-10.0/whatsnew), and [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Core questions

1. What is the difference between `IQueryable<T>` and `IEnumerable<T>`?
2. When does an EF LINQ query execute?
3. How does EF determine which expressions run on the database?
4. Why does a helper method inside `Where` fail while one in `Select` may work?
5. Explain `First`, `FirstOrDefault`, `Single`, and `SingleOrDefault`.
6. Compare `ToListAsync` and `AsAsyncEnumerable`.
7. What does `ToQueryString` prove, and what does it not prove?
8. What are `AsEnumerable` and `AsAsyncEnumerable` boundaries?
9. How can query shape affect EF compilation/database plan caches?
10. What changed for parameterized collections in EF Core 10?
11. Which current join operators are added in .NET 10/11, and what caveat remains?
12. How would you translate a custom domain method into SQL?
13. How do null semantics and collation affect apparently simple string comparisons?
14. How do EF Core 11 GroupBy and MaxBy/MinBy changes affect query design?

## Concise interview answers

1. `IQueryable` carries an expression tree and provider; `IEnumerable` represents local sequence processing. After an enumerable boundary, subsequent operators execute in .NET.
2. On enumeration or a terminal/materialization operator such as `ToList`, `First`, or `Count`.
3. EF/provider translates supported expression nodes. Captured values can be parameters; top-level projection can include client work; unsupported server-required expressions generally throw.
4. EF allows client evaluation in the final projection but rejects untranslatable predicates elsewhere to avoid silently fetching all rows.
5. `First` requires one-or-more and returns first; `FirstOrDefault` permits none; `Single` requires exactly one; `SingleOrDefault` permits zero but rejects multiple.
6. `ToListAsync` buffers all rows; `AsAsyncEnumerable` streams when enumerated, keeping the context/connection in use.
7. It renders provider SQL/debug text without executing or proving runtime success/performance.
8. They switch subsequent operators to local LINQ-to-Objects/async-enumerable processing; apply selective server work first.
9. Stable parameterized shapes can reuse EF compilation and database plans; dynamically embedded constants can create cache churn/pollution.
10. EF10 changed default scalar-parameter translation with padding and exposes controls because plan quality depends on cardinality/provider/workload.
11. .NET10 has `LeftJoin`/`RightJoin`; .NET11 has `FullJoin`; EF translation still depends on EF/provider support.
12. Use a supported `EF.Functions` provider method or map to a real database function with `DbFunction`; custom method translators are provider-level extension points.
13. SQL null has three-valued logic and collation affects string equality/order/index use. EF may add null compensation, but database/provider semantics need integration testing.
14. EF11 improves some GroupBy query shapes and translates MaxBy/MinBy where supported; verify exact provider translations rather than assuming all groupings materialize server-side.

## Deep follow-up answers

Deferred execution describes the database query's consumption boundary; query construction still allocates/composes expression objects and may run application code to produce captured parameter values. A `ToQueryString` inspection does not send the command. Logging and database plans are needed to see actual command parameters, execution, and physical performance.

The server/client decision is a data-movement decision. For client work, first filter, order, project, and bound on the server. `AsEnumerable` does not immediately buffer but changes downstream operator semantics; `AsAsyncEnumerable` allows incremental consumption but holds resources and can fail midstream. `ToListAsync` is simpler for bounded results but memory grows with result size.

Terminal methods encode assumptions. `First` without ordering is not deterministically “first”; `Single` performs an exactly-one assertion and can expose missing database uniqueness constraints. `Any` is the natural existence query; counting every match just to decide nonemptiness may do unnecessary work.

Provider support must be part of the answer. A LINQ expression may compile in C# and translate on SQL Server but fail or behave differently on SQLite/PostgreSQL/Cosmos. Null compensation, collations, date precision, JSON operators, collection parameterization, and SQL functions all require target-provider testing.

EF and database caches are separate. Constant values embedded into a newly built expression can cause EF to compile many expression shapes and cause generated SQL text variation/database plan cache pressure. Parameterizing values preserves shape, but does not guarantee the database has ideal cardinality estimates; EF10 parameterized-collection modes exist because one strategy cannot fit all data distributions.

## Scenario questions

### Scenario: search endpoint becomes slow

The endpoint pulls all products, then runs a custom C# predicate and formats a DTO.

**Strong approach:** Move searchable/ selective predicates, ordering, projection, and pagination to the provider where translatable. Map a database function/indexable normalized column if needed. Only perform a bounded final formatting step locally. Inspect generated SQL, actual plans, row counts, and transfer size.

### Scenario: query works in unit test but fails in production

The in-memory provider executes a custom method in a filter; relational provider throws.

**Strong approach:** The in-memory provider does LINQ-to-Objects and is not translation evidence. Test the relational provider/version or containerized target database and keep unsupported client work explicit and bounded.

### Scenario: case-insensitive search

The developer calls `ToLower()` on a column in every filter.

**Strong approach:** Check database collation and desired locale/normalization semantics; applying a function to an indexed column can prevent index use. Consider an appropriate column/database collation or normalized indexed column, and verify SQL/plan with real data. Do not assume C# casing equals database collation.

### Scenario: new .NET join code fails to translate

**Strong approach:** Verify target framework, EF Core major/provider compatibility, relational provider package version, and exact translation support. Use a supported equivalent pattern only after verifying its SQL and semantics; add a provider integration test.

## Tradeoffs and alternatives

- Server evaluation reduces data movement and exploits indexes/aggregates; local evaluation can express complex business-only transforms but should operate on bounded projections.
- Streaming lowers buffering but holds connection/context resources; buffering simplifies later access and closes enumeration sooner when context lifetime permits.
- `First` is appropriate for arbitrary top result only if ordering is irrelevant; `Single` asserts uniqueness and should be backed by a database constraint for integrity.
- Provider-specific functions may yield efficient native execution but reduce portability; application code may need provider-specific query branches.

## Common weak answers

- “All LINQ is translated to SQL.”
- “If a query compiles, the provider can execute it.”
- “EF downloads rows when it cannot translate any method.”
- “`ToQueryString` executes the query.”
- “`AsEnumerable` eagerly buffers the table.”
- “No-tracking is related to asynchronous execution.”
- “`First` returns the oldest row.”
- “All providers translate the same LINQ operators.”
- “EF's cache and the database plan cache are one cache.”

## Self-check rubric

Explain the expression/provider boundary, execution point, rows transferred, cardinality/order contract, provider/version assumptions, and the evidence you would collect. Separate compilation success from translation, runtime correctness, and measured query-plan performance.
