# select filtering sorting and pagination — Reference: SELECT statement structure, result projection, aliases, and logical processing boundaries

# Scope and version

This reference explains all 24 supplied items in **SELECT statement structure, result projection, aliases, and logical processing boundaries** and adds no neighboring query API. The target is SQL Server 2025 (17.x) T-SQL. Version-specific claims below are cited at the point of use. SQL Server product surfaces differ; Microsoft Learn labels Fabric-only grammar separately from SQL Server grammar.

# How this group fits the mental model

A SELECT is a request to form a result table. FROM establishes available row sources, WHERE keeps qualifying rows, and the select list shapes each remaining row. DISTINCT may remove duplicate projected tuples; ORDER BY orders the result only when requested.

# Supplied names explained

| Exact supplied item | SQL Server behavior and practical boundary |
| --- | --- |
| `SELECT statement` | The T-SQL statement that retrieves a result set. It combines a query expression with optional ordering and other clauses; its written clause order is grammar, not a promise about physical execution order. |
| `SELECT query expression` | The result-producing expression, which may be one query specification or query specifications combined by set operators. Parentheses can group a query expression; set-operation output is one result shape. |
| `SELECT query specification` | One SELECT branch that describes a projection and optional source, filter, grouping, and related clauses. In this topic the important separation is its select list, FROM table source, WHERE filter, and result-order/limit stage. |
| `SELECT [ALL]` | The default duplicate-preserving projection. `ALL` may be written explicitly, but omitting it has the same duplicate-retaining effect; duplicate result rows are not automatically removed. |
| `SELECT DISTINCT` | Removes duplicate rows from the projected result, comparing the entire selected row. It does not deduplicate a source table or choose an arbitrary representative source row; every selected expression participates. |
| `Select list` | The comma-separated expressions that define result columns, their values, and optionally their output labels. Its shape determines the result metadata and interacts with DISTINCT and set-operation compatibility. |
| `Select-list column expression` | A column reference or expression derived from a source column, such as `o.OrderDate` or `o.Total * 1.1`. Qualify a name when more than one source could supply it. |
| `Select-list scalar expression` | An expression evaluated to one scalar result for each row in the current query result. It can combine constants, columns, operators, and scalar functions; it is not a separate source row or a predicate. |
| `Select-list alias` | The output label assigned to a select-list expression. It is available to the later ORDER BY binding stage, but not to the earlier WHERE stage in the same query specification. |
| `AS column-alias syntax` | The explicit form `expression AS alias` labels a projected expression. Use AS to make the boundary between the expression and its result name clear; it is optional in some alias forms, but consistency improves review. |
| `Delimited identifier alias` | An output alias written as a delimited identifier, commonly `[Order Total]` in T-SQL, so it can contain a space or reserved word. Delimiting names is not a substitute for parameterizing data values. |
| `Duplicate projected values versus duplicate source rows` | Two different source rows may project identical values, and the result can therefore contain repeated-looking rows under ALL. DISTINCT removes identical projected tuples, which can hide source distinctions if the key was not selected. |
| `SELECT * wildcard` | Expands to all columns from the query source shape. It is convenient for exploration but makes a public result contract fragile: schema additions change output, more data may be read or exposed, and consumers depend on implicit column order. |
| `Qualified wildcard table-alias.*` | Expands to all columns from the one table source named by its FROM alias. It is less ambiguous than `*` in multi-source queries, but still has schema-drift and over-projection risks. |
| `FROM clause table source` | Introduces the table or other row-producing source from which the query reads. JOIN/APPLY/PIVOT composition is taught elsewhere; a table source supplies names used by the select list and search condition. |
| `Table alias in FROM` | A query-local name for a table source, such as `FROM dbo.Orders AS o`. Once an alias is assigned, qualify that source’s columns with it when needed; the alias does not rename the stored table. |
| `WHERE clause` | Filters candidate rows using a search condition before projection and duplicate elimination in SQL Server’s logical binding order. Only TRUE passes; FALSE and UNKNOWN do not. It is for row predicates, not aggregate-group filtering. |
| `Logical SELECT clause processing order` | SQL Server documents a logical binding sequence that makes FROM/WHERE inputs available before SELECT aliases; ORDER BY is later and may see the alias. This explains name visibility, not the optimizer’s physical operator sequence. |
| `SELECT alias visibility in ORDER BY` | Because ORDER BY is logically later than SELECT projection, an output alias can be referenced there. Keep the alias standalone when referencing it; Microsoft documents an alias combined inside another ORDER BY expression as invalid for this binding form. |
| `SELECT alias not visible in WHERE` | WHERE binds before the select list, so the alias is not in scope there. Repeat the expression, use a derived query/CTE boundary, or use an appropriate predicate form; do not rely on a physical plan evaluating projection first. |
| `SELECT result-set order is unspecified without ORDER BY` | Without a final ORDER BY, SQL Server makes no row-order guarantee, even if current results happen to look sorted or an index scan seems ordered. Storage order and execution-plan order are not result contracts. |
| `UNION-compatible result projection boundary` | Set-operation branches must project the same number of columns in the same positions with compatible data types. Output names come from the first query; implicit type precedence can convert values, so make casts explicit when shape or precision matters. |
| `ORDER BY ALL is Microsoft Fabric syntax, not SQL Server syntax` | This spelling is documented for Fabric Data Warehouse and the SQL analytics endpoint, where it sorts by every projected column. It is not part of the SQL Server SELECT grammar; enumerate SQL Server sort keys instead. |
| `QUALIFY is Fabric Data Warehouse syntax, not SQL Server syntax` | QUALIFY appears in the Fabric Data Warehouse SELECT syntax, not SQL Server’s current query specification. SQL Server code must use supported query structure, such as a derived query and an outer WHERE, when filtering a window result. |

# Cross-item comparison

`SELECT ALL` preserves repeated projected rows; `SELECT DISTINCT` removes duplicates in the complete projection. A query expression may combine compatible result shapes; a query specification is one branch. Fabric-only syntax names are included solely to keep the SQL Server boundary explicit.

# Examples

```sql
SELECT o.OrderId, o.CreatedAt, o.Total AS [Order Total]
FROM dbo.Orders AS o
WHERE o.Status = N'Open'
ORDER BY o.CreatedAt DESC, o.OrderId DESC;
```

This snippet illustrates the group’s rules. Its result order, NULL behavior, parameter values, and schema assumptions are explained above; validate it against the target schema and database compatibility level.



# Common mistakes

- Using SELECT * as a durable API contract.
- Expecting DISTINCT to select a representative row by some key.
- Trying to use a SELECT alias in WHERE.
- Assuming SELECT without ORDER BY returns the same order on each run.
- Copying Fabric-only ORDER BY ALL or QUALIFY into SQL Server.

# Knowledge checks with answers

1. **Which exact inventory items does this reference cover?** `SELECT statement`, `SELECT query expression`, `SELECT query specification`, `SELECT [ALL]`, `SELECT DISTINCT`, `Select list`, `Select-list column expression`, `Select-list scalar expression`, `Select-list alias`, `AS column-alias syntax`, `Delimited identifier alias`, `Duplicate projected values versus duplicate source rows`, `SELECT * wildcard`, `Qualified wildcard table-alias.*`, `FROM clause table source`, `Table alias in FROM`, `WHERE clause`, `Logical SELECT clause processing order`, `SELECT alias visibility in ORDER BY`, `SELECT alias not visible in WHERE`, `SELECT result-set order is unspecified without ORDER BY`, `UNION-compatible result projection boundary`, `ORDER BY ALL is Microsoft Fabric syntax, not SQL Server syntax`, `QUALIFY is Fabric Data Warehouse syntax, not SQL Server syntax`. Every one is explained in the table above.
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
- [SQL Server IS DISTINCT FROM](https://learn.microsoft.com/en-us/sql/t-sql/queries/is-distinct-from-transact-sql?view=sql-server-ver17)
- [SQL Server REGEXP_LIKE](https://learn.microsoft.com/en-us/sql/t-sql/functions/regexp-like-transact-sql?view=sql-server-ver17)
- [SQL Server UNION](https://learn.microsoft.com/en-us/sql/t-sql/language-elements/set-operators-union-transact-sql?view=sql-server-ver17)
