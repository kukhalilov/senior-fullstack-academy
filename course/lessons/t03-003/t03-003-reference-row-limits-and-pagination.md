# select filtering sorting and pagination — Reference: TOP, OFFSET/FETCH, page stability, and row-limiting alternatives

# Scope and version

This reference explains all 23 supplied items in **TOP, OFFSET/FETCH, page stability, and row-limiting alternatives** and adds no neighboring query API. The target is SQL Server 2025 (17.x) T-SQL. Version-specific claims below are cited at the point of use. SQL Server product surfaces differ; Microsoft Learn labels Fabric-only grammar separately from SQL Server grammar.

# How this group fits the mental model

A row limit answers “how many” and an order answers “which ones.” TOP is a top-N row limit; OFFSET/FETCH defines a page slice within an ordered query. Keyset paging follows the last key rather than counting from the beginning.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `TOP (expression)` | Limits a query result to the requested row count. Without ORDER BY, SQL Server may choose any qualifying rows; with a deterministic ORDER BY, it chooses the first rows in that order. |
| `TOP (expression) PERCENT` | Returns the requested percentage of the ordered result; a fractional row count is rounded up to the next whole row. It is based on the result cardinality and is not a fixed-size page. |
| `TOP (expression) WITH TIES` | Includes additional rows tied with the last selected row on all ORDER BY expressions, so the output can exceed the requested count. The relative order among tied rows is not guaranteed; use only when including all boundary ties is intended. |
| `TOP parentheses compatibility rule` | SQL Server retains a compatibility form omitting parentheses only when a SELECT TOP expression is an integer constant. Prefer `TOP (n)` consistently; parentheses are required in other DML forms and remove ambiguity. |
| `TOP requires ORDER BY for predictable row selection` | TOP without ORDER BY limits an undefined subset. Use an explicit sort key, and include a unique tie-breaker if exactly which rows are selected must be reproducible. |
| `WITH TIES requires ORDER BY` | WITH TIES is meaningful only against a boundary sort key, so SQL Server requires ORDER BY. It includes every row equal to the last row across the complete ORDER BY key list. |
| `TOP cannot share a query scope with OFFSET/FETCH` | SQL Server does not allow TOP and OFFSET/FETCH in the same query expression. Choose one row-limiting form per query scope; a nested query can establish a separate scope when genuinely needed. |
| `ORDER BY OFFSET integer_constant ROWS` | The integer constant is the number of ordered rows to skip before returning a result. It must be nonnegative and is used after ORDER BY; this basic form is often paired with FETCH for page size. |
| `ORDER BY OFFSET offset_row_count_expression ROWS` | The expression can be a variable, parameter, or noncorrelated scalar subquery and must be nonnegative. It cannot reference outer-query columns when it is a subquery; large offsets may cost more because earlier rows still have to be navigated. |
| `FETCH FIRST row_count ROW ONLY` | Returns the requested number of rows after OFFSET. FIRST and NEXT are synonyms, as are ROW and ROWS; FETCH count must be at least one. |
| `FETCH NEXT row_count ROWS ONLY` | The common paging form returns a bounded number of rows after the skip count. It belongs to ORDER BY with OFFSET, not a standalone unordered clause. |
| `OFFSET/FETCH requires ORDER BY` | SQL Server defines OFFSET/FETCH as part of ORDER BY. The sort order controls which positions make up each page; a stable page order should end in a unique key. |
| `OFFSET/FETCH SQL Server 2012 and later availability` | SQL Server added OFFSET/FETCH in SQL Server 2012 (11.x); it is present in SQL Server 2025. It is not available on older SQL Server engines. [Microsoft Learn: ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17) |
| `OFFSET/FETCH variables and expressions` | OFFSET and FETCH accept nonnegative expressions, including variables/parameters and noncorrelated scalar subqueries. OFFSET may be zero; FETCH must be at least one. Validate app input before binding it. |
| `Offset pagination` | A client requests page N by skipping a computed number of rows and fetching a page size. It is simple for numbered pages, but deep offsets can do increasing work and separate requests can see changing data. |
| `Keyset (seek) pagination` | A continuation query starts after the last row’s ordered key tuple instead of counting and skipping all earlier rows. For descending `(CreatedAt, OrderId)`, continue with an earlier date, or the same date and a smaller ID; the key tuple and null policy must match ORDER BY. |
| `Deterministic pagination needs a unique ordering key` | A unique ordering tuple is required to keep the same static rows in a predictable sequence across pages. Nonunique timestamps alone can shift tied rows between page boundaries. |
| `Pagination consistency under concurrent writes` | A unique order prevents tie ambiguity but does not freeze a multi-request result set while rows are inserted, deleted, or updated. Decide whether the product accepts movement/duplicates, uses a continuation key, or requires a transactionally consistent snapshot. |
| `Snapshot or serializable transaction for stable multi-page reads` | Microsoft’s OFFSET/FETCH guidance says stable page requests require unchanged underlying data, for example all page reads in one SNAPSHOT or SERIALIZABLE transaction, plus a unique ORDER BY key. SNAPSHOT needs ALLOW_SNAPSHOT_ISOLATION; READ_COMMITTED_SNAPSHOT gives statement-level versions, not one shared snapshot across page requests; SERIALIZABLE range locks can block writes. Holding a transaction across interactive HTTP page requests is often operationally undesirable, so assess the requirement rather than assuming pagination is a snapshot. |
| `Large-offset scan cost` | A deep page can require the engine to find and pass many preceding ordered rows before returning the requested slice. An appropriate index and plan can change cost, but keyset pagination is often better for sequential “next page” navigation. |
| `SET ROWCOUNT legacy row-limit alternative` | SET ROWCOUNT applies a connection/session setting that stops processing after the specified number of rows, rather than expressing a local SELECT row limit. It can leak into later work if not reset and is not the preferred SELECT paging interface. Microsoft says it will stop affecting DELETE, INSERT, and UPDATE in a future release; use TOP for DML row limits as well. [Microsoft Learn: SET ROWCOUNT](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-rowcount-transact-sql?view=sql-server-ver17) |
| `TOP and FETCH preferred over SET ROWCOUNT for SELECT limits` | Microsoft recommends TOP or OFFSET/FETCH for SELECT limits because the optimizer can consider their values during plan optimization; SET ROWCOUNT sits outside an individual query’s syntax. Choose TOP for top-N and OFFSET/FETCH for numbered page ranges. |
| `FETCH row-count and offset must be nonnegative` | OFFSET accepts zero or greater; FETCH accepts one or greater. A negative or zero FETCH count is invalid. Reject or normalize page inputs in application code rather than producing a runtime syntax error. |

# Cross-item comparison

`TOP (n)` is concise for top-N and can include boundary ties; OFFSET/FETCH is natural for page number/size; keyset paging is natural for sequential continuation. None guarantees a stable multi-request view if data changes unless the application also defines a consistency strategy.

# Examples

```sql
DECLARE @Offset bigint = 40;
DECLARE @PageSize int = 20;

SELECT o.OrderId, o.CreatedAt, o.Total
FROM dbo.Orders AS o
ORDER BY o.CreatedAt DESC, o.OrderId DESC
OFFSET @Offset ROWS
FETCH NEXT @PageSize ROWS ONLY;
```

This snippet illustrates the group’s rules. Its result order, NULL behavior, parameter values, and schema assumptions are explained above; validate it against the target schema and database compatibility level.


## Keyset continuation example

For descending `(CreatedAt, OrderId)`, the next page consists of rows lexicographically below the last row returned. This example assumes `CreatedAt` is non-NULL and `OrderId` is unique; the cursor values come from the last row of the prior page.

```sql
DECLARE @PageSize int = 20;
DECLARE @LastCreatedAt datetime2(7) = '2026-11-15T12:00:00';
DECLARE @LastOrderId bigint = 9001;

SELECT TOP (@PageSize) o.OrderId, o.CreatedAt, o.Total
FROM dbo.Orders AS o
WHERE o.CreatedAt < @LastCreatedAt
   OR (o.CreatedAt = @LastCreatedAt AND o.OrderId < @LastOrderId)
ORDER BY o.CreatedAt DESC, o.OrderId DESC;
```

Use the same filters and ordering on every request. If a sort key is nullable or mutable, define matching NULL and cursor semantics explicitly. Keyset navigation avoids skipping a deep prefix, but it does not by itself provide a frozen snapshot while rows change.

# Common mistakes

- Using TOP without ORDER BY and expecting a predictable subset.
- Combining TOP and OFFSET/FETCH in one query scope.
- Paging by a nonunique key.
- Assuming a unique sort key freezes data between independent requests.
- Using a long-lived transaction across user think time without considering version-store/locking costs.

# Knowledge checks with answers

1. **Which exact inventory items does this reference cover?** `TOP (expression)`, `TOP (expression) PERCENT`, `TOP (expression) WITH TIES`, `TOP parentheses compatibility rule`, `TOP requires ORDER BY for predictable row selection`, `WITH TIES requires ORDER BY`, `TOP cannot share a query scope with OFFSET/FETCH`, `ORDER BY OFFSET integer_constant ROWS`, `ORDER BY OFFSET offset_row_count_expression ROWS`, `FETCH FIRST row_count ROW ONLY`, `FETCH NEXT row_count ROWS ONLY`, `OFFSET/FETCH requires ORDER BY`, `OFFSET/FETCH SQL Server 2012 and later availability`, `OFFSET/FETCH variables and expressions`, `Offset pagination`, `Keyset (seek) pagination`, `Deterministic pagination needs a unique ordering key`, `Pagination consistency under concurrent writes`, `Snapshot or serializable transaction for stable multi-page reads`, `Large-offset scan cost`, `SET ROWCOUNT legacy row-limit alternative`, `TOP and FETCH preferred over SET ROWCOUNT for SELECT limits`, `FETCH row-count and offset must be nonnegative`. Every one is explained in the table above.
2. **What should be checked when a result surprises you?** Binding scope, data types, NULL truth value, collation, unique ordering, and the SQL Server product/version surface relevant to the syntax.
3. **Does a successful query prove its order is guaranteed?** No. Only an applicable final ORDER BY defines result order, and tied keys remain unordered.

# Sources

- [SQL Server SELECT](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-transact-sql?view=sql-server-ver17)
- [SQL Server search conditions](https://learn.microsoft.com/en-us/sql/t-sql/queries/search-condition-transact-sql?view=sql-server-ver17)
- [SQL Server logical operators](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/logical-operators-transact-sql?view=sql-server-ver17)
- [SQL Server ANY and SOME](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/some-any-transact-sql?view=sql-server-ver17)
- [SQL Server ALL](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/all-transact-sql?view=sql-server-ver17)
- [SQL Server operator precedence](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/operator-precedence-transact-sql?view=sql-server-ver17)
- [SQL Server LIKE](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql?view=sql-server-ver17)
- [SQL Server ORDER BY](https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql?view=sql-server-ver17)
- [SQL Server TOP](https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql?view=sql-server-ver17)
- [SQL Server SET ROWCOUNT](https://learn.microsoft.com/en-us/sql/t-sql/statements/set-rowcount-transact-sql?view=sql-server-ver17)
- [SQL Server IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17)
- [SQL Server REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
- [SQL Server UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)
