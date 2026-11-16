# raw SQL bulk updates and Dapper comparison — Reference: Dapper APIs and choosing micro-ORM versus EF Core

## Scope and version

Sources: the [Dapper official repository/readme](https://github.com/DapperLib/Dapper), Microsoft's [SQL queries](https://learn.microsoft.com/en-us/ef/core/querying/sql-queries), [ExecuteUpdate/Delete](https://learn.microsoft.com/en-us/ef/core/saving/execute-insert-update-delete), and [EF query tracking](https://learn.microsoft.com/en-us/ef/core/querying/tracking). The examples describe the current project API surface checked 2026-11-16; pin and verify package versions in your application.

## How this group fits the mental model

Dapper is an ADO.NET extension library: the application writes SQL and Dapper maps results. EF Core adds a model, LINQ provider, change tracker, and migrations. Mixing them can be appropriate, but every connection, transaction, mapping, and retry boundary must be explicit.

## Supplied names explained

- `Dapper` — lightweight object-mapping/query extension library over ADO.NET `DbConnection`; it does not provide an EF-style change tracker or LINQ-to-SQL model.
- `Dapper Query<T>` — synchronous query method that executes SQL and maps rows to `T`. Default buffering materializes results before return; query options can request unbuffered enumeration.
- `Dapper QueryAsync<T>` — asynchronous query method returning task-backed results; async controls I/O waiting, not whether the database query is fast. Choose buffering intentionally and pass cancellation/command settings supported by the package overload.
- `Dapper QueryFirst<T>` — returns the first row and expects at least one; it does not enforce that exactly one row exists. Use the corresponding default-returning or single-row semantics when those are desired.
- `Dapper QuerySingle<T>` — requires exactly one row and throws when zero or multiple rows are returned, making cardinality assumptions explicit.
- `Dapper Execute` — synchronous command execution method for statements without mapped result rows; returns an affected-row count. Passing a sequence of parameter objects can execute the command repeatedly.
- `Dapper ExecuteAsync` — asynchronous command execution counterpart; each invocation still follows connection/transaction and cancellation behavior of its overload/provider.
- `Dapper DynamicParameters` — parameter bag for named values and explicit database type/direction/size metadata, useful for stored procedure and output parameter calls.
- `Dapper multi-mapping` — maps columns from a joined row into multiple object types using split-column boundaries and a mapping function. Incorrect split keys/column aliases can silently produce wrong object graphs; it is not a tracked relationship fix-up system.
- `Dapper buffered query` — default behavior reads rows and stores the result sequence before returning, simplifying connection lifetime at the cost of memory proportional to result size.
- `Dapper unbuffered query` — returns an enumerable that reads as consumed, reducing full-list buffering but keeping the reader and connection occupied during enumeration. Dispose/finish consumption before reusing the connection.
- `Dapper list expansion` — passing an enumerable parameter to an `IN @Ids`-style expression expands values into individual parameters for supported Dapper syntax. Large lists can hit provider parameter limits; use bounded batches or provider-specific table-valued/array approaches.
- `EF Core change tracker versus Dapper mapping` — EF tracks entity identity, original values, and relationship fix-up for a unit of work; Dapper maps each result and leaves identity/state coordination to application code.
- `EF Core LINQ provider versus handwritten SQL` — LINQ is model-composed and provider-translated; handwritten SQL offers direct control but takes on translation portability, schema coupling, and manual review.
- `Shared DbConnection boundary` — EF and Dapper can use the same ADO.NET connection. Ensure one clear owner manages open/close/dispose lifecycle and avoid overlapping commands unsupported by the provider.
- `Transaction sharing` — commands are atomic together only when they use the same active database transaction/connection. Pass the transaction explicitly to Dapper and do not assume an EF transaction covers a separately opened connection.
- `Multiple mapping maintenance cost` — joined result mapping needs stable column ordering/aliases and split boundaries; schema/query changes can break it without compile-time checking.
- `Micro-ORM` — a small mapping-oriented layer that reduces boilerplate around SQL and object materialization. It still requires SQL, parameter, transaction, connection, and schema design.
- `Repository boundary for mixed data access` — a repository can isolate a stable domain operation that uses EF or Dapper and expose behavior-focused results. It is useful when it hides implementation choices meaningfully; a generic abstraction that merely mirrors `DbSet` can duplicate EF and reduce composability.

## Cross-item comparison

`Dapper Query<T>` and `Dapper QueryAsync<T>` map rows without EF tracking. Buffered results release the reader before later processing but consume memory; unbuffered results save list allocation while holding the connection. `QueryFirst` allows multiple rows but returns one; `QuerySingle` asserts exactly one. EF Core adds model/change-tracker capabilities; Dapper gives direct SQL control. Either can use the same transaction only when the connection and transaction are shared explicitly.

## Examples

```csharp
const string sql = "SELECT Id, Email FROM dbo.Users WHERE TenantId = @TenantId";
var users = await connection.QueryAsync<UserSummary>(
    sql,
    new { TenantId = tenantId },
    transaction: transaction);
```

Values are parameters. If `transaction` was created by EF, obtain and pass the same underlying connection/transaction using the supported relational APIs; keep lifetime ownership clear. For multi-mapping, alias each object's columns and select an unambiguous split boundary.

## Common mistakes

- Assuming Dapper updates an EF tracked entity's state.
- Opening a second connection and assuming it participates in the first connection's transaction.
- Returning an unbuffered sequence and disposing its connection before enumeration finishes.
- Assuming `QueryFirst` enforces exactly one row.
- Expanding an unbounded list into thousands of SQL parameters.
- Introducing a repository solely to hide `IQueryable` without a stable domain boundary.

## Knowledge checks with answers

1. **What does Dapper automate?** Execution/mapping conveniences over ADO.NET, not the entire EF unit-of-work model.
2. **When use buffered results?** When bounded result size and shorter reader/connection lifetime matter more than peak list memory.
3. **How does Dapper join an EF transaction?** Use the same connection and pass the active transaction to each Dapper command.
4. **When is a repository useful for mixed access?** When it defines a meaningful stable operation boundary; not merely as a generic copy of EF APIs.
