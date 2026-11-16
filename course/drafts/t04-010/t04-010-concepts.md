# raw SQL bulk updates and Dapper comparison — Core concepts and how they fit together

Sources: Microsoft's [SQL queries](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries), [ExecuteUpdate and ExecuteDelete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), [related-data eager loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), and the [Dapper project](https://github.com/DapperLib/Dapper). EF Core 11.0.0 shipped 2026-11-10; its release does not change the core distinction between model-tracked writes and immediate set-based commands.

## Learning objectives

Choose among LINQ, EF raw SQL, set-based DML, and Dapper; parameterize data safely; understand EF mapping/tracking of raw SQL results; preserve transaction and concurrency behavior; and explain when a micro-ORM helps or adds cost.

## Prerequisites

Understand relational SQL, ADO.NET connections/commands/parameters, EF entity mapping, transactions, change tracking, and SQL injection basics. Detailed injection threat modeling is in the security track.

## Core concepts

### Start with the semantic requirement

Use LINQ if it expresses the query and generated SQL is acceptable. EF raw SQL is a targeted escape hatch: SQL is authored by you, then EF may map results and allow composition when the SQL is composable. For entity results, all mapped columns expected by EF must be returned. Scalar/unmapped query results have different mapping and composition rules. A stored procedure call is often non-composable; avoid adding server-side LINQ after it unless provider documentation says it is valid.

Raw SQL is not a free performance upgrade. It can improve a measured translation, or it can lock in a poor plan and make provider upgrades harder. Inspect actual command/plan and keep SQL tests with the application.

### Parameters protect values, not SQL structure

SQL parameters represent values, not identifiers, operators, table names, or keywords. EF interpolated APIs such as `FromSql` accept a `FormattableString` and convert value holes into parameters; explicit `DbParameter` objects provide type, size, precision, scale, and direction control where needed. `FromSqlRaw` and raw command APIs insert supplied SQL text. Parameterize values even in raw SQL, and construct identifiers only from a fixed allow-list. Never treat escaping arbitrary user-provided SQL structure as a reliable policy.

Check the SQL type and facets: implicit type conversion can alter semantics or prevent index use. Stored procedure parameters must match the procedure's expected names/order/types. Avoid logging secrets and parameter values.

### Entity, scalar, and command paths differ

`FromSql` starts from a `DbSet` and returns mapped entity query results with normal EF tracking behavior. Tracking applies unless disabled. `Database.SqlQuery<T>` queries supported scalar or unmapped CLR result types; composition may require aliasing the scalar output as `Value`. Raw variants allow SQL construction and require safe parameter handling. `Database.ExecuteSql` is for commands and reports affected rows, not entity results. Command execution does not materialize or track entities.

Keyless entity types are model-mapped read shapes without entity keys/normal update tracking. `FromSql` entity mappings require expected column names to match mapped column names, regardless of CLR property naming. Keep SQL result shape aligned with mapping and verify against the real provider.

### Set-based operations are immediate and bypass the unit of work

`ExecuteUpdate`/`ExecuteDelete` translate a LINQ filter to set-based database DML. They execute immediately, do not load rows, do not call `SaveChanges`, and do not synchronize tracked instances. Multiple calls are not automatically grouped into one transaction; if they must be atomic, explicitly begin a transaction. Add concurrency-token predicates and check affected-row counts when the business operation depends on them. `SaveChanges` interceptors and per-entity domain logic do not automatically run for these commands.

These methods are supported by relational providers and are constrained by translation support. The `SetProperty` lambda has translation constraints, including navigation restrictions; project needed related values before applying the update if the provider can translate that shape. They are update/delete, not built-in bulk insert APIs. Third-party bulk extensions and provider bulk-copy tools have separate contracts, identity behavior, batching, and transaction semantics.

### EF Core and Dapper occupy different points in the stack

Dapper adds query/command mapping extensions to ADO.NET connections. You write SQL and pass parameters; Dapper maps columns to objects/dynamic rows. It can buffer results by default or return an unbuffered sequence, supports multi-mapping, repeated commands with parameter collections, and explicit dynamic parameters. It does not supply EF's change tracker, model-based relationships, migrations, or LINQ query translation. That gives SQL control and a small mapping layer but moves more query and persistence policy to application code.

A repository abstraction is not mandatory simply to hide EF. It can be valuable when it represents stable domain operations, enables stubbing at a meaningful boundary, or coordinates mixed query implementations. A generic repository duplicating `IQueryable`/DbSet behavior can obscure useful EF semantics. Keep mapping ownership explicit.

### Mixing tools without splitting correctness

EF and Dapper can use the same `DbConnection`. To make several writes atomic, use the same connection and transaction for both; Dapper commands must receive the active transaction. Ensure only one owner disposes a shared connection. Do not execute concurrent commands on a connection/provider that does not support it. Decide which tool owns identity generation, mapping, and retries. An EF transaction does not automatically cover a different connection opened by Dapper.

## Mechanisms and relationships

Decision sequence: confirm the required SQL behavior; try translatable LINQ; inspect SQL and plan; use EF raw SQL if EF mapping/composition is still useful; use Dapper/ADO.NET for a deliberately SQL-first boundary; for set-based writes, decide whether immediate tracker-independent semantics fit; then define transaction, concurrency, and test behavior. Minimize the boundary where custom SQL enters so reviewers can audit values, identifiers, mapping, and provider assumptions.

## Worked examples

Safe EF query with a value parameter:

```csharp
var status = "Open";
var rows = await context.Database
    .SqlQuery<int>($"SELECT [Id] AS [Value] FROM [dbo].[WorkItems] WHERE [Status] = {status}")
    .ToListAsync();
```

The interpolated value becomes a database parameter. If the table or column must vary, select among prewritten SQL fragments from an allow-list; do not concatenate arbitrary request text. For an entity query, use the appropriate DbSet SQL API and return the mapped columns.

Suppose a maintenance task updates old rows and writes an audit record through Dapper. An EF `ExecuteUpdateAsync` followed by Dapper `ExecuteAsync` is two immediately executed operations. If they must commit together, open one EF transaction and pass its underlying connection and transaction to the Dapper command; check failures and affected-row counts. If an execution strategy retries, ensure the whole unit is replayable and idempotent.

## Misconceptions and edge cases

- C# interpolation is not always SQL parameterization. The API receiving it determines whether holes become parameters or literal SQL.
- A SQL parameter cannot stand for a column name or `ORDER BY` direction.
- Stored procedures are not generally composable as subqueries; provider syntax matters.
- Raw entity queries still track by default unless configured otherwise.
- `ExecuteUpdate` is not deferred until `SaveChanges`; it executes immediately and tracked objects may be stale.
- Several set-based calls are not one atomic unit without an explicit transaction.
- Dapper's low overhead does not make a poorly indexed or over-fetching query fast.
- Sharing a connection without sharing the transaction does not make writes atomic.

## Knowledge checks with answers

1. **What is safe to parameterize?** Data values. Identifiers/keywords require fixed allow-listed SQL structure.
2. **Does `FromSql` disable tracking?** No; entity results follow ordinary EF tracking rules.
3. **Does `ExecuteUpdate` call `SaveChanges`?** No; it executes immediately and bypasses change tracking.
4. **What does Dapper contribute?** SQL execution/mapping helpers over ADO.NET connections; the application owns broader unit-of-work behavior.
5. **How do EF and Dapper writes share atomicity?** Use the same connection and transaction explicitly and pass the active transaction to both command paths.
